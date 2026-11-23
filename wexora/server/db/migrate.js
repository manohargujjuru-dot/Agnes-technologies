/* Minimal SQL migration runner.
   - Runs server/db/migrations/*.sql in filename order
   - Each file runs once, inside its own transaction
   - Applied versions are recorded in schema_migrations
   - A Postgres advisory lock stops two deploys migrating at the same time */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getPool } from "./pool.js";

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "migrations");
const LOCK_ID = 727_001; // arbitrary app-specific advisory lock key

export async function migrate({ log = console.log } = {}) {
  const client = await getPool().connect();
  try {
    await client.query("SELECT pg_advisory_lock($1)", [LOCK_ID]);
    await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);
    const applied = new Set((await client.query("SELECT version FROM schema_migrations")).rows.map(r => r.version));
    const files = fs.readdirSync(DIR).filter(f => /^\d+_.+\.sql$/.test(f)).sort();

    let count = 0;
    for (const file of files) {
      if (applied.has(file)) continue;
      const sql = fs.readFileSync(path.join(DIR, file), "utf8");
      try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations (version) VALUES ($1)", [file]);
        await client.query("COMMIT");
        log(`[migrate] applied ${file}`);
        count++;
      } catch (err) {
        await client.query("ROLLBACK");
        throw new Error(`Migration ${file} failed: ${err.message}`);
      }
    }
    if (!count) log("[migrate] database is up to date");
    return count;
  } finally {
    await client.query("SELECT pg_advisory_unlock($1)", [LOCK_ID]).catch(() => {});
    client.release();
  }
}

export async function migrationStatus() {
  const files = fs.readdirSync(DIR).filter(f => /^\d+_.+\.sql$/.test(f)).sort();
  const { rows } = await getPool().query(
    "SELECT version, applied_at FROM schema_migrations ORDER BY version"
  ).catch(() => ({ rows: [] }));
  const applied = new Map(rows.map(r => [r.version, r.applied_at]));
  return files.map(f => ({ version: f, appliedAt: applied.get(f) || null }));
}
