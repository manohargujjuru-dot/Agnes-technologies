import jwt from "jsonwebtoken";
import { rateLimit } from "express-rate-limit";
import { config } from "../config.js";
import { query } from "../db/pool.js";

/* Wrap async route handlers so rejected promises reach the error handler (Express 4). */
export const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/* Response helpers */
export const validationError = (res, details) => res.status(422).json({ error: "Please fix the highlighted fields.", details });
export const notFound = (res, what = "Not found") => res.status(404).json({ error: what });

/* JWT bearer-token authentication for admin routes.
   The token's version must match users.token_version, so a password change/reset or
   "sign out everywhere" immediately invalidates older sessions (and deleted users lose access). */
export const requireAdmin = asyncHandler(async (req, res, next) => {
  const token = (req.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "Authentication required." });
  let payload;
  try { payload = jwt.verify(token, config.jwtSecret); }
  catch { return res.status(401).json({ error: "Session expired. Please sign in again." }); }

  const { rows } = await query("SELECT token_version FROM users WHERE id = $1", [payload.sub]);
  if (!rows[0] || rows[0].token_version !== (payload.ver ?? 0)) {
    return res.status(401).json({ error: "Your session has ended. Please sign in again." });
  }
  req.user = payload;
  res.set("Cache-Control", "no-store");
  next();
});

/* Rate limits (in-memory: per instance — best-effort on serverless platforms) */
const limiter = (windowMs, limit, error) =>
  rateLimit({ windowMs, limit, standardHeaders: "draft-7", legacyHeaders: false, ...(error && { message: { error } }) });

export const apiLimiter = limiter(60_000, 300);
export const loginLimiter = limiter(15 * 60_000, 100, "Too many sign-in attempts from this connection. Please wait a few minutes and try again.");
export const enquiryLimiter = limiter(10 * 60_000, 10, "Too many enquiries from this connection. Please try again later.");

/* Central error handler — maps Postgres constraint errors to friendly 4xx responses */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err.type === "entity.parse.failed") return res.status(400).json({ error: "Invalid JSON body." });
  if (err.type === "entity.too.large") return res.status(413).json({ error: "Request too large." });
  switch (err.code) {
    case "23505": return res.status(409).json({ error: "A record with that value already exists." });
    case "23001":
    case "23503": return res.status(409).json({ error: err.table === "courses" ? "That category does not exist." : "This item is still in use and can't be changed or deleted." });
    case "23514": return res.status(422).json({ error: "A value is outside the allowed options." });
  }
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server." });
}
