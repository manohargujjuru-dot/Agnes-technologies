/* Database CLI
   npm run db:migrate   apply pending SQL migrations
   npm run db:seed      insert initial content + first admin user (only what's missing)
   npm run db:setup     migrate + seed
   npm run db:status    show migrations and row counts */
try { process.loadEnvFile(); } catch { /* use real environment variables */ }

const command = process.argv[2] || "setup";
const { closePool, query } = await import("../server/db/pool.js");
const { migrate, migrationStatus } = await import("../server/db/migrate.js");
const { seedContent, ensureAdminUser } = await import("../server/db/seed.js");

try {
  const { rows } = await query("SELECT current_database() AS db, split_part(version(), ',', 1) AS v");
  console.log(`[db] connected to ${rows[0].db} (${rows[0].v})`);

  if (command === "migrate" || command === "setup") await migrate();
  if (command === "seed" || command === "setup") { await seedContent(); await ensureAdminUser(); }
  if (command === "status") {
    for (const m of await migrationStatus()) console.log(`  ${m.appliedAt ? "✔" : "✖"} ${m.version}${m.appliedAt ? `  (${new Date(m.appliedAt).toISOString()})` : "  PENDING"}`);
    for (const t of ["categories", "courses", "batches", "enquiries", "services", "technologies", "settings", "users"]) {
      const { rows: r } = await query(`SELECT COUNT(*)::int AS n FROM ${t}`);
      console.log(`  ${t.padEnd(13)} ${r[0].n} rows`);
    }
  }
  if (!["migrate", "seed", "setup", "status"].includes(command)) throw new Error(`Unknown command "${command}"`);
  console.log("[db] done");
} catch (err) {
  console.error("[db] failed:", err.message);
  process.exitCode = 1;
} finally {
  await closePool();
}
