// Browser-only document conversion engine for Docnexis.
// Every function dynamically imports its heavy library so nothing touches SSR.
// All processing happens on-device — nothing is ever uploaded.

export type ConversionId =
  | "pdf-to-excel"
  | "excel-to-word"
  | "word-to-pdf"
  | "image-to-text";

export interface ConversionResult {
  blob: Blob;
  filename: string;
  /** Optional plain-text preview of the produced output. */
  textPreview?: string;
}

/** Progress callback: percent (0-100) and an optional human-readable phase label. */
export type ProgressFn = (percent: number, phase?: string) => void;

/** A conversion failure with a user-friendly message safe to show in the UI. */
export class ConversionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConversionError";
  }
}

const stripExt = (name: string) => name.replace(/\.[^/.]+$/, "");

/** Yield to the browser so the UI thread can paint progress and stay responsive. */
const yieldToUI = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

/** PDF → Excel: extract text content row-by-row and write a spreadsheet. */
async function pdfToExcel(file: File, onProgress: ProgressFn): Promise<ConversionResult> {
  const pdfjs = await import("pdfjs-dist");
  const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

  onProgress(8, "Reading PDF");
  const buffer = await file.arrayBuffer();

  let pdf;
  try {
    pdf = await pdfjs.getDocument({ data: buffer }).promise;
  } catch {
    throw new ConversionError("This PDF couldn't be read. It may be corrupted or password-protected.");
  }

  const rows: string[][] = [];

  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();

    // Group text items by their vertical position to reconstruct rows.
    const lines = new Map<number, { x: number; str: string }[]>();
    for (const item of content.items as Array<{ str: string; transform: number[] }>) {
      if (!item.str.trim()) continue;
      const y = Math.round(item.transform[5]);
      const x = item.transform[4];
      if (!lines.has(y)) lines.set(y, []);
      lines.get(y)!.push({ x, str: item.str });
    }

    [...lines.entries()]
      .sort((a, b) => b[0] - a[0])
      .forEach(([, cells]) => {
        rows.push(cells.sort((a, b) => a.x - b.x).map((c) => c.str));
      });

    // Free per-page resources to keep memory low on large PDFs.
    page.cleanup();
    onProgress(8 + Math.round((p / pdf.numPages) * 78), `Extracting page ${p} of ${pdf.numPages}`);
    await yieldToUI();
  }

  await pdf.destroy();

  onProgress(90, "Building spreadsheet");
  const XLSX = await import("xlsx");
  const ws = XLSX.utils.aoa_to_sheet(rows.length ? rows : [["No text found in PDF"]]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  const out = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  onProgress(100, "Done");

  return {
    blob: new Blob([out], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    filename: `${stripExt(file.name)}.xlsx`,
    textPreview: rows
      .slice(0, 25)
      .map((r) => r.join("  |  "))
      .join("\n"),
  };
}

/** Excel → Word: read each sheet and render it as a Word table. */
async function excelToWord(file: File, onProgress: ProgressFn): Promise<ConversionResult> {
  onProgress(10, "Reading spreadsheet");
  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();

  let wb;
  try {
    wb = XLSX.read(buffer, { type: "array" });
  } catch {
    throw new ConversionError("This spreadsheet couldn't be read. Make sure it's a valid Excel file.");
  }

  onProgress(35, "Building document");
  const docx = await import("docx");
  const { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel, WidthType } =
    docx;

  const children: Array<InstanceType<typeof Paragraph> | InstanceType<typeof Table>> = [];
  let previewLines: string[] = [];

  for (const name of wb.SheetNames) {
    const rows = XLSX.utils.sheet_to_json<string[]>(wb.Sheets[name], { header: 1, blankrows: false });
    children.push(new Paragraph({ text: name, heading: HeadingLevel.HEADING_2 }));

    if (rows.length) {
      const table = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: rows.map(
          (row) =>
            new TableRow({
              children: row.map(
                (cell) =>
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun(String(cell ?? ""))] })],
                  }),
              ),
            }),
        ),
      });
      children.push(table);
      children.push(new Paragraph({ text: "" }));
      previewLines = previewLines.concat(rows.slice(0, 20).map((r) => r.join("  |  ")));
    }
    await yieldToUI();
  }

  const doc = new Document({ sections: [{ children }] });
  onProgress(80, "Packaging .docx");
  const blob = await Packer.toBlob(doc);
  onProgress(100, "Done");

  return {
    blob,
    filename: `${stripExt(file.name)}.docx`,
    textPreview: previewLines.slice(0, 25).join("\n"),
  };
}

/** Word → PDF: extract text and lay it out on PDF pages. */
async function wordToPdf(file: File, onProgress: ProgressFn): Promise<ConversionResult> {
  onProgress(10, "Reading document");
  const mammoth = await import("mammoth");
  const buffer = await file.arrayBuffer();

  let value: string;
  try {
    ({ value } = await mammoth.extractRawText({ arrayBuffer: buffer }));
  } catch {
    throw new ConversionError("This Word file couldn't be read. Please upload a valid .docx file.");
  }

  onProgress(45, "Laying out PDF");
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const maxWidth = pageWidth - margin * 2;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);

  const paragraphs = value.split(/\n/);
  let y = margin;
  for (let i = 0; i < paragraphs.length; i++) {
    const lines = pdf.splitTextToSize(paragraphs[i] || " ", maxWidth) as string[];
    for (const line of lines) {
      if (y > pageHeight - margin) {
        pdf.addPage();
        y = margin;
      }
      pdf.text(line, margin, y);
      y += 16;
    }
    if (i % 50 === 0) {
      onProgress(45 + Math.round((i / paragraphs.length) * 50), "Laying out PDF");
      await yieldToUI();
    }
  }
  onProgress(100, "Done");

  return {
    blob: pdf.output("blob"),
    filename: `${stripExt(file.name)}.pdf`,
    textPreview: value.slice(0, 1200),
  };
}

/** Image → Text: run OCR with Tesseract (runs in its own worker thread). */
async function imageToText(file: File, onProgress: ProgressFn): Promise<ConversionResult> {
  onProgress(5, "Loading OCR engine");
  const Tesseract = await import("tesseract.js");
  let data;
  try {
    ({ data } = await Tesseract.recognize(file, "eng", {
      logger: (m: { status: string; progress: number }) => {
        if (m.status === "recognizing text") {
          onProgress(Math.max(5, Math.round(m.progress * 100)), "Reading text");
        }
      },
    }));
  } catch {
    throw new ConversionError("OCR failed on this image. Try a clearer or higher-contrast image.");
  }
  const text = data.text.trim() || "No readable text detected.";
  onProgress(100, "Done");

  return {
    blob: new Blob([text], { type: "text/plain;charset=utf-8" }),
    filename: `${stripExt(file.name)}.txt`,
    textPreview: text.slice(0, 1500),
  };
}

const RUNNERS: Record<
  ConversionId,
  (file: File, onProgress: ProgressFn) => Promise<ConversionResult>
> = {
  "pdf-to-excel": pdfToExcel,
  "excel-to-word": excelToWord,
  "word-to-pdf": wordToPdf,
  "image-to-text": imageToText,
};

export async function runConversion(
  id: ConversionId,
  file: File,
  onProgress: ProgressFn,
): Promise<ConversionResult> {
  try {
    return await RUNNERS[id](file, onProgress);
  } catch (err) {
    if (err instanceof ConversionError) throw err;
    console.error("Conversion failed:", err);
    throw new ConversionError(
      "We couldn't convert this file. It may be corrupted or in an unexpected format.",
    );
  }
}
