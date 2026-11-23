# Agnes Technologies — website + admin portal

React (Vite) front end · Node.js / Express API · PostgreSQL (Aiven) · deployable to Vercel.

All website content — courses, batches, services, technologies, categories and company details —
is stored in the database and managed from the admin portal (`/admin`).

## Project structure
```
api/[...path].js          Vercel serverless entry → Express app
server/
  app.js                  Express app (security headers, routes, error handling)
  config.js               every environment variable in one place
  index.js                local / self-hosted entry (also serves the built site)
  validators.js           server-side validation for every write
  middleware/index.js     auth (JWT), rate limits, async + error handlers
  routes/
    public.js             /api/site, /api/courses, /api/batches, POST /api/enquiries
    auth.js               login, session check, change password
    admin/                protected CRUD: courses, batches, enquiries, content (services,
                          technologies, categories, settings), system status
  services/notify.js      optional email notification for new enquiries
  db/
    pool.js               pg connection pool + transactions (TLS to Aiven)
    migrate.js            SQL migration runner (schema_migrations + advisory lock)
    migrations/*.sql      versioned schema changes — never edit an applied file, add a new one
    mappers.js            row ⇄ API object mapping, column lists
    seed.js, seed-data.js initial content (inserts only what is missing)
scripts/db.js             database CLI
src/                      React app
  api.js                  fetch wrapper + admin API client
  context/                DataContext (public content), AuthContext (admin session)
  components/ pages/      public website
  admin/                  admin portal
  data/                   shared constants, logo + image catalogues
public/                   images, technology logos, favicon
```

## Setup
```
npm install
cp .env.example .env        # fill DATABASE_URL, JWT_SECRET, ADMIN_PASSWORD
npm run db:setup            # run migrations + seed content + create admin user
npm run dev                 # http://localhost:5173  (admin: /admin)
```

## Database commands
| Command | What it does |
|---|---|
| `npm run db:migrate` | apply pending migrations in `server/db/migrations` |
| `npm run db:seed` | insert initial content and first admin user (never overwrites edits) |
| `npm run db:setup` | migrate + seed |
| `npm run db:status` | list migrations (applied/pending) and row counts |

Adding a schema change: create `server/db/migrations/005_description.sql`, then run `npm run db:migrate`
(locally, against the same Aiven database the live site uses).

### Schema overview
| Table | Purpose | Key rules |
|---|---|---|
| `categories` | course categories | slug id; can't delete while courses use it |
| `courses` | course catalogue | FK → categories; level/mode/weeks checked; `updated_at` trigger |
| `batches` | training batches | unique code; FK → courses (SET NULL); valid dates & status |
| `enquiries` | form submissions | kind checked; unread index |
| `services` | service pages | slug id; form kind checked; `updated_at` trigger |
| `technologies` | home-page technology cards | unique name; FK → courses (SET NULL) |
| `settings` | company details (JSON) | key `site` |
| `users` | admin accounts | bcrypt hashes; unique email; `token_version` for sign-out |
| `password_resets` | one-time reset links | SHA-256 token hash, 30-min expiry, single use |
| `schema_migrations` | applied migration versions | — |

## Admin accounts
- Sign in at `/admin` with the username **or** email, and password.
- **Admin → Settings → My account**: change username/email, change password, sign out of all devices.
- **Forgot password?** on the login page emails a one-time link (30 min) — needs the `SMTP_*` variables.
- Locked out and no email set up? From the project folder (uses the database in `.env`):
  ```
  npm run admin -- list
  npm run admin -- reset-password admin        # prints a new temporary password
  npm run admin -- create <username> [email]
  ```
- Changing or resetting a password signs out every other session immediately.

## Environment variables
| Name | Where | Notes |
|---|---|---|
| `DATABASE_URL` | local + Vercel | Aiven Service URI |
| `DATABASE_CA_PATH` | local | path to Aiven `ca.pem` |
| `DATABASE_CA` | Vercel | full text of `ca.pem` |
| `JWT_SECRET` | local + Vercel | 32+ random characters |
| `ADMIN_USER`, `ADMIN_PASSWORD`, `ADMIN_EMAIL` | local | used once by `db:seed` to create the first admin |
| `APP_URL` | optional | site address for reset-email links (Vercel's production URL is used automatically) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | local + Vercel | email for password resets + enquiry notifications |
| `NOTIFY_TO` | optional | where enquiry notifications are sent |

## Deploy (Vercel)
Push to GitHub and import the repo in Vercel, or run `npx vercel --prod`. Set `DATABASE_URL`,
`DATABASE_CA` and `JWT_SECRET` in Vercel → Settings → Environment Variables. Run migrations from your
machine (`npm run db:migrate`) before deploying code that needs them.

## Security
bcrypt password hashing · JWT (8 h) in the Authorization header · parameterised SQL everywhere ·
server-side validation + database constraints · Helmet/CSP headers · rate limiting · 100 kB body limit.

## Credits
Photos: Unsplash License (`public/images/CREDITS.txt`). Technology logos: Devicon (MIT) and
Simple Icons (CC0) (`public/logos/CREDITS.txt`); product names and logos belong to their owners.
