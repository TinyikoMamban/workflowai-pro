import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, TrendingUp, Mail, FileText, FlaskConical, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
  Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

export const Route = createFileRoute("/_authenticated/analytics")({ component: AnalyticsPage });

function AnalyticsPage() {
  const { data: stats } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const [emails, meets, research, tasks, events] = await Promise.all([
        supabase.from("emails").select("created_at"),
        supabase.from("meeting_notes").select("created_at"),
        supabase.from("research_sessions").select("created_at"),
        supabase.from("tasks").select("status,created_at"),
        supabase.from("analytics_events").select("event_type,created_at").order("created_at", { ascending: false }).limit(200),
      ]);
      return {
        emails: emails.data?.length ?? 0,
        meets: meets.data?.length ?? 0,
        research: research.data?.length ?? 0,
        tasksDone: tasks.data?.filter((t: { status: string }) => t.status === "done").length ?? 0,
        events: events.data ?? [],
      };
    },
  });

  const hoursSaved = ((stats?.emails ?? 0) * 0.25 + (stats?.meets ?? 0) * 0.5 + (stats?.research ?? 0) * 1 + (stats?.tasksDone ?? 0) * 0.1).toFixed(1);
  const productivity = Math.min(100, 50 + (stats?.tasksDone ?? 0) * 3 + (stats?.emails ?? 0) * 2);

  const week = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const count = (stats?.events ?? []).filter((e: { created_at: string }) => e.created_at.startsWith(key)).length;
    return { day: d.toLocaleDateString(undefined, { weekday: "short" }), events: count };
  });

  const breakdown = [
    { name: "Emails", v: stats?.emails ?? 0 },
    { name: "Meetings", v: stats?.meets ?? 0 },
    { name: "Research", v: stats?.research ?? 0 },
    { name: "Tasks", v: stats?.tasksDone ?? 0 },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Productivity Analytics</h1>
          <p className="text-sm text-muted-foreground">Track your AI-assisted productivity over time.</p>
        </div>
        <div className="grid size-12 place-items-center rounded-2xl bg-gradient-primary text-white shadow-elegant"><BarChart3 className="size-6" /></div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Mail} label="Emails generated" value={stats?.emails ?? 0} tone="from-blue-500 to-purple-500" />
        <Stat icon={FileText} label="Meetings summarized" value={stats?.meets ?? 0} tone="from-purple-500 to-pink-500" />
        <Stat icon={FlaskConical} label="Research sessions" value={stats?.research ?? 0} tone="from-pink-500 to-orange-500" />
        <Stat icon={Clock} label="Hours saved" value={hoursSaved} tone="from-green-500 to-emerald-500" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="bg-gradient-card p-6">
          <h3 className="mb-3 font-semibold">AI usage (last 7 days)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={week}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Line type="monotone" dataKey="events" stroke="hsl(var(--primary))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card className="bg-gradient-card p-6">
          <h3 className="mb-3 font-semibold">Output breakdown</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={breakdown}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Bar dataKey="v" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="bg-gradient-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="size-6 text-primary" />
            <div>
              <h3 className="font-semibold">Productivity score</h3>
              <p className="text-xs text-muted-foreground">Based on outputs, tasks completed, and AI usage.</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-gradient">{productivity}</div>
        </div>
      </Card>
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone }: { icon: typeof Mail; label: string; value: number | string; tone: string }) {
  return (
    <Card className="bg-gradient-card p-5">
      <div className={`mb-3 grid size-10 place-items-center rounded-xl bg-gradient-to-br ${tone} text-white shadow-soft`}>
        <Icon className="size-5" />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </Card>
  );
}
