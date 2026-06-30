import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  MessageSquare,
  Mail,
  FileText,
  ListTodo,
  FlaskConical,
  BookOpenText,
  Folder,
  BarChart3,
  Settings as SettingsIcon,
  ShieldCheck,
  Sparkles,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "AI Chat", url: "/chat", icon: MessageSquare },
  { title: "Email Generator", url: "/email", icon: Mail },
  { title: "Meeting Notes", url: "/meetings", icon: FileText },
  { title: "Task Planner", url: "/tasks", icon: ListTodo },
  { title: "Research", url: "/research", icon: FlaskConical },
];
const library = [
  { title: "Prompt Library", url: "/prompts", icon: BookOpenText },
  { title: "Documents", url: "/documents", icon: Folder },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
];
const account = [
  { title: "Responsible AI", url: "/responsible-ai", icon: ShieldCheck },
  { title: "Settings", url: "/settings", icon: SettingsIcon },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { theme, setTheme, resolved } = useTheme();
  const { user, signOut } = useAuth();
  const isActive = (url: string) => pathname === url || pathname.startsWith(url + "/");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to="/dashboard" className="flex items-center gap-2 px-2 py-2">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-primary shadow-soft">
            <Sparkles className="size-5 text-white" />
          </div>
          <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-bold">WorkFlow AI Pro</span>
            <span className="truncate text-[10px] text-muted-foreground">Productivity Assistant</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((i) => (
                <SidebarMenuItem key={i.url}>
                  <SidebarMenuButton asChild isActive={isActive(i.url)} tooltip={i.title}>
                    <Link to={i.url}>
                      <i.icon />
                      <span>{i.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Library</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {library.map((i) => (
                <SidebarMenuItem key={i.url}>
                  <SidebarMenuButton asChild isActive={isActive(i.url)} tooltip={i.title}>
                    <Link to={i.url}>
                      <i.icon />
                      <span>{i.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {account.map((i) => (
                <SidebarMenuItem key={i.url}>
                  <SidebarMenuButton asChild isActive={isActive(i.url)} tooltip={i.title}>
                    <Link to={i.url}>
                      <i.icon />
                      <span>{i.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
          <div className="grid size-8 place-items-center rounded-full bg-gradient-primary text-xs font-bold text-white">
            {(user?.email?.[0] ?? "U").toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium">{user?.email}</p>
            <p className="text-[10px] text-muted-foreground">Free plan</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => setTheme(resolved === "dark" ? "light" : "dark")}
            title="Toggle theme"
          >
            {resolved === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="size-7" onClick={signOut} title="Sign out">
            <LogOut className="size-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
