import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import type { AiRequest } from "./ai-schemas";
import { createLovableAiGatewayRunIdFetch, getLovableAiGatewayRunId, withLovableAiGatewayRunIdHeader } from "./run-id.server";

export function streamCelebrationAi(request: Request, input: AiRequest, apiKey: string) {
  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });
  const prompt =
    input.kind === "ideas"
      ? `Event type: ${input.eventType}\nRequest: ${input.query}`
      : `Event type: ${input.eventType}\nVendor: ${input.vendorName}\nCategory: ${input.category}\nCurrent quoted price: $${input.price.toLocaleString("en-US")}`;
  const instructions =
    input.kind === "ideas"
      ? "You are an expert celebration planner. Give practical, specific recommendations as a short numbered list with one-line explanations and approximate costs where relevant. Plain text only, no markdown symbols."
      : "Write a polite, professional negotiation email to the vendor. Reference their category and quoted price, ask respectfully for a reduced rate or added value, suggest one or two reasonable options, and keep it warm and concise. Start with 'Subject:'. Plain text only. Use [Your Name] for the signature.";
  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    instructions,
    messages: [{ role: "user", content: prompt }],
    abortSignal: request.signal,
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
    onError: ({ error }) => console.error("Celebration AI failed", error),
  });
  return withLovableAiGatewayRunIdHeader(result.toTextStreamResponse(), runIdFetch);
}