import { useCallback, useRef, useState } from "react";
import { FolderOpen, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadDropzoneProps {
  accept: string;
  acceptLabel: string;
  maxSizeMB: number;
  onFile: (file: File) => void;
}

export function UploadDropzone({ accept, acceptLabel, maxSizeMB, onFile }: UploadDropzoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = useCallback(() => inputRef.current?.click(), []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) onFile(file);
    },
    [onFile],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "glass flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-6 text-center transition-all sm:p-10",
        dragging
          ? "border-primary bg-primary/5 scale-[1.01]"
          : "border-border hover:border-primary/60",
      )}
    >
      <span className="flex size-14 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
        <UploadCloud className="size-7" />
      </span>
      <div>
        {/* Drag hint is desktop-first; the button below is the primary action on touch devices. */}
        <p className="font-medium text-foreground">
          <span className="hidden sm:inline">Drag &amp; drop your file here, or </span>
          <span className="sm:hidden">Tap to </span>
          <span className="text-gradient font-semibold">choose a file</span>
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Accepts {acceptLabel} · up to {maxSizeMB}MB
        </p>
      </div>

      {/* Explicit picker button — reliable file selection on mobile where drag-drop is unavailable. */}
      <button
        type="button"
        onClick={openPicker}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary active:scale-95"
      >
        <FolderOpen className="size-4" /> Browse files
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
