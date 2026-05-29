import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Download, Loader2, Lock, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { CONVERSION_TOOLS, validateFile, type ConversionTool } from "@/lib/conversion-tools";
import { runConversion, ConversionError, type ConversionResult } from "@/lib/conversions";
import { addHistory, clearHistory, loadHistory, type HistoryEntry } from "@/lib/history";
import { cn } from "@/lib/utils";
import { UploadDropzone } from "./UploadDropzone";
import { FilePreview } from "./FilePreview";
import { ConversionHistory } from "./ConversionHistory";

type Status = "idle" | "ready" | "processing" | "done" | "error";

export function Converter() {
  const [tool, setTool] = useState<ConversionTool>(CONVERSION_TOOLS[0]);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState("Preparing…");
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => setHistory(loadHistory()), []);

  const downloadUrl = useMemo(
    () => (result ? URL.createObjectURL(result.blob) : null),
    [result],
  );
  useEffect(() => {
    return () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [downloadUrl]);

  const processing = status === "processing";

  const reset = () => {
    setFile(null);
    setStatus("idle");
    setProgress(0);
    setPhase("Preparing…");
    setResult(null);
    setError(null);
  };

  const selectTool = (t: ConversionTool) => {
    if (processing) return;
    setTool(t);
    reset();
  };

  const handleFile = (f: File) => {
    const check = validateFile(tool, f);
    if (!check.ok) {
      toast.error("File not accepted", { description: check.reason });
      setError(check.reason);
      setStatus("error");
      setFile(null);
      return;
    }
    setFile(f);
    setResult(null);
    setError(null);
    setProgress(0);
    setStatus("ready");
  };

  const convert = async () => {
    if (!file || processing) return;
    setStatus("processing");
    setProgress(2);
    setPhase("Preparing…");
    setError(null);
    try {
      const res = await runConversion(tool.id, file, (p, label) => {
        setProgress(Math.max(2, Math.min(100, p)));
        if (label) setPhase(label);
      });
      setResult(res);
      setStatus("done");
      setHistory(
        addHistory({
          tool: tool.id,
          toolTitle: tool.title,
          inputName: file.name,
          outputName: res.filename,
        }),
      );
      toast.success("Conversion complete", {
        description: `${file.name} → ${res.filename}`,
      });
    } catch (err) {
      const message =
        err instanceof ConversionError
          ? err.message
          : "Something went wrong during conversion. Please try again.";
      setError(message);
      setStatus("error");
      toast.error("Conversion failed", { description: message });
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        {/* Tool picker */}
        <div className="grid gap-3 sm:grid-cols-2">
          {CONVERSION_TOOLS.map((t) => {
            const Icon = t.icon;
            const active = t.id === tool.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => selectTool(t)}
                disabled={processing && !active}
                aria-pressed={active}
                className={cn(
                  "glass group flex min-h-[88px] items-start gap-3 rounded-2xl p-4 text-left transition-all hover:shadow-card",
                  active && "ring-2 ring-primary",
                  processing && !active && "cursor-not-allowed opacity-50",
                )}
              >
                <span
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors",
                    active
                      ? "bg-gradient-primary text-primary-foreground shadow-glow"
                      : "bg-secondary text-foreground",
                  )}
                >
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground">{t.title}</p>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {t.from}→{t.to}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Upload + workflow */}
        <div className="glass rounded-2xl p-5 shadow-card sm:p-6">
          {!file ? (
            <div className="space-y-4">
              <UploadDropzone
                accept={tool.inputAccept}
                acceptLabel={tool.accept}
                maxSizeMB={tool.maxSizeMB}
                onFile={handleFile}
              />
              {status === "error" && error && (
                <div className="flex items-start gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <FilePreview file={file} onClear={reset} disabled={processing} />

              {status === "processing" && (
                <div className="space-y-2" role="status" aria-live="polite">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
                      <Loader2 className="size-4 shrink-0 animate-spin" />
                      <span className="truncate">{phase}</span>
                    </span>
                    <span className="shrink-0 font-medium text-foreground">{progress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-gradient-primary transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Keep this tab open — large files may take a moment.
                  </p>
                </div>
              )}

              {status === "error" && (
                <div className="flex items-start gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {status === "done" && result && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 rounded-xl bg-success/10 p-3 text-sm font-medium text-success">
                    <CheckCircle2 className="size-4 shrink-0" /> Converted to {tool.to} successfully
                  </div>
                  {result.textPreview && (
                    <pre className="max-h-44 overflow-auto rounded-xl bg-secondary/60 p-3 text-xs leading-relaxed text-muted-foreground">
                      {result.textPreview}
                    </pre>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                {status !== "done" ? (
                  <button
                    type="button"
                    onClick={convert}
                    disabled={processing || status === "error"}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.03] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="size-4 animate-spin" /> Converting…
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-4" /> Convert to {tool.to}
                      </>
                    )}
                  </button>
                ) : (
                  <>
                    <a
                      href={downloadUrl ?? "#"}
                      download={result?.filename}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.03] active:scale-95"
                    >
                      <Download className="size-4" /> Download {result?.filename}
                    </a>
                    <button
                      type="button"
                      onClick={reset}
                      className="inline-flex items-center rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                    >
                      Convert another
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Trust / privacy messaging */}
        <div className="glass flex flex-col gap-2 rounded-2xl p-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:gap-4">
          <span className="flex items-center gap-2 font-medium text-foreground">
            <Lock className="size-4 text-primary" /> Private by design
          </span>
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            <li>All processing happens in your browser</li>
            <li>Files are not uploaded to any server</li>
            <li>Data is deleted on refresh</li>
          </ul>
        </div>
      </div>

      <aside className="space-y-6">
        <ConversionHistory entries={history} onClear={() => setHistory(clearHistory())} />
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Sparkles className="size-4 text-accent" /> Coming soon
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            AI editing before conversion — e.g. “Remove all rows named Kulwant before exporting to
            Excel.”
          </p>
          <span className="mt-3 inline-block rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
            Premium · in development
          </span>
        </div>
      </aside>
    </div>
  );
}
