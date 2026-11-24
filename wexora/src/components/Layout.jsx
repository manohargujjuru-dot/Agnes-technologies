import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Burger, Icon, Logo, ThemeToggle } from "./ui.jsx";
import { useData } from "../context/DataContext.jsx";
import { ScrollFx, useSpotlight } from "./Effects.jsx";
import QuickSearch from "./QuickSearch.jsx";

const SOCIAL_LABELS = { linkedin: "LinkedIn", facebook: "Facebook", x: "X", youtube: "YouTube", instagram: "Instagram" };
/* Hover-to-open only for real mouse pointers on wide screens; touch devices (iPad) use tap. */
const canHover = () => window.innerWidth > 960 && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

export const telHref = phone => `tel:${String(phone).replace(/[^\d+]/g, "").replace(/^(?!\+)/, "+")}`;

/* Contact shortcuts at the bottom of the mobile drawer */
function DrawerFooter() {
  const { settings } = useData();
  if (!settings.phone && !settings.email) return null;
  return (
    <div className="drawer-foot">
      {settings.phone && <a href={telHref(settings.phone)} className="drawer-contact"><Icon name="tel" size={18} /> {settings.phone}</a>}
      {settings.email && <a href={`mailto:${settings.email}`} className="drawer-contact"><Icon name="mail" size={18} /> {settings.email}</a>}
    </div>
  );
}

function Header() {
  const { services, categories } = useData();
  const [open, setOpen] = useState(false);
  const [drop, setDrop] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [navUp, setNavUp] = useState(false);
  const { settings } = useData();
  const { pathname, search } = useLocation();

  const nav = useMemo(() => [
    { to: "/", label: "Home", end: true },
    { to: "/about", label: "About Us" },
    { to: "/services", label: "Services", children: [{ to: "/services", label: "All Services" }, ...services.map(s => ({ to: `/services/${s.id}`, label: s.title }))] },
    { to: "/courses", label: "Courses", children: [{ to: "/courses", label: "All Courses" }, ...categories.map(c => ({ to: `/courses?cat=${c.id}#catalogue`, label: c.name }))] },
    { to: "/batches", label: "Upcoming Batches" },
    { to: "/contact", label: "Contact" }
  ], [services, categories]);

  /* Close every menu after choosing a link — even when it points to the page you're already on —
     and drop focus so nothing stays highlighted */
  const closeMenus = () => {
    setDrop(null);
    setOpen(false);
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  };
  useEffect(() => { setOpen(false); setDrop(null); setNavUp(false); }, [pathname, search]);
  // Click/tap anywhere outside an open dropdown closes it
  useEffect(() => {
    if (!drop) return;
    const onDown = e => { if (!e.target.closest?.(".has-dropdown")) setDrop(null); };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [drop]);
  useEffect(() => {
    /* scrolled: compact header · navUp: scrolling back up → header switches to the brand navy;
       scrolling down (or back at the very top) → normal white header */
    /* Direction is measured over a deliberate distance (not every pixel) so tiny trackpad /
       touch movements and iOS bounce never make the colour flicker. */
    let last = Math.max(0, window.scrollY), travel = 0, ticking = false;
    const update = () => {
      ticking = false;
      const y = Math.max(0, window.scrollY);
      const d = y - last;
      last = y;
      setScrolled(y > 8);
      if (y < 120) { travel = 0; setNavUp(false); return; }          // near the top → standard header
      if (!d) return;
      if (Math.sign(d) !== Math.sign(travel)) travel = 0;             // direction changed → start measuring again
      travel += d;
      if (travel <= -40) setNavUp(true);                              // scrolled up ≥ 40px → navy
      else if (travel >= 12) setNavUp(false);                         // scrolled down → standard
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    const onKey = e => { if (e.key === "Escape") { setOpen(false); setDrop(null); } };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("keydown", onKey); };
  }, []);
  useEffect(() => {
    document.body.classList.toggle("menu-open", open); // locks page scroll behind the drawer
    return () => document.body.classList.remove("menu-open");
  }, [open]);
  // Close the drawer if the screen is resized to desktop width
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 961px)");
    const onChange = e => e.matches && setOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <header className={`site-header ${scrolled ? "scrolled" : ""} ${navUp && !open ? "nav-up" : ""} ${open ? "drawer-open" : ""}`}>
      <div className="container nav">
        <Logo />
        <div className={`nav-backdrop ${open ? "show" : ""}`} onClick={() => setOpen(false)} aria-hidden="true" />
        <nav aria-label="Main" id="nav-drawer" className={`nav-drawer ${open ? "open" : ""}`}>
          <div className="drawer-head"><span className="drawer-title">Menu</span><ThemeToggle className="theme-drawer" /></div>
          <ul className="nav-menu" id="nav-menu">
            {nav.map(item => item.children ? (
              <li key={item.to} className={`has-dropdown ${drop === item.to ? "open" : ""}`}
                onMouseEnter={() => canHover() && setDrop(item.to)}
                onMouseLeave={() => canHover() && setDrop(null)}>
                <button className={`nav-link ${pathname.startsWith(item.to) ? "active" : ""}`} aria-expanded={drop === item.to}
                  aria-haspopup="true" onClick={() => setDrop(d => (d === item.to ? null : item.to))}>
                  {item.label} <Icon name="chev" size={16} />
                </button>
                <ul className="dropdown">
                  {item.children.map(ch => <li key={ch.to + ch.label}><Link to={ch.to} onClick={closeMenus}>{ch.label}</Link></li>)}
                </ul>
              </li>
            ) : (
              <li key={item.to}><NavLink to={item.to} end={item.end} onClick={closeMenus}>{item.label}</NavLink></li>
            ))}
          </ul>
          <DrawerFooter />
        </nav>
        <div className="nav-cta">
          <QuickSearch />
          {settings.phone && <a href={telHref(settings.phone)} className="nav-phone" aria-label={`Call ${settings.phone}`}><span className="np-ic"><Icon name="tel" size={15} /></span><span className="np-num">{settings.phone}</span></a>}
          <ThemeToggle className="theme-desktop" />
          <Burger open={open} onClick={() => setOpen(o => !o)} controls="nav-drawer" />
        </div>
      </div>
    </header>
  );
}

function Footer() {
  const { settings, services, categories } = useData();
  const socials = Object.entries(settings.social || {}).filter(([, url]) => url);
  return (
    <footer className="site-footer">
      <div className="footer-glow" aria-hidden="true" />
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Logo light />
            <p className="footer-about">{settings.tagline}</p>
            <div className="footer-quick">
              {settings.phone && <a href={telHref(settings.phone)} className="fq-btn"><Icon name="tel" size={16} /> Call us</a>}
              <Link to="/contact#enquiry" className="fq-btn fq-primary">Send enquiry <Icon name="arrow" size={16} /></Link>
            </div>
            {socials.length > 0 && (
              <div className="socials" aria-label="Social media">
                {socials.map(([key, url]) => (
                  <a key={key} href={url} target="_blank" rel="noopener noreferrer" aria-label={SOCIAL_LABELS[key]}>{SOCIAL_LABELS[key][0]}</a>
                ))}
              </div>
            )}
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <ul className="footer-links">
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/batches">Upcoming Batches</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Courses</h4>
            <ul className="footer-links">
              {categories.slice(0, 5).map(c => <li key={c.id}><Link to={`/courses?cat=${c.id}#catalogue`}>{c.name}</Link></li>)}
              <li><Link to="/courses" className="fl-all">All courses</Link></li>
            </ul>
          </div>
          <div className="footer-col footer-services">
            <h4>Services</h4>
            <ul className="footer-links">{services.map(s => <li key={s.id}><Link to={`/services/${s.id}`}>{s.title}</Link></li>)}</ul>
          </div>
          <div className="footer-col footer-contact">
            <h4>Get in touch</h4>
            <ul className="contact-list">
              {settings.phone && <li><span className="cl-icon"><Icon name="tel" size={16} /></span><span><small>Phone</small><a href={telHref(settings.phone)}>{settings.phone}</a></span></li>}
              {settings.email && <li><span className="cl-icon"><Icon name="mail" size={16} /></span><span><small>Email</small><a href={`mailto:${settings.email}`}>{settings.email}</a></span></li>}
              {settings.address && <li><span className="cl-icon"><Icon name="pin" size={16} /></span><span><small>Address</small>{settings.address}</span></li>}
              {settings.hours && <li><span className="cl-icon"><Icon name="clock" size={16} /></span><span><small>Hours</small>{settings.hours}</span></li>}
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} {settings.name}. All rights reserved.</span>
          <nav aria-label="Legal"><Link to="/legal#privacy">Privacy Policy</Link><Link to="/legal#terms">Terms</Link></nav>
        </div>
      </div>
    </footer>
  );
}

/* Scroll behaviour on navigation:
   - link with #section → smooth-scroll to that section
   - new page (pathname changed) → start at the top
   - same page, only filters/hash changed (e.g. course tabs) → keep the current position */
function ScrollManager() {
  const { pathname, hash, key } = useLocation();
  const lastPath = useRef(pathname);
  useEffect(() => {
    const pageChanged = lastPath.current !== pathname;
    lastPath.current = pathname;
    if (hash) {
      const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
      return () => clearTimeout(t);
    }
    if (pageChanged) window.scrollTo(0, 0);
  }, [pathname, hash, key]);
  return null;
}

export default function Layout() {
  const { error, loading, refresh } = useData();
  useSpotlight();
  return (
    <>
      <ScrollFx />
      <a className="skip-link" href="#main">Skip to content</a>
      <ScrollManager />
      <Header />
      {!loading && error && (
        <div className="site-error" role="alert">
          <div className="container">We couldn't load the latest content ({error}). <button onClick={refresh}>Try again</button></div>
        </div>
      )}
      <main id="main"><Outlet /></main>
      <Footer />
    </>
  );
}
