import { useEffect, useRef, useState } from "react";
import { aiRequestSchema, type AiRequest } from "@/lib/ai-schemas";

export function useCelebrationAi() {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const controller = useRef<AbortController | null>(null);

  const stop = () => { controller.current?.abort(); setLoading(false); };
  const clear = () => { stop(); setText(""); setError(""); };
  useEffect(() => () => controller.current?.abort(), []);

  const generate = async (input: AiRequest) => {
    stop();
    const parsed = aiRequestSchema.safeParse(input);
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Invalid input."); return; }
    const current = new AbortController();
    controller.current = current;
    setText(""); setError(""); setLoading(true);
    let output = "";
    try {
      const response = await fetch("/api/celebration-ai", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data), signal: current.signal,
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "AI is unavailable. Please try again later.");
      }
      if (!response.body) throw new Error("No response received.");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let pending = "";
      while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        pending += decoder.decode(chunk.value, { stream: true });
        const lines = pending.split("\n");
        pending = lines.pop() ?? "";
        for (const line of lines) {
          if (!line) continue;
          const event = JSON.parse(line);
          if (event.error) throw new Error(event.error);
          if (event.text) { output += event.text; if (controller.current === current) setText(output); }
        }
      }
      if (!output && !current.signal.aborted) throw new Error("AI returned no recommendations. Please start a new request.");
    } catch (cause) {
      if (!current.signal.aborted && controller.current === current) setError(cause instanceof Error ? cause.message : "AI request failed.");
    } finally {
      if (controller.current === current) setLoading(false);
    }
  };
  return { text, error, loading, generate, stop, clear };
}