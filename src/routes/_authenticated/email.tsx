import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy, Sparkles, Loader2, Mail, RefreshCcw, Save, History } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateEmail, type EmailInput } from "@/lib/ai.functions";
import { supabase } from "@/integrations/supabase/client";
import { AiDisclaimer } from "@/components/ai-disclaimer";

export const Route = createFileRoute("/_authenticated/email")({
  component: EmailPage,
});

const TONES = ["Formal", "Friendly", "Professional", "Executive", "Persuasive", "Technical"] as const;
const LENGTHS = ["Short", "Medium", "Long"] as const;

function EmailPage() {
  const generate = useServerFn(generateEmail);
  const qc = useQueryClient();
  const [form, setForm] = useState<EmailInput>({
    recipient: "",
    audience: "",
    purpose: "",
    context: "",
    keywords: "",
    tone: "Professional",
    length: "Medium",
  });
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{
    subject: string; body: string; alternative: string; followUp: string; cta: string;
  } | null>(null);

  const { data: history } = useQuery({
    queryKey: ["emails"],
    queryFn: async () => {
      const { data } = await supabase.from("emails").select("id,subject,recipient,tone,created_at").order("created_at", { ascending: false }).limit(10);
      return data ?? [];
    },
  });

  const run = async () => {
    if (!form.purpose.trim()) { toast.error("Purpose is required"); return; }
    setBusy(true);
    try {
      const r = await generate({ data: form });
      setResult(r);
      qc.invalidateQueries({ queryKey: ["emails"] });
      toast.success("Email generated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setBusy(false);
    }
  };

  const copy = (s: string) => { navigator.clipboard.writeText(s); toast.success("Copied"); };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Smart Email Generator</h1>
          <p className="text-sm text-muted-foreground">Draft executive-quality emails in seconds.</p>
        </div>
        <div className="grid size-12 place-items-center rounded-2xl bg-gradient-primary text-white shadow-elegant">
          <Mail className="size-6" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        {/* Inputs */}
        <Card className="space-y-4 bg-gradient-card p-6">
          <h2 className="font-semibold">Email brief</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Recipient</Label>
              <Input value={form.recipient} onChange={(e) => setForm({ ...form, recipient: e.target.value })} placeholder="e.g. Sarah, my manager" />
            </div>
            <div className="space-y-1.5">
              <Label>Audience</Label>
              <Input value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} placeholder="e.g. Executive team" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Purpose *</Label>
            <Input value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} placeholder="What do you want to achieve?" />
          </div>
          <div className="space-y-1.5">
            <Label>Context</Label>
            <Textarea rows={3} value={form.context} onChange={(e) => setForm({ ...form, context: e.target.value })} placeholder="Background, prior conversations..." />
          </div>
          <div className="space-y-1.5">
            <Label>Keywords</Label>
            <Input value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} placeholder="e.g. Q1 launch, urgent, partnership" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Tone</Label>
              <Select value={form.tone} onValueChange={(v) => setForm({ ...form, tone: v as EmailInput["tone"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TONES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Length</Label>
              <Select value={form.length} onValueChange={(v) => setForm({ ...form, length: v as EmailInput["length"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{LENGTHS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={run} disabled={busy} className="w-full bg-gradient-primary shadow-soft">
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            Generate email
          </Button>

          <div className="border-t border-border/50 pt-4">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <History className="size-3.5" /> Recent
            </div>
            <div className="space-y-1.5 text-xs">
              {history?.length ? history.map((h) => (
                <div key={h.id} className="flex items-center justify-between rounded-md border border-border/40 px-2 py-1.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{h.subject || "(untitled)"}</p>
                    <p className="truncate text-muted-foreground">{h.recipient || "—"} · {h.tone}</p>
                  </div>
                </div>
              )) : <p className="text-muted-foreground">No emails yet.</p>}
            </div>
          </div>
        </Card>

        {/* Output */}
        <Card className="bg-gradient-card p-6">
          {!result && !busy && (
            <div className="grid h-full place-items-center py-20 text-center text-muted-foreground">
              <div>
                <Sparkles className="mx-auto mb-3 size-10 opacity-40" />
                <p>Your generated email will appear here.</p>
              </div>
            </div>
          )}
          {busy && (
            <div className="grid h-full place-items-center py-20">
              <div className="text-center">
                <Loader2 className="mx-auto size-8 animate-spin text-primary" />
                <p className="mt-3 text-sm text-muted-foreground">Crafting your email...</p>
              </div>
            </div>
          )}
          {result && (
            <Tabs defaultValue="primary">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="primary">Primary</TabsTrigger>
                <TabsTrigger value="alt">Alternative</TabsTrigger>
                <TabsTrigger value="follow">Follow-up</TabsTrigger>
                <TabsTrigger value="cta">CTA</TabsTrigger>
              </TabsList>
              <TabsContent value="primary" className="space-y-3">
                <Field label="Subject" value={result.subject} onCopy={copy} />
                <Field label="Body" value={result.body} onCopy={copy} multi />
              </TabsContent>
              <TabsContent value="alt"><Field label="Alternative version" value={result.alternative} onCopy={copy} multi /></TabsContent>
              <TabsContent value="follow"><Field label="Follow-up" value={result.followUp} onCopy={copy} multi /></TabsContent>
              <TabsContent value="cta"><Field label="Call to action" value={result.cta} onCopy={copy} /></TabsContent>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={run}><RefreshCcw className="size-3.5" /> Regenerate</Button>
                <Button size="sm" variant="outline" onClick={() => copy(`Subject: ${result.subject}\n\n${result.body}`)}><Copy className="size-3.5" /> Copy all</Button>
                <Button size="sm" variant="outline"><Save className="size-3.5" /> Saved</Button>
              </div>
              <AiDisclaimer className="mt-4" confidence={0.9} />
            </Tabs>
          )}
        </Card>
      </div>
    </div>
  );
}

function Field({ label, value, onCopy, multi }: { label: string; value: string; onCopy: (s: string) => void; multi?: boolean }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <Label className="text-xs">{label}</Label>
        <Button size="sm" variant="ghost" className="h-6 gap-1 px-2 text-xs" onClick={() => onCopy(value)}>
          <Copy className="size-3" /> Copy
        </Button>
      </div>
      {multi ? (
        <Textarea readOnly value={value} className="min-h-[200px] resize-none" />
      ) : (
        <Input readOnly value={value} />
      )}
    </div>
  );
}
