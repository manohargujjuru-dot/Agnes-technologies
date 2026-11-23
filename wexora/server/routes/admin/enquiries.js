import { Router } from "express";
import { query } from "../../db/pool.js";
import { toEnquiry } from "../../db/mappers.js";
import { asyncHandler as h, notFound } from "../../middleware/index.js";

const router = Router();
const parseId = raw => { const n = Number.parseInt(raw, 10); return Number.isInteger(n) && n > 0 ? n : null; };

router.get("/", h(async (_req, res) => {
  const { rows } = await query("SELECT * FROM enquiries ORDER BY created_at DESC LIMIT 1000");
  res.json(rows.map(toEnquiry));
}));

router.patch("/:id", h(async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return notFound(res, "Enquiry not found");
  const { rowCount } = await query("UPDATE enquiries SET is_read = $1 WHERE id = $2", [!!req.body?.read, id]);
  if (!rowCount) return notFound(res, "Enquiry not found");
  res.json({ ok: true });
}));

router.delete("/:id", h(async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return notFound(res, "Enquiry not found");
  const { rowCount } = await query("DELETE FROM enquiries WHERE id = $1", [id]);
  if (!rowCount) return notFound(res, "Enquiry not found");
  res.status(204).end();
}));

export default router;
