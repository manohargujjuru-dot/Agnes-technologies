/* Optional email notification for new enquiries.
   Enabled only when SMTP_HOST and NOTIFY_TO are set in .env. */
import { config } from "../config.js";

let transporter = null;

async function getTransport() {
  if (transporter || !config.smtp.host) return transporter;
  const { default: nodemailer } = await import("nodemailer");
  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.pass } : undefined
  });
  return transporter;
}

const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export const emailEnabled = () => !!config.smtp.host;

export async function sendPasswordResetEmail(to, username, link) {
  const t = await getTransport();
  if (!t) return false;
  await t.sendMail({
    from: config.smtp.from,
    to,
    subject: "Reset your admin password",
    text: `Hi ${username},\n\nUse this link to set a new admin password (valid for 30 minutes):\n${link}\n\nIf you didn't ask for this, ignore this email — your password stays the same.`,
    html: `<p>Hi ${esc(username)},</p><p>Use this link to set a new admin password. It is valid for <strong>30 minutes</strong> and can be used once.</p>
      <p><a href="${esc(link)}" style="display:inline-block;background:#D21404;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Reset password</a></p>
      <p style="color:#5b6782">If you didn't ask for this, ignore this email — your password stays the same.</p>`
  });
  return true;
}

export async function notifyEnquiry(enq) {
  try {
    const t = await getTransport();
    if (!t || !config.smtp.notifyTo) return false;
    const rows = Object.entries({ Name: enq.name, Email: enq.email, Phone: enq.phone, Source: enq.source, ...enq.payload })
      .filter(([, v]) => v).map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#5b6782">${esc(k)}</td><td>${esc(v)}</td></tr>`).join("");
    await t.sendMail({
      from: config.smtp.from,
      to: config.smtp.notifyTo,
      replyTo: enq.email,
      subject: `New enquiry: ${enq.payload.subject || enq.source || enq.kind} — ${enq.name}`,
      html: `<h2 style="color:#192841">New website enquiry</h2><table>${rows}</table>`
    });
    return true;
  } catch (err) {
    console.error("[notify] email failed:", err.message); // never fail the request because of email
    return false;
  }
}
