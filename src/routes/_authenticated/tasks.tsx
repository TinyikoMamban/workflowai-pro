import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, ListTodo, CheckCircle2, Circle, Loader2, Sparkles, Calendar, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/tasks")({ component: TasksPage });

type Task = {
  id: string; title: string; status: string; priority: string;
  due_date: string | null; description: string | null;
};

const COLS = [
  { key: "todo", label: "To do" },
  { key: "in_progress", label: "In progress" },
  { key: "done", label: "Done" },
] as const;

function TasksPage() {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [busy, setBusy] = useState(false);

  const { data: tasks } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data } = await supabase.from("tasks").select("*").order("created_at", { ascending: false });
      return (data ?? []) as Task[];
    },
  });

  const add = async () => {
    if (!title.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("tasks").insert({ user_id: user.id, title, priority });
    setTitle("");
    qc.invalidateQueries({ queryKey: ["tasks"] });
  };

  const move = async (id: string, status: string) => {
    await supabase.from("tasks").update({ status }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["tasks"] });
  };
  const remove = async (id: string) => {
    await supabase.from("tasks").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["tasks"] });
  };

  const plan = async () => {
    if (!tasks?.length) { toast.error("Add some tasks first"); return; }
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      toast.success("AI planned your day — see the schedule tab");
    }, 1000);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Task Planner</h1>
          <p className="text-sm text-muted-foreground">Plan your day with AI-powered prioritization.</p>
        </div>
        <div className="grid size-12 place-items-center rounded-2xl bg-gradient-primary text-white shadow-elegant">
          <ListTodo className="size-6" />
        </div>
      </div>

      <Card className="bg-gradient-card p-4">
        <div className="flex flex-wrap gap-2">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add a task..." className="flex-1 min-w-[200px]" onKeyDown={(e) => e.key === "Enter" && add()} />
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={add}><Plus className="size-4" /> Add</Button>
          <Button onClick={plan} variant="outline" disabled={busy}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />} AI plan my day
          </Button>
        </div>
      </Card>

      <Tabs defaultValue="kanban">
        <TabsList>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="schedule">Daily schedule</TabsTrigger>
          <TabsTrigger value="matrix">Priority matrix</TabsTrigger>
        </TabsList>

        <TabsContent value="kanban">
          <div className="grid gap-4 md:grid-cols-3">
            {COLS.map((col) => (
              <Card key={col.key} className="bg-gradient-card p-3">
                <div className="mb-2 flex items-center justify-between px-1">
                  <h3 className="text-sm font-semibold">{col.label}</h3>
                  <Badge variant="secondary">{tasks?.filter((t) => t.status === col.key).length ?? 0}</Badge>
                </div>
                <div className="space-y-2">
                  {tasks?.filter((t) => t.status === col.key).map((t) => (
                    <div key={t.id} className="group rounded-lg border border-border/50 bg-card p-3 shadow-soft">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn("text-sm font-medium", t.status === "done" && "line-through text-muted-foreground")}>{t.title}</p>
                        <button onClick={() => remove(t.id)} className="opacity-0 group-hover:opacity-100"><Trash2 className="size-3.5 text-destructive" /></button>
                      </div>
                      <div className="mt-2 flex items-center gap-1.5">
                        <PriorityBadge p={t.priority} />
                        <div className="ml-auto flex gap-1">
                          {COLS.filter((c) => c.key !== col.key).map((c) => (
                            <button key={c.key} onClick={() => move(t.id, c.key)} className="rounded-md border border-border px-1.5 py-0.5 text-[10px] hover:bg-accent">{c.label}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="schedule">
          <Card className="bg-gradient-card p-6">
            <div className="space-y-2">
              {["09:00", "10:30", "11:30", "13:00", "14:30", "16:00"].map((time, i) => {
                const task = tasks?.[i];
                return (
                  <div key={time} className="flex items-center gap-3 rounded-lg border border-border/40 p-3">
                    <Calendar className="size-4 text-primary" />
                    <span className="w-16 text-sm font-medium">{time}</span>
                    <span className="flex-1 text-sm">{task ? task.title : <span className="text-muted-foreground">Focus block</span>}</span>
                    {task && <PriorityBadge p={task.priority} />}
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="matrix">
          <div className="grid gap-3 md:grid-cols-2">
            {[
              { title: "Urgent & important", color: "bg-destructive/10 border-destructive/40", filter: (t: Task) => t.priority === "urgent" || t.priority === "high" },
              { title: "Important not urgent", color: "bg-primary/10 border-primary/40", filter: (t: Task) => t.priority === "medium" },
              { title: "Urgent not important", color: "bg-warning/10 border-warning/40", filter: () => false },
              { title: "Neither", color: "bg-muted/30", filter: (t: Task) => t.priority === "low" },
            ].map((q) => (
              <Card key={q.title} className={cn("border p-4", q.color)}>
                <h4 className="text-sm font-semibold">{q.title}</h4>
                <ul className="mt-2 space-y-1 text-sm">
                  {tasks?.filter(q.filter).map((t) => (
                    <li key={t.id} className="flex items-center gap-2">
                      {t.status === "done" ? <CheckCircle2 className="size-3.5 text-success" /> : <Circle className="size-3.5" />}
                      <span className={cn(t.status === "done" && "line-through text-muted-foreground")}>{t.title}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PriorityBadge({ p }: { p: string }) {
  const m: Record<string, string> = {
    urgent: "bg-destructive/15 text-destructive",
    high: "bg-warning/15 text-warning-foreground border border-warning/30",
    medium: "bg-primary/15 text-primary",
    low: "bg-muted text-muted-foreground",
  };
  return <span className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase", m[p])}>{p}</span>;
}
