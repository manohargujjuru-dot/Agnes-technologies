/* Site content: categories, services, technologies and site settings. */
import { Router } from "express";
import { query } from "../../db/pool.js";
import {
  SERVICE_COLS, serviceValues, TECH_COLS, techValues, placeholders, setList, toCategory, toService, toTechnology
} from "../../db/mappers.js";
import { asyncHandler as h, notFound, validationError } from "../../middleware/index.js";
import {
  hasErrors, slugify, validateCategory, validateService, validateSettings, validateTechnology
} from "../../validators.js";

const router = Router();

/* ---------- Categories ---------- */
router.get("/categories", h(async (_req, res) => {
  const { rows } = await query(
    `SELECT k.*, COUNT(c.id) AS course_count FROM categories k
     LEFT JOIN courses c ON c.category = k.id GROUP BY k.id ORDER BY k.sort, k.name`);
  res.json(rows.map(toCategory));
}));

router.post("/categories", h(async (req, res) => {
  const { errors, value } = validateCategory(req.body);
  if (hasErrors(errors)) return validationError(res, errors);
  const id = slugify(value.name);
  if (!id) return validationError(res, { name: "Use letters or numbers in the name." });
  const { rows } = await query("INSERT INTO categories (id, name, sort) VALUES ($1, $2, $3) RETURNING *", [id, value.name, value.sort]);
  res.status(201).json(toCategory(rows[0]));
}));

router.put("/categories/:id", h(async (req, res) => {
  const { errors, value } = validateCategory(req.body);
  if (hasErrors(errors)) return validationError(res, errors);
  const { rows } = await query("UPDATE categories SET name = $1, sort = $2 WHERE id = $3 RETURNING *", [value.name, value.sort, req.params.id]);
  if (!rows[0]) return notFound(res, "Category not found");
  res.json(toCategory(rows[0]));
}));

router.delete("/categories/:id", h(async (req, res) => {
  const used = (await query("SELECT COUNT(*)::int AS n FROM courses WHERE category = $1", [req.params.id])).rows[0].n;
  if (used) return res.status(409).json({ error: `This category still has ${used} course(s). Move or delete them first.` });
  const { rowCount } = await query("DELETE FROM categories WHERE id = $1", [req.params.id]);
  if (!rowCount) return notFound(res, "Category not found");
  res.status(204).end();
}));

/* ---------- Services ---------- */
router.get("/services", h(async (_req, res) => {
  const { rows } = await query("SELECT * FROM services ORDER BY sort, title");
  res.json(rows.map(toService));
}));

router.post("/services", h(async (req, res) => {
  const { errors, value } = validateService(req.body);
  if (hasErrors(errors)) return validationError(res, errors);
  const id = slugify(value.title);
  if ((await query("SELECT 1 FROM services WHERE id = $1", [id])).rowCount) return validationError(res, { title: "A service with this name already exists." });
  const { rows } = await query(
    `INSERT INTO services (id, ${SERVICE_COLS.join(", ")}, sort)
     VALUES ($1, ${placeholders(SERVICE_COLS.length, 2)}, (SELECT COALESCE(MAX(sort), 0) + 1 FROM services)) RETURNING *`,
    [id, ...serviceValues(value)]);
  res.status(201).json(toService(rows[0]));
}));

router.put("/services/:id", h(async (req, res) => {
  const { errors, value } = validateService(req.body);
  if (hasErrors(errors)) return validationError(res, errors);
  const { rows } = await query(
    `UPDATE services SET ${setList(SERVICE_COLS)} WHERE id = $${SERVICE_COLS.length + 1} RETURNING *`,
    [...serviceValues(value), req.params.id]);
  if (!rows[0]) return notFound(res, "Service not found");
  res.json(toService(rows[0]));
}));

router.delete("/services/:id", h(async (req, res) => {
  const { rowCount } = await query("DELETE FROM services WHERE id = $1", [req.params.id]);
  if (!rowCount) return notFound(res, "Service not found");
  res.status(204).end();
}));

/* ---------- Technologies ---------- */
async function courseMissing(courseId) {
  return courseId && !(await query("SELECT 1 FROM courses WHERE id = $1", [courseId])).rowCount;
}

router.get("/technologies", h(async (_req, res) => {
  const { rows } = await query("SELECT * FROM technologies ORDER BY sort, name");
  res.json(rows.map(toTechnology));
}));

router.post("/technologies", h(async (req, res) => {
  const { errors, value } = validateTechnology(req.body);
  if (await courseMissing(value.courseId)) errors.courseId = "Linked course does not exist.";
  if (hasErrors(errors)) return validationError(res, errors);
  const { rows } = await query(
    `INSERT INTO technologies (${TECH_COLS.join(", ")}, sort)
     VALUES (${placeholders(TECH_COLS.length)}, (SELECT COALESCE(MAX(sort), 0) + 1 FROM technologies)) RETURNING *`,
    techValues(value));
  res.status(201).json(toTechnology(rows[0]));
}));

router.put("/technologies/:id", h(async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const { errors, value } = validateTechnology(req.body);
  if (await courseMissing(value.courseId)) errors.courseId = "Linked course does not exist.";
  if (hasErrors(errors)) return validationError(res, errors);
  const { rows } = await query(`UPDATE technologies SET ${setList(TECH_COLS)} WHERE id = $${TECH_COLS.length + 1} RETURNING *`, [...techValues(value), id]);
  if (!rows[0]) return notFound(res, "Technology not found");
  res.json(toTechnology(rows[0]));
}));

router.delete("/technologies/:id", h(async (req, res) => {
  const { rowCount } = await query("DELETE FROM technologies WHERE id = $1", [Number.parseInt(req.params.id, 10) || 0]);
  if (!rowCount) return notFound(res, "Technology not found");
  res.status(204).end();
}));

/* ---------- Site settings ---------- */
router.get("/settings", h(async (_req, res) => {
  const { rows } = await query("SELECT value, updated_at FROM settings WHERE key = 'site'");
  res.json({ ...(rows[0]?.value || {}), updatedAt: rows[0]?.updated_at || null });
}));

router.put("/settings", h(async (req, res) => {
  const { errors, value } = validateSettings(req.body);
  if (hasErrors(errors)) return validationError(res, errors);
  await query(
    `INSERT INTO settings (key, value) VALUES ('site', $1)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`, [JSON.stringify(value)]);
  res.json(value);
}));

/* ---------- Company logo (stored as an image in the settings table, served at /api/logo) ---------- */
const LOGO_RE = /^data:(image\/(?:png|webp|jpeg));base64,([A-Za-z0-9+/]+={0,2})$/;
const LOGO_MAX_BYTES = 1024 * 1024; // 1 MB after decoding — the admin page sends a 512×512 image (~40–200 KB)
const MAGIC = {
  "image/png": b => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  "image/jpeg": b => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  "image/webp": b => b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP"
};

router.get("/settings/logo", h(async (_req, res) => {
  const { rows } = await query("SELECT updated_at FROM settings WHERE key = 'logo'");
  res.json({ custom: !!rows[0], version: rows[0] ? new Date(rows[0].updated_at).getTime() : null });
}));

router.put("/settings/logo", h(async (req, res) => {
  const m = LOGO_RE.exec(String(req.body?.image || ""));
  if (!m) return validationError(res, { image: "Upload a PNG, JPG or WebP image." });
  const buf = Buffer.from(m[2], "base64");
  if (!buf.length || buf.length > LOGO_MAX_BYTES) return validationError(res, { image: "Logo must be under 1 MB." });
  if (!MAGIC[m[1]](buf)) return validationError(res, { image: "That file isn't a valid image." });
  const { rows } = await query(
    `INSERT INTO settings (key, value) VALUES ('logo', $1)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
     RETURNING updated_at`, [JSON.stringify({ mime: m[1], data: m[2], bytes: buf.length })]);
  res.json({ custom: true, version: new Date(rows[0].updated_at).getTime() });
}));

router.delete("/settings/logo", h(async (_req, res) => {
  await query("DELETE FROM settings WHERE key = 'logo'");
  res.json({ custom: false, version: null });
}));

export default router;
