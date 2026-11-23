/* Express application — shared by the local server (server/index.js) and Vercel (api/[...path].js). */
import express from "express";
import helmet from "helmet";
import { assertServerConfig, config } from "./config.js";
import { apiLimiter, errorHandler, notFound } from "./middleware/index.js";
import publicRoutes from "./routes/public.js";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin/index.js";

assertServerConfig();

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

app.use("/api", apiLimiter);
app.use("/api", publicRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", (_req, res) => notFound(res, "Unknown API endpoint"));

app.use(errorHandler);

export default app;
