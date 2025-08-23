import {Hono} from 'hono'
import {handle} from 'hono/vercel'
import {cors} from 'hono/cors'
import images from './images'
// Edge runtime enables deploying to edge computing environments,
// offering lower latency and faster response times by running
// code closer to the user's geographic location
export const runtime = 'nodejs'; // OR "edge"

const app = new Hono().basePath('/api');

app.use('/*', cors({
  origin: ['http://localhost:3000', 'https://localhost:3000'],
  allowHeaders: ['X-Custom-Header', 'Upgrade-Insecure-Requests', 'Content-Type'],
  allowMethods: ['POST', 'GET', 'OPTIONS'],
  exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
  maxAge: 600,
  credentials: true,
}));

app.route('/images', images)

export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
export const DELETE = handle(app)
export const OPTIONS = handle(app)

export type AppType = typeof app;
