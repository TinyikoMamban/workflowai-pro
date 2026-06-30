import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Mail, FileText, ListTodo, FlaskConical, MessageSquare, BookOpenText, ShieldCheck, Zap, BarChart3, Star } from "lucide-react";
import { BrandMark } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WorkFlow AI Pro — Intelligent Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "Automate emails, meetings, tasks, and research with responsible AI. The all-in-one productivity platform for modern professionals.",
      },
      { property: "og:title", content: "WorkFlow AI Pro" },
      {
        property: "og:description",
        content: "Automate emails, meetings, tasks, and research with responsible AI.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Mail, title: "Smart Email Generator", desc: "Draft executive-quality emails in seconds across any tone, length, or audience." },
  { icon: FileText, title: "Meeting Notes Summarizer", desc: "Turn raw transcripts into action items, decisions, risks, and follow-ups." },
  { icon: ListTodo, title: "AI Task Planner", desc: "Generate daily schedules, time-blocks, and a priority matrix tailored to you." },
  { icon: FlaskConical, title: "Research Assistant", desc: "Synthesize articles into findings, insights, SWOT, and recommendations." },
  { icon: MessageSquare, title: "Workplace AI Chat", desc: "A persistent, context-aware assistant for any workplace question." },
  { icon: BookOpenText, title: "Prompt Library", desc: "Curated, role-specific templates for HR, marketing, sales, and more." },
];

const stats = [
  { value: "120K+", label: "Professionals Assisted" },
  { value: "8.4M", label: "AI Tasks Completed" },
  { value: "47%", label: "Productivity Increase" },
  { value: "2.1M", label: "Hours Saved" },
];

const testimonials = [
  { name: "Priya Sharma", role: "Product Manager, Lumen", quote: "WorkFlow AI Pro replaced four tools in our stack. Meetings to action items in seconds." },
  { name: "Marcus Chen", role: "HR Director, Northwind", quote: "Our team writes faster, plans smarter, and ships more — without burning out." },
  { name: "Sofia Alvarez", role: "Founder, Atlas Consulting", quote: "The Research Assistant alone pays for itself every single week." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <BrandMark className="size-9" />
            <span className="text-base font-bold">WorkFlow AI Pro</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <a href="#features" className="text-muted-foreground hover:text-foreground">Features</a>
            <a href="#stats" className="text-muted-foreground hover:text-foreground">Impact</a>
            <a href="#testimonials" className="text-muted-foreground hover:text-foreground">Customers</a>
            <a href="#faq" className="text-muted-foreground hover:text-foreground">FAQ</a>
            <Link to="/responsible-ai" className="text-muted-foreground hover:text-foreground">Responsible AI</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/auth"><Button variant="ghost" size="sm">Sign in</Button></Link>
            <Link to="/auth"><Button size="sm" className="bg-gradient-primary shadow-soft">Get Started</Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="mx-auto max-w-7xl px-6 py-24 text-center md:py-32">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-1.5 text-xs font-medium backdrop-blur">
            <Zap className="size-3.5 text-primary" />
            Now with real-time AI streaming
          </div>
          <h1 className="mx-auto max-w-4xl text-5xl font-extrabold leading-[1.05] tracking-tight md:text-7xl">
            Your intelligent <span className="text-gradient">workplace</span> productivity assistant
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            WorkFlow AI Pro automates emails, meetings, tasks, and research — so your team can focus on
            decisions that move the business forward.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-primary shadow-elegant">
                Get Started Free <ArrowRight className="ml-1 size-4" />
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline">Explore Features</Button>
            </a>
          </div>

          <div className="relative mx-auto mt-20 max-w-5xl">
            <div className="absolute inset-0 -z-10 bg-gradient-primary opacity-30 blur-3xl" />
            <div className="glass overflow-hidden rounded-3xl border shadow-elegant">
              <div className="flex items-center gap-1.5 border-b border-border/50 px-4 py-3">
                <div className="size-2.5 rounded-full bg-destructive/70" />
                <div className="size-2.5 rounded-full bg-warning/70" />
                <div className="size-2.5 rounded-full bg-success/70" />
                <div className="ml-3 text-xs text-muted-foreground">workflow.ai/dashboard</div>
              </div>
              <div className="grid gap-4 p-6 sm:grid-cols-3">
                {[
                  { label: "Today's Tasks", value: "12", trend: "+3" },
                  { label: "Hours Saved", value: "4.2h", trend: "+18%" },
                  { label: "Productivity", value: "92", trend: "+6" },
                ].map((s) => (
                  <Card key={s.label} className="bg-gradient-card p-4">
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="mt-1 text-2xl font-bold">{s.value}</p>
                    <p className="text-xs text-success">{s.trend}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">All-in-one platform</p>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">Six AI superpowers. One unified workspace.</h2>
          <p className="mt-3 text-muted-foreground">Replace a tangle of tools with one focused product.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} className="group bg-gradient-card p-6 transition hover:shadow-elegant">
              <div className="grid size-11 place-items-center rounded-xl bg-gradient-primary text-white shadow-soft transition group-hover:scale-110">
                <f.icon className="size-5" />
              </div>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="border-y border-border/40 bg-muted/30">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="bg-gradient-primary bg-clip-text text-4xl font-extrabold text-transparent md:text-5xl">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Loved by leaders at growing teams</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.name} className="bg-gradient-card p-6">
              <div className="flex gap-0.5 text-warning">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-4 fill-current" />)}
              </div>
              <p className="mt-4 text-sm">"{t.quote}"</p>
              <div className="mt-6">
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-6 py-24">
        <h2 className="mb-8 text-center text-3xl font-bold">Frequently asked questions</h2>
        <Accordion type="single" collapsible className="w-full">
          {[
            { q: "Is my data private?", a: "Yes. Your inputs are scoped to your account with row-level security and never used to train public models." },
            { q: "Which AI models power WorkFlow AI Pro?", a: "We use Google Gemini 3 Flash by default for low-latency, high-quality results, with smart fallbacks for complex tasks." },
            { q: "Can I cancel anytime?", a: "Absolutely. There are no contracts — your account stays free forever for individuals." },
            { q: "Do you support team workspaces?", a: "Team workspaces with shared prompts and analytics are coming soon." },
          ].map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-primary p-12 text-center text-white shadow-elegant">
          <div className="absolute inset-0 opacity-30 bg-gradient-hero" />
          <div className="relative">
            <ShieldCheck className="mx-auto mb-3 size-10" />
            <h2 className="text-3xl font-bold md:text-4xl">Start working smarter today</h2>
            <p className="mx-auto mt-2 max-w-xl opacity-90">Join thousands of professionals automating their day with responsible AI.</p>
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="mt-6 text-foreground">
                Get Started — it's free <ArrowRight className="ml-1 size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="size-4 text-primary" />
            <span>© 2026 WorkFlow AI Pro. Built with responsible AI.</span>
          </div>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link to="/responsible-ai">Responsible AI</Link>
            <a href="#features">Features</a>
            <Link to="/auth">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
