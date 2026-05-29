import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  FileStack,
  Lock,
  MousePointerClick,
  Sparkles,
  Zap,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { CONVERSION_TOOLS } from "@/lib/conversion-tools";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Docnexis — AI-Ready Document Conversion Platform" },
      {
        name: "description",
        content:
          "Convert PDF, Excel, Word and images right in your browser. Fast, private, no uploads to a server. Start converting with Docnexis.",
      },
      { property: "og:title", content: "Docnexis — AI-Ready Document Conversion Platform" },
      {
        property: "og:description",
        content: "Convert PDF, Excel, Word and images securely in your browser with Docnexis.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Landing,
});

const STEPS = [
  { icon: MousePointerClick, title: "Pick a tool", text: "Choose the conversion you need." },
  { icon: FileStack, title: "Drop your file", text: "Upload PDF, Excel, Word or an image." },
  { icon: Sparkles, title: "Download result", text: "Get your converted file instantly." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-hero-glow">
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:pt-16">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-muted-foreground">
                <Sparkles className="size-3.5 text-accent" /> AI editing coming soon
              </span>
              <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
                Convert documents <span className="text-gradient">in seconds</span>, right in your
                browser.
              </h1>
              <p className="mt-5 max-w-lg text-lg text-muted-foreground">
                Docnexis turns PDFs, spreadsheets, Word files and images into the formats you need —
                fast, clean and completely private. Nothing ever leaves your device.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.03] active:scale-95"
                >
                  Start Converting <ArrowRight className="size-4" />
                </Link>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock className="size-4" /> No account · No uploads
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-accent opacity-20 blur-3xl" />
              <img
                src={heroImg}
                alt="Documents converting between PDF, Excel and Word formats"
                className="relative w-full rounded-[1.75rem] border border-glass-border shadow-glow"
                loading="eager"
              />
            </div>
          </div>
        </section>

        {/* Tools */}
        <section className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Every conversion you need</h2>
          <p className="mt-2 text-muted-foreground">Built for clean, reliable results.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CONVERSION_TOOLS.map((t) => {
              const Icon = t.icon;
              return (
                <div key={t.id} className="glass rounded-2xl p-5 shadow-card">
                  <span className="flex size-12 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
                    <Icon className="size-6" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold">{t.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Steps */}
        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="glass rounded-3xl p-8 shadow-card sm:p-12">
            <h2 className="text-center font-display text-2xl font-bold sm:text-3xl">
              Three simple steps
            </h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-3">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={s.title} className="text-center">
                    <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
                      <Icon className="size-6" />
                    </span>
                    <h3 className="mt-4 font-display text-lg font-semibold">
                      {i + 1}. {s.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="glass relative overflow-hidden rounded-3xl p-10 text-center shadow-glow sm:p-14">
            <div className="absolute -inset-10 bg-gradient-accent opacity-10 blur-3xl" />
            <Zap className="relative mx-auto size-8 text-accent" />
            <h2 className="relative mt-4 font-display text-3xl font-bold sm:text-4xl">
              Ready to convert?
            </h2>
            <p className="relative mx-auto mt-3 max-w-md text-muted-foreground">
              Jump into the dashboard and transform your first document in seconds.
            </p>
            <Link
              to="/dashboard"
              className="relative mt-7 inline-flex items-center gap-2 rounded-full bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.03] active:scale-95"
            >
              Start Converting <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-4 py-10 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Docnexis. All processing happens locally in your browser.</p>
      </footer>
    </div>
  );
}
