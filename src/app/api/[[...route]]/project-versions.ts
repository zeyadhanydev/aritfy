import {Hono} from 'hono';
import {verifyAuth} from '@hono/auth-js';
import {zValidator} from '@hono/zod-validator';
import {and, desc, eq, sql} from 'drizzle-orm';
import {z} from 'zod';
import {db} from '@/db/drizzle';
import {projects, projectVersions} from '@/db/schema';
import {projectRevision} from '@/features/projects/revision';

const projectParam = z.object({id: z.string().min(1).max(100)});
const versionParam = projectParam.extend({versionId: z.uuid()});
const snapshot = z.object({
  id: z.uuid(), label: z.string().trim().min(1).max(80),
  json: z.string().max(524288).refine(value => new TextEncoder().encode(value).length <= 524288, 'Saved versions support designs up to 512 KB.'),
  width: z.number().int().min(1).max(8192), height: z.number().int().min(1).max(8192),
}).refine(value => value.width * value.height <= 16777216, 'The design is too large for a saved version.').refine(value => {
  try {
    const design = JSON.parse(value.json);
    return Array.isArray(design.objects) && design.objects.length <= 2000 && design.objects.some((object: {name?: string}) => object.name === 'clip');
  } catch {return false;}
}, 'Choose a valid Aritfy design with a workspace and no more than 2,000 top-level objects.');
const metadata = {id: projectVersions.id, label: projectVersions.label, width: projectVersions.width, height: projectVersions.height, kind: projectVersions.kind, createdAt: projectVersions.createdAt};
const failure = (cause: unknown) => {
  const message = cause instanceof Error ? cause.message : '';
  const reasons = [
    ['VERSION_PROJECT_LIMIT', 'This project has 20 versions. Delete a version before saving or restoring.'],
    ['VERSION_ACCOUNT_LIMIT', 'This account has 50 versions. Delete a version before saving or restoring.'],
    ['VERSION_STORAGE_LIMIT', 'The free version-storage limit is full. Export your JSON or remove unneeded versions.'],
    ['VERSION_STALE_PROJECT', 'This design changed in another tab. Export your current JSON before reloading.'],
    ['VERSION_REQUEST_CONFLICT', 'This save request conflicts with an existing version. Reopen version history.'],
  ];
  return reasons.find(([code]) => message.includes(code))?.[1] ?? null;
};

const app = new Hono()
  .use('*', verifyAuth())
  .get('/', zValidator('param', projectParam), async c => {
    const userId = c.get('authUser').token?.id;
    if (!userId) return c.json({error: 'Unauthorized'}, 401);
    const {id} = c.req.valid('param');
    const [project] = await db.select({id: projects.id}).from(projects).where(and(eq(projects.id, id), eq(projects.userId, userId))).limit(1);
    if (!project) return c.json({error: 'Not found'}, 404);
    try {
      const data = await db.select(metadata).from(projectVersions).where(and(eq(projectVersions.projectId, id), eq(projectVersions.userId, userId))).orderBy(desc(projectVersions.createdAt), desc(projectVersions.id)).limit(20);
      return c.json({data, limits: {project: 20, account: 50, snapshotBytes: 524288, instanceBytes: 33554432}});
    } catch {return c.json({error: 'Saved versions are not available on this deployment yet.'}, 503);}
  })
  .get('/:versionId', zValidator('param', versionParam), async c => {
    const userId = c.get('authUser').token?.id;
    if (!userId) return c.json({error: 'Unauthorized'}, 401);
    const {id, versionId} = c.req.valid('param');
    const [data] = await db.select().from(projectVersions).where(and(eq(projectVersions.id, versionId), eq(projectVersions.projectId, id), eq(projectVersions.userId, userId))).limit(1);
    return data ? c.json({data}) : c.json({error: 'Not found'}, 404);
  })
  .post('/', zValidator('param', projectParam), zValidator('json', snapshot), async c => {
    const userId = c.get('authUser').token?.id;
    if (!userId) return c.json({error: 'Unauthorized'}, 401);
    const {id} = c.req.valid('param');
    const value = c.req.valid('json');
    try {
      await db.execute(sql`SELECT aritfy_save_version(${value.id}, ${userId}, ${id}, ${value.label}, ${value.json}, ${value.width}, ${value.height})`);
      return c.json({data: {id: value.id}});
    } catch (cause) {
      const reason = failure(cause);
      if (reason) return c.json({error: reason}, 409);
      if (cause instanceof Error && cause.message.includes('VERSION_NOT_FOUND')) return c.json({error: 'Not found'}, 404);
      return c.json({error: 'This version could not be saved. Your project has not been replaced.'}, 503);
    }
  })
  .post('/:versionId/restore', zValidator('param', versionParam), zValidator('json', z.object({operationId: z.uuid(), baseRevision: z.string().regex(/^[a-f0-9]{64}$/)})), async c => {
    const userId = c.get('authUser').token?.id;
    if (!userId) return c.json({error: 'Unauthorized'}, 401);
    const {id, versionId} = c.req.valid('param');
    const {operationId, baseRevision} = c.req.valid('json');
    const [project] = await db.select().from(projects).where(and(eq(projects.id, id), eq(projects.userId, userId))).limit(1);
    const [version] = await db.select().from(projectVersions).where(and(eq(projectVersions.id, versionId), eq(projectVersions.projectId, id), eq(projectVersions.userId, userId))).limit(1);
    if (!project || !version) return c.json({error: 'Not found'}, 404);
    const currentRevision = await projectRevision(project);
    if (baseRevision !== currentRevision) {
      const [backup] = await db.select({id: projectVersions.id}).from(projectVersions).where(and(eq(projectVersions.id, operationId), eq(projectVersions.projectId, id), eq(projectVersions.userId, userId), eq(projectVersions.kind, 'pre_restore'), eq(projectVersions.targetVersionId, versionId))).limit(1);
      if (backup && currentRevision === await projectRevision(version)) return c.json({data: {restored: true}});
      return c.json({error: 'This design changed in another tab. Export your current JSON before reloading.'}, 409);
    }
    if (new TextEncoder().encode(project.json).length > 524288) return c.json({error: 'The current design is too large to back up safely. Export its JSON before making changes.'}, 413);
    try {
      await db.execute(sql`SELECT aritfy_restore_version(${operationId}, ${userId}, ${id}, ${versionId}, ${project.json}, ${project.width}, ${project.height})`);
      return c.json({data: {restored: true}});
    } catch (cause) {
      const reason = failure(cause);
      return c.json({error: reason ?? 'Restore did not complete. Reopen version history to check the saved state before retrying.'}, reason ? 409 : 503);
    }
  })
  .delete('/:versionId', zValidator('param', versionParam), async c => {
    const userId = c.get('authUser').token?.id;
    if (!userId) return c.json({error: 'Unauthorized'}, 401);
    const {id, versionId} = c.req.valid('param');
    const data = await db.delete(projectVersions).where(and(eq(projectVersions.id, versionId), eq(projectVersions.projectId, id), eq(projectVersions.userId, userId))).returning({id: projectVersions.id});
    return data.length ? c.json({data: data[0]}) : c.json({error: 'Not found'}, 404);
  });
export default app;
