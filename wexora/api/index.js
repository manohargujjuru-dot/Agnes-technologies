/* Vercel serverless entry: every /api/* request is rewritten here (see vercel.json)
   and handled by the Express app. */
import app from "../server/app.js";

export default function handler(req, res) {
  // vercel.json rewrites /api/<path> → /api?__path=<path>. Restore the original URL if needed.
  const url = new URL(req.url, "http://localhost");
  const rewritten = url.searchParams.get("__path");
  if (rewritten !== null) {
    url.searchParams.delete("__path");
    if (!url.pathname.startsWith("/api/")) url.pathname = `/api/${rewritten}`;
    req.url = url.pathname + (url.searchParams.size ? `?${url.searchParams}` : "");
  }
  return app(req, res);
}
