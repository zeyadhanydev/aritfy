import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { verifyAuth } from "@hono/auth-js";
import { AI_GENERATION_UNAVAILABLE, BACKGROUND_REMOVAL_UNAVAILABLE } from "@/lib/release-scope";

// Deliberately no provider SDKs or environment-based escape hatch in this release.
const app = new Hono()
  .post("/remove-bg", verifyAuth(), zValidator("json", z.object({
    image: z.url({ protocol: /^https$/ }).max(4096),
  })), (c) => c.json({ error: BACKGROUND_REMOVAL_UNAVAILABLE, fallbackToClient: false }, 503))
  .post("/generate-image", verifyAuth(), zValidator("json", z.object({
    prompt: z.string().trim().min(1).max(4000),
    model: z.enum(["google", "huggingface", "aritfy"]).default("google"),
  })), (c) => c.json({ error: AI_GENERATION_UNAVAILABLE }, 503));

export default app;
