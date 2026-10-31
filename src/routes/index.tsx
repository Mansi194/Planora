import { CelebrationIdeas, NegotiationModal, type NegotiationVendor } from "@/components/celebration-ai";
import { Button } from "@/components/ui/button";
import { budgetTotals, toggleTask } from "@/lib/planning-totals";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Heart, Cake, Tent, Sparkles, PartyPopper, Star, Wand2, Mail, UtensilsCrossed, Send,
  Building2, Camera, Shirt, Flower2, Wallet, CheckCircle2, Circle, Phone, Handshake, Loader2,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Celebrate AI — Event Planning Dashboard" },
      { name: "description", content: "Plan weddings, birthdays and festivals with AI ideas, budgets, timelines and vendors." },
      { property: "og:title", content: "Celebrate AI — Event Planning Dashboard" },
      { property: "og:description", content: "AI ideas, budget planner, timeline and vendor tracker in one vibrant dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Mode = "wedding" | "birthday" | "festival";
const MODES: Record<Mode, { label: string; icon: typeof Heart; budget: number; alloc: number[]; tagline: string }> = {
  wedding: { label: "Wedding", icon: Heart, budget: 30000, alloc: [9000, 7500, 3500, 3000, 3000], tagline: "Your forever starts with a beautiful plan." },
  birthday: { label: "Birthday", icon: Cake, budget: 3000, alloc: [800, 900, 300, 200, 500], tagline: "Make this year's celebration unforgettable." },
  festival: { label: "Community Festival", icon: Tent, budget: 15000, alloc: [4000, 3500, 1500, 1000, 3000], tagline: "Bring your whole neighborhood together." },
};
const CATS = [
  { name: "Venue", icon: Building2, color: "bg-cat-1" },
  { name: "Catering", icon: UtensilsCrossed, color: "bg-cat-2" },
  { name: "Photography", icon: Camera, color: "bg-cat-3" },
  { name: "Attire", icon: Shirt, color: "bg-cat-4" },
  { name: "Decor", icon: Flower2, color: "bg-cat-5" },
];
const TASKS0 = [
  { id: 1, m: "12 Months Before", t: "Set budget & guest list", done: true },
  { id: 2, m: "12 Months Before", t: "Book the venue", done: true },
  { id: 3, m: "6 Months Before", t: "Hire photographer", done: true },
  { id: 4, m: "6 Months Before", t: "Send save-the-dates", done: false },
  { id: 5, m: "1 Week Before", t: "Confirm vendor timings", done: false },
  { id: 6, m: "1 Week Before", t: "Final headcount to caterer", done: false },
];
type Status = "Booked" | "Pending" | "Inquiry";
const VENDORS: { name: string; type: string; status: Status; cost: number; phone: string; email: string }[] = [
  { name: "Golden Hall", type: "Venue", status: "Booked", cost: 8500, phone: "+15550101", email: "hello@goldenhall.com" },
  { name: "Saffron Kitchen", type: "Catering", status: "Pending", cost: 7200, phone: "+15550102", email: "book@saffron.com" },
  { name: "Lumen Studio", type: "Photography", status: "Inquiry", cost: 3200, phone: "+15550103", email: "hi@lumen.studio" },
  { name: "Petal & Vine", type: "Decor", status: "Pending", cost: 2800, phone: "+15550104", email: "flowers@petalvine.com" },
  { name: "Beat Collective", type: "Music", status: "Inquiry", cost: 1500, phone: "+15550105", email: "gigs@beat.co" },
  { name: "Tailor Row", type: "Attire", status: "Booked", cost: 2600, phone: "+15550106", email: "fit@tailorrow.com" },
];
const fmt = (n: number) => "$" + n.toLocaleString();

function Index() {
  const [mode, setMode] = useState<Mode>("wedding");
  const [alloc, setAlloc] = useState(MODES.wedding.alloc);
  const [tasks, setTasks] = useState(TASKS0);
  const [filter, setFilter] = useState<"All" | Status>("All");
  const [selectedVendor, setSelectedVendor] = useState<NegotiationVendor | null>(null);
  const [burst, setBurst] = useState<number | null>(null);

  const cfg = MODES[mode];
   const { spent, remaining } = budgetTotals(alloc, cfg.budget);
  const done = tasks.filter((t) => t.done).length;
  const pct = Math.round((done / tasks.length) * 100);
  const vendors = useMemo(() => VENDORS.filter((v) => filter === "All" || v.status === filter), [filter]);

  const switchMode = (m: Mode) => { setMode(m); setAlloc(MODES[m].alloc); setSelectedVendor(null); };
  const toggle = (id: number) => {
    setTasks((ts) => toggleTask(ts, id));
    if (!tasks.find((t) => t.id === id)?.done) { setBurst(id); setTimeout(() => setBurst(null), 850); }
  };

  return (
    <div data-theme={mode} className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        <CelebrationIdeas key={mode} eventType={cfg.label as "Wedding" | "Birthday" | "Community Festival"} />
        <div role="tablist" aria-label="Event type" className="glass flex flex-wrap gap-2 p-2 w-fit mx-auto">
          {(Object.keys(MODES) as Mode[]).map((m) => {
            const I = MODES[m].icon; const active = m === mode;
            return (
              <Button variant="ghost" key={m} role="tab" aria-selected={active} onClick={() => switchMode(m)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active ? "bg-primary text-primary-foreground shadow" : "hover:bg-muted"}`}>
                <I className="size-4" aria-hidden /> {MODES[m].label}
              </Button>
            );
          })}
        </div>

        <header className="bg-hero relative overflow-hidden rounded-3xl p-8 md:p-12 text-primary-foreground">
          {[PartyPopper, Star, Sparkles, Star, PartyPopper, Sparkles].map((I, i) => (
            <I key={i} aria-hidden className="animate-floaty absolute opacity-40"
              style={{ left: `${8 + i * 16}%`, top: `${15 + ((i * 37) % 60)}%`, animationDelay: `${i * 0.6}s`, width: 28 + (i % 3) * 10, height: 28 + (i % 3) * 10 }} />
          ))}
          <div className="relative max-w-3xl">
            <p className="uppercase tracking-widest text-sm opacity-90">{cfg.label} Planner</p>
            <h1 className="font-display text-4xl md:text-6xl font-extrabold mt-2">Let's celebrate.</h1>
            <p className="mt-2 text-lg opacity-95">{cfg.tagline}</p>

          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          <section aria-labelledby="budget-h" className="glass p-6 lg:col-span-2">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 id="budget-h" className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><Wallet className="size-4" />Total Budget</h2>
                <p className="font-display text-5xl font-extrabold">{fmt(cfg.budget)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Remaining Balance</p>
                <p className="text-2xl font-bold">{fmt(remaining)}</p>
                <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold text-primary-foreground ${remaining >= 0 ? "bg-success" : "bg-destructive"}`}>
                  {remaining >= 0 ? "On Budget" : "Over Budget"}
                </span>
              </div>
            </div>
            <div className="mt-5 flex h-5 overflow-hidden rounded-full bg-muted" role="img" aria-label="Spending allocation">
              {alloc.map((v, i) => (
                <div key={i} className={`${(CATS[i]?.color ?? "bg-muted")} transition-all`} style={{ width: `${(v / Math.max(spent, cfg.budget)) * 100}%` }} title={`${(CATS[i]?.name ?? "Category")} ${Math.round((v / cfg.budget) * 100)}%`} />
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-3 text-xs">
              {CATS.map((c, i) => <span key={c.name} className="flex items-center gap-1"><span className={`size-2.5 rounded-full ${c.color}`} />{c.name} {Math.round(((alloc[i] ?? 0) / cfg.budget) * 100)}%</span>)}
            </div>
            <div className="mt-6 space-y-4">
              {CATS.map((c, i) => {
                const I = c.icon;
                return (
                  <div key={c.name}>
                    <div className="flex justify-between text-sm">
                      <label htmlFor={`s${i}`} className="flex items-center gap-2 font-medium"><I className="size-4 text-primary" aria-hidden />{c.name}</label>
                      <span className="font-semibold tabular-nums">{fmt((alloc[i] ?? 0))}</span>
                    </div>
                    <input id={`s${i}`} type="range" min={0} max={Math.round(cfg.budget * 0.6)} step={cfg.budget / 300} value={(alloc[i] ?? 0)}
                      onChange={(e) => setAlloc((a) => a.map((x, j) => (j === i ? +e.target.value : x)))}
                      className="mt-1 w-full accent-primary" />
                  </div>
                );
              })}
            </div>
          </section>

          <section aria-labelledby="tl-h" className="glass p-6">
            <h2 id="tl-h" className="font-display text-2xl font-bold">Timeline</h2>
            <div className="my-4 flex items-center gap-4">
              <svg width="110" height="110" viewBox="0 0 110 110" role="img" aria-label={`${pct}% complete`}>
                <circle cx="55" cy="55" r="46" className="stroke-muted" strokeWidth="10" fill="none" />
                <circle cx="55" cy="55" r="46" className="stroke-primary transition-all duration-500" strokeWidth="10" fill="none" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 46} strokeDashoffset={2 * Math.PI * 46 * (1 - pct / 100)} transform="rotate(-90 55 55)" />
                <text x="55" y="61" textAnchor="middle" className="fill-foreground font-bold" fontSize="20">{pct}%</text>
              </svg>
              <p className="font-semibold">{done} of {tasks.length} Completed</p>
            </div>
            {["12 Months Before", "6 Months Before", "1 Week Before"].map((m) => (
              <div key={m} className="mt-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{m}</h3>
                <ul className="mt-1 space-y-1">
                  {tasks.filter((t) => t.m === m).map((t) => (
                    <li key={t.id} className="relative">
                      <Button variant="ghost" role="checkbox" aria-checked={t.done} onClick={() => toggle(t.id)}
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        {t.done ? <CheckCircle2 className="size-5 text-primary" /> : <Circle className="size-5 text-muted-foreground" />}
                        <span className={t.done ? "line-through text-muted-foreground" : ""}>{t.t}</span>
                      </Button>
                      {burst === t.id && Array.from({ length: 10 }).map((_, k) => (
                        <span key={k} aria-hidden className={`animate-burst pointer-events-none absolute left-4 top-4 size-2 rounded-full ${(CATS[k % 5]?.color ?? "bg-muted")}`}
                          style={{ ["--dx" as string]: `${Math.cos(k * 0.63) * 40}px`, ["--dy" as string]: `${Math.sin(k * 0.63) * 40}px` }} />
                      ))}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        </div>

        <section aria-labelledby="v-h" className="glass p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="v-h" className="font-display text-2xl font-bold">Vendors</h2>
            <div role="tablist" aria-label="Filter vendors" className="flex gap-1 rounded-full bg-muted p-1">
              {(["All", "Booked", "Pending", "Inquiry"] as const).map((f) => (
                <Button variant="ghost" key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)}
                  className={`rounded-full px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${filter === f ? "bg-primary text-primary-foreground" : ""}`}>{f}</Button>
              ))}
            </div>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vendors.map((v) => (
              <article key={v.name} className="rounded-2xl border border-border bg-background/60 p-4">
                <div className="flex items-start justify-between">
                  <div><h3 className="font-semibold">{v.name}</h3><p className="text-sm text-muted-foreground">{v.type}</p></div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${v.status === "Booked" ? "bg-success text-primary-foreground" : v.status === "Pending" ? "bg-accent text-accent-foreground" : "bg-muted"}`}>{v.status}</span>
                </div>
                <p className="mt-2 text-lg font-bold">{fmt(v.cost)}</p>
                <div className="mt-2 flex gap-3 text-sm">
                  <a href={`tel:${v.phone}`} className="flex items-center gap-1 text-primary hover:underline"><Phone className="size-3.5" />Call</a>
                  <a href={`mailto:${v.email}`} className="flex items-center gap-1 text-primary hover:underline"><Mail className="size-3.5" />Email</a>
                </div>
                <Button onClick={() => setSelectedVendor(v)}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2 text-sm font-medium text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Handshake className="size-4" />Ask AI to Negotiate
                </Button>
              </article>
            ))}
          </div>
        </section>
      </div>
      {selectedVendor && <NegotiationModal key={selectedVendor.name} vendor={selectedVendor} eventType={cfg.label as "Wedding" | "Birthday" | "Community Festival"} onClose={() => setSelectedVendor(null)} />}
    </div>
  );
}

