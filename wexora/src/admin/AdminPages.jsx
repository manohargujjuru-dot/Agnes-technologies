import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Icon, TechLogo, useTitle } from "../components/ui.jsx";
import { ICON_BY_TEXT, LOGOS } from "../data/logos.js";
import { batchStatus } from "../context/DataContext.jsx";
import { LEVELS, MODES } from "../data/constants.js";
import { adminApi } from "../api.js";
import { ConfirmDialog, Modal, Toast, useAdminData } from "./AdminShell.jsx";

const nameOf = (list, id) => list.find(c => c.id === id)?.name || id;

export function useToast() {
  const [toast, setToast] = useState(null);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 2000); return () => clearTimeout(t); }, [toast]);
  const show = useCallback((text, error = false) => setToast({ text, error }), []);
  return [toast, show];
}

export function Loading({ error, reload }) {
  if (error) return <div className="panel center"><p className="err">{error}</p><button className="btn btn-outline btn-sm" onClick={reload}>Retry</button></div>;
  return <div className="admin-loading"><span className="spinner dark" /> Loading…</div>;
}

/* ================= Dashboard ================= */
function SystemPanel() {
  const [sys, setSys] = useState(null);
  const [err, setErr] = useState("");
  useEffect(() => { adminApi.system().then(setSys).catch(e => setErr(e.message)); }, []);
  return (
    <div className="panel" style={{ marginTop: 24 }}>
      <div className="panel-head"><h2>Database</h2>{sys && <span className="badge badge-green">Healthy</span>}</div>
      {err && <p className="err">{err}</p>}
      {!sys && !err && <p className="muted small">Checking…</p>}
      {sys && (
        <div className="system-grid">
          <div>
            <p className="muted small">{sys.version} · database <code>{sys.database}</code></p>
            <ul className="mini-list">
              {sys.migrations.map(m => (
                <li key={m.version}><span><strong>{m.version}</strong><small>{m.appliedAt ? `Applied ${new Date(m.appliedAt).toLocaleString()}` : "Pending — run npm run db:migrate"}</small></span>
                  <span className={`badge ${m.appliedAt ? "badge-green" : "badge-amber"}`}>{m.appliedAt ? "Applied" : "Pending"}</span></li>
              ))}
            </ul>
          </div>
          <div className="count-grid">
            {Object.entries(sys.counts).map(([t, n]) => <div key={t}><strong>{n}</strong><small>{t}</small></div>)}
          </div>
        </div>
      )}
    </div>
  );
}

export function Dashboard() {
  useTitle("Admin Dashboard");
  const { courses, batches, enquiries, categories, loading, error, reload } = useAdminData();
  if (loading || error) return <Loading error={error} reload={reload} />;

  const open = batches.filter(b => batchStatus(b) !== "Completed").length;
  const stats = [
    ["Total courses", courses.length, "book", "/admin/courses"],
    ["Published", courses.filter(c => c.published).length, "eye", "/admin/courses"],
    ["Open batches", open, "cal", "/admin/batches"],
    ["Unread enquiries", enquiries.filter(e => !e.read).length, "inbox", "/admin/enquiries"]
  ];
  const missing = courses.filter(c => !c.modules?.length || !c.level);
  return (
    <>
      <div className="admin-head"><div><h1>Dashboard</h1><p className="muted">Overview of your website content.</p></div></div>
      <div className="stat-grid">
        {stats.map(([l, v, ic, to]) => (
          <Link to={to} className="stat-card" key={l}>
            <span className="stat-icon"><Icon name={ic} size={22} /></span>
            <span><strong>{v}</strong><small>{l}</small></span>
          </Link>
        ))}
      </div>
      <div className="admin-grid-2">
        <div className="panel">
          <div className="panel-head"><h2>Latest enquiries</h2><Link to="/admin/enquiries">View all</Link></div>
          {enquiries.length ? (
            <ul className="mini-list">
              {enquiries.slice(0, 5).map(e => (
                <li key={e.id}><span><strong>{e.name}</strong><small>{e.source || e.kind} · {new Date(e.date).toLocaleDateString()}</small></span>{!e.read && <span className="badge badge-red">New</span>}</li>
              ))}
            </ul>
          ) : <p className="muted small">No enquiries yet. New website enquiries appear here.</p>}
        </div>
        <div className="panel">
          <div className="panel-head"><h2>Content to complete</h2><Link to="/admin/courses">Manage</Link></div>
          <p className="muted small">{missing.length} of {courses.length} courses are missing a syllabus or skill level. These show “To be confirmed” on the website.</p>
          <ul className="mini-list">
            {missing.slice(0, 4).map(c => (
              <li key={c.id}><span><strong>{c.title}</strong><small>{nameOf(categories, c.category)}</small></span><span className="badge badge-amber">Needs details</span></li>
            ))}
          </ul>
        </div>
      </div>
      <SystemPanel />
    </>
  );
}

/* ================= Courses CRUD ================= */
const EMPTY_COURSE = { title: "", category: "", weeks: 4, logo: "", icon: "", summary: "", level: "", mode: "", schedule: "", prerequisites: "", audience: "", overview: "", outcomesText: "", modulesText: "", tools: "", published: true, flag: "" };

const toForm = c => ({
  ...EMPTY_COURSE, ...c,
  outcomesText: (c.outcomes || []).join("\n"),
  modulesText: (c.modules || []).map(m => `${m.title}${m.topics?.length ? ` | ${m.topics.join(", ")}` : ""}`).join("\n")
});
const fromForm = f => {
  const { outcomesText, modulesText, id: _id, updatedAt: _u, ...rest } = f;
  return {
    ...rest,
    weeks: Number(f.weeks),
    outcomes: outcomesText.split("\n").map(s => s.trim()).filter(Boolean),
    modules: modulesText.split("\n").map(s => s.trim()).filter(Boolean).map(line => {
      const [title, topics = ""] = line.split("|");
      return { title: title.trim(), topics: topics.split(",").map(t => t.trim()).filter(Boolean) };
    })
  };
};

function CourseForm({ initial, onSave, onCancel }) {
  const { categories } = useAdminData();
  const [f, setF] = useState(initial);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const submit = async e => {
    e.preventDefault();
    const errs = {};
    if (!f.title.trim()) errs.title = "Title is required.";
    if (!f.category) errs.category = "Choose a category.";
    if (!f.weeks || f.weeks < 1) errs.weeks = "Enter a duration of at least 1 week.";
    if (!f.summary.trim()) errs.summary = "A short card description is required.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true); setMsg("");
    try { await onSave(fromForm(f)); }
    catch (err) { setErrors(err.details || {}); setMsg(err.message); setBusy(false); }
  };
  const Err = ({ k }) => (errors[k] ? <span className="err">{errors[k]}</span> : null);
  const cls = k => `field ${errors[k] ? "invalid" : ""}`;
  return (
    <form onSubmit={submit} noValidate>
      <div className="form-grid">
        <div className={cls("title")}><label>Course title <span className="req">*</span></label><input value={f.title} onChange={e => set("title", e.target.value)} autoFocus /><Err k="title" /></div>
        <div className={cls("category")}><label>Category <span className="req">*</span></label>
          <select value={f.category} onChange={e => set("category", e.target.value)}><option value="">Select…</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select><Err k="category" /></div>
        <div className={cls("weeks")}><label>Duration (weeks) <span className="req">*</span></label><input type="number" min="1" max="104" value={f.weeks} onChange={e => set("weeks", e.target.value)} /><Err k="weeks" /></div>
        <div className={cls("icon")}><label>Technology logo</label>
          <div className="logo-pick">
            <TechLogo icon={f.icon} text={f.logo || f.title.slice(0, 2).toUpperCase()} size="sm" />
            <select value={f.icon} onChange={e => set("icon", e.target.value)}>
              <option value="">No logo (show text)</option>
              {Object.entries(LOGOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div><Err k="icon" /></div>
        <div className="field"><label>Fallback text <span className="opt">(2–4 letters)</span></label><input maxLength={4} value={f.logo} onChange={e => set("logo", e.target.value)} placeholder="e.g. AWS" /></div>
        <div className="field" />
        <div className={cls("level")}><label>Skill level</label><select value={f.level} onChange={e => set("level", e.target.value)}><option value="">To be confirmed</option>{LEVELS.map(l => <option key={l}>{l}</option>)}</select><Err k="level" /></div>
        <div className={cls("mode")}><label>Delivery mode</label><select value={f.mode} onChange={e => set("mode", e.target.value)}><option value="">To be confirmed</option>{MODES.map(l => <option key={l}>{l}</option>)}</select><Err k="mode" /></div>
        <div className={`${cls("summary")} full`}><label>Short card description <span className="req">*</span></label><textarea rows={2} value={f.summary} onChange={e => set("summary", e.target.value)} /><Err k="summary" /></div>
        <div className="field full"><label>Full overview</label><textarea rows={3} value={f.overview} onChange={e => set("overview", e.target.value)} /></div>
        <div className="field full"><label>Learning outcomes <span className="opt">(one per line)</span></label><textarea rows={3} value={f.outcomesText} onChange={e => set("outcomesText", e.target.value)} /></div>
        <div className="field full"><label>Syllabus modules <span className="opt">(one module per line: Title | topic, topic)</span></label>
          <textarea rows={4} value={f.modulesText} onChange={e => set("modulesText", e.target.value)} placeholder={"Introduction | Setup, Basics, First project\nCore concepts | Topic A, Topic B"} /></div>
        <div className="field"><label>Schedule</label><input value={f.schedule} onChange={e => set("schedule", e.target.value)} placeholder="e.g. Weekday evenings" /></div>
        <div className="field"><label>Tools / software</label><input value={f.tools} onChange={e => set("tools", e.target.value)} /></div>
        <div className="field"><label>Prerequisites</label><input value={f.prerequisites} onChange={e => set("prerequisites", e.target.value)} /></div>
        <div className="field"><label>Target audience</label><input value={f.audience} onChange={e => set("audience", e.target.value)} /></div>
        <div className="field full"><label className="checkbox"><input type="checkbox" checked={f.published} onChange={e => set("published", e.target.checked)} /> <span>Published (visible on the website)</span></label></div>
      </div>
      {msg && <div className="form-status error">{msg}</div>}
      <div className="modal-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel} disabled={busy}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? <><span className="spinner" /> Saving…</> : "Save course"}</button>
      </div>
    </form>
  );
}

export function CoursesAdmin() {
  useTitle("Manage Courses");
  const { courses, categories, loading, error, reload, mutate } = useAdminData();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [editing, setEditing] = useState(null); // null | "new" | course
  const [deleting, setDeleting] = useState(null);
  const [toast, show] = useToast();

  const list = useMemo(() => courses.filter(c =>
    (!cat || c.category === cat) && (!q || c.title.toLowerCase().includes(q.toLowerCase()))), [courses, q, cat]);

  if (loading || error) return <Loading error={error} reload={reload} />;

  const save = async data => {
    if (editing === "new") { await mutate(() => adminApi.createCourse(data)); show(`“${data.title}” added`); }
    else { await mutate(() => adminApi.updateCourse(editing.id, data)); show(`“${data.title}” updated`); }
    setEditing(null);
  };
  const togglePublish = async c => {
    try { await mutate(() => adminApi.setPublished(c.id, !c.published)); show(`“${c.title}” ${c.published ? "moved to draft" : "published"}`); }
    catch (e) { show(e.message, true); }
  };

  return (
    <>
      <div className="admin-head">
        <div><h1>Courses</h1><p className="muted">{courses.length} courses · add, edit, publish or delete.</p></div>
        <button className="btn btn-primary" onClick={() => setEditing("new")}><Icon name="plus" size={18} /> Add course</button>
      </div>
      <div className="admin-toolbar">
        <div className="search-box"><span className="s-icon"><Icon name="search" size={18} /></span>
          <input type="search" placeholder="Search courses…" value={q} onChange={e => setQ(e.target.value)} aria-label="Search courses" /></div>
        <select className="filter-select" value={cat} onChange={e => setCat(e.target.value)} aria-label="Filter by category">
          <option value="">All categories</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Course</th><th>Category</th><th>Duration</th><th>Level</th><th>Syllabus</th><th>Status</th><th className="right">Actions</th></tr></thead>
          <tbody>
            {list.map(c => (
              <tr key={c.id}>
                <td><div className="cell-course"><TechLogo icon={c.icon} text={c.logo} size="sm" /><span><strong>{c.title}</strong><small>/{c.id}</small></span></div></td>
                <td>{nameOf(categories, c.category)}</td>
                <td>{c.weeks} wks</td>
                <td>{c.level || <span className="muted">TBC</span>}</td>
                <td>{c.modules?.length ? `${c.modules.length} modules` : <span className="badge badge-amber">TBC</span>}</td>
                <td>
                  <button className={`status-toggle ${c.published ? "on" : ""}`} onClick={() => togglePublish(c)}
                    aria-label={`${c.published ? "Unpublish" : "Publish"} ${c.title}`}>{c.published ? "Published" : "Draft"}</button>
                </td>
                <td className="right">
                  <div className="row-actions">
                    {c.published && <Link className="icon-btn" to={`/courses/${c.id}`} target="_blank" aria-label={`View ${c.title}`}><Icon name="eye" size={18} /></Link>}
                    <button className="icon-btn" onClick={() => setEditing(c)} aria-label={`Edit ${c.title}`}><Icon name="edit" size={18} /></button>
                    <button className="icon-btn danger" onClick={() => setDeleting(c)} aria-label={`Delete ${c.title}`}><Icon name="trash" size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {!list.length && <tr><td colSpan={7} className="center muted" style={{ padding: 40 }}>No courses match.</td></tr>}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal wide title={editing === "new" ? "Add course" : `Edit: ${editing.title}`} onClose={() => setEditing(null)}>
          <CourseForm initial={editing === "new" ? EMPTY_COURSE : toForm(editing)} onSave={save} onCancel={() => setEditing(null)} />
        </Modal>
      )}
      {deleting && (
        <ConfirmDialog title="Delete course?" message={`“${deleting.title}” will be permanently removed from the database and website. Batches linked to it will be unlinked.`}
          onCancel={() => setDeleting(null)}
          onConfirm={async () => {
            try { await mutate(() => adminApi.deleteCourse(deleting.id)); show(`“${deleting.title}” deleted`); }
            catch (e) { show(e.message, true); }
            setDeleting(null);
          }} />
      )}
      <Toast toast={toast} />
    </>
  );
}

/* ================= Batches CRUD ================= */
const EMPTY_BATCH = { code: "", title: "", courseId: "", logo: "", start: "", end: "", days: "", time: "", tz: "IST", mode: "Online (live)", status: "Enrolling", desc: "", featured: false };
const REQUIRED_BATCH = ["code", "title", "start", "end"];

function BatchForm({ initial, courses, onSave, onCancel }) {
  const [f, setF] = useState(initial);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const pickCourse = id => {
    const c = courses.find(x => x.id === id);
    setF(s => ({ ...s, courseId: id, title: s.title || c?.title || "", logo: s.logo || c?.logo || "" }));
  };
  const submit = async e => {
    e.preventDefault();
    const errs = {};
    REQUIRED_BATCH.forEach(k => { if (!String(f[k]).trim()) errs[k] = "Required."; });
    if (f.start && f.end && f.end < f.start) errs.end = "End date must be after start date.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true); setMsg("");
    const { id: _id, ...data } = f;
    try { await onSave(data); }
    catch (err) { setErrors(err.details || {}); setMsg(err.message); setBusy(false); }
  };
  const fld = (k, label, props = {}) => (
    <div className={`field ${errors[k] ? "invalid" : ""}`}>
      <label>{label}{REQUIRED_BATCH.includes(k) && <span className="req"> *</span>}</label>
      <input value={f[k]} onChange={e => set(k, e.target.value)} type={props.type || "text"} placeholder={props.ph} />
      {errors[k] && <span className="err">{errors[k]}</span>}
    </div>
  );
  return (
    <form onSubmit={submit} noValidate>
      <div className="form-grid">
        <div className={`field ${errors.courseId ? "invalid" : ""}`}><label>Linked course</label>
          <select value={f.courseId} onChange={e => pickCourse(e.target.value)}><option value="">None</option>{courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select>
          {errors.courseId && <span className="err">{errors.courseId}</span>}</div>
        {fld("title", "Batch title")}
        {fld("code", "Batch code", { ph: "e.g. AWS-SA-2701" })}
        {fld("logo", "Logo text", { ph: "e.g. AWS" })}
        {fld("start", "Start date", { type: "date" })}
        {fld("end", "End date", { type: "date" })}
        {fld("days", "Class days", { ph: "e.g. Mon – Fri" })}
        {fld("time", "Time", { ph: "e.g. 7:00 – 8:30 PM" })}
        {fld("tz", "Time zone")}
        {fld("mode", "Mode")}
        <div className="field"><label>Status</label><select value={f.status} onChange={e => set("status", e.target.value)}>{["Enrolling", "Registration Closed", "Completed"].map(s => <option key={s}>{s}</option>)}</select></div>
        <div className="field"><label className="checkbox align-with-fields"><input type="checkbox" checked={f.featured} onChange={e => set("featured", e.target.checked)} /> <span>Feature on home page</span></label></div>
        <div className="field full"><label>Short description</label><textarea rows={2} value={f.desc} onChange={e => set("desc", e.target.value)} /></div>
      </div>
      {msg && <div className="form-status error">{msg}</div>}
      <div className="modal-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel} disabled={busy}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? <><span className="spinner" /> Saving…</> : "Save batch"}</button>
      </div>
    </form>
  );
}

export function BatchesAdmin() {
  useTitle("Manage Batches");
  const { batches, courses, loading, error, reload, mutate } = useAdminData();
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [toast, show] = useToast();
  if (loading || error) return <Loading error={error} reload={reload} />;

  const save = async data => {
    if (editing === "new") { await mutate(() => adminApi.createBatch(data)); show("Batch added"); }
    else { await mutate(() => adminApi.updateBatch(editing.id, data)); show("Batch updated"); }
    setEditing(null);
  };
  return (
    <>
      <div className="admin-head">
        <div><h1>Batches</h1><p className="muted">Past batches are marked Completed automatically after their end date.</p></div>
        <button className="btn btn-primary" onClick={() => setEditing("new")}><Icon name="plus" size={18} /> Add batch</button>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Batch</th><th>Start</th><th>End</th><th>Schedule</th><th>Status</th><th>Featured</th><th className="right">Actions</th></tr></thead>
          <tbody>
            {batches.map(b => {
              const st = batchStatus(b);
              return (
                <tr key={b.id}>
                  <td><div className="cell-course"><TechLogo icon={courses.find(c => c.id === b.courseId)?.icon || ICON_BY_TEXT[b.logo]} text={b.logo} size="sm" /><span><strong>{b.title}</strong><small>{b.code}</small></span></div></td>
                  <td>{b.start}</td><td>{b.end}</td>
                  <td><small>{b.days}<br />{b.time} {b.tz}</small></td>
                  <td><span className={`badge ${st === "Enrolling" ? "badge-green" : st === "Completed" ? "badge-gray" : "badge-amber"}`}>{st}</span></td>
                  <td>{b.featured ? <span className="badge badge-gold">Featured</span> : "—"}</td>
                  <td className="right"><div className="row-actions">
                    <button className="icon-btn" onClick={() => setEditing(b)} aria-label={`Edit ${b.code}`}><Icon name="edit" size={18} /></button>
                    <button className="icon-btn danger" onClick={() => setDeleting(b)} aria-label={`Delete ${b.code}`}><Icon name="trash" size={18} /></button>
                  </div></td>
                </tr>
              );
            })}
            {!batches.length && <tr><td colSpan={7} className="center muted" style={{ padding: 40 }}>No batches yet.</td></tr>}
          </tbody>
        </table>
      </div>
      {editing && (
        <Modal wide title={editing === "new" ? "Add batch" : `Edit: ${editing.code}`} onClose={() => setEditing(null)}>
          <BatchForm initial={editing === "new" ? EMPTY_BATCH : { ...EMPTY_BATCH, ...editing }} courses={courses} onSave={save} onCancel={() => setEditing(null)} />
        </Modal>
      )}
      {deleting && <ConfirmDialog title="Delete batch?" message={`Batch ${deleting.code} will be permanently removed.`}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          try { await mutate(() => adminApi.deleteBatch(deleting.id)); show("Batch deleted"); } catch (e) { show(e.message, true); }
          setDeleting(null);
        }} />}
      <Toast toast={toast} />
    </>
  );
}

/* ================= Enquiries ================= */
const KIND_LABELS = { general: "Home page", contact: "Contact page", course: "Course enquiry", web: "Web Development", app: "App Development", training: "Online Training", support: "IT Support", corporate: "Corporate Training" };
const HELP_LABELS = { web: "Website Development", app: "App Development", training: "Online Training", support: "IT Support", corporate: "Corporate Training", general: "General Enquiry" };
const EXTRA_COURSES = { devops: "DevOps", "power-bi": "Microsoft Power BI", other: "Other / not sure" };

const DETAIL_FIELDS = [
  ["subject", "Subject"], ["enquiryType", "Enquiry type"], ["help", "Topic"], ["batch", "Preferred batch / time"], ["level", "Current skill level"],
  ["mode", "Mode"], ["schedule", "Preferred schedule"], ["org", "Organisation"], ["participants", "Participants"], ["area", "Training area"],
  ["dates", "Expected dates"], ["websiteType", "Website type"], ["platform", "Platform"], ["appType", "App type"], ["features", "Features"],
  ["budget", "Budget"], ["timeline", "Timeline"], ["supportType", "Support type"], ["urgency", "Urgency"], ["contactMethod", "Preferred contact"]
];

const digits = p => String(p || "").replace(/\D/g, "");
const telLink = p => `tel:+${digits(p).replace(/^0+/, "")}`;
const waLink = p => { const d = digits(p).replace(/^0+/, ""); return `https://wa.me/${d.length === 10 ? `91${d}` : d}`; };

/* What the person is asking about, in plain words */
function interestOf(e, courses) {
  const course = e.course ? (courses.find(c => c.id === e.course)?.title || EXTRA_COURSES[e.course] || e.course) : "";
  const topic = HELP_LABELS[e.help] || e.enquiryType || "";
  const detail = e.websiteType || e.platform || e.supportType || e.area || e.appType || "";
  const main = course || detail || topic || KIND_LABELS[e.kind] || "General enquiry";
  const sub = [
    course && topic && topic !== "Online Training" && topic !== "Course Enquiry" ? topic : "",
    !course && detail && topic ? topic : "",
    e.batch ? `Batch: ${e.batch}` : ""
  ].filter(Boolean).join(" · ");
  return { main, sub, isCourse: !!course };
}

export function EnquiriesAdmin() {
  useTitle("Enquiries");
  const { enquiries, courses, loading, error, reload, mutate } = useAdminData();
  const [view, setView] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [toast, show] = useToast();

  const rows = useMemo(() => enquiries.map(e => ({ ...e, interest: interestOf(e, courses) })), [enquiries, courses]);
  if (loading || error) return <Loading error={error} reload={reload} />;

  const term = q.trim().toLowerCase();
  const list = rows.filter(e =>
    (filter === "all" || (filter === "unread" ? !e.read : filter === "courses" ? e.interest.isCourse : e.read)) &&
    (!term || [e.name, e.email, e.phone, e.interest.main, e.interest.sub, e.message, e.source].join(" ").toLowerCase().includes(term)));
  const counts = { all: rows.length, unread: rows.filter(e => !e.read).length, courses: rows.filter(e => e.interest.isCourse).length, read: rows.filter(e => e.read).length };

  const open = async e => {
    setView(e);
    if (!e.read) { try { await mutate(() => adminApi.setRead(e.id, true)); } catch { /* non-critical */ } }
  };
  const exportCsv = () => {
    const cols = [["Received", e => new Date(e.date).toLocaleString()], ["Name", e => e.name], ["Phone", e => e.phone], ["Email", e => e.email],
      ["Interested in", e => e.interest.main], ["Details", e => e.interest.sub], ["Source", e => KIND_LABELS[e.kind] || e.source],
      ["Message", e => e.message], ["Status", e => (e.read ? "Read" : "New")]];
    const cell = v => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [cols.map(c => c[0]).join(",")].concat(list.map(e => cols.map(([, fn]) => cell(fn(e))).join(","))).join("\n");
    const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    Object.assign(document.createElement("a"), { href: url, download: `enquiries-${new Date().toISOString().slice(0, 10)}.csv` }).click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="admin-head">
        <div><h1>Enquiries</h1><p className="muted">Who contacted you, what they want, and how to reach them.</p></div>
        <button className="btn btn-outline" onClick={exportCsv} disabled={!list.length}>Export CSV</button>
      </div>
      <div className="admin-toolbar">
        <div className="search-box"><span className="s-icon"><Icon name="search" size={18} /></span>
          <input type="search" placeholder="Search name, phone, course…" value={q} onChange={e => setQ(e.target.value)} aria-label="Search enquiries" /></div>
      </div>
      <div className="tabs admin-tabs" role="tablist">
        {[["all", "All"], ["unread", "New"], ["courses", "Course enquiries"], ["read", "Read"]].map(([k, label]) => (
          <button key={k} className="tab" role="tab" aria-selected={filter === k} onClick={() => setFilter(k)}>{label}<span className="count">{counts[k]}</span></button>
        ))}
      </div>
      <div className="table-wrap">
        <table className="data-table enquiries-table">
          <thead><tr><th>Person</th><th>Interested in</th><th>Phone</th><th>Message</th><th>Received</th><th>Status</th><th className="right">Actions</th></tr></thead>
          <tbody>
            {list.map(e => (
              <tr key={e.id} className={e.read ? "" : "unread"}>
                <td>
                  <div className="person"><span className="avatar sm">{(e.name || "?")[0].toUpperCase()}</span>
                    <span><strong>{e.name}</strong><a className="small" href={`mailto:${e.email}`}>{e.email}</a></span></div>
                </td>
                <td><span className="interest"><strong>{e.interest.main}</strong>{e.interest.sub && <small>{e.interest.sub}</small>}</span></td>
                <td>{e.phone ? (
                  <span className="phone-cell">
                    <a href={telLink(e.phone)} className="phone-link"><Icon name="tel" size={15} /> {e.phone}</a>
                    <a href={waLink(e.phone)} target="_blank" rel="noopener noreferrer" className="wa-link" aria-label={`WhatsApp ${e.name}`}>WhatsApp</a>
                  </span>
                ) : <span className="muted">—</span>}</td>
                <td><span className="msg-preview">{e.message || <span className="muted">—</span>}</span></td>
                <td><small>{new Date(e.date).toLocaleDateString()}<br />{new Date(e.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small></td>
                <td>{e.read ? <span className="badge badge-gray">Read</span> : <span className="badge badge-red">New</span>}</td>
                <td className="right"><div className="row-actions">
                  <button className="icon-btn" onClick={() => open(e)} aria-label={`View enquiry from ${e.name}`}><Icon name="eye" size={18} /></button>
                  <button className="icon-btn danger" onClick={() => setDeleting(e)} aria-label={`Delete enquiry from ${e.name}`}><Icon name="trash" size={18} /></button>
                </div></td>
              </tr>
            ))}
            {!list.length && <tr><td colSpan={7} className="center muted" style={{ padding: 40 }}>{rows.length ? "No enquiries match." : "No enquiries yet — they appear here as soon as someone submits a form on the website."}</td></tr>}
          </tbody>
        </table>
      </div>

      {view && (
        <Modal title={`Enquiry from ${view.name}`} onClose={() => setView(null)}>
          <div className="enq-summary">
            <span className="badge badge-blue">{KIND_LABELS[view.kind] || "Enquiry"}</span>
            <h3>{view.interest.main}</h3>
            {view.interest.sub && <p className="muted small">{view.interest.sub}</p>}
          </div>
          <div className="contact-actions">
            {view.phone && <a className="btn btn-primary btn-sm" href={telLink(view.phone)}><Icon name="tel" size={16} /> Call {view.phone}</a>}
            {view.phone && <a className="btn btn-outline btn-sm" href={waLink(view.phone)} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
            <a className="btn btn-outline btn-sm" href={`mailto:${view.email}?subject=${encodeURIComponent(`Re: ${view.interest.main}`)}`}><Icon name="mail" size={16} /> Email</a>
          </div>
          <dl className="detail-list">
            <div><dt>Name</dt><dd>{view.name}</dd></div>
            <div><dt>Phone</dt><dd>{view.phone || "—"}</dd></div>
            <div><dt>Email</dt><dd>{view.email}</dd></div>
            {view.course && <div><dt>Course</dt><dd>{view.interest.isCourse ? view.interest.main : view.course}</dd></div>}
            {DETAIL_FIELDS.filter(([k]) => view[k]).map(([k, label]) => <div key={k}><dt>{label}</dt><dd>{String(view[k])}</dd></div>)}
            <div><dt>Message</dt><dd>{view.message || "—"}</dd></div>
            <div><dt>Submitted from</dt><dd>{view.source || KIND_LABELS[view.kind]}</dd></div>
            <div><dt>Received</dt><dd>{new Date(view.date).toLocaleString()}</dd></div>
          </dl>
          <div className="modal-actions">
            <button className="btn btn-outline" onClick={async () => { await mutate(() => adminApi.setRead(view.id, false)); setView(null); }}>Mark as new</button>
            <button className="btn btn-primary" onClick={() => setView(null)}>Done</button>
          </div>
        </Modal>
      )}
      {deleting && <ConfirmDialog title="Delete enquiry?" message={`The enquiry from ${deleting.name} will be permanently removed.`}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          try { await mutate(() => adminApi.deleteEnquiry(deleting.id)); show("Enquiry deleted"); } catch (err) { show(err.message, true); }
          setDeleting(null);
        }} />}
      <Toast toast={toast} />
    </>
  );
}
