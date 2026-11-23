-- 004: data-integrity rules, updated_at triggers and supporting indexes
-- ('' means "to be confirmed" for optional course facts)

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'courses_level_check') THEN
    ALTER TABLE courses ADD CONSTRAINT courses_level_check
      CHECK (level IN ('', 'Beginner', 'Intermediate', 'Advanced'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'courses_mode_check') THEN
    ALTER TABLE courses ADD CONSTRAINT courses_mode_check
      CHECK (mode IN ('', 'Online', 'Classroom', 'Online & Classroom'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'courses_id_format') THEN
    ALTER TABLE courses ADD CONSTRAINT courses_id_format CHECK (id ~ '^[a-z0-9-]+$');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'batches_status_check') THEN
    ALTER TABLE batches ADD CONSTRAINT batches_status_check
      CHECK (status IN ('Enrolling', 'Registration Closed', 'Completed'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'batches_dates_check') THEN
    ALTER TABLE batches ADD CONSTRAINT batches_dates_check CHECK (
      start_date ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
      AND end_date ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
      AND end_date >= start_date);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'enquiries_kind_check') THEN
    ALTER TABLE enquiries ADD CONSTRAINT enquiries_kind_check
      CHECK (kind IN ('general', 'contact', 'course', 'web', 'app', 'training', 'support', 'corporate'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'services_form_kind_check') THEN
    ALTER TABLE services ADD CONSTRAINT services_form_kind_check
      CHECK (form_kind IN ('general', 'web', 'app', 'training', 'support', 'corporate'));
  END IF;
END
$$;

-- Keep updated_at current automatically on every UPDATE
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_courses_updated ON courses;
CREATE TRIGGER trg_courses_updated BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_services_updated ON services;
CREATE TRIGGER trg_services_updated BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_settings_updated ON settings;
CREATE TRIGGER trg_settings_updated BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_batches_course ON batches (course_id);
CREATE INDEX IF NOT EXISTS idx_batches_start ON batches (start_date DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_unread ON enquiries (is_read) WHERE NOT is_read;
CREATE INDEX IF NOT EXISTS idx_technologies_course ON technologies (course_id);
