import { Hono } from "hono";
import {z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { hf } from "@/lib/huggingface";

const app = new Hono()
  .post('/generate-image',
  // add verification
  zValidator('json',
    z.object({
    prompt: z.string(),
  })),
  async (c) => {
    const {prompt} = c.req.valid('json')
    const response = await hf.textToImage({
      model: 'black-forest-labs/Flux.1-dev',
      // model: 'stabilityai/stable-diffusion-3.5-large',
      inputs: prompt,

    }, {
      outputType: 'url'
    })
    console.log(response)

    return c.json({
      data: response
    });

  }

  );
export default app;
