-- 002: course categories become a real table referenced by courses.category

CREATE TABLE IF NOT EXISTS categories (
  id         TEXT PRIMARY KEY CHECK (id ~ '^[a-z0-9-]+$'),
  name       TEXT NOT NULL UNIQUE,
  sort       INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO categories (id, name, sort) VALUES
  ('admin', 'Admin', 1),
  ('ai', 'Artificial Intelligence', 2),
  ('backend', 'Backend', 3),
  ('cloud', 'Cloud', 4),
  ('databases', 'Databases', 5),
  ('scripting', 'Scripting', 6),
  ('testing', 'Testing', 7),
  ('web', 'Web Development', 8)
ON CONFLICT (id) DO NOTHING;

-- Any course pointing at an unknown category gets that category created, so the FK can be added safely
INSERT INTO categories (id, name, sort)
SELECT DISTINCT c.category, initcap(c.category), 99
FROM courses c
WHERE NOT EXISTS (SELECT 1 FROM categories k WHERE k.id = c.category)
ON CONFLICT DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'courses_category_fkey') THEN
    ALTER TABLE courses ADD CONSTRAINT courses_category_fkey
      FOREIGN KEY (category) REFERENCES categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_courses_category ON courses (category);
