import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Folder, Mail, FileText, FlaskConical, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/documents")({ component: DocsPage });

function DocsPage() {
  const [q, setQ] = useState("");
  const { data: emails } = useQuery({ queryKey: ["docs-emails"], queryFn: async () => (await supabase.from("emails").select("*").order("created_at", { ascending: false })).data ?? [] });
  const { data: meets } = useQuery({ queryKey: ["docs-meets"], queryFn: async () => (await supabase.from("meeting_notes").select("*").order("created_at", { ascending: false })).data ?? [] });
  const { data: research } = useQuery({ queryKey: ["docs-research"], queryFn: async () => (await supabase.from("research_sessions").select("*").order("created_at", { ascending: false })).data ?? [] });

  const f = (s: string | null | undefined) => !q || (s ?? "").toLowerCase().includes(q.toLowerCase());

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Document Workspace</h1>
          <p className="text-sm text-muted-foreground">Everything you've created with AI in one place.</p>
        </div>
        <div className="grid size-12 place-items-center rounded-2xl bg-gradient-primary text-white shadow-elegant"><Folder className="size-6" /></div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search documents..." className="pl-9" />
      </div>

      <Tabs defaultValue="emails">
        <TabsList>
          <TabsTrigger value="emails"><Mail className="size-4" /> Emails ({emails?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="meetings"><FileText className="size-4" /> Meetings ({meets?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="research"><FlaskConical className="size-4" /> Research ({research?.length ?? 0})</TabsTrigger>
        </TabsList>
        <TabsContent value="emails" className="space-y-2">
          {(emails ?? []).filter((e) => f(e.subject) || f(e.recipient)).map((e) => (
            <Card key={e.id} className="bg-gradient-card p-4">
              <p className="font-semibold">{e.subject || "(untitled)"}</p>
              <p className="text-xs text-muted-foreground">To: {e.recipient || "—"} · {e.tone}</p>
              <p className="mt-2 line-clamp-2 text-sm">{e.body}</p>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="meetings" className="space-y-2">
          {(meets ?? []).filter((m) => f(m.title) || f(m.summary)).map((m) => (
            <Card key={m.id} className="bg-gradient-card p-4">
              <p className="font-semibold">{m.title}</p>
              <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{m.summary}</p>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="research" className="space-y-2">
          {(research ?? []).filter((r) => f(r.topic) || f(r.summary)).map((r) => (
            <Card key={r.id} className="bg-gradient-card p-4">
              <p className="font-semibold">{r.topic}</p>
              <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{r.summary}</p>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
