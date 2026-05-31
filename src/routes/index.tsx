import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground flex-col gap-6">
      <h1 className="text-5xl font-bold">Docnexis 🚀</h1>

      <p className="text-muted-foreground">
        Your AI-powered document conversion platform
      </p>
    </div>
  );
}