/* Quick search (Ctrl/⌘ + K or "/"): find any course or service from anywhere on the site. */
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon, TechLogo } from "./ui.jsx";
import { useData } from "../context/DataContext.jsx";

export default function QuickSearch() {
  const { publishedCourses, services, catName } = useData();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();

  // keyboard shortcuts
  useEffect(() => {
    const onKey = e => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable;
      if ((e.key === "k" && (e.ctrlKey || e.metaKey)) || (e.key === "/" && !typing)) { e.preventDefault(); setOpen(true); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    if (!open) return;
    setQ(""); setActive(0);
    document.body.classList.add("search-open");
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    return () => { clearTimeout(t); document.body.classList.remove("search-open"); };
  }, [open]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    const svc = services.map(s => ({ key: `s-${s.id}`, type: "Service", title: s.title, sub: (s.caps || []).slice(0, 3).join(" · "), to: `/services/${s.id}`, icon: s.icon, text: `${s.title} ${s.short} ${(s.caps || []).join(" ")}` }));
    const crs = publishedCourses.map(c => ({ key: `c-${c.id}`, type: "Course", title: c.title, sub: [catName(c.category), c.weeks && `${c.weeks} weeks`, c.level].filter(Boolean).join(" · "), to: `/courses/${c.id}`, logo: c, text: `${c.title} ${c.summary} ${c.tools || ""} ${catName(c.category)}` }));
    const all = [...svc, ...crs];
    if (!term) return [...svc.slice(0, 3), ...crs.slice(0, 5)];
    return all.filter(r => r.text.toLowerCase().includes(term)).slice(0, 10);
  }, [q, services, publishedCourses, catName]);

  useEffect(() => { setActive(0); }, [q]);
  useEffect(() => { listRef.current?.querySelector(".qs-item.active")?.scrollIntoView({ block: "nearest" }); }, [active]);

  const go = r => { if (!r) return; setOpen(false); navigate(r.to); };
  const onInputKey = e => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(a => Math.min(results.length - 1, a + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(a => Math.max(0, a - 1)); }
    else if (e.key === "Enter") { e.preventDefault(); go(results[active]); }
    else if (e.key === "Escape") setOpen(false);
  };

  return (
    <>
      <button type="button" className="qs-trigger" onClick={() => setOpen(true)} aria-label="Search courses and services" title="Search (Ctrl + K)">
        <Icon name="search" size={18} />
        <span className="qs-label">Search</span>
        <kbd className="qs-kbd">Ctrl K</kbd>
      </button>
      {open && (
        <div className="qs-overlay" onMouseDown={e => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="qs-panel" role="dialog" aria-modal="true" aria-label="Search">
            <div className="qs-input">
              <Icon name="search" size={20} />
              <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} onKeyDown={onInputKey}
                placeholder="Search courses, technologies, services…" aria-label="Search" autoComplete="off" />
              <button type="button" className="qs-esc" onClick={() => setOpen(false)}>Esc</button>
            </div>
            <ul className="qs-list" ref={listRef} role="listbox">
              {!q && <li className="qs-head">Popular</li>}
              {results.map((r, i) => (
                <li key={r.key} role="option" aria-selected={i === active}
                  className={`qs-item ${i === active ? "active" : ""}`} onMouseEnter={() => setActive(i)} onClick={() => go(r)}>
                  <span className="qs-ic">
                    {r.logo ? <TechLogo icon={r.logo.icon} text={r.logo.logo || r.title.slice(0, 2).toUpperCase()} size="sm" /> : <Icon name={r.icon} size={18} />}
                  </span>
                  <span className="qs-text"><strong>{r.title}</strong>{r.sub && <small>{r.sub}</small>}</span>
                  <span className="qs-type">{r.type}</span>
                </li>
              ))}
              {!results.length && <li className="qs-empty">No matches for “{q}”</li>}
            </ul>
            <div className="qs-foot"><span><kbd>↑</kbd><kbd>↓</kbd> navigate</span><span><kbd>Enter</kbd> open</span><span><kbd>Esc</kbd> close</span></div>
          </div>
        </div>
      )}
    </>
  );
}
