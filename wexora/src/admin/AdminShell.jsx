import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Burger, Icon, LogoMark, ThemeToggle, useTitle, PasswordInput } from "../components/ui.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useData } from "../context/DataContext.jsx";
import { adminApi, passwordApi } from "../api.js";

/* ---------- Admin data: everything the portal manages, loaded from the protected API ---------- */
const AdminDataContext = createContext(null);
export const useAdminData = () => useContext(AdminDataContext);

function AdminDataProvider({ children }) {
  const { refresh: refreshPublic } = useData();
  const [state, setState] = useState({ courses: [], batches: [], enquiries: [], categories: [], services: [], technologies: [], loading: true, error: "" });

  const reload = useCallback(async () => {
    try {
      const [courses, batches, enquiries, categories, services, technologies] = await Promise.all([
        adminApi.courses(), adminApi.batches(), adminApi.enquiries(), adminApi.categories(), adminApi.services(), adminApi.technologies()
      ]);
      setState({ courses, batches, enquiries, categories, services, technologies, loading: false, error: "" });
    } catch (e) {
      setState(s => ({ ...s, loading: false, error: e.message }));
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  /* Run a mutation, then refresh admin + public data so the website updates immediately. */
  const mutate = useCallback(async fn => {
    const out = await fn();
    await Promise.all([reload(), refreshPublic()]);
    return out;
  }, [reload, refreshPublic]);

  return <AdminDataContext.Provider value={{ ...state, reload, mutate }}>{children}</AdminDataContext.Provider>;
}

export function RequireAuth({ children }) {
  const { user, checking } = useAuth();
  const loc = useLocation();
  if (checking) return <div className="admin-loading"><span className="spinner dark" /> Checking session…</div>;
  return user ? <AdminDataProvider>{children}</AdminDataProvider> : <Navigate to="/admin/login" replace state={{ from: loc.pathname }} />;
}

export function AdminLogin() {
  useTitle("Admin Login");
  const { settings } = useData();
  const { user, login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/admin" replace />;

  const submit = async e => {
    e.preventDefault();
    if (!form.username || !form.password) return setError("Enter your username (or email) and password.");
    setBusy(true); setError("");
    try {
      await login(form.username, form.password);
      nav(loc.state?.from || "/admin", { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="admin-login">
      <ThemeToggle />
      <form className="login-card" onSubmit={submit} noValidate>
        <div className="login-brand"><LogoMark height={52} /><div><strong>{settings.shortName || "Agnes"}</strong><span>Admin Portal</span></div></div>
        <h1>Sign in</h1>
        <p className="muted small">Manage courses, batches and enquiries.</p>
        <div className="field">
          <label htmlFor="u">Username or email</label>
          <input id="u" autoComplete="username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
        </div>
        <div className="field">
          <div className="label-row"><label htmlFor="p">Password</label><Link to="/admin/forgot-password" className="small">Forgot password?</Link></div>
          <PasswordInput id="p" autoComplete="current-password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        </div>
        {error && <div className="form-status error" role="alert">{error}</div>}
        <button className="btn btn-primary block" type="submit" disabled={busy}>{busy ? <><span className="spinner" /> Signing in…</> : "Sign in"}</button>
        <Link to="/" className="back-link">← Back to website</Link>
      </form>
    </div>
  );
}

/* ---------- Forgot / reset password (public pages) ---------- */
function AuthCard({ title, children }) {
  const { settings } = useData();
  return (
    <div className="admin-login">
      <ThemeToggle />
      <div className="login-card">
        <div className="login-brand"><LogoMark height={52} /><div><strong>{settings.shortName || "Agnes"}</strong><span>Admin Portal</span></div></div>
        <h1>{title}</h1>
        {children}
        <Link to="/admin/login" className="back-link">← Back to sign in</Link>
      </div>
    </div>
  );
}

export function ForgotPassword() {
  useTitle("Forgot password");
  const [email, setEmail] = useState("");
  const [state, setState] = useState({ status: "idle", message: "" });
  const [emailEnabled, setEmailEnabled] = useState(null);
  useEffect(() => { passwordApi.options().then(d => setEmailEnabled(d.emailEnabled)).catch(() => setEmailEnabled(false)); }, []);

  const submit = async e => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return setState({ status: "error", message: "Enter the email address on your admin account." });
    setState({ status: "sending", message: "" });
    try {
      const d = await passwordApi.forgot(email);
      setState({ status: "sent", message: d.message });
    } catch (err) {
      setState({ status: "error", message: err.message });
    }
  };

  if (emailEnabled === false) {
    return (
      <AuthCard title="Forgot password">
        <p className="muted small">Password reset by email isn't switched on for this site yet (no email server configured).</p>
        <div className="demo-creds">
          Ask the site developer to reset it from the project folder:<br />
          <code>npm run admin -- reset-password admin</code><br />
          This prints a new temporary password.
        </div>
      </AuthCard>
    );
  }
  return (
    <AuthCard title="Forgot password">
      <p className="muted small">Enter the email address on your admin account. We'll send a link to set a new password (valid for 30 minutes).</p>
      {state.status === "sent" ? (
        <div className="form-status success">{state.message} Check your inbox and spam folder.</div>
      ) : (
        <form onSubmit={submit} noValidate style={{ display: "grid", gap: 16 }}>
          <div className="field">
            <label htmlFor="fe">Email</label>
            <input id="fe" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          {state.status === "error" && <div className="form-status error" role="alert">{state.message}</div>}
          <button className="btn btn-primary block" disabled={state.status === "sending" || emailEnabled === null}>
            {state.status === "sending" ? <><span className="spinner" /> Sending…</> : "Send reset link"}
          </button>
        </form>
      )}
    </AuthCard>
  );
}

export function ResetPassword() {
  useTitle("Set a new password");
  const token = new URLSearchParams(useLocation().search).get("token") || "";
  const [f, setF] = useState({ password: "", confirm: "" });
  const [state, setState] = useState({ status: "idle", message: "" });

  const submit = async e => {
    e.preventDefault();
    if (f.password.length < 8) return setState({ status: "error", message: "Use at least 8 characters." });
    if (f.password !== f.confirm) return setState({ status: "error", message: "Passwords don't match." });
    setState({ status: "saving", message: "" });
    try {
      await passwordApi.reset(token, f.password);
      setState({ status: "done", message: "" });
    } catch (err) {
      setState({ status: "error", message: err.details?.password || err.message });
    }
  };

  if (!token) return <AuthCard title="Reset link missing"><p className="muted small">Open the link from your email, or request a new one.</p><Link to="/admin/forgot-password" className="btn btn-primary block">Request a new link</Link></AuthCard>;
  if (state.status === "done") {
    return (
      <AuthCard title="Password updated">
        <div className="form-status success">Your password has been changed and all other sessions were signed out.</div>
        <Link to="/admin/login" className="btn btn-primary block">Sign in</Link>
      </AuthCard>
    );
  }
  return (
    <AuthCard title="Set a new password">
      <form onSubmit={submit} noValidate style={{ display: "grid", gap: 16 }}>
        <div className="field"><label htmlFor="np">New password <span className="opt">(8+ characters)</span></label>
          <PasswordInput id="np" autoComplete="new-password" value={f.password} onChange={e => setF({ ...f, password: e.target.value })} /></div>
        <div className="field"><label htmlFor="cp">Confirm new password</label>
          <PasswordInput id="cp" autoComplete="new-password" value={f.confirm} onChange={e => setF({ ...f, confirm: e.target.value })} /></div>
        {state.status === "error" && <div className="form-status error" role="alert">{state.message}</div>}
        <button className="btn btn-primary block" disabled={state.status === "saving"}>{state.status === "saving" ? <><span className="spinner" /> Saving…</> : "Save new password"}</button>
      </form>
    </AuthCard>
  );
}

/* Copies each table's column headings onto its cells (data-label) so tables can
   turn into stacked cards on phones (see .data-table rules in admin.css). */
function useResponsiveTables(ref) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const label = () => root.querySelectorAll("table.data-table").forEach(table => {
      const heads = [...table.querySelectorAll("thead th")].map(th => th.textContent.trim());
      table.querySelectorAll("tbody tr").forEach(tr => [...tr.children].forEach((td, i) => {
        if (heads[i] && td.getAttribute("data-label") !== heads[i]) td.setAttribute("data-label", heads[i]);
      }));
    });
    label();
    const mo = new MutationObserver(label);
    mo.observe(root, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, [ref]);
}

export function AdminLayout() {
  const contentRef = useRef(null);
  useResponsiveTables(contentRef);
  const { user, logout } = useAuth();
  const { settings } = useData();
  const { enquiries } = useAdminData();
  const [open, setOpen] = useState(false);
  const [askLogout, setAskLogout] = useState(false);
  const unread = enquiries.filter(e => !e.read).length;
  const links = [
    { to: "/admin", label: "Dashboard", icon: "grid", end: true },
    { to: "/admin/courses", label: "Courses", icon: "book" },
    { to: "/admin/batches", label: "Batches", icon: "cal" },
    { to: "/admin/enquiries", label: "Enquiries", icon: "inbox", badge: unread },
    { section: "Website content" },
    { to: "/admin/services", label: "Services", icon: "laptop" },
    { to: "/admin/technologies", label: "Technologies", icon: "code" },
    { to: "/admin/categories", label: "Categories", icon: "grid" },
    { to: "/admin/settings", label: "Settings", icon: "wrench" }
  ];
  return (
    <div className="admin">
      <aside id="admin-side" className={`admin-side ${open ? "open" : ""}`}>
        <div className="admin-brand"><LogoMark height={34} tile /><div><strong>{settings.shortName || "Agnes"}</strong><span>Admin</span></div></div>
        <nav aria-label="Admin">
          {links.map(l => l.section ? <span className="nav-section" key={l.section}>{l.section}</span> : (
            <NavLink key={l.to} to={l.to} end={l.end} onClick={() => setOpen(false)}>
              <Icon name={l.icon} size={20} /> {l.label}
              {l.badge > 0 && <span className="nav-badge">{l.badge}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="admin-side-foot">
          <Link to="/" target="_blank"><Icon name="eye" size={18} /> View website</Link>
          <button onClick={() => { setOpen(false); setAskLogout(true); }}><Icon name="logout" size={18} /> Log out</button>
        </div>
      </aside>
      {open && <div className="admin-scrim" onClick={() => setOpen(false)} />}
      <div className="admin-main">
        <header className="admin-top">
          <Burger className="admin-toggle" open={open} onClick={() => setOpen(o => !o)} controls="admin-side" />
          <span className="db-pill"><span className="dot" /> Connected to database</span>
          <ThemeToggle />
          <span className="admin-user"><span className="avatar">{user?.[0]?.toUpperCase()}</span>{user}</span>
        </header>
        <div className="admin-content" ref={contentRef}><Outlet /></div>
      </div>
      {askLogout && (
        <ConfirmDialog title="Log out?" message="Do you want to log out of the admin portal?"
          confirmLabel="Yes, log out" cancelLabel="No, stay" icon="logout"
          onCancel={() => setAskLogout(false)} onConfirm={() => { setAskLogout(false); logout(); }} />
      )}
    </div>
  );
}

/* ---------- Shared admin UI ---------- */
export function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const onKey = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? "wide" : ""}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="icon-btn" aria-label="Close" onClick={onClose}><Icon name="x" size={20} /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({ title, message, onConfirm, onCancel, confirmLabel = "Delete", cancelLabel = "Cancel", icon }) {
  const [busy, setBusy] = useState(false);
  return (
    <Modal title={title} onClose={onCancel}>
      {icon && <div className="confirm-icon"><Icon name={icon} size={26} /></div>}
      <p className="confirm-text">{message}</p>
      <div className="modal-actions">
        <button className="btn btn-outline" onClick={onCancel} disabled={busy}>{cancelLabel}</button>
        <button className="btn btn-danger" autoFocus disabled={busy} onClick={async () => { setBusy(true); try { await onConfirm(); } finally { setBusy(false); } }}>
          {busy ? <><span className="spinner" /> Working…</> : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

export function Toast({ toast }) {
  return toast ? <div className={`toast ${toast.error ? "error" : ""}`} role="status">{toast.text}</div> : null;
}
