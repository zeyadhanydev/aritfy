-- Additive only. Existing project rows and authentication/billing tables are not changed.
CREATE TABLE IF NOT EXISTS "projectVersion" (
  "id" text PRIMARY KEY,
  "projectId" text NOT NULL REFERENCES "project"("id") ON DELETE CASCADE,
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "label" text NOT NULL CHECK (char_length("label") BETWEEN 1 AND 80),
  "json" text NOT NULL CHECK (octet_length("json") <= 524288 AND "json"::jsonb ? 'objects' AND jsonb_typeof("json"::jsonb->'objects') = 'array'),
  "width" integer NOT NULL CHECK ("width" BETWEEN 1 AND 8192),
  "height" integer NOT NULL CHECK ("height" BETWEEN 1 AND 8192),
  "kind" text NOT NULL CHECK ("kind" IN ('manual', 'pre_restore')),
  "targetVersionId" text,
  "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK ("width"::bigint * "height" <= 16777216)
);
-- statement-breakpoint
COMMENT ON TABLE "projectVersion" IS 'aritfy_project_versions_v1_20261122';
-- statement-breakpoint
CREATE INDEX IF NOT EXISTS "projectVersion_owner_project_created" ON "projectVersion" ("userId", "projectId", "createdAt" DESC);
-- statement-breakpoint

CREATE OR REPLACE FUNCTION aritfy_save_version(
  p_id text, p_user text, p_project text, p_label text, p_json text,
  p_width integer, p_height integer, p_kind text DEFAULT 'manual', p_target text DEFAULT NULL
) RETURNS text LANGUAGE plpgsql SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE previous "projectVersion"%ROWTYPE;
BEGIN
  -- All version writes use one short transaction lock, including the global storage check.
  PERFORM pg_advisory_xact_lock(710431607);
  PERFORM 1 FROM "project" WHERE "id" = p_project AND "userId" = p_user FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'VERSION_NOT_FOUND'; END IF;
  SELECT * INTO previous FROM "projectVersion" WHERE "id" = p_id;
  IF FOUND THEN
    IF previous."userId" = p_user AND previous."projectId" = p_project
       AND previous."json" = p_json AND previous."label" = p_label
       AND previous."width" = p_width AND previous."height" = p_height
       AND previous."kind" = p_kind AND previous."targetVersionId" IS NOT DISTINCT FROM p_target
    THEN RETURN p_id; END IF;
    RAISE EXCEPTION 'VERSION_REQUEST_CONFLICT';
  END IF;
  IF (SELECT count(*) FROM "projectVersion" WHERE "projectId" = p_project AND "userId" = p_user) >= 20 THEN
    RAISE EXCEPTION 'VERSION_PROJECT_LIMIT';
  END IF;
  IF (SELECT count(*) FROM "projectVersion" WHERE "userId" = p_user) >= 50 THEN
    RAISE EXCEPTION 'VERSION_ACCOUNT_LIMIT';
  END IF;
  IF (SELECT coalesce(sum(octet_length("json")), 0) FROM "projectVersion") + octet_length(p_json) > 33554432 THEN
    RAISE EXCEPTION 'VERSION_STORAGE_LIMIT';
  END IF;
  INSERT INTO "projectVersion" ("id", "projectId", "userId", "label", "json", "width", "height", "kind", "targetVersionId")
  VALUES (p_id, p_project, p_user, p_label, p_json, p_width, p_height, p_kind, p_target);
  RETURN p_id;
END;
$$;
-- statement-breakpoint
CREATE OR REPLACE FUNCTION aritfy_restore_version(
  p_backup text, p_user text, p_project text, p_version text,
  p_expected_json text, p_expected_width integer, p_expected_height integer
) RETURNS text LANGUAGE plpgsql SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE current_project "project"%ROWTYPE;
DECLARE selected_version "projectVersion"%ROWTYPE;
BEGIN
  PERFORM pg_advisory_xact_lock(710431607);
  SELECT * INTO current_project FROM "project" WHERE "id" = p_project AND "userId" = p_user FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'VERSION_NOT_FOUND'; END IF;
  SELECT * INTO selected_version FROM "projectVersion" WHERE "id" = p_version AND "projectId" = p_project AND "userId" = p_user;
  IF NOT FOUND THEN RAISE EXCEPTION 'VERSION_NOT_FOUND'; END IF;
  IF EXISTS (SELECT 1 FROM "projectVersion" WHERE "id" = p_backup AND "userId" = p_user AND "projectId" = p_project AND "kind" = 'pre_restore' AND "targetVersionId" = p_version)
     AND current_project."json" = selected_version."json"
     AND current_project."width" = selected_version."width" AND current_project."height" = selected_version."height"
  THEN RETURN p_backup; END IF;
  IF current_project."json" IS DISTINCT FROM p_expected_json OR current_project."width" IS DISTINCT FROM p_expected_width OR current_project."height" IS DISTINCT FROM p_expected_height THEN
    RAISE EXCEPTION 'VERSION_STALE_PROJECT';
  END IF;
  -- A failed backup or full cap aborts the whole restore. Nothing is silently deleted.
  PERFORM aritfy_save_version(p_backup, p_user, p_project, left('Before restore: ' || selected_version."label", 80), current_project."json", current_project."width", current_project."height", 'pre_restore', p_version);
  UPDATE "project" SET "json" = selected_version."json", "width" = selected_version."width", "height" = selected_version."height", "updatedAt" = clock_timestamp()
  WHERE "id" = p_project AND "userId" = p_user;
  RETURN p_backup;
END;
$$;
