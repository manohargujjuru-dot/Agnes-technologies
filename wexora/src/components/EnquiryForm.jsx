import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LEVELS } from "../data/constants.js";
import { useData } from "../context/DataContext.jsx";
import { formatPhone, sanitizePhoneInput, suggestEmail, validateEmail, validatePhone } from "../utils/validation.js";
import { SuccessCard, useAlert } from "./Alerts.jsx";

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
  if (value && field.type === "email") return validateEmail(value);
  if (value && field.type === "tel") return validatePhone(value);
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
  const [touched, setTouched] = useState({});
  const [reference, setReference] = useState("");
  const alert = useAlert();

  const visible = fl => !fl.when || values[fl.when[0]] === fl.when[1];
  const set = (name, v) => {
    const fl = fields.find(x => x.name === name);
    if (fl?.type === "tel") v = sanitizePhoneInput(v);
    if (fl?.type === "email") v = v.replace(/\s/g, "");
    setValues(s => ({ ...s, [name]: v }));
    // live re-validation once a field has been visited (or already shows an error)
    if (errors[name] || touched[name]) setErrors(e => ({ ...e, [name]: validate(fl, v) }));
  };
  const blur = fl => {
    let v = values[fl.name];
    if (fl.type === "tel" && v && !validatePhone(v)) { v = formatPhone(v); setValues(s => ({ ...s, [fl.name]: v })); }
    setTouched(t => ({ ...t, [fl.name]: true }));
    setErrors(e => ({ ...e, [fl.name]: validate(fl, v) }));
  };
  const reset = () => { setValues({}); setErrors({}); setTouched({}); setReference(""); setStatus("idle"); };

  const submit = async e => {
    e.preventDefault();
    if (status === "sending") return; // duplicate-submit guard
    const errs = {};
    fields.filter(visible).forEach(fl => { const m = validate(fl, values[fl.name]); if (m) errs[fl.name] = m; });
    setErrors(errs);
    if (Object.keys(errs).length) {
      setStatus("invalid");
      const names = Object.keys(errs).map(n => fields.find(x => x.name === n)?.label || "Consent");
      alert.warning(`${names.length} field${names.length > 1 ? "s need" : " needs"} attention`, names.slice(0, 4).join(" · ") + (names.length > 4 ? " …" : ""));
      document.getElementById(`f-${kind}-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    setStatus("sending");
    const data = { kind, source, consent: true, website: honeypot };
    fields.filter(visible).forEach(fl => { if (fl.type !== "consent" && values[fl.name]) data[fl.name] = values[fl.name]; });
    try {
      const res = await submitEnquiry(data);
      const ref = res?.id != null ? `WX-${typeof res.id === "number" ? String(res.id).padStart(5, "0") : String(res.id).slice(0, 8).toUpperCase()}` : "";
      const first = String(values.name || "").trim().split(" ")[0];
      setReference(ref);
      setStatus("success");
      setValues({}); setTouched({});
      alert.success("Enquiry submitted successfully!", `Thanks${first ? `, ${first}` : ""} — our team will contact you within 24 hours.`);
    } catch (err) {
      if (err.details) setErrors(err.details); // server-side validation messages
      setServerMsg(err.message);
      setStatus("error");
      alert.error("Submission failed", err.message || "Something went wrong sending your enquiry.", {
        action: { label: "Try again", onClick: () => document.getElementById(`enq-submit-${kind}`)?.click() }
      });
    }
  };

  const label = fl => (
    <>
      {fl.label}
      {fl.req ? <span className="req"> *</span> : fl.opt ? <span className="opt"> (optional)</span> : null}
    </>
  );

  if (status === "success") {
    return (
      <SuccessCard title="Enquiry submitted!" reference={reference} onReset={reset}>
        <p>Thank you for reaching out. Your enquiry has been received — our team will get back to you within 24 hours.</p>
      </SuccessCard>
    );
  }

  return (
    <form className="enquiry-form" noValidate onSubmit={submit}>
      <div className="form-grid">
        {fields.filter(visible).map(fl => {
          const id = `f-${kind}-${fl.name}`;
          const err = errors[fl.name];
          const ok = !err && touched[fl.name] && (fl.type === "email" || fl.type === "tel") && !!values[fl.name];
          const suggestion = fl.type === "email" && touched[fl.name] && !err ? suggestEmail(values[fl.name]) : "";
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
            <div className={`field ${fl.type === "textarea" || fl.full ? "full" : ""} ${err ? "invalid" : ""} ${ok ? "valid" : ""}`} key={fl.name}>
              <label htmlFor={id}>{label(fl)}</label>
              {fl.type === "select" ? (
                <select {...common}>
                  <option value="">Select…</option>
                  {fl.options.map(o => { const [v, l] = Array.isArray(o) ? o : [o, o]; return <option key={v} value={v}>{l}</option>; })}
                </select>
              ) : fl.type === "textarea" ? (
                <textarea {...common} placeholder={fl.ph} />
              ) : (
                <div className="input-wrap">
                  <input {...common} type={fl.type} min={fl.type === "number" ? 1 : undefined}
                    placeholder={fl.ph ?? { email: "name@example.com", tel: "+91 91234 56789" }[fl.type]}
                    inputMode={{ email: "email", tel: "tel" }[fl.type]}
                    maxLength={{ email: 254, tel: 22 }[fl.type]}
                    autoCapitalize={fl.type === "email" ? "off" : undefined} spellCheck={fl.type === "email" ? false : undefined}
                    autoComplete={{ name: "name", email: "email", phone: "tel", org: "organization" }[fl.name]} />
                  {(fl.type === "email" || fl.type === "tel") && (ok || err) && (
                    <span className={`field-state ${ok ? "is-ok" : "is-err"}`} aria-hidden="true">
                      {ok ? <svg viewBox="0 0 24 24" width="18" height="18"><path d="M6 12.5l4 4L18 8" /></svg>
                        : <svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 7v6M12 16.5v.5" /></svg>}
                    </span>
                  )}
                </div>
              )}
              {err && <span className="err" id={`${id}-err`} role="alert">{err}</span>}
              {fl.type === "tel" && !err && !ok && <span className="hint">10-digit mobile, or +country code for international.</span>}
              {suggestion && (
                <button type="button" className="email-suggest" onClick={() => { set(fl.name, suggestion); setErrors(e => ({ ...e, [fl.name]: "" })); }}>
                  Did you mean <strong>{suggestion}</strong>?
                </button>
              )}
            </div>
          );
        })}
      </div>
      <input type="text" className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={honeypot} onChange={e => setHoneypot(e.target.value)} />
      <div className="form-actions">
        <button type="submit" id={`enq-submit-${kind}`} className="btn btn-primary" disabled={status === "sending"}>
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
      </div>
    </form>
  );
}
