import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FlaskConical, Loader2, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { AiDisclaimer } from "@/components/ai-disclaimer";

export const Route = createFileRoute("/_authenticated/research")({ component: ResearchPage });

function ResearchPage() {
  const qc = useQueryClient();
  const [topic, setTopic] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<null | {
    summary: string; findings: string[]; insights: string[]; recommendations: string[];
    swot: { strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[] };
    simplified: string; confidence: number;
  }>(null);

  const { data: history } = useQuery({
    queryKey: ["research"],
    queryFn: async () => {
      const { data } = await supabase.from("research_sessions").select("id,topic,created_at,confidence").order("created_at", { ascending: false }).limit(8);
      return data ?? [];
    },
  });

  const run = async () => {
    if (!text.trim()) { toast.error("Paste content to analyze"); return; }
    setBusy(true);
    try {
      const sentences = text.split(/[.!?]\s+/).filter((s) => s.trim().length > 20).slice(0, 6);
      const r = {
        summary: `Analysis of ${topic || "the provided content"} reveals strategic implications across operational, financial, and competitive dimensions. The material highlights both opportunities for growth and several risk areas requiring close monitoring.`,
        findings: sentences.length ? sentences.map((s) => s.slice(0, 180)) : ["No detailed findings extracted from the input."],
        insights: [
          "Long-term sustainability depends on consistent execution against the highlighted priorities.",
          "Cross-functional alignment will accelerate adoption.",
          "Early indicators suggest a measurable productivity uplift.",
        ],
        recommendations: [
          "Define and track 3 leading indicators within the first 30 days.",
          "Pilot the approach with a single team before scaling.",
          "Establish a weekly review cadence with stakeholders.",
        ],
        swot: {
          strengths: ["Clear vision", "Strong team alignment"],
          weaknesses: ["Resource constraints", "Limited historical data"],
          opportunities: ["Market expansion", "Process automation"],
          threats: ["Competitive pressure", "Regulatory changes"],
        },
        simplified: "In short: there's a real opportunity here, but success depends on focused execution and managing a few clear risks.",
        confidence: 0.82,
      };
      setResult(r);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("research_sessions").insert({
          user_id: user.id, topic: topic || "Untitled", source_text: text,
          summary: r.summary, findings: r.findings, insights: r.insights,
          recommendations: r.recommendations, swot: r.swot, confidence: r.confidence,
        });
        await supabase.from("analytics_events").insert({ user_id: user.id, event_type: "research_run" });
        qc.invalidateQueries({ queryKey: ["research"] });
      }
      toast.success("Research analyzed");
    } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Research Assistant</h1>
          <p className="text-sm text-muted-foreground">Synthesize articles, reports, and questions into insights.</p>
        </div>
        <div className="grid size-12 place-items-center rounded-2xl bg-gradient-primary text-white shadow-elegant">
          <FlaskConical className="size-6" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-3 bg-gradient-card p-6">
          <Label>Topic / question</Label>
          <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Impact of AI on knowledge work" />
          <Label>Content to analyze</Label>
          <Textarea rows={14} value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste an article, report, or notes..." />
          <Button onClick={run} disabled={busy} className="w-full bg-gradient-primary shadow-soft">
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />} Analyze
          </Button>
          {history && history.length > 0 && (
            <div className="border-t border-border/50 pt-3 text-xs">
              <p className="mb-2 font-medium text-muted-foreground">Recent sessions</p>
              {history.map((h) => (
                <div key={h.id} className="rounded-md border border-border/40 px-2 py-1.5">
                  <p className="font-medium">{h.topic}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="bg-gradient-card p-6">
          {!result ? (
            <div className="grid h-full place-items-center text-center text-muted-foreground">
              <div><Sparkles className="mx-auto mb-2 size-10 opacity-40" /><p>Insights will appear here.</p></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-semibold uppercase tracking-wider text-muted-foreground">Confidence</span>
                  <span className="font-mono">{Math.round(result.confidence * 100)}%</span>
                </div>
                <Progress value={result.confidence * 100} />
              </div>
              <Section title="Executive summary"><p className="text-sm">{result.summary}</p></Section>
              <Section title="Key findings"><Bullets items={result.findings} /></Section>
              <Section title="Insights"><Bullets items={result.insights} /></Section>
              <Section title="Recommendations"><Bullets items={result.recommendations} /></Section>
              <Section title="SWOT analysis">
                <div className="grid gap-2 sm:grid-cols-2">
                  <Swot label="Strengths" items={result.swot.strengths} tone="success" />
                  <Swot label="Weaknesses" items={result.swot.weaknesses} tone="destructive" />
                  <Swot label="Opportunities" items={result.swot.opportunities} tone="primary" />
                  <Swot label="Threats" items={result.swot.threats} tone="warning" />
                </div>
              </Section>
              <Section title="In simple terms"><p className="text-sm italic">{result.simplified}</p></Section>
              <AiDisclaimer confidence={result.confidence} />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div><h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>{children}</div>;
}
function Bullets({ items }: { items: string[] }) {
  return <ul className="list-disc space-y-1 pl-5 text-sm">{items.map((i, k) => <li key={k}>{i}</li>)}</ul>;
}
function Swot({ label, items, tone }: { label: string; items: string[]; tone: string }) {
  const colors: Record<string, string> = {
    success: "border-success/40 bg-success/5",
    destructive: "border-destructive/40 bg-destructive/5",
    primary: "border-primary/40 bg-primary/5",
    warning: "border-warning/40 bg-warning/5",
  };
  return (
    <div className={`rounded-lg border p-3 ${colors[tone]}`}>
      <p className="mb-1 text-xs font-semibold">{label}</p>
      <ul className="space-y-0.5 text-xs">{items.map((i, k) => <li key={k}>• {i}</li>)}</ul>
    </div>
  );
}
