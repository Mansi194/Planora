import { z } from "zod";

// 1. Schema for AI Prompt input validation (prevents overly long inputs or basic script injections)
export const aiPromptSchema = z.object({
  prompt: z
    .string()
    .min(3, "Prompt must be at least 3 characters long")
    .max(500, "Prompt must be under 500 characters")
    .refine((val) => !/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(val), {
      message: "Invalid input or script tag detected",
    }),
});

// 2. Schema for Event Budget input validation
export const budgetSchema = z.object({
  categoryName: z.string().min(1, "Category name is required").max(50),
  allocatedAmount: z
    .number()
    .nonnegative("Amount cannot be negative")
    .max(1000000, "Amount exceeds limit"),
});