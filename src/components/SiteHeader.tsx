import { Link } from "@tanstack/react-router";
import { FileStack } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
            <FileStack className="size-5" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">Docnexis</span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/dashboard"
            className="hidden rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-block"
          >
            Dashboard
          </Link>
          <Link
            to="/dashboard"
            className="rounded-full bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.03] active:scale-95"
          >
            Start Converting
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
