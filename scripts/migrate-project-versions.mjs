import { readFileSync } from 'node:fs';
import { neon } from '@neondatabase/serverless';

// Never migrate implicitly at runtime. An owner-controlled Preview-only switch is required.
if (process.env.APPLY_PROJECT_VERSIONS_MIGRATION !== '1') process.exit(0);
if (process.env.VERCEL_ENV !== 'preview' || process.env.VERCEL_GIT_COMMIT_REF !== 'review/aritfy-editor-fixes-20261122') {
  console.error('Version migration refused outside its approved review branch.');
  process.exit(1);
}
const url = process.env.DATABASE_URL ?? process.env.NEXT_PUBLIC_DATABASE_URL;
if (!url) {console.error('Server database configuration is missing.'); process.exit(1);}
try {
  const sql = neon(url);
  const existing = await sql.query(`SELECT to_regclass('public."projectVersion"')::text AS name, obj_description(to_regclass('public."projectVersion"'), 'pg_class') AS marker`);
  if (existing[0]?.name && existing[0]?.marker !== 'aritfy_project_versions_v1_20261122') {
    console.error('An unrecognized version table already exists. No migration attempted.');
    process.exit(1);
  }
  const migration = readFileSync(new URL('../migrations/20261122_project_versions.sql', import.meta.url), 'utf8');
  const statements = migration.split(/^-- statement-breakpoint$/m).map(value => value.trim()).filter(Boolean);
  await sql.transaction(statements.map(statement => sql.query(statement)));
  console.log('Additive project-version schema migration completed. Existing project rows were not updated or deleted.');
} catch {
  console.error('Project-version schema migration failed. Transaction rolled back; inspect database access and migration compatibility before retrying.');
  process.exit(1);
}
