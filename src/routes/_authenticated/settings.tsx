import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Settings as SettingsIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/settings")({ component: SettingsPage });

function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState("");
  const [notif, setNotif] = useState(true);
  const [lang, setLang] = useState("en");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("profiles").select("display_name").maybeSingle();
      setName(data?.display_name ?? "");
      const { data: s } = await supabase.from("user_settings").select("*").maybeSingle();
      if (s) {
        const prefs = (s.preferences ?? {}) as { notifications?: boolean };
        setNotif(prefs.notifications !== false);
        setLang(s.language ?? "en");
      }
    })();
  }, []);

  const save = async () => {
    await supabase.from("profiles").update({ display_name: name }).eq("id", user!.id);
    await supabase.from("user_settings").upsert({ user_id: user!.id, language: lang, preferences: { notifications: notif } });
    toast.success("Settings saved");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your profile and preferences.</p>
        </div>
        <div className="grid size-12 place-items-center rounded-2xl bg-gradient-primary text-white shadow-elegant"><SettingsIcon className="size-6" /></div>
      </div>

      <Card className="space-y-4 bg-gradient-card p-6">
        <h2 className="font-semibold">Profile</h2>
        <div className="space-y-1.5"><Label>Email</Label><Input value={user?.email ?? ""} disabled /></div>
        <div className="space-y-1.5"><Label>Full name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
      </Card>

      <Card className="space-y-4 bg-gradient-card p-6">
        <h2 className="font-semibold">Preferences</h2>
        <div className="flex items-center justify-between"><Label>Theme</Label>
          <Select value={theme} onValueChange={(v) => setTheme(v as "light" | "dark" | "system")}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between"><Label>Language</Label>
          <Select value={lang} onValueChange={setLang}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="de">Deutsch</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between"><Label>Notifications</Label><Switch checked={notif} onCheckedChange={setNotif} /></div>
      </Card>

      <Button onClick={save} className="bg-gradient-primary shadow-soft">Save changes</Button>
    </div>
  );
}
