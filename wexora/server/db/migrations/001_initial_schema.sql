-- 001: core tables.
-- Idempotent (IF NOT EXISTS) so it also adopts the database created before migrations existed.

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  username      TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS courses (
  id            TEXT PRIMARY KEY,
  title         TEXT NOT NULL,
  category      TEXT NOT NULL,
  weeks         INTEGER NOT NULL CHECK (weeks BETWEEN 1 AND 104),
  logo          TEXT NOT NULL DEFAULT '',
  summary       TEXT NOT NULL DEFAULT '',
  level         TEXT NOT NULL DEFAULT '',
  mode          TEXT NOT NULL DEFAULT '',
  schedule      TEXT NOT NULL DEFAULT '',
  prerequisites TEXT NOT NULL DEFAULT '',
  audience      TEXT NOT NULL DEFAULT '',
  overview      TEXT NOT NULL DEFAULT '',
  outcomes      JSONB NOT NULL DEFAULT '[]',
  modules       JSONB NOT NULL DEFAULT '[]',
  tools         TEXT NOT NULL DEFAULT '',
  flag          TEXT NOT NULL DEFAULT '',
  published     BOOLEAN NOT NULL DEFAULT TRUE,
  sort          INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS icon TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS batches (
  id          TEXT PRIMARY KEY,
  code        TEXT NOT NULL UNIQUE,
  title       TEXT NOT NULL,
  course_id   TEXT REFERENCES courses(id) ON DELETE SET NULL,
  logo        TEXT NOT NULL DEFAULT '',
  start_date  TEXT NOT NULL,
  end_date    TEXT NOT NULL,
  days        TEXT NOT NULL DEFAULT '',
  class_time  TEXT NOT NULL DEFAULT '',
  tz          TEXT NOT NULL DEFAULT '',
  mode        TEXT NOT NULL DEFAULT '',
  status      TEXT NOT NULL DEFAULT 'Enrolling',
  description TEXT NOT NULL DEFAULT '',
  featured    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS enquiries (
  id         SERIAL PRIMARY KEY,
  kind       TEXT NOT NULL,
  source     TEXT NOT NULL DEFAULT '',
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  phone      TEXT NOT NULL DEFAULT '',
  payload    JSONB NOT NULL DEFAULT '{}',
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_courses_published ON courses (published, sort);
CREATE INDEX IF NOT EXISTS idx_enquiries_created ON enquiries (created_at DESC);
