import projectVersionsRouter from './project-versions';
import { db } from '@/db/drizzle';
import { projects, projectsInsertSchema } from '@/db/schema';
import { verifyAuth } from '@hono/auth-js';
import { zValidator } from '@hono/zod-validator';
import { and, asc, desc, eq, gt, ilike, isNull, lt, or } from 'drizzle-orm';
import { projectRevision } from '@/features/projects/revision';
import { BUILT_IN_TEMPLATES } from '@/features/projects/built-in-templates';
import {Hono} from 'hono'
import z from 'zod';


const pageQuery = {
  page: z.coerce.number().int().min(1).max(10000).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  search: z.string().trim().max(100).default(""),
};
const searchPattern = (value: string) => `%${value.replace(/[\\%_]/g, "\\$&")}%`;

const app = new Hono()
  .route('/:id/versions', projectVersionsRouter)
  .get('/templates', verifyAuth(), zValidator('query', z.object({
    ...pageQuery,
    access: z.enum(["all", "free", "premium"]).default("all"),
    source: z.enum(["all", "local", "saved"]).default("all"),
  })), async (c) => {
    const auth = c.get('authUser');
    if (!auth.token?.id) return c.json({error: 'Unauthorized'}, 401);
    const {page, limit, search, access, source} = c.req.valid('query');
    const local = source === "saved" ? [] : BUILT_IN_TEMPLATES.filter(template =>
      template.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()) &&
      (access === "all" || template.isPro === (access === "premium"))
    ).map(template => ({...template, source: "local" as const}));
    const offset = (page - 1) * limit;
    const localPage = local.slice(offset, offset + limit + 1);
    const remaining = limit + 1 - localPage.length;
    const saved = source === "local" || remaining === 0 ? [] : await db.select().from(projects).where(and(
      eq(projects.isTemplate, true),
      search ? ilike(projects.name, searchPattern(search)) : undefined,
      access === "all" ? undefined : access === "premium" ? eq(projects.isPro, true) : or(eq(projects.isPro, false), isNull(projects.isPro)),
    )).limit(remaining).offset(Math.max(0, offset - local.length)).orderBy(
      asc(projects.isPro), desc(projects.updatedAt), asc(projects.id)
    );
    const combined = [...localPage, ...saved.map(template => ({...template, source: "saved" as const}))];
    return c.json({data: combined.slice(0, limit), nextPage: combined.length > limit ? page + 1 : null});
  })
  .delete('/:id', verifyAuth(), zValidator('param', z.object({id: z.string()})), async (c) => {
    const auth = c.get('authUser');
    const {id} = c.req.valid('param');
    if (!auth.token?.id) {
       return c.json({error: 'Unauthorized'}, 401)
    }
    const data = await db.delete(projects).where(
      and(
        eq(projects.id, id),
        eq(projects.userId, auth.token.id)
      )
    ).returning();
    if (data.length === 0) {
      return c.json({error: 'Not found' }, 404);
    }
    return c.json({
      data: {id}
    })

  })
.post('/:id/duplicate', verifyAuth(), zValidator('param', z.object({
  id: z.string()

})), async (c) => {
  const auth= c.get('authUser');
  const { id } = c.req.valid('param');

  if (!auth.token?.id) {
    return c.json({error: 'Unauthorized'}, 401)
  }
  const data = await db.select().from(projects).where(and(
    eq(projects.id, id),
    eq(projects.userId,auth.token.id)
  ))
  if (data.length === 0) {
    return c.json({
      error: 'Not found'
    }, 404)
  }
  const project = data[0];
  const duplicatedData = await db.insert(projects).values({
    name: `Copy of ${project.name}`,
    json: project.json,
    width: project.width,
    height: project.height,
    userId: auth.token.id,
    createdAt: new Date(),
    updatedAt: new Date(),
    thumbnailUrl: project.thumbnailUrl,
    isTemplate: false,
    isPro: project.isPro,
  }).returning();
  return c.json({data: duplicatedData[0]})
})
  .get('/', verifyAuth(), zValidator('query', z.object({
    ...pageQuery,
    orientation: z.enum(["all", "portrait", "landscape", "square"]).default("all"),
  })), async (c) => {
    const auth = c.get('authUser');
    const {limit, page, search, orientation} = c.req.valid('query');
    if (!auth.token?.id) return c.json({error: "Unauthorized"}, 401);
    const data = await db.select().from(projects).where(and(
      eq(projects.userId, auth.token.id),
      search ? ilike(projects.name, searchPattern(search)) : undefined,
      orientation === "portrait" ? gt(projects.height, projects.width) :
      orientation === "landscape" ? lt(projects.height, projects.width) :
      orientation === "square" ? eq(projects.height, projects.width) : undefined,
    )).limit(limit).offset((page - 1) * limit).orderBy(desc(projects.updatedAt), asc(projects.id));
    return c.json({data, nextPage: data.length === limit ? page + 1 : null});
  })
  .patch('/:id', verifyAuth(), zValidator('param',
    z.object({
      id: z.string(),

    })), zValidator('json',
      projectsInsertSchema.pick({
        name: true,
        json: true,
        width: true,
        height: true,
        thumbnailUrl: true
      }).partial().extend({baseRevision: z.string().regex(/^[a-f0-9]{64}$/).optional()})
   ), async (c) => {
    const auth = c.get('authUser');
    const { id } = c.req.valid('param');
    const {baseRevision, ...values} = c.req.valid('json');
    if (!auth.token?.id) {
      return c.json({error: 'Unauthorized'}, 401)
    }
    const changesDesign = values.json !== undefined || values.width !== undefined || values.height !== undefined;
    const current = changesDesign ? (await db.select().from(projects).where(and(eq(projects.id, id), eq(projects.userId, auth.token.id))).limit(1))[0] : undefined;
    if (changesDesign) {
      if (!current) return c.json({error: "Not found"}, 404);
      if (!baseRevision) return c.json({error: "Reload the editor before saving. Export your current JSON first."}, 409);
      const revision = await projectRevision(current);
      const nextRevision = await projectRevision({...current, ...values});
      if (baseRevision !== revision && nextRevision !== revision) return c.json({error: "This design changed in another tab. Export your current JSON before reloading."}, 409);
    }
    const data = await db.update(projects).set({
      ...values,
      updatedAt: new Date()
    }).where(
      and(
        eq(projects.id, id),
        eq(projects.userId, auth.token.id),
        current ? and(eq(projects.json, current.json), eq(projects.width, current.width), eq(projects.height, current.height)) : undefined
      )
    ).returning()
    if (data.length === 0) {
      return c.json({
        error: "This design changed while saving. Export your current JSON before reloading."
      }, 409)
    }
    return c.json({
      data: {...data[0], revision: await projectRevision(data[0])}
    })
   })
  .get('/:id', verifyAuth(), zValidator('param', z.object({
   id: z.string()
  })), async (c) => {
    const auth = c.get('authUser');
    const {id } = c.req.valid('param')
    if (!auth.token?.id) {
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
      data: {...data[0], revision: await projectRevision(data[0])}
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
      name,
      json,
      width,
      height,
      userId: auth.token.id,
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
