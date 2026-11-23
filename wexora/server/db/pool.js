/* PostgreSQL connection pool (Aiven). All queries use parameterised statements ($1, $2…). */
import fs from "node:fs";
import path from "node:path";
import pg from "pg";
import { config } from "../config.js";

function buildConfig() {
  if (!config.databaseUrl) throw new Error("DATABASE_URL is not set. Add your Aiven PostgreSQL Service URI to .env (or Vercel env vars).");
  // TLS is configured explicitly below, so remove sslmode from the URI (pg would otherwise override it).
  const url = new URL(config.databaseUrl);
  url.searchParams.delete("sslmode");

  // Aiven CA certificate enables full certificate verification.
  // Local: DATABASE_CA_PATH=./ca.pem   ·   Vercel: DATABASE_CA = the PEM text.
  const ca = config.databaseCa
    ? config.databaseCa.replace(/\\n/g, "\n")
    : config.databaseCaPath ? fs.readFileSync(path.resolve(config.databaseCaPath), "utf8") : undefined;
  if (!ca) console.warn("[db] No CA certificate configured — connection is encrypted but the server certificate is not verified.");

  return {
    connectionString: url.toString(),
    ssl: ca ? { ca, rejectUnauthorized: true } : { rejectUnauthorized: false },
    /* Aiven's free plan allows very few connections. Serverless instances each get ONE
       connection that closes after 5 s idle; local/self-hosted servers use up to 5. */
    max: config.isVercel ? 1 : 5,
    idleTimeoutMillis: config.isVercel ? 5_000 : 10_000,
    connectionTimeoutMillis: 10_000,
    allowExitOnIdle: true
  };
}

let pool;
export function getPool() {
  if (!pool) {
    pool = new pg.Pool(buildConfig());
    pool.on("error", err => console.error("[db] idle client error:", err.message));
    // On Vercel, release idle connections before the function instance is suspended
    if (config.isVercel) {
      import("@vercel/functions").then(({ attachDatabasePool }) => attachDatabasePool(pool)).catch(() => {});
    }
  }
  return pool;
}

export const query = (text, params) => getPool().query(text, params);

export async function transaction(fn) {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function closePool() {
  if (pool) { await pool.end(); pool = undefined; }
}
