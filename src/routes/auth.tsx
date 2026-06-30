import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Sparkles, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — WorkFlow AI Pro" },
      { name: "description", content: "Sign in to your WorkFlow AI Pro account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const { user, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (!loading && user) nav({ to: "/dashboard" });
  }, [loading, user, nav]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        nav({ to: "/dashboard" });
      } else if (mode === "signup") {
        if (password.length < 8) throw new Error("Password must be at least 8 characters.");
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { full_name: name },
          },
        });
        if (error) throw error;
        toast.success("Account created — check your email or sign in.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });
        if (error) throw error;
        toast.success("Password reset email sent.");
        setMode("signin");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
      if (!result.redirected) nav({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left brand panel */}
      <div className="relative hidden overflow-hidden bg-gradient-primary p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 opacity-40 bg-gradient-hero" />
        <Link to="/" className="relative flex items-center gap-2">
          <div className="grid size-9 place-items-center rounded-xl bg-white/20 backdrop-blur">
            <Sparkles className="size-5" />
          </div>
          <span className="text-lg font-bold">WorkFlow AI Pro</span>
        </Link>
        <div className="relative">
          <h1 className="text-4xl font-extrabold leading-tight">Work smarter,<br />not harder.</h1>
          <p className="mt-3 max-w-md text-white/80">
            Automate emails, meetings, tasks, and research with one intelligent assistant.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { v: "8.4M", l: "Tasks done" },
              { v: "120K+", l: "Pros assisted" },
              { v: "47%", l: "More output" },
            ].map((s) => (
              <div key={s.l}>
                <p className="text-2xl font-bold">{s.v}</p>
                <p className="text-xs opacity-80">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-xs opacity-70">© 2026 WorkFlow AI Pro</p>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center bg-background px-6 py-12">
        <Card className="w-full max-w-md border-border/60 bg-gradient-card p-8 shadow-elegant">
          <div className="mb-6 lg:hidden">
            <Link to="/" className="flex items-center gap-2">
              <div className="grid size-9 place-items-center rounded-xl bg-gradient-primary">
                <Sparkles className="size-5 text-white" />
              </div>
              <span className="font-bold">WorkFlow AI Pro</span>
            </Link>
          </div>

          <h2 className="text-2xl font-bold">
            {mode === "signin" ? "Welcome back" : mode === "signup" ? "Create your account" : "Reset password"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Sign in to access your AI workspace."
              : mode === "signup"
                ? "Free forever. No credit card required."
                : "We'll email you a reset link."}
          </p>

          {mode !== "forgot" && (
            <Tabs value={mode} onValueChange={(v) => setMode(v as "signin" | "signup")} className="mt-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Sign up</TabsTrigger>
              </TabsList>
              <TabsContent value={mode} className="mt-0" />
            </Tabs>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  placeholder="you@company.com"
                />
              </div>
            </div>
            {mode !== "forgot" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {mode === "signin" && (
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={mode === "signup" ? 8 : 1}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                    placeholder={mode === "signup" ? "Min. 8 characters" : "••••••••"}
                  />
                </div>
              </div>
            )}
            {mode === "signin" && (
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Checkbox /> Remember me
              </label>
            )}
            <Button type="submit" className="w-full bg-gradient-primary shadow-soft" disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : (
                <>
                  {mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
                  <ArrowRight className="ml-1 size-4" />
                </>
              )}
            </Button>
          </form>

          {mode !== "forgot" && (
            <>
              <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
                <div className="h-px flex-1 bg-border" /> OR <div className="h-px flex-1 bg-border" />
              </div>
              <div className="grid gap-2">
                <Button variant="outline" onClick={handleGoogle} disabled={busy}>
                  <GoogleIcon /> Continue with Google
                </Button>
                <Button variant="outline" disabled title="Coming soon">
                  <MicrosoftIcon /> Continue with Microsoft
                </Button>
              </div>
            </>
          )}

          {mode === "forgot" && (
            <button
              type="button"
              onClick={() => setMode("signin")}
              className="mt-4 text-xs text-primary hover:underline"
            >
              ← Back to sign in
            </button>
          )}
        </Card>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4">
      <path fill="#EA4335" d="M12 11v2.7h7.4c-.3 1.8-2.2 5.4-7.4 5.4-4.5 0-8.1-3.7-8.1-8.2s3.6-8.2 8.1-8.2c2.5 0 4.2 1.1 5.2 2l3.5-3.4C18.3 1.2 15.5 0 12 0 5.4 0 0 5.4 0 12s5.4 12 12 12c6.9 0 11.5-4.9 11.5-11.7 0-.8-.1-1.4-.2-2H12z" />
    </svg>
  );
}
function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4">
      <path fill="#F25022" d="M1 1h10v10H1z" />
      <path fill="#7FBA00" d="M13 1h10v10H13z" />
      <path fill="#00A4EF" d="M1 13h10v10H1z" />
      <path fill="#FFB900" d="M13 13h10v10H13z" />
    </svg>
  );
}
