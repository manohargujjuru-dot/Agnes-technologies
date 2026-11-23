/* Admin account CLI — for when nobody can sign in (e.g. forgot password and email isn't configured).
   Runs against the database in .env (the same one the live site uses).

   npm run admin -- list
   npm run admin -- reset-password <username>            (prints a new random password)
   npm run admin -- reset-password <username> <password>
   npm run admin -- create <username> [email]            (prints a random password)
   npm run admin -- set-email <username> <email>
   npm run admin -- delete <username>                     (refuses to delete the last admin) */
import crypto from "node:crypto";
try { process.loadEnvFile(); } catch { /* use real environment variables */ }

const { default: bcrypt } = await import("bcryptjs");
const { query, closePool } = await import("../server/db/pool.js");

const [command, a, b] = process.argv.slice(2);
const randomPassword = () => crypto.randomBytes(12).toString("base64url");

async function findUser(username) {
  const u = (await query("SELECT * FROM users WHERE username = $1", [username])).rows[0];
  if (!u) throw new Error(`No admin named "${username}". Run: npm run admin -- list`);
  return u;
}

try {
  switch (command) {
    case "list": {
      const { rows } = await query("SELECT username, email, last_login_at, created_at FROM users ORDER BY id");
      console.table(rows.map(r => ({ username: r.username, email: r.email || "—", lastLogin: r.last_login_at?.toISOString() || "never" })));
      break;
    }
    case "reset-password": {
      if (!a) throw new Error("Usage: npm run admin -- reset-password <username> [new-password]");
      await findUser(a);
      const pw = b || randomPassword();
      if (pw.length < 8) throw new Error("Password must be at least 8 characters.");
      await query("UPDATE users SET password_hash = $1, token_version = token_version + 1 WHERE username = $2", [await bcrypt.hash(pw, 12), a]);
      console.log(`Password reset for "${a}". All existing sessions are signed out.`);
      if (!b) console.log(`New password: ${pw}\n(Sign in and change it under Admin → Settings → My account.)`);
      break;
    }
    case "create": {
      if (!a) throw new Error("Usage: npm run admin -- create <username> [email]");
      const pw = randomPassword();
      await query("INSERT INTO users (username, password_hash, email) VALUES ($1, $2, $3)", [a, await bcrypt.hash(pw, 12), b?.toLowerCase() || null]);
      console.log(`Created admin "${a}". Password: ${pw}`);
      break;
    }
    case "set-email": {
      if (!a || !b) throw new Error("Usage: npm run admin -- set-email <username> <email>");
      await findUser(a);
      await query("UPDATE users SET email = $1 WHERE username = $2", [b.toLowerCase(), a]);
      console.log(`Email for "${a}" set to ${b}.`);
      break;
    }
    case "delete": {
      if (!a) throw new Error("Usage: npm run admin -- delete <username>");
      const { rows } = await query("SELECT COUNT(*)::int AS n FROM users");
      if (rows[0].n <= 1) throw new Error("Refusing to delete the last admin account.");
      await findUser(a);
      await query("DELETE FROM users WHERE username = $1", [a]);
      console.log(`Deleted admin "${a}".`);
      break;
    }
    default:
      console.log("Commands: list | reset-password <username> [password] | create <username> [email] | set-email <username> <email> | delete <username>");
  }
} catch (err) {
  console.error("Error:", err.code === "23505" ? "That username or email already exists." : err.message);
  process.exitCode = 1;
} finally {
  await closePool();
}
