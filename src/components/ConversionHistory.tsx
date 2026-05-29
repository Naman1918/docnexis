import { Clock, Trash2 } from "lucide-react";
import type { HistoryEntry } from "@/lib/history";

interface ConversionHistoryProps {
  entries: HistoryEntry[];
  onClear: () => void;
}

const formatDate = (ts: number) =>
  new Date(ts).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export function ConversionHistory({ entries, onClear }: ConversionHistoryProps) {
  return (
    <section className="glass rounded-2xl p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-display text-base font-semibold">
          <Clock className="size-4 text-primary" /> Recent conversions
        </h3>
        {entries.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive"
          >
            <Trash2 className="size-3.5" /> Clear
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Your last 5 conversions will appear here.
        </p>
      ) : (
        <ul className="space-y-2">
          {entries.map((e) => (
            <li
              key={e.id}
              className="flex items-center justify-between gap-3 rounded-xl bg-secondary/60 px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{e.outputName}</p>
                <p className="truncate text-xs text-muted-foreground">{e.toolTitle}</p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">{formatDate(e.date)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
