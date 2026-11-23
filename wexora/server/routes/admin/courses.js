import crypto from "node:crypto";
import { Router } from "express";
import { query } from "../../db/pool.js";
import { COURSE_COLS, courseValues, placeholders, setList, toCourse } from "../../db/mappers.js";
import { asyncHandler as h, notFound, validationError } from "../../middleware/index.js";
import { hasErrors, slugify, validateCourse } from "../../validators.js";

const router = Router();

async function categoryExists(id) {
  return (await query("SELECT 1 FROM categories WHERE id = $1", [id])).rowCount > 0;
}

router.get("/", h(async (_req, res) => {
  const { rows } = await query("SELECT * FROM courses ORDER BY sort, title");
  res.json(rows.map(toCourse));
}));

router.post("/", h(async (req, res) => {
  const { errors, value } = validateCourse(req.body);
  if (!errors.category && !(await categoryExists(value.category))) errors.category = "Choose a valid category.";
  if (hasErrors(errors)) return validationError(res, errors);

  let id = slugify(value.title) || `course-${Date.now().toString(36)}`;
  if ((await query("SELECT 1 FROM courses WHERE id = $1", [id])).rowCount) id = `${id}-${crypto.randomBytes(3).toString("hex")}`;

  const { rows } = await query(
    `INSERT INTO courses (id, ${COURSE_COLS.join(", ")}, sort)
     VALUES ($1, ${placeholders(COURSE_COLS.length, 2)}, (SELECT COALESCE(MIN(sort), 0) - 1 FROM courses))
     RETURNING *`,
    [id, ...courseValues(value)]
  );
  res.status(201).json(toCourse(rows[0]));
}));

router.put("/:id", h(async (req, res) => {
  const { errors, value } = validateCourse(req.body);
  if (!errors.category && !(await categoryExists(value.category))) errors.category = "Choose a valid category.";
  if (hasErrors(errors)) return validationError(res, errors);
  const { rows } = await query(
    `UPDATE courses SET ${setList(COURSE_COLS)} WHERE id = $${COURSE_COLS.length + 1} RETURNING *`,
    [...courseValues(value), req.params.id]
  );
  if (!rows[0]) return notFound(res, "Course not found");
  res.json(toCourse(rows[0]));
}));

router.patch("/:id/publish", h(async (req, res) => {
  const { rows } = await query("UPDATE courses SET published = $1 WHERE id = $2 RETURNING *", [!!req.body?.published, req.params.id]);
  if (!rows[0]) return notFound(res, "Course not found");
  res.json(toCourse(rows[0]));
}));

router.delete("/:id", h(async (req, res) => {
  // batches.course_id and technologies.course_id are set to NULL by their foreign keys
  const { rowCount } = await query("DELETE FROM courses WHERE id = $1", [req.params.id]);
  if (!rowCount) return notFound(res, "Course not found");
  res.status(204).end();
}));

export default router;
