import {
  FileSpreadsheet,
  FileText,
  FileType2,
  ScanText,
  type LucideIcon,
} from "lucide-react";
import type { ConversionId } from "./conversions";

export interface ConversionTool {
  id: ConversionId;
  title: string;
  description: string;
  /** Human label for accepted inputs. */
  accept: string;
  /** input[accept] attribute value. */
  inputAccept: string;
  /** Accepted file extensions (lowercase, incl. dot) for client-side validation. */
  extensions: string[];
  /** Maximum input size in megabytes. */
  maxSizeMB: number;
  from: string;
  to: string;
  icon: LucideIcon;
}

export const CONVERSION_TOOLS: ConversionTool[] = [
  {
    id: "pdf-to-excel",
    title: "PDF to Excel",
    description: "Extract tables and text from PDFs into a clean spreadsheet.",
    accept: "PDF files",
    inputAccept: ".pdf,application/pdf",
    extensions: [".pdf"],
    maxSizeMB: 25,
    from: "PDF",
    to: "XLSX",
    icon: FileSpreadsheet,
  },
  {
    id: "excel-to-word",
    title: "Excel to Word",
    description: "Turn spreadsheets into formatted Word document tables.",
    accept: "XLSX / XLS files",
    inputAccept: ".xlsx,.xls",
    extensions: [".xlsx", ".xls"],
    maxSizeMB: 15,
    from: "XLSX",
    to: "DOCX",
    icon: FileText,
  },
  {
    id: "word-to-pdf",
    title: "Word to PDF",
    description: "Render Word documents into shareable, print-ready PDFs.",
    accept: "DOCX files",
    inputAccept: ".docx",
    extensions: [".docx"],
    maxSizeMB: 15,
    from: "DOCX",
    to: "PDF",
    icon: FileType2,
  },
  {
    id: "image-to-text",
    title: "Image to Text",
    description: "Read text from images and scans with on-device OCR.",
    accept: "PNG / JPG images",
    inputAccept: "image/*",
    extensions: [".png", ".jpg", ".jpeg", ".webp", ".bmp", ".gif"],
    maxSizeMB: 10,
    from: "Image",
    to: "TXT",
    icon: ScanText,
  },
];

/** Validate a file against a tool's accepted extensions and size limit. */
export function validateFile(
  tool: ConversionTool,
  file: File,
): { ok: true } | { ok: false; reason: string } {
  if (file.size === 0) {
    return { ok: false, reason: "This file is empty. Please choose a different file." };
  }

  const maxBytes = tool.maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      ok: false,
      reason: `File is too large (max ${tool.maxSizeMB}MB for ${tool.title}). Try a smaller file.`,
    };
  }

  const name = file.name.toLowerCase();
  const matches = tool.extensions.some((ext) => name.endsWith(ext));
  if (!matches) {
    return {
      ok: false,
      reason: `Unsupported format for ${tool.title}. Please upload ${tool.accept}.`,
    };
  }

  return { ok: true };
}
