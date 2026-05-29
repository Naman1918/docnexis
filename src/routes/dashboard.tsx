import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { Converter } from "@/components/Converter";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Docnexis" },
      {
        name: "description",
        content: "Upload, convert and download your documents securely in your browser.",
      },
      { property: "og:title", content: "Dashboard — Docnexis" },
      {
        property: "og:description",
        content: "Upload, convert and download documents with Docnexis.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="min-h-screen bg-hero-glow">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-6">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Conversion dashboard
          </h1>
          <p className="mt-2 text-muted-foreground">
            Pick a tool, drop a file, and download the result — all processed on your device.
          </p>
        </div>
        <Converter />
      </main>
    </div>
  );
}
