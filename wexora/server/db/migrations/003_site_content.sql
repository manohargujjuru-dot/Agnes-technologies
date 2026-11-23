-- 003: dynamic site content — settings, services, technologies

CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS services (
  id           TEXT PRIMARY KEY CHECK (id ~ '^[a-z0-9-]+$'),
  title        TEXT NOT NULL,
  icon         TEXT NOT NULL DEFAULT 'code',
  short        TEXT NOT NULL DEFAULT '',
  hero         TEXT NOT NULL DEFAULT '',
  cta          TEXT NOT NULL DEFAULT 'Send an Enquiry',
  cta_link     TEXT NOT NULL DEFAULT '',
  image        TEXT NOT NULL DEFAULT '',
  types_title  TEXT NOT NULL DEFAULT 'What we offer',
  types        JSONB NOT NULL DEFAULT '[]',
  caps_title   TEXT NOT NULL DEFAULT 'Capabilities',
  caps         JSONB NOT NULL DEFAULT '[]',
  process      JSONB NOT NULL DEFAULT '[]',
  form_kind    TEXT NOT NULL DEFAULT 'general',
  show_batches BOOLEAN NOT NULL DEFAULT FALSE,
  show_note    BOOLEAN NOT NULL DEFAULT FALSE,
  published    BOOLEAN NOT NULL DEFAULT TRUE,
  sort         INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS technologies (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE,
  label      TEXT NOT NULL DEFAULT '',
  icon       TEXT NOT NULL DEFAULT '',
  logo_text  TEXT NOT NULL DEFAULT '',
  course_id  TEXT REFERENCES courses(id) ON DELETE SET NULL,
  published  BOOLEAN NOT NULL DEFAULT TRUE,
  sort       INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_services_published ON services (published, sort);
CREATE INDEX IF NOT EXISTS idx_technologies_published ON technologies (published, sort);
