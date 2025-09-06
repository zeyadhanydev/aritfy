import { db } from '@/db/drizzle';
import { projects, projectsInsertSchema } from '@/db/schema';
import { verifyAuth } from '@hono/auth-js';
import { zValidator } from '@hono/zod-validator';
import { and, eq } from 'drizzle-orm';
import {Hono} from 'hono'
import z from 'zod';


const app = new Hono()
  .patch('/:id', verifyAuth(), zValidator('param',
    z.object({
      id: z.string(),

    })), zValidator('json',
      projectsInsertSchema.omit({
        id: true,
        userId: true,
        createdAt: true,
        updatedAt: true
      }).partial()
   ), async (c) => {
    const auth = c.get('authUser');
    const { id } = c.req.valid('param');
    const values = c.req.valid('json');
    if (!auth.token.id) {
      return c.json({error: 'Unauthorized'}, 401)
    }


   })
  .get('/:id', verifyAuth(), zValidator('param', z.object({
   id: z.string()
  })), async (c) => {
    const auth = c.get('authUser');
    const {id } = c.req.valid('param')
    if (!auth.token.id) {
      return c.json({
        error: "Unauthroized"
      }, 401)

    }
    const data = await db.select().from(projects).where(
      and(eq(
        projects.id, id
      ), eq(
        projects.userId,auth.token.id
      )))
    if (data?.length === 0) {
      return c.json({error: "Not Found"}, 404)
    }
    return c.json({
      data: data[0]
    })
  })
  .post('/', verifyAuth(), zValidator('json', projectsInsertSchema.pick({
    name: true,
    json: true,
    width: true,
    height: true
  })), async (c) => {
    const auth = c.get('authUser')
    const { name, json, width, height } = c.req.valid('json');
    if (!auth.token?.id) {
      return c.json({ error: 'Unauthroized' }, 401)
    }
    const data = await db.insert(projects).values({
      name, json, width, height, userId: auth.token.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    if (!data[0]) {
      return c.json({error: "Something went wrong"}, 400)
    }
    return c.json({
      data: data[0]
    })
  })

export default app;
