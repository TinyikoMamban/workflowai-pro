import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Sparkles, FileText, Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { AiDisclaimer } from "@/components/ai-disclaimer";

export const Route = createFileRoute("/_authenticated/meetings")({ component: MeetingsPage });

function MeetingsPage() {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<null | {
    summary: string;
    key_points: string[];
    action_items: { task: string; owner: string; deadline: string }[];
    decisions: string[];
    risks: string[];
    follow_up: string;
  }>(null);

  const { data: history } = useQuery({
    queryKey: ["meetings"],
    queryFn: async () => {
      const { data } = await supabase.from("meeting_notes").select("id,title,created_at,summary").order("created_at", { ascending: false }).limit(8);
      return data ?? [];
    },
  });

  const analyze = async () => {
    if (!input.trim()) { toast.error("Paste meeting notes first"); return; }
    setBusy(true);
    try {
      // Mock structured summary (Meeting feature uses mock until wired)
      const points = input.split(/\n+/).filter((l) => l.trim().length > 6).slice(0, 6);
      const r = {
        summary: `This meeting covered ${points.length} key topics with a focus on delivery, planning, and team alignment. Decisions were made around scope and timeline, and follow-up actions were assigned.`,
        key_points: points.length ? points.map((p) => p.replace(/^[-*•]\s*/, "").slice(0, 140)) : ["No clear discussion points detected."],
        action_items: [
          { task: "Send follow-up summary to team", owner: "You", deadline: "Tomorrow" },
          { task: "Schedule kickoff review", owner: "Lead", deadline: "Next week" },
          { task: "Document open questions", owner: "PM", deadline: "Friday" },
        ],
        decisions: ["Proceed with proposed scope", "Defer non-critical items to next sprint"],
        risks: ["Resource availability over the next 2 weeks", "Dependency on external vendor confirmation"],
        follow_up: `Hi team,\n\nThanks for a productive session. Here's a recap and the action items we agreed on. Please confirm by EOD.\n\nBest regards`,
      };
      setResult(r);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("meeting_notes").insert({
          user_id: user.id,
          title: title || "Untitled meeting",
          raw_input: input,
          summary: r.summary,
          key_points: r.key_points,
          action_items: r.action_items,
          decisions: r.decisions,
          risks: r.risks,
          follow_up_email: r.follow_up,
        });
        await supabase.from("analytics_events").insert({ user_id: user.id, event_type: "meeting_summarized" });
        qc.invalidateQueries({ queryKey: ["meetings"] });
        toast.success("Meeting summarized");
      }
    } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meeting Notes Summarizer</h1>
          <p className="text-sm text-muted-foreground">Turn raw notes into action items and follow-ups.</p>
        </div>
        <div className="grid size-12 place-items-center rounded-2xl bg-gradient-primary text-white shadow-elegant">
          <FileText className="size-6" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-3 bg-gradient-card p-6">
          <Label>Meeting title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Q1 Planning kickoff" />
          <Label>Paste transcript or notes</Label>
          <Textarea rows={14} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste the meeting transcript, notes, or bullet points here..." />
          <Button onClick={analyze} disabled={busy} className="w-full bg-gradient-primary shadow-soft">
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            Summarize meeting
          </Button>
          <div className="border-t border-border/50 pt-3 text-xs">
            <p className="mb-2 font-medium text-muted-foreground">Recent summaries</p>
            {history?.map((h) => (
              <div key={h.id} className="rounded-md border border-border/40 px-2 py-1.5">
                <p className="font-medium">{h.title}</p>
                <p className="line-clamp-2 text-muted-foreground">{h.summary}</p>
              </div>
            )) || null}
          </div>
        </Card>

        <Card className="bg-gradient-card p-6">
          {!result ? (
            <div className="grid h-full place-items-center text-center text-muted-foreground">
              <div>
                <Sparkles className="mx-auto mb-2 size-10 opacity-40" />
                <p>Your meeting summary will appear here.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Section title="Executive summary"><p className="text-sm">{result.summary}</p></Section>
              <Section title="Key points">
                <ul className="list-disc pl-5 text-sm space-y-1">{result.key_points.map((p, i) => <li key={i}>{p}</li>)}</ul>
              </Section>
              <Section title="Action items">
                <div className="space-y-1.5">
                  {result.action_items.map((a, i) => (
                    <div key={i} className="rounded-lg border border-border/50 p-2.5 text-sm">
                      <p className="font-medium">{a.task}</p>
                      <p className="text-xs text-muted-foreground">Owner: {a.owner} · Due: {a.deadline}</p>
                    </div>
                  ))}
                </div>
              </Section>
              <div className="grid gap-3 sm:grid-cols-2">
                <Section title="Decisions"><ul className="list-disc pl-5 text-sm space-y-1">{result.decisions.map((d, i) => <li key={i}>{d}</li>)}</ul></Section>
                <Section title="Risks"><ul className="list-disc pl-5 text-sm space-y-1">{result.risks.map((d, i) => <li key={i}>{d}</li>)}</ul></Section>
              </div>
              <Section title="Follow-up email">
                <Textarea readOnly value={result.follow_up} className="min-h-32" />
              </Section>
              <Button variant="outline" className="w-full"><Save className="size-4" /> Saved to workspace</Button>
              <AiDisclaimer confidence={0.78} />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      {children}
    </div>
  );
}
