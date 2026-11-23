/* Local / self-hosted entry point.
   Dev:  npm run dev           (API :4000, Vite :5173 proxies /api)
   Prod: npm run build && npm start   (API + built site on one port) */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

try { process.loadEnvFile(); } catch { /* no .env — rely on real environment variables */ }

const { default: express } = await import("express");
const { default: app } = await import("./app.js");

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../dist");
if (fs.existsSync(path.join(dist, "index.html"))) {
  app.use("/assets", express.static(path.join(dist, "assets"), { maxAge: "1y", immutable: true }));
  app.use(express.static(dist, { index: false, maxAge: "7d" }));
  app.get("*", (_req, res) => { res.set("Cache-Control", "no-cache"); res.sendFile(path.join(dist, "index.html")); });
}

const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, () => console.log(`[api] listening on http://localhost:${PORT}`));
