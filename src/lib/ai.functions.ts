import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateText } from "ai";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createLovableAiGatewayProvider, DEFAULT_CHAT_MODEL, requireLovableKey } from "./ai-gateway.server";

const EmailInput = z.object({
  recipient: z.string().optional().default(""),
  audience: z.string().optional().default(""),
  purpose: z.string().min(1, "Purpose required"),
  context: z.string().optional().default(""),
  keywords: z.string().optional().default(""),
  tone: z.enum(["Formal", "Friendly", "Professional", "Executive", "Persuasive", "Technical"]).default("Professional"),
  length: z.enum(["Short", "Medium", "Long"]).default("Medium"),
});

export type EmailInput = z.infer<typeof EmailInput>;

export const generateEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => EmailInput.parse(input))
  .handler(async ({ data, context }) => {
    const key = requireLovableKey();
    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway(DEFAULT_CHAT_MODEL);

    const prompt = `ROLE: Expert business communication writer.
OBJECTIVE: Generate a polished professional email plus alternatives.

CONTEXT:
- Recipient: ${data.recipient || "Unspecified"}
- Audience: ${data.audience || "General professional"}
- Purpose: ${data.purpose}
- Background context: ${data.context || "None"}
- Keywords to include: ${data.keywords || "None"}
- Tone: ${data.tone}
- Length: ${data.length}

INSTRUCTIONS:
1. Write a compelling subject line.
2. Write the primary email body in the requested tone and length.
3. Provide an alternative version with a different angle.
4. Suggest a polite follow-up email for one week later.
5. Suggest a strong call-to-action sentence.

OUTPUT FORMAT — return EXACTLY this structure with these section headers (no extra prose):
### SUBJECT
<subject line only>
### EMAIL
<full email body>
### ALTERNATIVE
<alternative version>
### FOLLOW_UP
<follow-up email>
### CTA
<single sentence call to action>`;

    const { text } = await generateText({ model, prompt });

    const parse = (label: string) => {
      const re = new RegExp(`###\\s*${label}\\s*\\n([\\s\\S]*?)(?=\\n###\\s|$)`, "i");
      return text.match(re)?.[1]?.trim() ?? "";
    };
    const result = {
      subject: parse("SUBJECT"),
      body: parse("EMAIL"),
      alternative: parse("ALTERNATIVE"),
      followUp: parse("FOLLOW_UP"),
      cta: parse("CTA"),
    };

    // Persist
    await context.supabase.from("emails").insert({
      user_id: context.userId,
      recipient: data.recipient,
      audience: data.audience,
      purpose: data.purpose,
      context: data.context,
      keywords: data.keywords,
      tone: data.tone,
      length: data.length,
      subject: result.subject,
      body: result.body,
      alternative: result.alternative,
      follow_up: result.followUp,
      cta: result.cta,
    });
    await context.supabase.from("analytics_events").insert({
      user_id: context.userId,
      event_type: "email_generated",
      metadata: { tone: data.tone, length: data.length },
    });

    return result;
  });

// Chat thread management ------------------------------------------------
export const listChats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("chats")
      .select("id,title,pinned,updated_at,created_at")
      .order("pinned", { ascending: false })
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

export const createChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ title: z.string().optional() }).parse(i))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("chats")
      .insert({ user_id: context.userId, title: data.title ?? "New conversation" })
      .select("id,title,created_at,updated_at,pinned")
      .single();
    if (error) throw error;
    return row;
  });

export const getChatMessages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ chatId: z.string() }).parse(i))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("chat_messages")
      .select("id,role,parts,created_at")
      .eq("chat_id", data.chatId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return rows ?? [];
  });

export const saveChatMessages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({
      chatId: z.string(),
      messages: z.array(z.object({ role: z.string(), parts: z.any() })),
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    // simple replace strategy: delete + insert
    await context.supabase.from("chat_messages").delete().eq("chat_id", data.chatId);
    if (data.messages.length === 0) return { ok: true };
    const rows = data.messages.map((m) => ({
      chat_id: data.chatId,
      user_id: context.userId,
      role: m.role,
      parts: m.parts,
    }));
    const { error } = await context.supabase.from("chat_messages").insert(rows);
    if (error) throw error;
    await context.supabase.from("chats").update({ updated_at: new Date().toISOString() }).eq("id", data.chatId);
    return { ok: true };
  });

export const renameChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ chatId: z.string(), title: z.string() }).parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("chats").update({ title: data.title }).eq("id", data.chatId);
    if (error) throw error;
    return { ok: true };
  });

export const togglePinChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ chatId: z.string(), pinned: z.boolean() }).parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("chats").update({ pinned: data.pinned }).eq("id", data.chatId);
    if (error) throw error;
    return { ok: true };
  });

export const deleteChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ chatId: z.string() }).parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("chats").delete().eq("id", data.chatId);
    if (error) throw error;
    return { ok: true };
  });
