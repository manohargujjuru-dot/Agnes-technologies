/* Central configuration — every environment variable the server reads is listed here. */
export const config = {
  port: Number(process.env.PORT || 4000),
  isVercel: !!process.env.VERCEL,
  trustProxy: !!(process.env.VERCEL || process.env.TRUST_PROXY),
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: "8h",
  databaseUrl: process.env.DATABASE_URL,
  databaseCa: process.env.DATABASE_CA,
  databaseCaPath: process.env.DATABASE_CA_PATH,
  admin: { username: process.env.ADMIN_USER || "admin", password: process.env.ADMIN_PASSWORD, email: process.env.ADMIN_EMAIL },
  /* Public site URL used in password-reset emails. Never derived from the request Host header (prevents link poisoning). */
  appUrl: (process.env.APP_URL
    || (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`)
    || "http://localhost:5173").replace(/\/$/, ""),
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    notifyTo: process.env.NOTIFY_TO
  }
};

export function assertServerConfig() {
  if (!config.jwtSecret || config.jwtSecret.length < 32) throw new Error("JWT_SECRET must be set (32+ characters).");
  if (!config.databaseUrl) throw new Error("DATABASE_URL must be set (Aiven PostgreSQL Service URI).");
}
