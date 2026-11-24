/* Admin pages for dynamic website content: services, technologies, categories, settings. */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Icon, TechLogo, useTitle, PasswordInput } from "../components/ui.jsx";
import { IMAGES } from "../data/images.js";
import { LOGOS } from "../data/logos.js";
import { FORM_KINDS, SERVICE_ICONS } from "../data/constants.js";
import { adminApi } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { ConfirmDialog, Modal, Toast, useAdminData } from "./AdminShell.jsx";
import { Loading, useToast } from "./AdminPages.jsx";
import LogoManager from "./LogoManager.jsx";

const lines = text => text.split("\n").map(s => s.trim()).filter(Boolean);

/* Small form helpers shared by the forms below */
function useForm(initial) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const set = (k, v) => setValues(s => ({ ...s, [k]: v }));
  const run = async fn => {
    setBusy(true); setMessage("");
    try { await fn(); }
    catch (err) { setErrors(err.details || {}); setMessage(err.message); }
    finally { setBusy(false); }
  };
  return { values, set, errors, setErrors, busy, message, run };
}

function Field({ label, error, full, hint, children }) {
  return (
    <div className={`field ${full ? "full" : ""} ${error ? "invalid" : ""}`}>
      <label>{label}{hint && <span className="opt"> ({hint})</span>}</label>
      {children}
      {error && <span className="err">{error}</span>}
    </div>
  );
}

function FormActions({ busy, onCancel, label }) {
  return (
    <div className="modal-actions">
      {onCancel && <button type="button" className="btn btn-outline" onClick={onCancel} disabled={busy}>Cancel</button>}
      <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? <><span className="spinner" /> Saving…</> : label}</button>
    </div>
  );
}

function PageHead({ title, text, onAdd, addLabel }) {
  return (
    <div className="admin-head">
      <div><h1>{title}</h1><p className="muted">{text}</p></div>
      {onAdd && <button className="btn btn-primary" onClick={onAdd}><Icon name="plus" size={18} /> {addLabel}</button>}
    </div>
  );
}

/* ================= Services ================= */
const EMPTY_SERVICE = { title: "", icon: "code", short: "", hero: "", cta: "Send an Enquiry", ctaLink: "", image: "analytics", typesTitle: "What we offer",
  typesText: "", capsTitle: "Capabilities", capsText: "", processText: "", formKind: "general", showBatches: false, showNote: false, published: true };

const serviceToForm = s => ({ ...EMPTY_SERVICE, ...s, typesText: s.types.join("\n"), capsText: s.caps.join("\n"), processText: s.process.join("\n") });

function ServiceForm({ initial, onSave, onCancel }) {
  const { values: f, set, errors, busy, message, run } = useForm(initial);
  const submit = e => {
    e.preventDefault();
    const { typesText, capsText, processText, ...rest } = f;
    run(() => onSave({ ...rest, types: lines(typesText), caps: lines(capsText), process: lines(processText) }));
  };
  return (
    <form onSubmit={submit} noValidate>
      <div className="form-grid">
        <Field label="Service name *" error={errors.title}><input value={f.title} onChange={e => set("title", e.target.value)} autoFocus /></Field>
        <Field label="Card icon" error={errors.icon}>
          <div className="logo-pick"><span className="icon-box sm" style={{ margin: 0 }}><Icon name={f.icon} size={20} /></span>
            <select value={f.icon} onChange={e => set("icon", e.target.value)}>{SERVICE_ICONS.map(i => <option key={i}>{i}</option>)}</select></div>
        </Field>
        <Field label="Short description *" error={errors.short} full><textarea rows={2} value={f.short} onChange={e => set("short", e.target.value)} /></Field>
        <Field label="Page headline" error={errors.hero} full><input value={f.hero} onChange={e => set("hero", e.target.value)} /></Field>
        <Field label="Button text" error={errors.cta}><input value={f.cta} onChange={e => set("cta", e.target.value)} /></Field>
        <Field label="Button link" hint="empty = scroll to form" error={errors.ctaLink}><input value={f.ctaLink} onChange={e => set("ctaLink", e.target.value)} placeholder="/courses" /></Field>
        <Field label="Banner photo" error={errors.image}>
          <select value={f.image} onChange={e => set("image", e.target.value)}>{Object.entries(IMAGES).map(([k, v]) => <option key={k} value={k}>{k} — {v.alt.slice(0, 40)}</option>)}</select>
        </Field>
        <Field label="Enquiry form" error={errors.formKind}>
          <select value={f.formKind} onChange={e => set("formKind", e.target.value)}>{Object.entries(FORM_KINDS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        </Field>
        <Field label="Section 1 title"><input value={f.typesTitle} onChange={e => set("typesTitle", e.target.value)} /></Field>
        <Field label="Section 2 title"><input value={f.capsTitle} onChange={e => set("capsTitle", e.target.value)} /></Field>
        <Field label="Section 1 items" hint="one per line"><textarea rows={5} value={f.typesText} onChange={e => set("typesText", e.target.value)} /></Field>
        <Field label="Section 2 items" hint="one per line"><textarea rows={5} value={f.capsText} onChange={e => set("capsText", e.target.value)} /></Field>
        <Field label="Process steps" hint="one per line, optional" full><textarea rows={3} value={f.processText} onChange={e => set("processText", e.target.value)} /></Field>
        <div className="field full check-row">
          <label className="checkbox"><input type="checkbox" checked={f.published} onChange={e => set("published", e.target.checked)} /> <span>Published</span></label>
          <label className="checkbox"><input type="checkbox" checked={f.showBatches} onChange={e => set("showBatches", e.target.checked)} /> <span>Show upcoming batches</span></label>
          <label className="checkbox"><input type="checkbox" checked={f.showNote} onChange={e => set("showNote", e.target.checked)} /> <span>Show "hours to be confirmed" note</span></label>
        </div>
      </div>
      {message && <div className="form-status error">{message}</div>}
      <FormActions busy={busy} onCancel={onCancel} label="Save service" />
    </form>
  );
}

export function ServicesAdmin() {
  useTitle("Manage Services");
  const { services, loading, error, reload, mutate } = useAdminData();
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [toast, show] = useToast();
  if (loading || error) return <Loading error={error} reload={reload} />;

  const save = async data => {
    if (editing === "new") { await mutate(() => adminApi.createService(data)); show(`“${data.title}” added`); }
    else { await mutate(() => adminApi.updateService(editing.id, data)); show(`“${data.title}” updated`); }
    setEditing(null);
  };
  return (
    <>
      <PageHead title="Services" text="Service cards, menus and service pages on the website." onAdd={() => setEditing("new")} addLabel="Add service" />
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Service</th><th>Enquiry form</th><th>Sections</th><th>Status</th><th className="right">Actions</th></tr></thead>
          <tbody>
            {services.map(s => (
              <tr key={s.id}>
                <td><div className="cell-course"><span className="icon-box sm" style={{ margin: 0 }}><Icon name={s.icon} size={18} /></span><span><strong>{s.title}</strong><small>/services/{s.id}</small></span></div></td>
                <td>{FORM_KINDS[s.formKind]}</td>
                <td><small>{s.types.length} + {s.caps.length} items{s.process.length ? ` · ${s.process.length} steps` : ""}</small></td>
                <td><span className={`badge ${s.published ? "badge-green" : "badge-gray"}`}>{s.published ? "Published" : "Hidden"}</span></td>
                <td className="right"><div className="row-actions">
                  {s.published && <Link className="icon-btn" to={`/services/${s.id}`} target="_blank" aria-label={`View ${s.title}`}><Icon name="eye" size={18} /></Link>}
                  <button className="icon-btn" onClick={() => setEditing(s)} aria-label={`Edit ${s.title}`}><Icon name="edit" size={18} /></button>
                  <button className="icon-btn danger" onClick={() => setDeleting(s)} aria-label={`Delete ${s.title}`}><Icon name="trash" size={18} /></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && (
        <Modal wide title={editing === "new" ? "Add service" : `Edit: ${editing.title}`} onClose={() => setEditing(null)}>
          <ServiceForm initial={editing === "new" ? EMPTY_SERVICE : serviceToForm(editing)} onSave={save} onCancel={() => setEditing(null)} />
        </Modal>
      )}
      {deleting && <ConfirmDialog title="Delete service?" message={`“${deleting.title}” and its page will be removed from the website.`}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => { try { await mutate(() => adminApi.deleteService(deleting.id)); show("Service deleted"); } catch (e) { show(e.message, true); } setDeleting(null); }} />}
      <Toast toast={toast} />
    </>
  );
}

/* ================= Technologies ================= */
const EMPTY_TECH = { name: "", label: "", icon: "", logoText: "", courseId: "", published: true };

function TechForm({ initial, courses, onSave, onCancel }) {
  const { values: f, set, errors, busy, message, run } = useForm(initial);
  const submit = e => { e.preventDefault(); run(() => onSave(f)); };
  return (
    <form onSubmit={submit} noValidate>
      <div className="form-grid">
        <Field label="Name *" error={errors.name}><input value={f.name} onChange={e => set("name", e.target.value)} autoFocus /></Field>
        <Field label="Label" hint="e.g. Cloud, Analytics"><input value={f.label} onChange={e => set("label", e.target.value)} /></Field>
        <Field label="Logo" error={errors.icon}>
          <div className="logo-pick"><TechLogo icon={f.icon} text={f.logoText || f.name.slice(0, 2).toUpperCase()} size="sm" />
            <select value={f.icon} onChange={e => set("icon", e.target.value)}><option value="">No logo (show text)</option>{Object.entries(LOGOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
        </Field>
        <Field label="Fallback text" hint="2–4 letters"><input maxLength={4} value={f.logoText} onChange={e => set("logoText", e.target.value)} /></Field>
        <Field label="Links to course" error={errors.courseId} full>
          <select value={f.courseId} onChange={e => set("courseId", e.target.value)}><option value="">— Course catalogue —</option>{courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select>
        </Field>
        <div className="field full"><label className="checkbox"><input type="checkbox" checked={f.published} onChange={e => set("published", e.target.checked)} /> <span>Show on the home page</span></label></div>
      </div>
      {message && <div className="form-status error">{message}</div>}
      <FormActions busy={busy} onCancel={onCancel} label="Save technology" />
    </form>
  );
}

export function TechnologiesAdmin() {
  useTitle("Manage Technologies");
  const { technologies, courses, loading, error, reload, mutate } = useAdminData();
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [toast, show] = useToast();
  if (loading || error) return <Loading error={error} reload={reload} />;

  const save = async data => {
    if (editing === "new") { await mutate(() => adminApi.createTechnology(data)); show(`“${data.name}” added`); }
    else { await mutate(() => adminApi.updateTechnology(editing.id, data)); show(`“${data.name}” updated`); }
    setEditing(null);
  };
  return (
    <>
      <PageHead title="Technologies" text="The “Popular Tools & Technologies” cards on the home page." onAdd={() => setEditing("new")} addLabel="Add technology" />
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Technology</th><th>Label</th><th>Linked course</th><th>Status</th><th className="right">Actions</th></tr></thead>
          <tbody>
            {technologies.map(t => (
              <tr key={t.id}>
                <td><div className="cell-course"><TechLogo icon={t.icon} text={t.logoText} size="sm" /><strong>{t.name}</strong></div></td>
                <td>{t.label || "—"}</td>
                <td>{courses.find(c => c.id === t.courseId)?.title || <span className="muted">Catalogue</span>}</td>
                <td><span className={`badge ${t.published ? "badge-green" : "badge-gray"}`}>{t.published ? "Shown" : "Hidden"}</span></td>
                <td className="right"><div className="row-actions">
                  <button className="icon-btn" onClick={() => setEditing(t)} aria-label={`Edit ${t.name}`}><Icon name="edit" size={18} /></button>
                  <button className="icon-btn danger" onClick={() => setDeleting(t)} aria-label={`Delete ${t.name}`}><Icon name="trash" size={18} /></button>
                </div></td>
              </tr>
            ))}
            {!technologies.length && <tr><td colSpan={5} className="center muted" style={{ padding: 40 }}>No technologies yet.</td></tr>}
          </tbody>
        </table>
      </div>
      {editing && (
        <Modal title={editing === "new" ? "Add technology" : `Edit: ${editing.name}`} onClose={() => setEditing(null)}>
          <TechForm initial={editing === "new" ? EMPTY_TECH : { ...EMPTY_TECH, ...editing }} courses={courses} onSave={save} onCancel={() => setEditing(null)} />
        </Modal>
      )}
      {deleting && <ConfirmDialog title="Delete technology?" message={`“${deleting.name}” will be removed from the home page.`}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => { try { await mutate(() => adminApi.deleteTechnology(deleting.id)); show("Technology deleted"); } catch (e) { show(e.message, true); } setDeleting(null); }} />}
      <Toast toast={toast} />
    </>
  );
}

/* ================= Categories ================= */
function CategoryForm({ initial, onSave, onCancel }) {
  const { values: f, set, errors, busy, message, run } = useForm(initial);
  const submit = e => { e.preventDefault(); run(() => onSave({ name: f.name, sort: Number(f.sort) || 0 })); };
  return (
    <form onSubmit={submit} noValidate>
      <div className="form-grid">
        <Field label="Category name *" error={errors.name}><input value={f.name} onChange={e => set("name", e.target.value)} autoFocus /></Field>
        <Field label="Display order" hint="lower shows first"><input type="number" value={f.sort} onChange={e => set("sort", e.target.value)} /></Field>
      </div>
      {message && <div className="form-status error">{message}</div>}
      <FormActions busy={busy} onCancel={onCancel} label="Save category" />
    </form>
  );
}

export function CategoriesAdmin() {
  useTitle("Manage Categories");
  const { categories, loading, error, reload, mutate } = useAdminData();
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [toast, show] = useToast();
  if (loading || error) return <Loading error={error} reload={reload} />;

  const save = async data => {
    if (editing === "new") { await mutate(() => adminApi.createCategory(data)); show(`“${data.name}” added`); }
    else { await mutate(() => adminApi.updateCategory(editing.id, data)); show(`“${data.name}” updated`); }
    setEditing(null);
  };
  return (
    <>
      <PageHead title="Course categories" text="Category tabs on the Courses page and in the menu. A category with courses can't be deleted." onAdd={() => setEditing("new")} addLabel="Add category" />
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Category</th><th>URL key</th><th>Courses</th><th>Order</th><th className="right">Actions</th></tr></thead>
          <tbody>
            {categories.map(c => (
              <tr key={c.id}>
                <td><strong>{c.name}</strong></td><td><code>{c.id}</code></td><td>{c.courseCount}</td><td>{c.sort}</td>
                <td className="right"><div className="row-actions">
                  <Link className="icon-btn" to={`/courses?cat=${c.id}`} target="_blank" aria-label={`View ${c.name}`}><Icon name="eye" size={18} /></Link>
                  <button className="icon-btn" onClick={() => setEditing(c)} aria-label={`Edit ${c.name}`}><Icon name="edit" size={18} /></button>
                  <button className="icon-btn danger" onClick={() => setDeleting(c)} disabled={c.courseCount > 0}
                    title={c.courseCount > 0 ? "Move or delete its courses first" : undefined} aria-label={`Delete ${c.name}`}><Icon name="trash" size={18} /></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && (
        <Modal title={editing === "new" ? "Add category" : `Edit: ${editing.name}`} onClose={() => setEditing(null)}>
          <CategoryForm initial={editing === "new" ? { name: "", sort: categories.length + 1 } : editing} onSave={save} onCancel={() => setEditing(null)} />
        </Modal>
      )}
      {deleting && <ConfirmDialog title="Delete category?" message={`“${deleting.name}” will be removed.`}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => { try { await mutate(() => adminApi.deleteCategory(deleting.id)); show("Category deleted"); } catch (e) { show(e.message, true); } setDeleting(null); }} />}
      <Toast toast={toast} />
    </>
  );
}

/* ================= Settings ================= */
const SOCIAL = [["linkedin", "LinkedIn"], ["facebook", "Facebook"], ["instagram", "Instagram"], ["x", "X (Twitter)"], ["youtube", "YouTube"]];

function AccountForm() {
  const { account, updateSession, logout } = useAuth();
  const { values: f, set, errors, busy, message, run } = useForm({ username: account?.username || "", email: account?.email || "" });
  const [saved, setSaved] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(null);
  useEffect(() => { adminApi.me().then(d => setEmailEnabled(d.emailEnabled)).catch(() => {}); }, []);
  const submit = e => {
    e.preventDefault(); setSaved(false);
    run(async () => { const d = await adminApi.updateProfile(f); updateSession(d.token, d.user); setSaved(true); });
  };
  const [askSignOut, setAskSignOut] = useState(false);
  const signOutEverywhere = async () => { await adminApi.logoutAll().catch(() => {}); logout(); };
  return (
    <form className="panel" onSubmit={submit} noValidate>
      <div className="panel-head"><h2>My account</h2>
        {account?.lastLoginAt && <span className="muted small">Last sign-in {new Date(account.lastLoginAt).toLocaleString()}</span>}</div>
      <div className="form-grid">
        <Field label="Username" error={errors.username}><input autoComplete="username" value={f.username} onChange={e => set("username", e.target.value)} /></Field>
        <Field label="Email" hint="used for “Forgot password”" error={errors.email}><input type="email" autoComplete="email" value={f.email} onChange={e => set("email", e.target.value)} /></Field>
      </div>
      {emailEnabled === false && <p className="muted small" style={{ marginTop: 12 }}>Note: reset emails need an email server (SMTP) in the site settings — until then, use <code>npm run admin -- reset-password</code>.</p>}
      {message && !Object.keys(errors).length && <div className="form-status error">{message}</div>}
      {saved && <div className="form-status success">Account details saved.</div>}
      {askSignOut && <ConfirmDialog title="Sign out everywhere?" icon="logout" confirmLabel="Yes, sign out" cancelLabel="No"
        message="Do you want to sign out of the admin portal on every device, including this one?"
        onCancel={() => setAskSignOut(false)} onConfirm={signOutEverywhere} />}
      <div className="modal-actions">
        <button type="button" className="btn btn-outline" onClick={() => setAskSignOut(true)}>Sign out of all devices</button>
        <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? <><span className="spinner" /> Saving…</> : "Save account"}</button>
      </div>
    </form>
  );
}

function PasswordForm() {
  const { updateSession } = useAuth();
  const { values: f, set, errors, setErrors, busy, message, run } = useForm({ currentPassword: "", newPassword: "", confirm: "" });
  const [done, setDone] = useState(false);
  const submit = e => {
    e.preventDefault(); setDone(false);
    if (f.newPassword !== f.confirm) return setErrors({ confirm: "Passwords don't match." });
    run(async () => {
      const d = await adminApi.changePassword(f.currentPassword, f.newPassword);
      updateSession(d.token); // this session stays signed in; all others are signed out
      setDone(true); set("currentPassword", ""); set("newPassword", ""); set("confirm", ""); setErrors({});
    });
  };
  return (
    <form className="panel" onSubmit={submit} noValidate>
      <div className="panel-head"><h2>Change admin password</h2></div>
      <div className="form-grid">
        <Field label="Current password" error={errors.currentPassword} full><PasswordInput id="pw-1" autoComplete="current-password" value={f.currentPassword} onChange={e => set("currentPassword", e.target.value)} /></Field>
        <Field label="New password" hint="8+ characters" error={errors.newPassword}><PasswordInput id="pw-2" autoComplete="new-password" value={f.newPassword} onChange={e => set("newPassword", e.target.value)} /></Field>
        <Field label="Confirm new password" error={errors.confirm}><PasswordInput id="pw-3" autoComplete="new-password" value={f.confirm} onChange={e => set("confirm", e.target.value)} /></Field>
      </div>
      {message && !Object.keys(errors).length && <div className="form-status error">{message}</div>}
      {done && <div className="form-status success">Password changed. Other devices have been signed out.</div>}
      <FormActions busy={busy} label="Update password" />
    </form>
  );
}

export function SettingsAdmin() {
  useTitle("Site Settings");
  const [initial, setInitial] = useState(null);
  const [loadErr, setLoadErr] = useState("");
  const [toast, show] = useToast();
  useEffect(() => { adminApi.settings().then(setInitial).catch(e => setLoadErr(e.message)); }, []);
  if (!initial) return <Loading error={loadErr} reload={() => location.reload()} />;
  return <SettingsForm initial={initial} show={show} toast={toast} />;
}

function SettingsForm({ initial, show, toast }) {
  const { mutate } = useAdminData();
  const { values: f, set, errors, busy, message, run } = useForm({ ...initial, social: { ...(initial.social || {}) } });
  const setSocial = (k, v) => set("social", { ...f.social, [k]: v });
  const submit = e => {
    e.preventDefault();
    run(async () => { await mutate(() => adminApi.saveSettings(f)); show("Settings saved — the website is updated"); });
  };
  return (
    <>
      <PageHead title="Site settings" text="Company logo and details shown in the header, footer and Contact page." />
      <div style={{ marginBottom: 24 }}><LogoManager /></div>
      <form className="panel" onSubmit={submit} noValidate>
        <div className="panel-head"><h2>Company</h2></div>
        <div className="form-grid">
          <Field label="Company name *" error={errors.name}><input value={f.name} onChange={e => set("name", e.target.value)} /></Field>
          <Field label="Short name" hint="logo text"><input value={f.shortName} onChange={e => set("shortName", e.target.value)} /></Field>
          <Field label="Tagline" full><input value={f.tagline} onChange={e => set("tagline", e.target.value)} /></Field>
          <Field label="Phone" error={errors.phone}><input type="tel" value={f.phone} onChange={e => set("phone", e.target.value)} placeholder="+91 …" /></Field>
          <Field label="Email" error={errors.email}><input type="email" value={f.email} onChange={e => set("email", e.target.value)} /></Field>
          <Field label="Office address" full><input value={f.address} onChange={e => set("address", e.target.value)} /></Field>
          <Field label="Map location" hint="search text for Google Maps" full><input value={f.mapQuery} onChange={e => set("mapQuery", e.target.value)} /></Field>
          <Field label="Working hours" full><input value={f.hours} onChange={e => set("hours", e.target.value)} /></Field>
        </div>
        <div className="panel-head" style={{ marginTop: 24 }}><h2>Social media</h2><span className="muted small">Leave empty to hide</span></div>
        <div className="form-grid">
          {SOCIAL.map(([k, label]) => (
            <Field key={k} label={label} error={errors[`social.${k}`]}><input value={f.social[k] || ""} onChange={e => setSocial(k, e.target.value)} placeholder="https://" /></Field>
          ))}
        </div>
        {message && <div className="form-status error">{message}</div>}
        <FormActions busy={busy} label="Save settings" />
      </form>
      <div style={{ marginTop: 24 }}><AccountForm /></div>
      <div style={{ marginTop: 24 }}><PasswordForm /></div>
      <Toast toast={toast} />
    </>
  );
}
