/* Interactive polish: scroll progress, back-to-top, WhatsApp shortcut, card spotlight,
   hero parallax, animated counters and a technology logo marquee.
   Everything degrades gracefully: no motion when the user prefers reduced motion. */
import { useEffect, useRef, useState } from "react";
import { Icon, TechLogo } from "./ui.jsx";
import { useData } from "../context/DataContext.jsx";

const reduceMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
const finePointer = () => window.matchMedia?.("(hover: hover) and (pointer: fine)").matches;

/* Thin gradient bar at the very top + floating back-to-top (with progress ring) and WhatsApp buttons */
export function ScrollFx() {
  const { settings } = useData();
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
  }, []);

  const digits = String(settings.phone || "").replace(/\D/g, "");
  const showTop = progress > 0.08;
  const C = 2 * Math.PI * 22;
  return (
    <>
      <div className="scroll-progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
      <div className="fab-stack">
        {digits && (
          <a className="fab fab-wa" href={`https://wa.me/${digits}`} target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.8-1.2.2-.6.2-1.1.1-1.2l-.5-.3Z" /></svg>
            <span className="fab-tip">WhatsApp us</span>
          </a>
        )}
        <button type="button" className={`fab fab-top ${showTop ? "show" : ""}`} aria-label="Back to top" tabIndex={showTop ? 0 : -1}
          onClick={() => window.scrollTo({ top: 0, behavior: reduceMotion() ? "auto" : "smooth" })}>
          <svg className="fab-ring" viewBox="0 0 50 50" aria-hidden="true">
            <circle cx="25" cy="25" r="22" />
            <circle cx="25" cy="25" r="22" className="bar" style={{ strokeDasharray: C, strokeDashoffset: C * (1 - progress) }} />
          </svg>
          <Icon name="arrow" size={18} style={{ transform: "rotate(-90deg)" }} />
        </button>
      </div>
    </>
  );
}

/* Cards light up where the mouse is (one delegated listener for the whole page) */
export function useSpotlight() {
  useEffect(() => {
    if (!finePointer()) return;
    const onMove = e => {
      const el = e.target.closest?.(".card.hover, .tool-card, .stat-tile, .contact-card");
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => document.removeEventListener("pointermove", onMove);
  }, []);
}

/* Hero elements drift gently with the mouse (desktop only) */
export function useParallax(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el || reduceMotion() || !finePointer()) return;
    let raf = 0, x = 0, y = 0;
    const apply = () => { raf = 0; el.style.setProperty("--px", x.toFixed(3)); el.style.setProperty("--py", y.toFixed(3)); };
    const onMove = e => {
      const r = el.getBoundingClientRect();
      x = (e.clientX - r.left) / r.width - 0.5;
      y = (e.clientY - r.top) / r.height - 0.5;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onLeave = () => { x = 0; y = 0; if (!raf) raf = requestAnimationFrame(apply); };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => { el.removeEventListener("pointermove", onMove); el.removeEventListener("pointerleave", onLeave); cancelAnimationFrame(raf); };
  }, [ref]);
}

/* Number that counts up when it scrolls into view */
export function CountUp({ value, suffix = "", duration = 1400 }) {
  const ref = useRef(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduceMotion() || !("IntersectionObserver" in window)) { setN(value); return; }
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = t => {
        const p = Math.min(1, (t - start) / duration);
        setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [value, duration]);
  return <span ref={ref}>{n}{suffix}</span>;
}

/* Endless strip of technology logos (pauses on hover) */
export function TechMarquee() {
  const { technologies } = useData();
  if (!technologies.length) return null;
  // repeat short lists so one group is always wider than the screen (seamless loop)
  let items = technologies.slice(0, 16);
  while (items.length < 14) items = items.concat(technologies);
  const row = items.map((t, i) => (
    <span className="mq-item" key={t.name + i}><TechLogo icon={t.icon} text={t.logoText} size="sm" /><span>{t.name}</span></span>
  ));
  return (
    <div className="marquee" aria-label="Technologies we work with">
      <div className="mq-track" style={{ "--mq-dur": `${Math.max(24, items.length * 3)}s` }}>
        <div className="mq-group">{row}</div>
        <div className="mq-group" aria-hidden="true">{row}</div>
      </div>
    </div>
  );
}
