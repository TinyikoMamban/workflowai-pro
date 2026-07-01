import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BookOpenText, Copy, Search, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/prompts")({ component: PromptsPage });

type Template = { id: string; title: string; category: string; description: string | null; prompt: string; tags: string[] | null };

const CATS = ["All", "Emails", "Meetings", "Research", "Writing", "Business", "HR", "Marketing"];

function PromptsPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");

  const { data: templates } = useQuery({
    queryKey: ["prompts"],
    queryFn: async () => {
      const { data } = await supabase.from("prompt_templates").select("*").order("category");
      return (data ?? []) as Template[];
    },
  });
  const { data: favIds } = useQuery({
    queryKey: ["prompt-favs"],
    queryFn: async () => {
      const { data } = await supabase.from("prompt_favorites").select("template_id");
      return new Set((data ?? []).map((r: { template_id: string }) => r.template_id));
    },
  });

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (templates ?? []).filter((t) => {
      if (cat !== "All" && t.category !== cat) return false;
      if (!needle) return true;
      const hay = [
        t.title,
        t.category,
        t.description ?? "",
        t.prompt,
        (t.tags ?? []).join(" "),
      ].join(" ").toLowerCase();
      return hay.includes(needle);
    });
  }, [templates, q, cat]);

  const toggleFav = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (favIds?.has(id)) {
      await supabase.from("prompt_favorites").delete().eq("template_id", id).eq("user_id", user.id);
    } else {
      await supabase.from("prompt_favorites").insert({ template_id: id, user_id: user.id });
    }
    qc.invalidateQueries({ queryKey: ["prompt-favs"] });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Prompt Library</h1>
          <p className="text-sm text-muted-foreground">Professional templates for every workplace task.</p>
        </div>
        <div className="grid size-12 place-items-center rounded-2xl bg-gradient-primary text-white shadow-elegant">
          <BookOpenText className="size-6" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search prompts..." className="pl-9" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CATS.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition",
              cat === c ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-accent",
            )}>{c}</button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((t) => (
          <Card key={t.id} className="flex flex-col bg-gradient-card p-5">
            <div className="flex items-start justify-between gap-2">
              <Badge variant="secondary">{t.category}</Badge>
              <button onClick={() => toggleFav(t.id)}>
                <Star className={cn("size-4", favIds?.has(t.id) ? "fill-warning text-warning" : "text-muted-foreground")} />
              </button>
            </div>
            <h3 className="mt-2 font-semibold">{t.title}</h3>
            {(() => {
              const desc = t.description ?? "";
              const idx = desc.toLowerCase().indexOf("use case:");
              const short = idx >= 0 ? desc.slice(0, idx).trim() : desc;
              const useCase = idx >= 0 ? desc.slice(idx + "use case:".length).trim() : "";
              return (
                <>
                  {short && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{short}</p>}
                  {useCase && (
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      <span className="font-semibold text-foreground/80">Use case: </span>{useCase}
                    </p>
                  )}
                </>
              );
            })()}
            <pre className="mt-3 line-clamp-4 whitespace-pre-wrap rounded-md bg-muted/40 p-2 text-[11px] text-muted-foreground">{t.prompt}</pre>
            {t.tags && t.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {t.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="rounded-full bg-muted/60 px-2 py-0.5 text-[10px] text-muted-foreground">{tag}</span>
                ))}
              </div>
            )}
            <Button size="sm" variant="outline" className="mt-3" onClick={() => { navigator.clipboard.writeText(t.prompt); toast.success("Prompt copied to clipboard"); }}>
              <Copy className="size-3.5" /> Copy prompt
            </Button>
          </Card>
        ))}
        {filtered.length === 0 && (
          <Card className="col-span-full p-10 text-center text-muted-foreground">No prompts found.</Card>
        )}
      </div>
    </div>
  );
}
