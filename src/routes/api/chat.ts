import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider, DEFAULT_CHAT_MODEL, requireLovableKey } from "@/lib/ai-gateway.server";

const SYSTEM_PROMPT = `You are WorkFlow AI Pro, an expert workplace productivity assistant for professionals.

ROLE: Helpful, concise, professional AI workplace co-pilot.
OBJECTIVE: Help users complete workplace tasks faster — drafting, planning, research, summarization, analysis.
CONSTRAINTS:
- Keep responses focused, actionable, and well-structured (use markdown headings/lists when helpful).
- Never invent statistics, names, dates, citations, or quotes — if unknown, say so.
- For sensitive HR/legal/medical/financial questions, add a brief note recommending professional verification.
- Politely decline harmful, illegal, or unethical requests.
FORMATTING: Use markdown. Short paragraphs. Bullet lists for multi-step output. Bold key terms.
RESPONSIBLE AI: When generating decisions or analysis, remind the user to verify before professional use.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { messages?: UIMessage[] };
          if (!Array.isArray(body.messages)) {
            return new Response("Messages required", { status: 400 });
          }
          const key = requireLovableKey();
          const gateway = createLovableAiGatewayProvider(key);
          const model = gateway(DEFAULT_CHAT_MODEL);
          const result = streamText({
            model,
            system: SYSTEM_PROMPT,
            messages: await convertToModelMessages(body.messages),
          });
          return result.toUIMessageStreamResponse({ originalMessages: body.messages });
        } catch (err) {
          const msg = err instanceof Error ? err.message : "AI gateway error";
          return new Response(JSON.stringify({ error: msg }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
