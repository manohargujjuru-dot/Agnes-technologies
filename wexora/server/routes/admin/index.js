import { Router } from "express";
import { query } from "../../db/pool.js";
import { migrationStatus } from "../../db/migrate.js";
import { asyncHandler as h, requireAdmin } from "../../middleware/index.js";
import courses from "./courses.js";
import batches from "./batches.js";
import enquiries from "./enquiries.js";
import content from "./content.js";

const router = Router();
router.use(requireAdmin); // every /api/admin/* route requires a valid admin token

router.use("/courses", courses);
router.use("/batches", batches);
router.use("/enquiries", enquiries);
router.use("/", content); // /categories, /services, /technologies, /settings

/* Database health for the dashboard: applied migrations + row counts */
router.get("/system", h(async (_req, res) => {
  const tables = ["categories", "courses", "batches", "enquiries", "services", "technologies", "settings", "users"];
  const counts = {};
  for (const t of tables) counts[t] = (await query(`SELECT COUNT(*)::int AS n FROM ${t}`)).rows[0].n; // table names are a fixed list
  const { rows } = await query("SELECT current_database() AS db, version() AS version");
  res.json({ database: rows[0].db, version: rows[0].version.split(",")[0], counts, migrations: await migrationStatus() });
}));

export default router;
