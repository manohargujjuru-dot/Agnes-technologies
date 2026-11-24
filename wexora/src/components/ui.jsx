import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useData } from "../context/DataContext.jsx";
import { IMAGES } from "../data/images.js";
import { logoSrc } from "../data/logos.js";

/* ---------- Icons ---------- */
const PATHS = {
  code: <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />,
  phone: <><rect x="6" y="2" width="12" height="20" rx="3" /><path d="M11 18h2" /></>,
  laptop: <><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M2 20h20" /></>,
  wrench: <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z" />,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7M22 20c0-3-2-5.2-5-5.8" /></>,
  headset: <><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><rect x="2" y="14" width="5" height="6" rx="2" /><rect x="17" y="14" width="5" height="6" rx="2" /></>,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  cal: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></>,
  tel: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />,
  pin: <><path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></>,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  chev: <path d="M6 9l6 6 6-6" />,
  alert: <><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" /></>,
  shield: <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />,
  heart: <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" />,
  grow: <path d="M3 17l6-6 4 4 8-8M15 7h6v6" />,
  bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7z" />,
  star: <path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z" />,
  level: <path d="M4 20V14M10 20V9M16 20V4" />,
  plus: <path d="M12 5v14M5 12h14" />,
  edit: <path d="M4 20h4L19 9l-4-4L4 16zM14 6l4 4" />,
  trash: <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />,
  book: <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5" />,
  inbox: <path d="M3 13h5l2 3h4l2-3h5M5 5h14l2 8v6H3v-6z" />,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  logout: <path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10" />,
  eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
  check: <path d="M5 12l5 5L20 7" />,
  eyeOff: <><path d="M3 3l18 18" /><path d="M10.6 5.1A9.6 9.6 0 0 1 12 5c6 0 10 7 10 7a17.6 17.6 0 0 1-3.2 3.9M6.6 6.6C3.9 8.4 2 12 2 12s4 7 10 7a9.7 9.7 0 0 0 5.4-1.6" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>
};

export function Icon({ name, size = 22, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
      {PATHS[name]}
    </svg>
  );
}

/* ---------- Brand logo (public/logo.webp, transparent PNG fallback) ----------
   `tile` puts it on a white rounded tile so the navy parts stay visible on dark backgrounds. */
/* Square brand mark: the logo centred on a white rounded-square tile (looks right on light and dark backgrounds). */
export function LogoMark({ size }) {
  return (
    <span className="logo-mark" style={size ? { "--logo-size": `${size}px` } : undefined} aria-hidden="true">
      <picture>
        <source srcSet="/logo-square.webp" type="image/webp" />
        <img src="/logo-square.png" alt="" width="192" height="192" decoding="async" />
      </picture>
    </span>
  );
}

export function Logo({ light = false, to = "/" }) {
  const { settings } = useData();
  const [first, ...rest] = (settings.name || "Agnes Technologies").split(" ");
  return (
    <Link to={to} className={`logo ${light ? "logo-light" : ""}`} aria-label={`${settings.name} home`}>
      <LogoMark />
      <span className="logo-text">
        <strong>{settings.shortName || first}</strong>
        {rest.length > 0 && <small>{rest.join(" ")}</small>}
      </span>
    </Link>
  );
}

/* ---------- Scroll reveal (visible by default if IO/motion unavailable) ---------- */
export function Reveal({ as: Tag = "div", className = "", delay = 0, children, ...rest }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (!el || reduce || !("IntersectionObserver" in window)) { setShown(true); return; }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setShown(true); io.disconnect(); }
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={`reveal ${shown ? "in" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  );
}

export function Notice({ children, info = false, style }) {
  return (
    <div className={`notice ${info ? "info" : ""}`} style={style}>
      <Icon name="alert" size={20} />
      <span>{children}</span>
    </div>
  );
}

export function Steps({ items }) {
  return (
    <div className="steps" style={{ "--n": items.length }}>
      {items.map((s, i) => (
        <Reveal className="step" key={s.title || s} delay={i * 80}>
          <span className="step-num">{i + 1}</span>
          <h3>{s.title || s}</h3>
          {s.text && <p>{s.text}</p>}
        </Reveal>
      ))}
    </div>
  );
}

export function SectionHead({ eyebrow, title, children }) {
  return (
    <Reveal className="section-head">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </Reveal>
  );
}

export function Breadcrumbs({ items }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        <li><Link to="/">Home</Link></li>
        {items.map((it, i) => (
          <li key={i} aria-current={i === items.length - 1 ? "page" : undefined}>
            {it.to ? <Link to={it.to}>{it.label}</Link> : it.label}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageBanner({ crumbs, eyebrow, title, lead, actions, art }) {
  return (
    <section className="page-banner">
      <div className="banner-shapes" aria-hidden="true"><span /><span /></div>
      <div className={`container ${art ? "banner-grid" : ""}`}>
        <div>
          <Breadcrumbs items={crumbs} />
          {eyebrow && <span className="eyebrow anim">{eyebrow}</span>}
          <h1 className="anim d1">{title}</h1>
          {lead && <p className="lead anim d2">{lead}</p>}
          {actions && <div className="btn-row anim d3">{actions}</div>}
        </div>
        {art && <div className="banner-art anim-scale">{art}</div>}
      </div>
    </section>
  );
}

export function useTitle(title, description) {
  const { settings } = useData();
  const name = settings.name || "Agnes Technologies";
  useEffect(() => {
    document.title = title ? `${title} | ${name}` : `${name} | Software Development, IT Support & Training`;
    if (description) document.querySelector('meta[name="description"]')?.setAttribute("content", description);
  }, [title, description, name]);
}

export const TBC = () => <span className="tbc">To be confirmed</span>;

/* Real photo with lazy loading; `eager` for above-the-fold images. */
export function Photo({ name, eager = false, className = "" }) {
  const img = IMAGES[name];
  if (!img) return null;
  return (
    <img className={`photo ${className}`} src={img.src} alt={img.alt} width="1200" height="800"
      loading={eager ? "eager" : "lazy"} decoding="async" fetchPriority={eager ? "high" : undefined} />
  );
}

/* Technology logo on a white tile; falls back to the short text badge. */
export function TechLogo({ icon, text = "", size = "md", label = "" }) {
  const src = logoSrc(icon);
  return (
    <span className={`tech-logo ${size} ${src ? "has-img" : ""}`} aria-hidden={!label || undefined}>
      {src ? <img src={src} alt={label} width="48" height="48" loading="lazy" decoding="async" /> : <span className="tech-text">{text}</span>}
    </span>
  );
}

/* ---------- Light / dark theme ---------- */
const THEME_KEY = "agnes-theme";
const currentTheme = () => document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";

export function useTheme() {
  const [theme, setTheme] = useState(currentTheme);
  // keep every toggle on the page in sync, and follow the system setting until the user picks one
  useEffect(() => {
    const sync = () => setTheme(currentTheme());
    window.addEventListener("agnes-theme", sync);
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    const onSystem = e => {
      let saved = null;
      try { saved = localStorage.getItem(THEME_KEY); } catch { /* ignore */ }
      if (!saved) applyTheme(e.matches ? "dark" : "light", false);
    };
    mq?.addEventListener?.("change", onSystem);
    return () => { window.removeEventListener("agnes-theme", sync); mq?.removeEventListener?.("change", onSystem); };
  }, []);
  const toggle = () => applyTheme(currentTheme() === "dark" ? "light" : "dark", true);
  return { theme, toggle };
}

function applyTheme(theme, remember) {
  const root = document.documentElement;
  root.classList.add("theme-anim");
  root.setAttribute("data-theme", theme);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#0a1120" : "#192841");
  if (remember) { try { localStorage.setItem(THEME_KEY, theme); } catch { /* ignore */ } }
  window.dispatchEvent(new Event("agnes-theme"));
  setTimeout(() => root.classList.remove("theme-anim"), 450);
}

const SunIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4.5" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);
const MoonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);

export function ThemeToggle({ className = "" }) {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";
  return (
    <button type="button" className={`theme-toggle ${className}`} onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} title={dark ? "Light mode" : "Dark mode"}>
      {dark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

/* Animated burger: three bars that morph into a cross when open. */
export function Burger({ open, onClick, controls, className = "" }) {
  return (
    <button type="button" className={`burger ${open ? "is-open" : ""} ${className}`} onClick={onClick}
      aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls={controls}>
      <span /><span /><span />
    </button>
  );
}

/* Password field with a show/hide (eye) toggle. Accepts the same props as <input>. */
export function PasswordInput({ id, ...props }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="password-field">
      <input id={id} {...props} type={visible ? "text" : "password"} autoCapitalize="off" autoCorrect="off" spellCheck={false} />
      <button type="button" className="password-toggle" onClick={() => setVisible(v => !v)}
        aria-label={visible ? "Hide password" : "Show password"} aria-pressed={visible} aria-controls={id}>
        <Icon name={visible ? "eyeOff" : "eye"} size={20} />
      </button>
    </div>
  );
}

export function PageLoader() {
  return <div className="page-loader"><span className="spinner dark" /> Loading…</div>;
}
