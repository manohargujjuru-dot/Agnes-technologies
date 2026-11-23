import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LEVELS } from "../data/constants.js";
import { useData } from "../context/DataContext.jsx";

const BUDGET = ["Under 1,000", "1,000 – 5,000", "5,000 – 15,000", "15,000+", "Not sure yet"];
const TIMELINE = ["ASAP", "1–3 months", "3–6 months", "Flexible"];
const SCHEDULE = ["Weekday mornings", "Weekday evenings", "Weekends", "Flexible"];
const MODES = ["Online", "Classroom", "Either"];
const SUPPORT = ["Technology consulting", "Troubleshooting", "Technical assistance", "System / software support", "Maintenance"];
const PLATFORM = ["Android", "iOS", "Windows", "Cross-platform", "Other"];
const SITE_TYPES = ["Business Website", "E-commerce", "Blog", "Web App", "Landing Page", "Other"];
const ENQ_TYPES = ["General", "Web Development", "App Development", "Online Training", "IT Support", "Corporate Training", "Course Enquiry"];

/* field helpers: [name, label, type, options] */
const f = (name, label, type = "text", extra = {}) => ({ name, label, type, ...extra });

function buildFields(kind, courseOpts, areaOpts) {
  const base = [f("name", "Name", "text", { req: true }), f("email", "Email Address", "email", { req: true }), f("phone", "Phone Number", "tel", { req: true })];
  const tail = [f("message", "Message", "textarea", { req: true }), f("consent", "", "consent", { req: true })];
  switch (kind) {
    case "general":
      return [...base,
        f("help", "How Can We Help?", "select", { req: true, options: [["web", "Website Development"], ["app", "App Development"], ["training", "Online Training"], ["support", "IT Support"], ["corporate", "Corporate Training"], ["general", "General Enquiry"]] }),
        f("websiteType", "Website Type", "select", { options: SITE_TYPES, when: ["help", "web"] }),
        f("budget", "Budget", "select", { options: BUDGET, opt: true, when: ["help", "web"] }),
        f("platform", "Platform", "select", { options: PLATFORM, when: ["help", "app"] }),
        f("timeline", "Timeline", "select", { options: TIMELINE, opt: true, when: ["help", "app"] }),
        f("course", "Course of Interest", "select", { options: courseOpts, when: ["help", "training"] }),
        f("level", "Current Skill Level", "select", { options: LEVELS, when: ["help", "training"] }),
        f("supportType", "Support Type", "select", { options: SUPPORT, when: ["help", "support"] }),
        f("urgency", "Urgency", "select", { options: ["Low", "Medium", "High"], when: ["help", "support"] }),
        f("org", "Organisation", "text", { when: ["help", "corporate"] }),
        f("participants", "Number of Participants", "number", { when: ["help", "corporate"] }),
        ...tail];
    case "contact":
      return [f("name", "Full Name", "text", { req: true }), f("email", "Email", "email", { req: true }), f("phone", "Phone", "tel"),
        f("subject", "Subject"), f("enquiryType", "Enquiry Type", "select", { req: true, options: ENQ_TYPES }),
        f("course", "Course", "select", { options: courseOpts, when: ["enquiryType", "Course Enquiry"] }),
        f("batch", "Preferred Batch / Time", "text", { when: ["enquiryType", "Course Enquiry"] }),
        ...tail];
    case "course":
      return [f("name", "Full Name", "text", { req: true }), f("email", "Email", "email", { req: true }), f("phone", "Phone", "tel", { req: true }),
        f("course", "Course", "select", { req: true, options: courseOpts }), f("batch", "Preferred Batch / Time", "select", { options: SCHEDULE }),
        f("mode", "Training Mode", "select", { options: MODES }), f("level", "Current Skill Level", "select", { options: LEVELS }),
        f("message", "Message", "textarea"), f("consent", "", "consent", { req: true })];
    case "web":
      return [...base, f("websiteType", "Website Type", "select", { req: true, options: SITE_TYPES }), f("features", "Required Features", "text", { ph: "e.g. booking, payments, CMS" }),
        f("budget", "Budget", "select", { opt: true, options: BUDGET }), f("timeline", "Timeline", "select", { opt: true, options: TIMELINE }),
        f("message", "Project Description", "textarea", { req: true }), f("consent", "", "consent", { req: true })];
    case "app":
      return [...base, f("platform", "Platform", "select", { req: true, options: PLATFORM }), f("appType", "App Type", "text", { ph: "e.g. booking, e-commerce" }),
        f("features", "Key Features", "text", { full: true }), f("budget", "Budget", "select", { opt: true, options: BUDGET }), f("timeline", "Timeline", "select", { opt: true, options: TIMELINE }),
        f("message", "Project Description", "textarea", { req: true }), f("consent", "", "consent", { req: true })];
    case "training":
      return [...base, f("course", "Course of Interest", "select", { req: true, options: courseOpts }), f("schedule", "Preferred Schedule", "select", { options: SCHEDULE }),
        f("level", "Current Skill Level", "select", { options: LEVELS }), f("mode", "Mode", "select", { options: MODES }),
        f("message", "Message", "textarea"), f("consent", "", "consent", { req: true })];
    case "support":
      return [f("name", "Name", "text", { req: true }), f("org", "Organisation"), f("email", "Email", "email", { req: true }), f("phone", "Phone", "tel", { req: true }),
        f("supportType", "Support Type", "select", { req: true, options: SUPPORT }), f("urgency", "Urgency", "select", { req: true, options: ["Low", "Medium", "High", "Critical"] }),
        f("contactMethod", "Preferred Contact Method", "select", { options: ["Email", "Phone", "Either"], full: true }),
        f("message", "Issue Description", "textarea", { req: true }), f("consent", "", "consent", { req: true })];
    case "corporate":
      return [f("name", "Contact Name", "text", { req: true }), f("org", "Organisation", "text", { req: true }), f("email", "Email", "email", { req: true }), f("phone", "Phone", "tel", { req: true }),
        f("area", "Training Area", "select", { req: true, options: areaOpts }),
        f("participants", "Number of Participants", "number"), f("mode", "Preferred Mode", "select", { options: ["Online", "Classroom", "Hybrid"] }),
        f("dates", "Expected Dates", "text", { ph: "e.g. Feb 2027" }), f("message", "Message", "textarea"), f("consent", "", "consent", { req: true })];
    default:
      return [...base, ...tail];
  }
}

function validate(field, value) {
  if (field.req && (field.type === "consent" ? !value : !String(value ?? "").trim()))
    return field.type === "consent" ? "Please accept to continue." : "This field is required.";
  if (value && field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) return "Please enter a valid email address.";
  if (value && field.type === "tel" && !/^[+]?[\d\s()-]{7,18}$/.test(value)) return "Please enter a valid phone number.";
  return "";
}

/**
 * Reusable enquiry form. `kind` selects the field set; `initial` pre-fills values.
 * Submissions are saved to the demo store so they appear in Admin → Enquiries.
 */
export default function EnquiryForm({ kind = "general", initial = {}, submitLabel = "Send Enquiry", source = "" }) {
  const { publishedCourses, categories, submitEnquiry } = useData();
  const courseOpts = useMemo(() => publishedCourses.map(c => [c.id, c.title]).concat([["devops", "DevOps"], ["power-bi", "Microsoft Power BI"], ["other", "Other / not sure"]]), [publishedCourses]);
  const areaOpts = useMemo(() => categories.map(c => c.name).concat(["Soft skills", "Other"]), [categories]);
  const fields = useMemo(() => buildFields(kind, courseOpts, areaOpts), [kind, courseOpts, areaOpts]);

  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | invalid | sending | success | error
  const [serverMsg, setServerMsg] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const visible = fl => !fl.when || values[fl.when[0]] === fl.when[1];
  const set = (name, v) => {
    setValues(s => ({ ...s, [name]: v }));
    if (errors[name]) setErrors(e => ({ ...e, [name]: validate(fields.find(x => x.name === name), v) }));
  };
  const blur = fl => setErrors(e => ({ ...e, [fl.name]: validate(fl, values[fl.name]) }));

  const submit = async e => {
    e.preventDefault();
    if (status === "sending") return; // duplicate-submit guard
    const errs = {};
    fields.filter(visible).forEach(fl => { const m = validate(fl, values[fl.name]); if (m) errs[fl.name] = m; });
    setErrors(errs);
    if (Object.keys(errs).length) {
      setStatus("invalid");
      document.getElementById(`f-${kind}-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    setStatus("sending");
    const data = { kind, source, consent: true, website: honeypot };
    fields.filter(visible).forEach(fl => { if (fl.type !== "consent" && values[fl.name]) data[fl.name] = values[fl.name]; });
    try {
      await submitEnquiry(data);
      setStatus("success");
      setValues({});
    } catch (err) {
      if (err.details) setErrors(err.details); // server-side validation messages
      setServerMsg(err.message);
      setStatus("error");
    }
  };

  const label = fl => (
    <>
      {fl.label}
      {fl.req ? <span className="req"> *</span> : fl.opt ? <span className="opt"> (optional)</span> : null}
    </>
  );

  return (
    <form className="enquiry-form" noValidate onSubmit={submit}>
      <div className="form-grid">
        {fields.filter(visible).map(fl => {
          const id = `f-${kind}-${fl.name}`;
          const err = errors[fl.name];
          const common = {
            id, name: fl.name, value: values[fl.name] ?? "", "aria-invalid": !!err,
            "aria-describedby": err ? `${id}-err` : undefined,
            onChange: e => set(fl.name, e.target.value), onBlur: () => blur(fl)
          };
          if (fl.type === "consent") {
            return (
              <div className={`field full ${err ? "invalid" : ""}`} key={fl.name}>
                <label className="checkbox">
                  <input type="checkbox" id={id} checked={!!values.consent} onChange={e => set("consent", e.target.checked)} aria-invalid={!!err} />
                  <span>I agree to be contacted about my enquiry and accept the <Link to="/legal#privacy">Privacy Policy</Link>. <span className="req">*</span></span>
                </label>
                {err && <span className="err" id={`${id}-err`} role="alert">{err}</span>}
              </div>
            );
          }
          return (
            <div className={`field ${fl.type === "textarea" || fl.full ? "full" : ""} ${err ? "invalid" : ""}`} key={fl.name}>
              <label htmlFor={id}>{label(fl)}</label>
              {fl.type === "select" ? (
                <select {...common}>
                  <option value="">Select…</option>
                  {fl.options.map(o => { const [v, l] = Array.isArray(o) ? o : [o, o]; return <option key={v} value={v}>{l}</option>; })}
                </select>
              ) : fl.type === "textarea" ? (
                <textarea {...common} placeholder={fl.ph} />
              ) : (
                <input {...common} type={fl.type} placeholder={fl.ph} min={fl.type === "number" ? 1 : undefined}
                  autoComplete={{ name: "name", email: "email", phone: "tel", org: "organization" }[fl.name]} />
              )}
              {err && <span className="err" id={`${id}-err`} role="alert">{err}</span>}
            </div>
          );
        })}
      </div>
      <input type="text" className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={honeypot} onChange={e => setHoneypot(e.target.value)} />
      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={status === "sending"}>
          {status === "sending" ? <><span className="spinner" /> Sending…</> : submitLabel}
        </button>
      </div>
      <div className="form-status-wrap" aria-live="polite">
        {status === "invalid" && <div className="form-status error">Please fix the highlighted fields.</div>}
        {status === "error" && (
          <div className="form-status error">
            {serverMsg || "Something went wrong sending your enquiry."}
            <button type="submit" className="btn btn-sm btn-outline" style={{ marginLeft: 10 }}>Retry</button>
          </div>
        )}
        {status === "success" && <div className="form-status success">Thank you! Your enquiry has been received — our team will get back to you soon.</div>}
      </div>
    </form>
  );
}
