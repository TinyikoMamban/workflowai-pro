import { createFileRoute, Outlet, redirect, Link, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Bell, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: Layout,
});

function Layout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const segments = pathname.split("/").filter(Boolean);
  const title = segments[segments.length - 1]?.replace(/-/g, " ") ?? "dashboard";

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/60 bg-background/70 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
          <SidebarTrigger className="-ml-1" />
          <div className="hidden text-sm text-muted-foreground md:flex md:items-center md:gap-1.5">
            <span>Workspace</span>
            <span className="opacity-40">/</span>
            <span className="font-medium capitalize text-foreground">{title}</span>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <Button variant="ghost" size="icon" className="size-8 rounded-lg">
              <Search className="size-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative size-8 rounded-lg">
                  <Bell className="size-4" />
                  <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex-col items-start gap-0.5">
                  <span className="font-medium">Welcome to WorkFlow AI Pro</span>
                  <span className="text-xs text-muted-foreground">Try the AI chat to get started.</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex-col items-start gap-0.5">
                  <span className="font-medium">Tip: Press Ctrl+K</span>
                  <span className="text-xs text-muted-foreground">Open the command palette anywhere.</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link to="/settings">
              <Button variant="ghost" size="sm" className="rounded-lg">Profile</Button>
            </Link>
          </div>
        </header>
        <main className="min-h-[calc(100vh-3.5rem)] bg-gradient-hero/30 animate-fade-in">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
