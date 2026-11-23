import crypto from "node:crypto";
import { Router } from "express";
import { query } from "../../db/pool.js";
import { BATCH_COLS, batchValues, placeholders, setList, toBatch } from "../../db/mappers.js";
import { asyncHandler as h, notFound, validationError } from "../../middleware/index.js";
import { hasErrors, validateBatch } from "../../validators.js";

const router = Router();

async function checkReferences(value, errors, selfId) {
  if (value.courseId && !(await query("SELECT 1 FROM courses WHERE id = $1", [value.courseId])).rowCount) {
    errors.courseId = "Linked course does not exist.";
  }
  const clash = (await query("SELECT id FROM batches WHERE code = $1", [value.code])).rows[0];
  if (clash && clash.id !== selfId) errors.code = "This batch code is already used.";
}

router.get("/", h(async (_req, res) => {
  const { rows } = await query("SELECT * FROM batches ORDER BY start_date DESC");
  res.json(rows.map(toBatch));
}));

router.post("/", h(async (req, res) => {
  const { errors, value } = validateBatch(req.body);
  await checkReferences(value, errors);
  if (hasErrors(errors)) return validationError(res, errors);
  const { rows } = await query(
    `INSERT INTO batches (id, ${BATCH_COLS.join(", ")}) VALUES ($1, ${placeholders(BATCH_COLS.length, 2)}) RETURNING *`,
    [`b_${crypto.randomUUID()}`, ...batchValues(value)]
  );
  res.status(201).json(toBatch(rows[0]));
}));

router.put("/:id", h(async (req, res) => {
  const { errors, value } = validateBatch(req.body);
  await checkReferences(value, errors, req.params.id);
  if (hasErrors(errors)) return validationError(res, errors);
  const { rows } = await query(
    `UPDATE batches SET ${setList(BATCH_COLS)} WHERE id = $${BATCH_COLS.length + 1} RETURNING *`,
    [...batchValues(value), req.params.id]
  );
  if (!rows[0]) return notFound(res, "Batch not found");
  res.json(toBatch(rows[0]));
}));

router.delete("/:id", h(async (req, res) => {
  const { rowCount } = await query("DELETE FROM batches WHERE id = $1", [req.params.id]);
  if (!rowCount) return notFound(res, "Batch not found");
  res.status(204).end();
}));

export default router;
