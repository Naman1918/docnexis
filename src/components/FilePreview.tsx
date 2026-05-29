import { useEffect, useState } from "react";
import { File as FileIcon, X } from "lucide-react";

interface FilePreviewProps {
  file: File;
  onClear: () => void;
  disabled?: boolean;
}

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function FilePreview({ file, onClear, disabled }: FilePreviewProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setImageUrl(null);
  }, [file]);

  return (
    <div className="glass flex items-center gap-4 rounded-2xl p-4">
      <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-secondary">
        {imageUrl ? (
          <img src={imageUrl} alt={file.name} className="size-full object-cover" />
        ) : (
          <FileIcon className="size-7 text-muted-foreground" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-foreground">{file.name}</p>
        <p className="text-sm text-muted-foreground">{formatSize(file.size)}</p>
      </div>
      <button
        type="button"
        onClick={onClear}
        disabled={disabled}
        aria-label="Remove file"
        className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
      >
        <X className="size-5" />
      </button>
    </div>
  );
}
