import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, ListTodo, Mail, FileText, FlaskConical, Sparkles, Clock, TrendingUp, MessageSquare, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const { data: stats } = useQuery({
    queryKey: ["dash-stats", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [tasks, emails, meetings, research] = await Promise.all([
        supabase.from("tasks").select("id,status", { count: "exact" }),
        supabase.from("emails").select("id", { count: "exact", head: true }),
        supabase.from("meeting_notes").select("id", { count: "exact", head: true }),
        supabase.from("research_sessions").select("id", { count: "exact", head: true }),
      ]);
      const todo = (tasks.data ?? []).filter((t) => t.status !== "done").length;
      return {
        todayTasks: todo,
        emails: emails.count ?? 0,
        meetings: meetings.count ?? 0,
        research: research.count ?? 0,
      };
    },
  });

  const cards = [
    { label: "Today's Tasks", value: stats?.todayTasks ?? 0, icon: ListTodo, accent: "from-blue-500 to-indigo-500", to: "/tasks" },
    { label: "Emails Generated", value: stats?.emails ?? 0, icon: Mail, accent: "from-purple-500 to-pink-500", to: "/email" },
    { label: "Meeting Summaries", value: stats?.meetings ?? 0, icon: FileText, accent: "from-emerald-500 to-teal-500", to: "/meetings" },
    { label: "Research Sessions", value: stats?.research ?? 0, icon: FlaskConical, accent: "from-orange-500 to-red-500", to: "/research" },
  ];

  const productivity = Math.min(100, 65 + (stats?.todayTasks ?? 0) * 2);
  const hoursSaved = ((stats?.emails ?? 0) * 0.3 + (stats?.meetings ?? 0) * 0.7 + (stats?.research ?? 0) * 1.2).toFixed(1);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Welcome */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(" ")[0]}` : ""} 👋
          </h1>
          <p className="text-sm text-muted-foreground">Here's what AI did for you today.</p>
        </div>
        <Link to="/chat">
          <Button className="bg-gradient-primary shadow-soft">
            <Sparkles className="size-4" /> Ask AI anything
          </Button>
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} to={c.to}>
            <Card className="group bg-gradient-card p-5 transition hover:shadow-elegant">
              <div className="flex items-start justify-between">
                <div className={`grid size-10 place-items-center rounded-xl bg-gradient-to-br ${c.accent} text-white shadow-soft`}>
                  <c.icon className="size-5" />
                </div>
                <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
              </div>
              <p className="mt-4 text-3xl font-bold">{c.value}</p>
              <p className="text-xs text-muted-foreground">{c.label}</p>
            </Card>
          </Link>
        ))}
      </div>

      {/* Productivity + Hours */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="bg-gradient-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Productivity Score</h3>
              <p className="text-xs text-muted-foreground">Based on AI usage and tasks completed</p>
            </div>
            <TrendingUp className="size-5 text-success" />
          </div>
          <div className="mt-6 flex items-end gap-4">
            <p className="bg-gradient-primary bg-clip-text text-5xl font-extrabold text-transparent">{productivity}</p>
            <span className="pb-2 text-sm text-success">+6 this week</span>
          </div>
          <Progress value={productivity} className="mt-4" />
          <div className="mt-6 grid grid-cols-3 gap-4 text-center text-xs">
            {[
              { label: "Focus", v: 78 },
              { label: "Output", v: 92 },
              { label: "Consistency", v: 84 },
            ].map((m) => (
              <div key={m.label}>
                <p className="text-2xl font-bold">{m.v}</p>
                <p className="text-muted-foreground">{m.label}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-gradient-card p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Hours Saved</h3>
            <Clock className="size-5 text-primary" />
          </div>
          <p className="mt-4 bg-gradient-primary bg-clip-text text-5xl font-extrabold text-transparent">{hoursSaved}h</p>
          <p className="text-xs text-muted-foreground">this week with AI</p>
          <div className="mt-6 space-y-3 text-xs">
            <div className="flex justify-between"><span>Emails</span><span className="font-medium">{((stats?.emails ?? 0) * 0.3).toFixed(1)}h</span></div>
            <div className="flex justify-between"><span>Meetings</span><span className="font-medium">{((stats?.meetings ?? 0) * 0.7).toFixed(1)}h</span></div>
            <div className="flex justify-between"><span>Research</span><span className="font-medium">{((stats?.research ?? 0) * 1.2).toFixed(1)}h</span></div>
          </div>
        </Card>
      </div>

      {/* Quick actions */}
      <Card className="bg-gradient-card p-6">
        <h3 className="font-semibold">Quick Actions</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "New chat", to: "/chat", icon: MessageSquare },
            { label: "Draft email", to: "/email", icon: Mail },
            { label: "Summarize meeting", to: "/meetings", icon: FileText },
            { label: "Plan my day", to: "/tasks", icon: Plus },
          ].map((a) => (
            <Link key={a.label} to={a.to}>
              <Button variant="outline" className="w-full justify-start gap-2">
                <a.icon className="size-4 text-primary" /> {a.label}
              </Button>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
