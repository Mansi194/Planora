import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { APICallError, streamText } from "ai";
import type { AiRequest } from "./ai-schemas";
import { createLovableAiGatewayRunIdFetch, getLovableAiGatewayRunId, withLovableAiGatewayRunIdHeader } from "./run-id.server";

export async function streamCelebrationAi(request: Request, input: AiRequest, apiKey: string) {
  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));

  // 1. Initialize the official Google Gemini provider
  const google = createGoogleGenerativeAI({
    apiKey,
  });

  const prompt =
    input.kind === "ideas"
      ? `Event type: ${input.eventType}\nRequest: ${input.query}`
      : `Event type: ${input.eventType}\nVendor: ${input.vendorName}\nCategory: ${input.category}\nCurrent quoted price: $${input.price.toLocaleString("en-US")}`;

  const system =
    input.kind === "ideas"
      ? "You are an expert celebration planner. Give practical, specific recommendations as a short numbered list with one-line explanations and approximate costs where relevant. Plain text only, no markdown symbols."
      : "Write a polite, professional negotiation email to the vendor. Reference their category and quoted price, ask respectfully for a reduced rate or added value, suggest one or two reasonable options, and keep it warm and concise. Start with 'Subject:'. Plain text only. Use [Your Name] for the signature.";

  // 2. Stream using Gemini 2.5 Flash
  const result = streamText({
    model: google("gemini-2.5-flash"),
    system,
    prompt,
    abortSignal: request.signal,
    maxRetries: 0,
    onError: ({ error }) => console.error("Celebration AI failed", error),
  });

  const safeError = (error: unknown) => {
    if (APICallError.isInstance(error) && error.responseBody) {
      try {
        const body = JSON.parse(error.responseBody);
        const message = body.error?.message ?? body.message;
        if (typeof message === "string") return message;
      } catch { /* Safe fallback for non-JSON failures. */ }
    }
    return "AI could not complete this request. Please start a new request later.";
  };

  const iterator = result.fullStream[Symbol.asyncIterator]();
  let first = await iterator.next();
  while (!first.done && first.value.type !== "text-delta" && first.value.type !== "error") {
    first = await iterator.next();
  }

  if (!first.done && first.value.type === "error") {
    const error = first.value.error;
    return Response.json(
      { error: safeError(error) },
      { status: request.signal.aborted ? 499 : APICallError.isInstance(error) ? error.statusCode ?? 500 : 500 }
    );
  }

  const encoder = new TextEncoder();
  const body = new ReadableStream({
    async start(controller) {
      try {
        let next = first;
        while (!next.done) {
          const part = next.value;
          if (part.type === "text-delta") {
            controller.enqueue(encoder.encode(JSON.stringify({ text: part.text }) + "\n"));
          }
          if (part.type === "error") {
            controller.enqueue(encoder.encode(JSON.stringify({ error: safeError(part.error) }) + "\n"));
            break;
          }
          next = await iterator.next();
        }
      } catch (error) {
        controller.enqueue(encoder.encode(JSON.stringify({ error: safeError(error) }) + "\n"));
      } finally {
        controller.close();
      }
    },
    cancel: async () => {
      await iterator.return?.();
    },
  });

  return withLovableAiGatewayRunIdHeader(
    new Response(body, { headers: { "Content-Type": "application/x-ndjson", "Cache-Control": "no-store" } }),
    runIdFetch
  );
}