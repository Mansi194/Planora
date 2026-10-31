import { useState } from "react";
import { Copy, Loader2, Mail, Send, Sparkles, Square, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCelebrationAi } from "@/hooks/use-celebration-ai";
import type { AiRequest } from "@/lib/ai-schemas";

type EventType = AiRequest["eventType"];
export type NegotiationVendor = { name: string; type: string; cost: number };

export function CelebrationIdeas({ eventType }: { eventType: EventType }) {
  const [query, setQuery] = useState("");
  const ai = useCelebrationAi();
  const ask = (value: string) => ai.generate({ kind: "ideas", query: value, eventType });
  return (
    <section aria-labelledby="ideas-title" className="space-y-4">
      <h2 id="ideas-title" className="flex items-center gap-2 font-display text-2xl font-bold"><Wand2 className="size-5 text-primary" />Ask AI for Celebration Ideas</h2>
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); void ask(query); }}>
        <input aria-label="Celebration ideas prompt" value={query} maxLength={500} onChange={(e) => setQuery(e.target.value)} placeholder="Suggest 5 eco-friendly wedding themes under $5,000"
          className="min-w-0 flex-1 rounded-lg border border-border bg-background px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        {ai.loading ? <Button type="button" size="icon" className="h-12 w-12" aria-label="Stop generating ideas" onClick={ai.stop}><Square /></Button>
          : <Button size="icon" className="h-12 w-12" aria-label="Ask AI"><Send /></Button>}
      </form>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" disabled={ai.loading} onClick={() => { void ask(`Suggest 5 themes for a ${eventType}`); }}><Sparkles />Suggest 5 Themes</Button>
        <Button variant="outline" size="sm" disabled={ai.loading} onClick={() => { void ask(`Draft a professional vendor inquiry email for a ${eventType}`); }}><Mail />Draft Vendor Email</Button>
        <Button variant="outline" size="sm" disabled={ai.loading} onClick={() => { void ask(`Generate menu ideas for a ${eventType}`); }}>Generate Menu Ideas</Button>
      </div>
      {ai.error && <p role="alert" className="text-sm text-destructive">{ai.error}</p>}
      {(ai.loading || ai.text) && <article aria-label="AI recommendations" aria-live="polite" className="rounded-lg border border-border bg-card p-5">
        <h3 className="mb-3 flex items-center gap-2 font-semibold"><Sparkles className="size-4 text-primary" />Celebration recommendations {ai.loading && <Loader2 className="size-4 animate-spin" />}</h3>
        <p className="whitespace-pre-wrap leading-relaxed">{ai.text || "Thinking…"}</p>
      </article>}
    </section>
  );
}

export function NegotiationModal({ vendor, eventType, onClose }: { vendor: NegotiationVendor | null; eventType: EventType; onClose: () => void }) {
  const ai = useCelebrationAi();
  const [copied, setCopied] = useState(false);
  // The parent keys this modal by vendor, so each draft starts fresh.
  const [started, setStarted] = useState(false);
  if (vendor && !started) {
    setStarted(true);
    void ai.generate({ kind: "negotiate", vendorName: vendor.name, category: vendor.type, price: vendor.cost, eventType });
  }
  return <Dialog open={Boolean(vendor)} onOpenChange={(open) => { if (!open) { ai.stop(); onClose(); } }}>
    <DialogContent className="max-h-[85dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-lg">
      <DialogHeader>
        <DialogTitle>Negotiate with {vendor?.name}</DialogTitle>
        <DialogDescription>{vendor?.type} · Quoted price ${vendor?.cost.toLocaleString()}</DialogDescription>
      </DialogHeader>
      {ai.loading && <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" />Drafting your email…</p>}
      {ai.error && <p role="alert" className="text-sm text-destructive">{ai.error}</p>}
      {ai.text && <div aria-label="Negotiation email" aria-live="polite" className="whitespace-pre-wrap border-t border-border pt-4 text-sm leading-relaxed">{ai.text}</div>}
      <div className="flex justify-end gap-2">
        {ai.loading && <Button variant="outline" onClick={ai.stop}><Square />Stop</Button>}
        <Button disabled={!ai.text || ai.loading} onClick={async () => { try { await navigator.clipboard.writeText(ai.text); setCopied(true); } catch { setCopied(false); } }}><Copy />{copied ? "Copied" : "Copy email"}</Button>
      </div>
    </DialogContent>
  </Dialog>;
}