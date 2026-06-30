import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import {
  Plus, Send, Pin, Trash2, Pencil, Sparkles, Loader2, Search,
  Mic, Paperclip, MessageSquare,
} from "lucide-react";
import { BrandMark } from "@/components/brand-logo";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import {
  createChat, deleteChat, getChatMessages, listChats, renameChat, saveChatMessages, togglePinChat,
} from "@/lib/ai.functions";

export const Route = createFileRoute("/_authenticated/chat/$chatId")({
  component: ChatPage,
});

const SUGGESTIONS = [
  "Draft an email declining a meeting politely",
  "Summarize this week's priorities",
  "Help me prepare for a 1:1 with my manager",
  "Brainstorm a Q1 marketing campaign",
];

function ChatPage() {
  const { chatId } = Route.useParams();
  const nav = useNavigate();
  const qc = useQueryClient();
  const list = useServerFn(listChats);
  const create = useServerFn(createChat);
  const rename = useServerFn(renameChat);
  const pin = useServerFn(togglePinChat);
  const del = useServerFn(deleteChat);
  const fetchMessages = useServerFn(getChatMessages);
  const saveMessages = useServerFn(saveChatMessages);

  const [filter, setFilter] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");

  const { data: chats } = useQuery({ queryKey: ["chats"], queryFn: () => list({}) });
  const { data: initialMessages } = useQuery({
    queryKey: ["chat-messages", chatId],
    queryFn: async () => {
      const rows = await fetchMessages({ data: { chatId } });
      return rows.map((r) => ({
        id: r.id,
        role: r.role as "user" | "assistant" | "system",
        parts: r.parts,
      })) as UIMessage[];
    },
  });

  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const { messages, sendMessage, status, setMessages } = useChat({
    id: chatId,
    transport,
    onError: (e) => toast.error(e.message || "AI request failed"),
  });

  // Hydrate when initial messages arrive
  useEffect(() => {
    if (initialMessages) setMessages(initialMessages);
  }, [initialMessages, setMessages]);

  // Persist after stream finishes
  const lastSaved = useRef<string>("");
  useEffect(() => {
    if (status !== "ready" || messages.length === 0) return;
    const sig = messages.map((m) => m.id).join("|");
    if (sig === lastSaved.current) return;
    lastSaved.current = sig;
    saveMessages({
      data: {
        chatId,
        messages: messages.map((m) => ({ role: m.role, parts: m.parts })),
      },
    }).catch(() => {});
    // Auto-title from first user message
    const firstUser = messages.find((m) => m.role === "user");
    const chat = chats?.find((c) => c.id === chatId);
    if (firstUser && chat?.title === "New conversation") {
      const text = firstUser.parts.find((p) => p.type === "text")?.text ?? "";
      const title = text.slice(0, 50);
      if (title) {
        rename({ data: { chatId, title } }).then(() => qc.invalidateQueries({ queryKey: ["chats"] }));
      }
    }
  }, [status, messages, chatId, chats, saveMessages, rename, qc]);

  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, [chatId]);

  const submit = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || status === "submitted" || status === "streaming") return;
    setInput("");
    await sendMessage({ text: msg });
  };

  const newChat = async () => {
    const c = await create({ data: {} });
    qc.invalidateQueries({ queryKey: ["chats"] });
    nav({ to: "/chat/$chatId", params: { chatId: c.id } });
  };

  const removeChat = async (id: string) => {
    await del({ data: { chatId: id } });
    qc.invalidateQueries({ queryKey: ["chats"] });
    if (id === chatId) {
      const remaining = (chats ?? []).filter((c) => c.id !== id);
      if (remaining[0]) nav({ to: "/chat/$chatId", params: { chatId: remaining[0].id } });
      else nav({ to: "/chat" });
    }
  };

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  const filtered = (chats ?? []).filter((c) => c.title.toLowerCase().includes(filter.toLowerCase()));
  const isBusy = status === "submitted" || status === "streaming";

  return (
    <div className="grid h-[calc(100vh-3.5rem)] grid-cols-1 md:grid-cols-[280px_1fr]">
      {/* Thread sidebar */}
      <aside className="hidden flex-col border-r border-border/50 bg-card/40 md:flex">
        <div className="p-3">
          <Button onClick={newChat} className="w-full bg-gradient-primary shadow-soft">
            <Plus className="size-4" /> New chat
          </Button>
          <div className="relative mt-3">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search..."
              className="h-8 pl-8 text-xs"
            />
          </div>
        </div>
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-0.5 pb-3">
            {filtered.map((c) => (
              <div
                key={c.id}
                className={cn(
                  "group flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm",
                  c.id === chatId ? "bg-accent/60 text-accent-foreground" : "hover:bg-accent/30",
                )}
              >
                {editing === c.id ? (
                  <input
                    autoFocus
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    onBlur={async () => {
                      if (draftTitle.trim()) {
                        await rename({ data: { chatId: c.id, title: draftTitle.trim() } });
                        qc.invalidateQueries({ queryKey: ["chats"] });
                      }
                      setEditing(null);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                    className="flex-1 rounded bg-background px-1.5 py-0.5 text-xs outline-none"
                  />
                ) : (
                  <Link
                    to="/chat/$chatId"
                    params={{ chatId: c.id }}
                    className="flex min-w-0 flex-1 items-center gap-1.5"
                  >
                    {c.pinned && <Pin className="size-3 shrink-0 text-primary" />}
                    <MessageSquare className="size-3 shrink-0 text-muted-foreground" />
                    <span className="truncate">{c.title}</span>
                  </Link>
                )}
                <div className="hidden gap-0.5 group-hover:flex">
                  <button
                    onClick={() => pin({ data: { chatId: c.id, pinned: !c.pinned } }).then(() => qc.invalidateQueries({ queryKey: ["chats"] }))}
                    className="rounded p-1 hover:bg-background"
                    title="Pin"
                  >
                    <Pin className="size-3" />
                  </button>
                  <button
                    onClick={() => { setEditing(c.id); setDraftTitle(c.title); }}
                    className="rounded p-1 hover:bg-background"
                    title="Rename"
                  >
                    <Pencil className="size-3" />
                  </button>
                  <button
                    onClick={() => removeChat(c.id)}
                    className="rounded p-1 hover:bg-background"
                    title="Delete"
                  >
                    <Trash2 className="size-3 text-destructive" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </aside>

      {/* Conversation */}
      <section className="flex h-full flex-col">
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl space-y-6 p-6">
            {messages.length === 0 && (
              <div className="py-12 text-center">
                <BrandMark className="mx-auto size-14" />
                <h3 className="mt-4 text-xl font-semibold">How can I help you today?</h3>
                <p className="mt-1 text-sm text-muted-foreground">Try one of these to get started:</p>
                <div className="mt-6 grid gap-2 sm:grid-cols-2">
                  {SUGGESTIONS.map((s) => (
                    <Card
                      key={s}
                      onClick={() => submit(s)}
                      className="cursor-pointer bg-gradient-card p-3 text-left text-sm hover:shadow-soft"
                    >
                      {s}
                    </Card>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m) => (
              <Message key={m.id} message={m} />
            ))}
            {isBusy && messages[messages.length - 1]?.role === "user" && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin text-primary" /> Thinking...
              </div>
            )}
            {messages.length > 0 && <AiDisclaimer confidence={0.86} />}
          </div>
        </div>

        {/* Composer */}
        <div className="border-t border-border/50 bg-background/60 p-4 backdrop-blur-xl">
          <form
            onSubmit={(e) => { e.preventDefault(); submit(); }}
            className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-border/60 bg-card p-2 shadow-soft"
          >
            <Button type="button" variant="ghost" size="icon" className="size-8 shrink-0" title="Attach">
              <Paperclip className="size-4" />
            </Button>
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              rows={1}
              placeholder="Ask WorkFlow AI anything..."
              className="min-h-9 flex-1 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
            />
            <Button type="button" variant="ghost" size="icon" className="size-8 shrink-0" title="Voice">
              <Mic className="size-4" />
            </Button>
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isBusy}
              className="size-8 shrink-0 bg-gradient-primary"
            >
              {isBusy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}

function Message({ message }: { message: UIMessage }) {
  const text = message.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
  const isUser = message.role === "user";
  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-primary-foreground shadow-soft">
          <p className="whitespace-pre-wrap text-sm">{text}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-3">
      <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-gradient-primary text-white shadow-soft">
        <Sparkles className="size-4" />
      </div>
      <div className="prose prose-sm dark:prose-invert max-w-none flex-1 text-foreground">
        <ReactMarkdown>{text || "..."}</ReactMarkdown>
      </div>
    </div>
  );
}
