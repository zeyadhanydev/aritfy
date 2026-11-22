import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { verifyAuth } from "@hono/auth-js";
import { GoogleGenAI } from "@google/genai";
import { hf } from "@/lib/huggingface";

const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
async function imageDataUrl(response: Response) {
	if (!response.ok) throw new Error("Image provider request failed");
	const mime = response.headers.get("content-type")?.split(";")[0] ?? "";
	if (!mime.startsWith("image/")) throw new Error("Provider did not return an image");
	const size = Number(response.headers.get("content-length"));
	if (size > MAX_IMAGE_BYTES) throw new Error("Provider image is too large");
	const bytes = await response.arrayBuffer();
	if (bytes.byteLength > MAX_IMAGE_BYTES) throw new Error("Provider image is too large");
	return `data:${mime};base64,${Buffer.from(bytes).toString("base64")}`;
}

const app = new Hono()
	.post("/remove-bg", verifyAuth(), zValidator("json", z.object({
		image: z.url({ protocol: /^https$/ }).max(4096),
	})), async (c) => {
		const { image } = c.req.valid("json");
		const endpoint = process.env.REMOVE_BG_MODEL;
		const key = process.env.API_KEY;
		if (!endpoint || !key) return c.json({ error: "Background removal is not configured", fallbackToClient: true }, 503);
		try {
			const url = new URL(endpoint);
			url.searchParams.set("image", image);
			const response = await fetch(url, { headers: { "X-API-Key": key }, signal: AbortSignal.timeout(60000) });
			return c.json({ data: await imageDataUrl(response), clientSide: false });
		} catch {
			return c.json({ error: "Background removal failed", fallbackToClient: true }, 502);
		}
	})
	.post("/generate-image", verifyAuth(), zValidator("json", z.object({
		prompt: z.string().trim().min(1).max(4000),
		model: z.enum(["google", "huggingface", "aritfy"]).default("google"),
	})), async (c) => {
		const { prompt, model } = c.req.valid("json");
		try {
			if (model === "aritfy") {
				const endpoint = process.env.GENERATE_IMAGE_MODAL_ENDPOINT;
				const key = process.env.API_KEY;
				if (!endpoint || !key) return c.json({ error: "Image generation is not configured" }, 503);
				const url = new URL(endpoint);
				url.searchParams.set("prompt", prompt);
				const response = await fetch(url, { headers: { "X-API-Key": key }, signal: AbortSignal.timeout(60000) });
				return c.json({ data: await imageDataUrl(response) });
			}
			if (model === "google") {
				const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
				const imageModel = process.env.GOOGLE_IMAGE_MODEL;
				if (!apiKey || !imageModel) return c.json({ error: "Google image generation is not configured" }, 503);
				const ai = new GoogleGenAI({ apiKey });
				const response = await ai.models.generateContent({
					model: imageModel,
					contents: prompt,
					config: { responseModalities: ["TEXT", "IMAGE"] },
				});
				const image = response.candidates?.flatMap((candidate) => candidate.content?.parts ?? [])
					.find((part) => part.inlineData?.data && part.inlineData.mimeType?.startsWith("image/"))?.inlineData;
				if (!image?.data) return c.json({ error: "The provider did not return an image" }, 502);
				return c.json({ data: `data:${image.mimeType};base64,${image.data}` });
			}
			if (!process.env.HUGGINGFACE_API_TOKEN) return c.json({ error: "Hugging Face image generation is not configured" }, 503);
			const image = await hf.textToImage({ model: "black-forest-labs/Flux.1-dev", inputs: prompt }, { outputType: "url" });
			return c.json({ data: image });
		} catch {
			return c.json({ error: "Image generation failed" }, 502);
		}
	});

export default app;
