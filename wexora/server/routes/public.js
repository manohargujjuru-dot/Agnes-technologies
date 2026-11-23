/* Public, read-mostly endpoints used by the website. */
import { Router } from "express";
import { query } from "../db/pool.js";
import { toBatch, toCategory, toCourse, toService, toTechnology } from "../db/mappers.js";
import { asyncHandler as h, enquiryLimiter, notFound, validationError } from "../middleware/index.js";
import { hasErrors, validateEnquiry } from "../validators.js";
import { notifyEnquiry } from "../services/notify.js";

const router = Router();
const shortCache = res => res.set("Cache-Control", "public, max-age=0, s-maxage=30, stale-while-revalidate=120");

router.get("/health", h(async (_req, res) => {
  await query("SELECT 1");
  res.json({ ok: true });
}));

/* Everything the layout needs in one request: settings, categories, services, technologies */
router.get("/site", h(async (_req, res) => {
  const [settings, categories, services, technologies] = await Promise.all([
    query("SELECT value FROM settings WHERE key = 'site'"),
    query("SELECT * FROM categories ORDER BY sort, name"),
    query("SELECT * FROM services WHERE published = TRUE ORDER BY sort, title"),
    query("SELECT * FROM technologies WHERE published = TRUE ORDER BY sort, name")
  ]);
  shortCache(res);
  res.json({
    settings: settings.rows[0]?.value || {},
    categories: categories.rows.map(toCategory),
    services: services.rows.map(toService),
    technologies: technologies.rows.map(toTechnology)
  });
}));

router.get("/courses", h(async (_req, res) => {
  const { rows } = await query("SELECT * FROM courses WHERE published = TRUE ORDER BY sort, title");
  shortCache(res);
  res.json(rows.map(toCourse));
}));

router.get("/courses/:id", h(async (req, res) => {
  const { rows } = await query("SELECT * FROM courses WHERE id = $1 AND published = TRUE", [req.params.id]);
  if (!rows[0]) return notFound(res, "Course not found");
  res.json(toCourse(rows[0]));
}));

router.get("/batches", h(async (_req, res) => {
  const { rows } = await query("SELECT * FROM batches ORDER BY start_date DESC");
  shortCache(res);
  res.json(rows.map(toBatch));
}));

router.post("/enquiries", enquiryLimiter, h(async (req, res) => {
  if (req.body?.website) return res.status(201).json({ ok: true }); // honeypot field filled → bot; pretend success
  const { errors, value } = validateEnquiry(req.body);
  if (hasErrors(errors)) return validationError(res, errors);
  const { rows } = await query(
    "INSERT INTO enquiries (kind, source, name, email, phone, payload) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
    [value.kind, value.source, value.name, value.email, value.phone, JSON.stringify(value.payload)]
  );
  await notifyEnquiry(value); // never throws; awaited so serverless doesn't freeze mid-send
  res.status(201).json({ ok: true, id: rows[0].id });
}));

export default router;
