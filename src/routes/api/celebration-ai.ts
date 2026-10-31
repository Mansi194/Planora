import { createFileRoute } from "@tanstack/react-router";
import { aiRequestSchema } from "@/lib/ai-schemas";
import { streamCelebrationAi } from "@/lib/celebration-ai.server";

export const Route = createFileRoute("/api/celebration-ai")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsed = aiRequestSchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) {
          return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
        }
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return Response.json({ error: "AI is not configured yet." }, { status: 500 });
        return streamCelebrationAi(request, parsed.data, apiKey);
      },
    },
  },
});