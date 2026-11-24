import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

/* =====================================================================
   Advanced alert / toast system
   - success · error · warning · info variants with animated SVG icons
   - countdown progress bar that pauses on hover / focus
   - stacked, animated enter + exit, max 4 on screen
   - optional action button, aria-live announcements
   Usage:  const alert = useAlert();
           alert.success("Enquiry sent", "We'll reply within 24 hours.");
   ===================================================================== */

const AlertContext = createContext(null);
const MAX = 4;
let seq = 0;

const ICONS = {
  success: <path className="al-draw" d="M7 12.5l3.2 3.2L17 9" />,
  error: <><path className="al-draw" d="M8.5 8.5l7 7" /><path className="al-draw al-d2" d="M15.5 8.5l-7 7" /></>,
  warning: <><path className="al-draw" d="M12 7.5v5.5" /><circle cx="12" cy="16.6" r="1.1" className="al-dot" /></>,
  info: <><circle cx="12" cy="7.6" r="1.1" className="al-dot" /><path className="al-draw" d="M12 11v5.5" /></>
};

function AlertItem({ a, onClose }) {
  const [leaving, setLeaving] = useState(false);
  const [paused, setPaused] = useState(false);
  const remaining = useRef(a.duration);
  const started = useRef(Date.now());

  const close = useCallback(() => { setLeaving(true); setTimeout(() => onClose(a.id), 320); }, [a.id, onClose]);

  useEffect(() => {
    if (!a.duration || paused) return;
    started.current = Date.now();
    const t = setTimeout(close, remaining.current);
    return () => { clearTimeout(t); remaining.current -= Date.now() - started.current; };
  }, [paused, a.duration, close]);

  return (
    <div
      className={`al al-${a.type} ${leaving ? "al-out" : ""} ${paused ? "al-paused" : ""}`}
      role={a.type === "error" ? "alert" : "status"}
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
    >
      <div className="al-icon" aria-hidden="true">
        <span className="al-ring" />
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          {ICONS[a.type]}
        </svg>
      </div>
      <div className="al-body">
        <strong className="al-title">{a.title}</strong>
        {a.message && <p className="al-msg">{a.message}</p>}
        {a.action && (
          <button type="button" className="al-action" onClick={() => { a.action.onClick(); close(); }}>{a.action.label}</button>
        )}
      </div>
      <button type="button" className="al-close" onClick={close} aria-label="Dismiss notification">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
      {a.duration > 0 && <span className="al-progress" style={{ animationDuration: `${a.duration}ms` }} />}
    </div>
  );
}

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);
  const remove = useCallback(id => setAlerts(list => list.filter(x => x.id !== id)), []);

  const push = useCallback((type, title, message = "", opts = {}) => {
    const id = ++seq;
    const duration = opts.duration ?? { success: 3000, info: 3500, warning: 4000, error: 6000 }[type];
    setAlerts(list => [...list, { id, type, title, message, duration, action: opts.action }].slice(-MAX));
    return id;
  }, []);

  const api = useMemo(() => ({
    show: push,
    success: (t, m, o) => push("success", t, m, o),
    error: (t, m, o) => push("error", t, m, o),
    warning: (t, m, o) => push("warning", t, m, o),
    info: (t, m, o) => push("info", t, m, o),
    dismiss: remove
  }), [push, remove]);

  return (
    <AlertContext.Provider value={api}>
      {children}
      {createPortal(
        <div className="al-stack" aria-live="polite">
          {alerts.map(a => <AlertItem key={a.id} a={a} onClose={remove} />)}
        </div>,
        document.body
      )}
    </AlertContext.Provider>
  );
}

/** Returns the alert API; falls back to a no-op outside the provider. */
export function useAlert() {
  return useContext(AlertContext) ?? { show() {}, success() {}, error() {}, warning() {}, info() {}, dismiss() {} };
}

/* Full success card shown in place of the form after a submission. */
export function SuccessCard({ title, children, reference, onReset }) {
  const pieces = useMemo(() => Array.from({ length: 28 }, (_, i) => ({
    x: Math.round(Math.cos((i / 28) * Math.PI * 2) * (90 + (i % 4) * 30)),
    y: Math.round(Math.sin((i / 28) * Math.PI * 2) * (70 + (i % 3) * 28)),
    r: (i * 47) % 360,
    c: ["#3A9BCB", "#22618F", "#0B2556", "#F2B705", "#D21404"][i % 5],
    d: (i % 6) * 40
  })), []);
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);

  return (
    <div className="success-card" tabIndex={-1} ref={ref} role="status" aria-live="polite">
      <div className="sc-burst" aria-hidden="true">
        {pieces.map((p, i) => (
          <span key={i} style={{ "--x": `${p.x}px`, "--y": `${p.y}px`, "--r": `${p.r}deg`, background: p.c, animationDelay: `${p.d}ms` }} />
        ))}
      </div>
      <div className="sc-check" aria-hidden="true">
        <span className="sc-pulse" /><span className="sc-pulse sc-p2" />
        <svg viewBox="0 0 52 52" width="76" height="76">
          <circle className="sc-circle" cx="26" cy="26" r="24" fill="none" />
          <path className="sc-tick" fill="none" d="M15 27l7.5 7.5L38 19" />
        </svg>
      </div>
      <h3 className="sc-title">{title}</h3>
      <div className="sc-text">{children}</div>
      {reference && <div className="sc-ref">Reference <code>{reference}</code></div>}
      {onReset && <button type="button" className="sc-again" onClick={onReset}><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12a8 8 0 0 1 13.7-5.6L20 9M20 4v5h-5M20 12a8 8 0 0 1-13.7 5.6L4 15M4 20v-5h5" /></svg> Send another enquiry</button>}
    </div>
  );
}
