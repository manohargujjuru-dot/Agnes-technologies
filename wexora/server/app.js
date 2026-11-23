/* Express application — shared by the local server (server/index.js) and Vercel (api/[...path].js). */
import express from "express";
import helmet from "helmet";
import { config, missingConfig } from "./config.js";
import { apiLimiter, errorHandler, notFound } from "./middleware/index.js";
import publicRoutes from "./routes/public.js";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin/index.js";


const app = express();
app.disable("x-powered-by");
if (config.trustProxy) app.set("trust proxy", 1);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["https://www.google.com"]
    }
  }
}));
app.use(express.json({ limit: "100kb" }));

/* If the host is missing required settings, answer every API call with a clear message
   instead of crashing (shows up in Vercel logs and at /api/health). */
const missing = missingConfig();
if (missing.length) {
  console.error(`[config] Missing environment variables: ${missing.join(", ")}`);
  app.use("/api", (_req, res) => res.status(503).json({ error: "Server is not configured yet.", missing }));
}

app.use("/api", apiLimiter);
app.use("/api", publicRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", (_req, res) => notFound(res, "Unknown API endpoint"));

app.use(errorHandler);

export default app;
