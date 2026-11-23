/* Seeds initial content. Idempotent: only inserts rows that don't exist yet, never overwrites admin edits. */
import bcrypt from "bcryptjs";
import { config } from "../config.js";
import { query } from "./pool.js";
import {
  COURSE_COLS, courseValues, BATCH_COLS, batchValues, SERVICE_COLS, serviceValues, TECH_COLS, techValues, placeholders
} from "./mappers.js";
import { DEFAULT_SETTINGS, SEED_BATCHES, SEED_COURSES, SEED_SERVICES, SEED_TECHNOLOGIES } from "./seed-data.js";

export async function seedContent(db = { query }, { log = console.log } = {}) {
  const counts = { settings: 0, courses: 0, batches: 0, services: 0, technologies: 0, logos: 0 };

  const s = await db.query("INSERT INTO settings (key, value) VALUES ('site', $1) ON CONFLICT (key) DO NOTHING", [JSON.stringify(DEFAULT_SETTINGS)]);
  counts.settings = s.rowCount;

  for (const [i, c] of SEED_COURSES.entries()) {
    const r = await db.query(
      `INSERT INTO courses (id, ${COURSE_COLS.join(", ")}, sort) VALUES ($1, ${placeholders(COURSE_COLS.length, 2)}, $${COURSE_COLS.length + 2})
       ON CONFLICT (id) DO NOTHING`, [c.id, ...courseValues(c), i]);
    counts.courses += r.rowCount;
    // backfill logo for existing catalogue courses that have none (never overwrites a chosen logo)
    if (c.icon) counts.logos += (await db.query("UPDATE courses SET icon = $1 WHERE id = $2 AND icon = ''", [c.icon, c.id])).rowCount;
  }

  for (const b of SEED_BATCHES) {
    const r = await db.query(
      `INSERT INTO batches (id, ${BATCH_COLS.join(", ")}) VALUES ($1, ${placeholders(BATCH_COLS.length, 2)}) ON CONFLICT DO NOTHING`,
      [b.id, ...batchValues(b)]);
    counts.batches += r.rowCount;
  }

  for (const [i, sv] of SEED_SERVICES.entries()) {
    const r = await db.query(
      `INSERT INTO services (id, ${SERVICE_COLS.join(", ")}, sort) VALUES ($1, ${placeholders(SERVICE_COLS.length, 2)}, $${SERVICE_COLS.length + 2})
       ON CONFLICT (id) DO NOTHING`, [sv.id, ...serviceValues(sv), i]);
    counts.services += r.rowCount;
  }

  for (const [i, t] of SEED_TECHNOLOGIES.entries()) {
    const r = await db.query(
      `INSERT INTO technologies (${TECH_COLS.join(", ")}, sort) VALUES (${placeholders(TECH_COLS.length)}, $${TECH_COLS.length + 1})
       ON CONFLICT (name) DO NOTHING`, [...techValues(t), i]);
    counts.technologies += r.rowCount;
  }

  log(`[seed] inserted: ${Object.entries(counts).map(([k, v]) => `${k}=${v}`).join(", ")}`);
  return counts;
}

export async function ensureAdminUser({ log = console.log } = {}) {
  const { rows } = await query("SELECT COUNT(*)::int AS n FROM users");
  if (rows[0].n > 0) return false;
  const { username, password, email } = config.admin;
  if (!password || password.length < 8) throw new Error("Set ADMIN_PASSWORD (min 8 characters) in .env to create the first admin user.");
  await query("INSERT INTO users (username, password_hash, email) VALUES ($1, $2, $3)", [username, await bcrypt.hash(password, 12), email?.toLowerCase() || null]);
  log(`[seed] created admin user "${username}"`);
  return true;
}
