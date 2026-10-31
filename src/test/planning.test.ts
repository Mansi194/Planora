import { describe, expect, it } from "vitest";
import { budgetTotals, toggleTask } from "@/lib/planning-totals";
import { aiRequestSchema } from "@/lib/ai-schemas";

describe("Live planning rules", () => {
  it("updates spending and remaining balance when a category changes", () => {
    expect(budgetTotals([9000, 7500, 3500, 3000, 3000], 30000)).toEqual({ spent: 26000, remaining: 4000 });
    expect(budgetTotals([10000, 7500, 3500, 3000, 3000], 30000)).toEqual({ spent: 27000, remaining: 3000 });
  });
  it("toggles a timeline task and updates the six-task completion count both ways", () => {
    const tasks = Array.from({ length: 6 }, (_, i) => ({ id: i + 1, done: i < 3 }));
    const checked = toggleTask(tasks, 4);
    expect(checked.find(t => t.id === 4)?.done).toBe(true);
    expect(checked.filter(t => t.done)).toHaveLength(4);
    expect(toggleTask(checked, 4).filter(t => t.done)).toHaveLength(3);
  });
  it("validates prompts before AI requests", () => {
    expect(aiRequestSchema.safeParse({ kind: "ideas", query: "Suggest 5 eco-friendly wedding themes under $5,000", eventType: "Wedding" }).success).toBe(true);
    expect(aiRequestSchema.safeParse({ kind: "ideas", query: "  ", eventType: "Wedding" }).success).toBe(false);
  });
  it("requires a vendor category and positive price for negotiation", () => {
    const vendor = { kind: "negotiate", vendorName: "Golden Hall", category: "Venue", price: 8500, eventType: "Wedding" };
    expect(aiRequestSchema.safeParse(vendor).success).toBe(true);
    expect(aiRequestSchema.safeParse({ ...vendor, price: -1 }).success).toBe(false);
    expect(aiRequestSchema.safeParse({ ...vendor, category: "" }).success).toBe(false);
  });
});