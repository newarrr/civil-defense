-- Review migration: run only in an empty, isolated development database.
-- No production credentials, roles or grants are provisioned by this file.
BEGIN;
CREATE SCHEMA cd;
REVOKE ALL ON SCHEMA cd FROM PUBLIC;
CREATE TABLE cd.staff (
  id text PRIMARY KEY,
  identity_subject text NOT NULL UNIQUE,
  active boolean NOT NULL DEFAULT false
);
CREATE TABLE cd.staff_role (
  staff_id text REFERENCES cd.staff(id) ON DELETE RESTRICT,
  role text CHECK (role IN ('super_admin','admin','editor','reviewer','publisher','translator','subject_expert','media_manager','auditor')),
  PRIMARY KEY (staff_id, role)
);
CREATE TABLE cd.source (
  id text PRIMARY KEY,
  metadata jsonb NOT NULL CHECK (jsonb_typeof(metadata) = 'object'),
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE cd.taxonomy_term (
  dimension text CHECK (dimension IN ('hazards','stages','audiences','places')),
  id text CHECK (id ~ '^[a-z][a-z0-9-]{0,63}$'),
  labels jsonb NOT NULL CHECK (labels ?& ARRAY['badini','sorani','ar','en']),
  review_status text NOT NULL DEFAULT 'pending-human-review' CHECK (review_status IN ('pending-human-review','approved')),
  PRIMARY KEY (dimension, id)
);
CREATE TABLE cd.content (
  id text PRIMARY KEY CHECK (id ~ '^[a-z][a-z0-9-]{0,79}$'),
  author_id text NOT NULL REFERENCES cd.staff(id),
  version integer NOT NULL CHECK (version > 0),
  status text NOT NULL CHECK (status IN ('draft','submitted','in_review','approved','published','archived')),
  document jsonb NOT NULL,
  CHECK ((document->>'id' = id AND document->>'authorId' = author_id AND (document->>'version')::integer = version AND document->>'status' = status) IS TRUE),
  CHECK (document ?& ARRAY['id','authorId','version','status','revision']),
  CHECK (((document->>'revision')::integer > 0) IS TRUE)
);
-- Immutable complete snapshots permit rollback without overwriting history.
CREATE TABLE cd.content_revision (
  content_id text REFERENCES cd.content(id) ON DELETE RESTRICT,
  version integer CHECK (version > 0),
  document jsonb NOT NULL,
  saved_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (content_id, version),
  CHECK ((document->>'id' = content_id AND (document->>'version')::integer = version) IS TRUE)
);
CREATE TABLE cd.translation (
  content_id text,
  version integer,
  locale text CHECK (locale IN ('badini','sorani','ar','en')),
  title text NOT NULL,
  summary text NOT NULL,
  body text NOT NULL,
  review jsonb,
  PRIMARY KEY (content_id, version, locale),
  FOREIGN KEY (content_id, version) REFERENCES cd.content_revision(content_id, version) ON DELETE RESTRICT
);
CREATE TABLE cd.content_term (
  content_id text REFERENCES cd.content(id) ON DELETE RESTRICT,
  dimension text,
  term_id text,
  PRIMARY KEY (content_id, dimension, term_id),
  FOREIGN KEY (dimension, term_id) REFERENCES cd.taxonomy_term(dimension, id) ON DELETE RESTRICT
);
CREATE TABLE cd.content_source (
  content_id text REFERENCES cd.content(id) ON DELETE RESTRICT,
  source_id text REFERENCES cd.source(id) ON DELETE RESTRICT,
  PRIMARY KEY (content_id, source_id)
);
CREATE TABLE cd.content_relation (
  content_id text REFERENCES cd.content(id) ON DELETE RESTRICT,
  related_id text REFERENCES cd.content(id) ON DELETE RESTRICT,
  relation text CHECK (relation IN ('related','prerequisite','equipment','document')),
  CHECK (content_id <> related_id),
  PRIMARY KEY (content_id, related_id, relation)
);
CREATE TABLE cd.audit_event (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  content_id text NOT NULL REFERENCES cd.content(id),
  actor_id text NOT NULL REFERENCES cd.staff(id),
  version integer NOT NULL,
  action text NOT NULL CHECK (action IN ('submit','start_review','request_changes','approve','publish','archive')),
  from_status text NOT NULL,
  to_status text NOT NULL,
  occurred_at timestamptz NOT NULL,
  reason text,
  UNIQUE(content_id, version),
  FOREIGN KEY (content_id, version) REFERENCES cd.content_revision(content_id, version)
);
CREATE FUNCTION cd.reject_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Append-only record' USING ERRCODE = '42501';
END;
$$;
CREATE TRIGGER audit_append_only BEFORE UPDATE OR DELETE ON cd.audit_event FOR EACH ROW EXECUTE FUNCTION cd.reject_mutation();
CREATE TRIGGER revision_append_only BEFORE UPDATE OR DELETE ON cd.content_revision FOR EACH ROW EXECUTE FUNCTION cd.reject_mutation();
CREATE TRIGGER translation_append_only BEFORE UPDATE OR DELETE ON cd.translation FOR EACH ROW EXECUTE FUNCTION cd.reject_mutation();
CREATE INDEX content_status_idx ON cd.content(status);
CREATE INDEX content_term_lookup_idx ON cd.content_term(dimension, term_id, content_id);
CREATE INDEX audit_time_idx ON cd.audit_event(occurred_at);
REVOKE ALL ON ALL TABLES IN SCHEMA cd FROM PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA cd FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA cd FROM PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA cd REVOKE ALL ON TABLES FROM PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA cd REVOKE ALL ON FUNCTIONS FROM PUBLIC;
COMMIT;
