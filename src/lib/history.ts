import type { ConversionId } from "./conversions";

export interface HistoryEntry {
  id: string;
  tool: ConversionId;
  toolTitle: string;
  inputName: string;
  outputName: string;
  date: number;
}

const KEY = "docnexis-history";
const MAX = 5;

export function loadHistory(): HistoryEntry[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function addHistory(entry: Omit<HistoryEntry, "id" | "date">): HistoryEntry[] {
  const next: HistoryEntry[] = [
    { ...entry, id: crypto.randomUUID(), date: Date.now() },
    ...loadHistory(),
  ].slice(0, MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}

export function clearHistory(): HistoryEntry[] {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  return [];
}
