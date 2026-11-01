import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    define: {
      'process.env.LOVABLE_API_KEY': JSON.stringify(process.env.LOVABLE_API_KEY || process.env.VITE_GEMINI_API_KEY),
      'process.env.VITE_GEMINI_API_KEY': JSON.stringify(process.env.VITE_GEMINI_API_KEY || process.env.LOVABLE_API_KEY),
    },
  },
});