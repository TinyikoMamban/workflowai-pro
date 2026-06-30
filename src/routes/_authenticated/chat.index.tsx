import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { createChat, listChats } from "@/lib/ai.functions";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { BrandMark } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/chat/")({
  component: ChatIndex,
});

function ChatIndex() {
  const nav = useNavigate();
  const list = useServerFn(listChats);
  const create = useServerFn(createChat);
  const { data: chats, isLoading } = useQuery({
    queryKey: ["chats"],
    queryFn: () => list({}),
  });

  useEffect(() => {
    if (chats && chats.length > 0) {
      nav({ to: "/chat/$chatId", params: { chatId: chats[0].id }, replace: true });
    }
  }, [chats, nav]);

  const startNew = async () => {
    const c = await create({ data: {} });
    nav({ to: "/chat/$chatId", params: { chatId: c.id } });
  };

  return (
    <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center p-6">
      <div className="max-w-md text-center">
        <BrandMark className="mx-auto size-16" />
        <h2 className="mt-6 text-2xl font-bold">Workplace AI Chat</h2>
        <p className="mt-2 text-muted-foreground">
          Your persistent AI co-pilot for any workplace task. Ask, draft, research, plan.
        </p>
        <Button onClick={startNew} className="mt-6 bg-gradient-primary shadow-soft" disabled={isLoading}>
          {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          Start a conversation
        </Button>
      </div>
    </div>
  );
}
