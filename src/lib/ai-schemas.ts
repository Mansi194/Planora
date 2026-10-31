import { z } from "zod";

export const ideasSchema = z.object({
  kind: z.literal("ideas"),
  query: z.string().trim().min(3, "Please enter at least 3 characters.").max(500, "Please keep it under 500 characters."),
  eventType: z.enum(["Wedding", "Birthday", "Community Festival"]),
});

export const negotiationSchema = z.object({
  kind: z.literal("negotiate"),
  vendorName: z.string().trim().min(1).max(100),
  category: z.string().trim().min(1).max(50),
  price: z.number().positive().max(10_000_000),
  eventType: z.enum(["Wedding", "Birthday", "Community Festival"]),
});

export const aiRequestSchema = z.discriminatedUnion("kind", [ideasSchema, negotiationSchema]);
export type AiRequest = z.infer<typeof aiRequestSchema>;