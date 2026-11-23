/* Admin authentication & account management.
   - JWT (8h) carries the user id + token_version; bumping token_version signs out every session
   - Forgot password: one-time, 30-minute link emailed to the admin (requires SMTP settings)  */
import crypto from "node:crypto";
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { query, transaction } from "../db/pool.js";
import { asyncHandler as h, loginLimiter, requireAdmin, validationError } from "../middleware/index.js";
import { emailEnabled, sendPasswordResetEmail } from "../services/notify.js";

const router = Router();
const DUMMY_HASH = bcrypt.hashSync("timing-safe-dummy", 10); // compare even for unknown users (no username probing)
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const USERNAME = /^[A-Za-z0-9._-]{3,40}$/;
const RESET_MINUTES = 30;
const sha256 = s => crypto.createHash("sha256").update(s).digest("hex");
const passwordProblem = p => (p.length < 8 ? "Use at least 8 characters." : p.length > 200 ? "Password is too long." : "");

const signToken = user => jwt.sign({ sub: user.id, username: user.username, ver: user.token_version }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
const publicUser = u => ({ id: u.id, username: u.username, email: u.email || "", lastLoginAt: u.last_login_at });

/* ---------- Login ---------- */
router.post("/login", loginLimiter, h(async (req, res) => {
  const login = String(req.body?.username || "").trim();
  const password = String(req.body?.password || "");
  // Sign in with username or email
  const { rows } = await query("SELECT * FROM users WHERE username = $1 OR lower(email) = lower($1) LIMIT 1", [login]);
  const user = rows[0];
  const ok = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);
  if (!user || !ok) return res.status(401).json({ error: "Invalid username or password." });
  await query("UPDATE users SET last_login_at = now() WHERE id = $1", [user.id]);
  res.json({ token: signToken(user), user: publicUser(user) });
}));

/* ---------- Current account ---------- */
router.get("/me", requireAdmin, h(async (req, res) => {
  const { rows } = await query("SELECT * FROM users WHERE id = $1", [req.user.sub]);
  res.json({ user: publicUser(rows[0]), emailEnabled: emailEnabled() });
}));

router.put("/profile", requireAdmin, h(async (req, res) => {
  const username = String(req.body?.username || "").trim();
  const email = String(req.body?.email || "").trim().toLowerCase();
  const errors = {};
  if (!USERNAME.test(username)) errors.username = "3–40 characters: letters, numbers, dot, dash or underscore.";
  if (email && !EMAIL.test(email)) errors.email = "Enter a valid email address.";
  if (!errors.username && (await query("SELECT 1 FROM users WHERE username = $1 AND id <> $2", [username, req.user.sub])).rowCount) errors.username = "That username is taken.";
  if (email && !errors.email && (await query("SELECT 1 FROM users WHERE lower(email) = $1 AND id <> $2", [email, req.user.sub])).rowCount) errors.email = "That email is used by another admin.";
  if (Object.keys(errors).length) return validationError(res, errors);
  const { rows } = await query("UPDATE users SET username = $1, email = $2 WHERE id = $3 RETURNING *", [username, email || null, req.user.sub]);
  res.json({ user: publicUser(rows[0]), token: signToken(rows[0]) }); // new token carries the new username
}));

router.post("/change-password", requireAdmin, h(async (req, res) => {
  const current = String(req.body?.currentPassword || "");
  const next = String(req.body?.newPassword || "");
  const problem = passwordProblem(next);
  if (problem) return validationError(res, { newPassword: problem });
  const { rows } = await query("SELECT * FROM users WHERE id = $1", [req.user.sub]);
  if (!rows[0] || !(await bcrypt.compare(current, rows[0].password_hash))) {
    return validationError(res, { currentPassword: "Current password is incorrect." });
  }
  // bump token_version → every other session is signed out; return a fresh token for this one
  const { rows: updated } = await query(
    "UPDATE users SET password_hash = $1, token_version = token_version + 1 WHERE id = $2 RETURNING *",
    [await bcrypt.hash(next, 12), req.user.sub]);
  res.json({ ok: true, token: signToken(updated[0]) });
}));

router.post("/logout-all", requireAdmin, h(async (req, res) => {
  await query("UPDATE users SET token_version = token_version + 1 WHERE id = $1", [req.user.sub]);
  res.json({ ok: true });
}));

/* ---------- Forgot / reset password ---------- */
router.get("/reset-options", (_req, res) => res.json({ emailEnabled: emailEnabled() }));

router.post("/forgot-password", loginLimiter, h(async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const generic = { ok: true, emailEnabled: emailEnabled(), message: "If that email belongs to an admin, a reset link has been sent." };
  if (!EMAIL.test(email) || !emailEnabled()) return res.json(generic); // same answer either way — no account probing

  const user = (await query("SELECT id, username, email FROM users WHERE lower(email) = $1", [email])).rows[0];
  if (user) {
    const token = crypto.randomBytes(32).toString("base64url");
    await query("DELETE FROM password_resets WHERE user_id = $1 AND (used_at IS NOT NULL OR expires_at < now())", [user.id]);
    await query(
      `INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES ($1, $2, now() + ($3 || ' minutes')::interval)`,
      [user.id, sha256(token), String(RESET_MINUTES)]);
    try {
      await sendPasswordResetEmail(user.email, user.username, `${config.appUrl}/admin/reset-password?token=${token}`);
    } catch (err) {
      console.error("[auth] reset email failed:", err.message);
    }
  }
  res.json(generic);
}));

router.post("/reset-password", loginLimiter, h(async (req, res) => {
  const token = String(req.body?.token || "");
  const password = String(req.body?.password || "");
  const problem = passwordProblem(password);
  if (problem) return validationError(res, { password: problem });

  const ok = await transaction(async db => {
    const { rows } = await db.query(
      `SELECT id, user_id FROM password_resets
       WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now() FOR UPDATE`, [sha256(token)]);
    if (!rows[0]) return false;
    await db.query("UPDATE password_resets SET used_at = now() WHERE id = $1", [rows[0].id]);
    await db.query("DELETE FROM password_resets WHERE user_id = $1 AND id <> $2", [rows[0].user_id, rows[0].id]);
    await db.query("UPDATE users SET password_hash = $1, token_version = token_version + 1 WHERE id = $2",
      [await bcrypt.hash(password, 12), rows[0].user_id]);
    return true;
  });
  if (!ok) return res.status(400).json({ error: "This reset link is invalid or has expired. Request a new one." });
  res.json({ ok: true });
}));

export default router;
