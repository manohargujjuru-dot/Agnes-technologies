/* =========================================================
   Shared site script: layout, animations, forms, page logic
   ========================================================= */
(function () {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const params = new URLSearchParams(location.search);
  const page = document.body.dataset.page;
  const TODAY = new Date(); TODAY.setHours(0, 0, 0, 0);

  /* ---------- Icons ---------- */
  const P = {
    code: '<path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/>',
    phone: '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/>',
    laptop: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M2 20h20"/>',
    wrench: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M22 20c0-3-2-5.2-5-5.8"/>',
    headset: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="2" y="14" width="5" height="6" rx="2"/><rect x="17" y="14" width="5" height="6" rx="2"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    tel: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    pin: '<path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    chev: '<path d="M6 9l6 6 6-6"/>',
    alert: '<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
    heart: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
    grow: '<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>',
    bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
    star: '<path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    level: '<path d="M4 20V14M10 20V9M16 20V4"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'
  };
  const icon = (n, s = 22) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n] || ""}</svg>`;
  window.icon = icon;

  const catOf = id => CATEGORIES.find(c => c.id === id) || { name: id, color: "#4f46e5" };
  const courseById = id => COURSES.find(c => c.id === id);
  const svcById = id => SERVICES.find(s => s.id === id);
  const fmtDate = d => new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const weeksBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / (7 * 864e5));
  const batchStatus = b => (new Date(b.end + "T00:00:00") < TODAY ? "Completed" : b.status);
  const badgeFor = s => s === "Enrolling" ? "badge-green" : s === "Completed" ? "badge-gray" : "badge-amber";
  const TBC = '<span class="tbc">To be confirmed</span>';

  /* ---------- Illustrations (original inline SVG) ---------- */
  window.artHero = () => `
  <svg viewBox="0 0 500 440" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustration of a code editor, analytics chart and online class window">
    <defs><linearGradient id="hg" x1="0" x2="1"><stop offset="0" stop-color="#818cf8"/><stop offset="1" stop-color="#22d3ee"/></linearGradient></defs>
    <g opacity=".15" stroke="#fff">${Array.from({ length: 11 }, (_, i) => `<path d="M0 ${i * 44}H500M${i * 50} 0V440"/>`).join("")}</g>
    <rect x="50" y="60" width="260" height="190" rx="16" fill="#0f1329" stroke="#4f46e5"/>
    <circle cx="72" cy="80" r="5" fill="#f87171"/><circle cx="88" cy="80" r="5" fill="#fbbf24"/><circle cx="104" cy="80" r="5" fill="#34d399"/>
    <g stroke-linecap="round" stroke-width="8">
      <path d="M72 112h60" stroke="#818cf8"/><path d="M144 112h90" stroke="#22d3ee"/>
      <path d="M92 136h110" stroke="#a78bfa"/><path d="M92 160h70" stroke="#34d399"/><path d="M172 160h60" stroke="#818cf8"/>
      <path d="M92 184h130" stroke="#22d3ee" opacity=".7"/><path d="M72 208h50" stroke="#a78bfa"/>
    </g>
    <rect x="250" y="190" width="210" height="160" rx="16" fill="#fff"/>
    <text x="272" y="222" font-family="sans-serif" font-size="14" font-weight="700" fill="#141a33">Progress</text>
    <g fill="url(#hg)"><rect x="276" y="300" width="22" height="30" rx="4"/><rect x="310" y="278" width="22" height="52" rx="4"/><rect x="344" y="258" width="22" height="72" rx="4"/><rect x="378" y="240" width="22" height="90" rx="4"/><rect x="412" y="250" width="22" height="80" rx="4"/></g>
    <rect x="80" y="280" width="150" height="110" rx="16" fill="#1e1b4b" stroke="#22d3ee"/>
    <circle cx="155" cy="320" r="18" fill="#a5b4fc"/><path d="M125 370c0-18 14-28 30-28s30 10 30 28" fill="#a5b4fc"/>
    <rect x="96" y="292" width="40" height="10" rx="5" fill="#f87171"/>
    <circle cx="400" cy="100" r="46" fill="none" stroke="url(#hg)" stroke-width="12" stroke-dasharray="210 300" transform="rotate(-90 400 100)"/>
    <text x="400" y="106" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="800" fill="#fff">&lt;/&gt;</text>
  </svg>`;

  window.artTeam = () => `
  <svg viewBox="0 0 500 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustration of a team collaborating around a shared screen">
    <rect x="110" y="50" width="280" height="170" rx="14" fill="#0f1329" stroke="#818cf8"/>
    <g stroke-linecap="round" stroke-width="8"><path d="M140 90h120" stroke="#22d3ee"/><path d="M140 115h180" stroke="#a78bfa"/><path d="M140 140h90" stroke="#34d399"/></g>
    <rect x="270" y="135" width="90" height="60" rx="8" fill="#4f46e5"/><path d="M285 180l20-20 15 12 25-25" stroke="#fff" stroke-width="4" fill="none"/>
    <path d="M240 220v30M200 250h100" stroke="#a5b4fc" stroke-width="6" stroke-linecap="round"/>
    ${[[100, "#a5b4fc"], [200, "#67e8f9"], [300, "#f0abfc"], [400, "#fcd34d"]].map(([x, c]) => `<circle cx="${x}" cy="300" r="24" fill="${c}"/><path d="M${x - 40} 380c0-30 18-48 40-48s40 18 40 48" fill="${c}" opacity=".85"/>`).join("")}
  </svg>`;

  window.artApp = () => `
  <svg viewBox="0 0 500 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustration of mobile app screens">
    <rect x="150" y="40" width="150" height="300" rx="26" fill="#0f1329" stroke="#818cf8" stroke-width="3"/>
    <rect x="166" y="70" width="118" height="70" rx="10" fill="#4f46e5"/><rect x="166" y="152" width="54" height="54" rx="10" fill="#22d3ee"/><rect x="230" y="152" width="54" height="54" rx="10" fill="#a78bfa"/>
    <path d="M168 230h110M168 252h80M168 274h100" stroke="#a5b4fc" stroke-width="8" stroke-linecap="round"/>
    <rect x="320" y="100" width="120" height="220" rx="22" fill="#fff" opacity=".95"/><circle cx="380" cy="160" r="30" fill="#c7d2fe"/><path d="M340 220h80M340 242h60M340 264h70" stroke="#4f46e5" stroke-width="7" stroke-linecap="round"/>
    <rect x="50" y="130" width="85" height="160" rx="18" fill="#1e1b4b" stroke="#22d3ee"/><circle cx="92" cy="180" r="16" fill="#22d3ee"/><path d="M68 225h50M68 245h36" stroke="#67e8f9" stroke-width="6" stroke-linecap="round"/>
  </svg>`;

  window.artSupport = () => `
  <svg viewBox="0 0 500 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustration of server racks and a support agent">
    ${[0, 1, 2].map(i => `<rect x="${70 + i * 80}" y="80" width="64" height="230" rx="10" fill="#0f1329" stroke="#818cf8"/>${[0, 1, 2, 3, 4].map(j => `<rect x="${80 + i * 80}" y="${96 + j * 42}" width="44" height="28" rx="5" fill="#1e1b4b"/><circle cx="${116 + i * 80}" cy="${110 + j * 42}" r="4" fill="${j % 2 ? "#34d399" : "#22d3ee"}"/>`).join("")}`).join("")}
    <circle cx="390" cy="170" r="44" fill="#a5b4fc"/><path d="M330 320c0-50 26-80 60-80s60 30 60 80" fill="#a5b4fc"/>
    <path d="M350 170a40 40 0 0 1 80 0" stroke="#fff" stroke-width="6" fill="none"/><rect x="342" y="165" width="14" height="24" rx="5" fill="#fff"/><rect x="424" y="165" width="14" height="24" rx="5" fill="#fff"/>
  </svg>`;

  const artFor = svc => ({ "app-development": artApp, "it-support": artSupport, "technical-support": artSupport, "corporate-training": artTeam })[svc] || artHero;

  /* ---------- Header ---------- */
  const navItems = [
    { href: "index.html", label: "Home", key: "home" },
    { href: "about.html", label: "About Us", key: "about" },
    { label: "Services", key: "services", href: "services.html", children: [{ href: "services.html", label: "All Services" }].concat(SERVICES.map(s => ({ href: `service.html?s=${s.id}`, label: s.title }))) },
    { label: "Courses", key: "courses", href: "courses.html", children: [{ href: "courses.html", label: "All Courses" }].concat(CATEGORIES.map(c => ({ href: `courses.html?cat=${c.id}`, label: c.name }))) },
    { href: "batches.html", label: "Upcoming Batches", key: "batches" },
    { href: "contact.html", label: "Contact", key: "contact" }
  ];
  const active = { home: "home", about: "about", services: "services", service: "services", courses: "courses", course: "courses", batches: "batches", contact: "contact" }[page];

  const header = document.getElementById("site-header");
  if (header) {
    header.className = "site-header";
    header.innerHTML = `
    <div class="demo-bar"><strong>Demo preview</strong> — placeholder brand &amp; sample data. Items marked “To be confirmed” need management approval.</div>
    <div class="container nav">
      <a href="index.html" class="logo" aria-label="${esc(SITE.name)} home"><span class="logo-mark">${SITE.short}</span>${esc(SITE.name.split(" ")[0])}</a>
      <nav aria-label="Main">
        <ul class="nav-menu" id="nav-menu">
          ${navItems.map(n => n.children ? `
            <li class="has-dropdown">
              <button class="nav-link ${active === n.key ? "active" : ""}" aria-expanded="false" aria-haspopup="true">${n.label} ${icon("chev", 16)}</button>
              <ul class="dropdown">${n.children.map(c => `<li><a href="${c.href}">${esc(c.label)}</a></li>`).join("")}</ul>
            </li>` : `<li><a href="${n.href}" class="${active === n.key ? "active" : ""}" ${active === n.key ? 'aria-current="page"' : ""}>${n.label}</a></li>`).join("")}
          <li class="mobile-cta"><a href="contact.html" class="btn btn-primary" style="justify-content:center">Enquire Now</a></li>
        </ul>
      </nav>
      <div class="nav-cta">
        <a href="contact.html" class="btn btn-primary btn-sm">Enquire Now</a>
        <button class="menu-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="nav-menu">${icon("menu")}</button>
      </div>
    </div>`;

    const menu = $("#nav-menu"), toggle = $(".menu-toggle");
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      toggle.innerHTML = icon(open ? "x" : "menu");
      document.body.style.overflow = open ? "hidden" : "";
    });
    $$(".has-dropdown > button").forEach(b => b.addEventListener("click", () => {
      const li = b.parentElement, open = !li.classList.contains("open");
      $$(".has-dropdown").forEach(x => { x.classList.remove("open"); x.firstElementChild.setAttribute("aria-expanded", "false"); });
      li.classList.toggle("open", open); b.setAttribute("aria-expanded", open);
    }));
    document.addEventListener("click", e => { if (!e.target.closest(".has-dropdown")) $$(".has-dropdown").forEach(x => x.classList.remove("open")); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") { $$(".has-dropdown").forEach(x => x.classList.remove("open")); if (menu.classList.contains("open")) toggle.click(); } });
    const onScroll = () => header.classList.toggle("scrolled", scrollY > 8);
    addEventListener("scroll", onScroll, { passive: true }); onScroll();
  }

  /* ---------- Footer ---------- */
  const footer = document.getElementById("site-footer");
  if (footer) {
    footer.className = "site-footer";
    footer.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div>
          <a href="index.html" class="logo"><span class="logo-mark">${SITE.short}</span>${esc(SITE.name.split(" ")[0])}</a>
          <p>${esc(SITE.tagline)}</p>
          <div class="socials" aria-label="Social media">
            <a href="#" aria-label="LinkedIn (link to be confirmed)"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 9h4v11H4zM6 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM10 9h4v1.6c.6-1 1.9-1.9 3.6-1.9 3.4 0 4.4 2 4.4 5.4V20h-4v-5.3c0-1.4-.3-2.7-1.8-2.7-1.6 0-2.2 1.1-2.2 2.7V20h-4z"/></svg></a>
            <a href="#" aria-label="Facebook (link to be confirmed)"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H8v4h2v8h4v-8h3l1-4h-4V8.5c0-.3.2-.5.5-.5z"/></svg></a>
            <a href="#" aria-label="X (link to be confirmed)"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 3h5l4.5 6.3L18 3h3l-7.2 8.2L21.5 21h-5l-5-6.8L5.5 21h-3l7.7-8.8z"/></svg></a>
            <a href="#" aria-label="YouTube (link to be confirmed)"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 8.2a3 3 0 0 0-2.1-2.1C18 5.6 12 5.6 12 5.6s-6 0-7.9.5A3 3 0 0 0 2 8.2 31 31 0 0 0 1.6 12 31 31 0 0 0 2 15.8a3 3 0 0 0 2.1 2.1c1.9.5 7.9.5 7.9.5s6 0 7.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .4-3.8 31 31 0 0 0-.4-3.8zM10 15V9l5.2 3z"/></svg></a>
          </div>
        </div>
        <div><h4>Company</h4><ul><li><a href="about.html">About Us</a></li><li><a href="batches.html">Upcoming Batches</a></li><li><a href="contact.html">Contact</a></li><li><a href="legal.html#privacy">Privacy Policy</a></li></ul></div>
        <div><h4>Services</h4><ul>${SERVICES.map(s => `<li><a href="service.html?s=${s.id}">${esc(s.title)}</a></li>`).join("")}</ul></div>
        <div><h4>Courses</h4><ul>${CATEGORIES.slice(0, 6).map(c => `<li><a href="courses.html?cat=${c.id}">${esc(c.name)}</a></li>`).join("")}<li><a href="courses.html">All courses →</a></li></ul></div>
        <div><h4>Get in touch</h4><ul>
          <li style="display:flex;gap:10px">${icon("tel", 18)}<a href="tel:${SITE.phone.replace(/\s/g, "")}">${esc(SITE.phone)}</a></li>
          <li style="display:flex;gap:10px">${icon("mail", 18)}<a href="mailto:${SITE.email}">${esc(SITE.email)}</a></li>
          <li style="display:flex;gap:10px">${icon("pin", 18)}<span>${esc(SITE.address)}</span></li>
        </ul></div>
      </div>
      <div class="footer-bottom">
        <span>© ${new Date().getFullYear()} ${esc(SITE.name)}. All rights reserved.</span>
        <nav aria-label="Legal"><a href="legal.html#privacy">Privacy Policy</a><a href="legal.html#terms">Terms</a><a href="sitemap.xml">Sitemap</a></nav>
      </div>
    </div>`;
  }

  /* ---------- Reusable renderers ---------- */
  const serviceCard = s => `
    <article class="card hover reveal">
      <div class="icon-box">${icon(s.icon, 26)}</div>
      <h3>${esc(s.title)}</h3>
      <p>${esc(s.short)}</p>
      <a class="link-arrow" href="service.html?s=${s.id}">Learn More ${icon("arrow", 16)}</a>
    </article>`;

  const courseCard = c => {
    const cat = catOf(c.cat);
    return `
    <article class="card hover course-card reveal">
      <div class="course-thumb" style="background:linear-gradient(135deg, ${cat.color}, ${cat.color}bb)">
        <span class="badge">${esc(cat.name)}</span>
        <span class="c-logo" aria-hidden="true">${esc(c.logo)}</span>
      </div>
      <div class="course-body">
        <h3>${esc(c.title)}</h3>
        <div class="course-facts"><span>${icon("clock", 16)} ${c.weeks} weeks</span><span>${icon("level", 16)} Level: TBC</span></div>
        <p>${esc(c.summary)}</p>
        <div class="course-actions">
          <a class="btn btn-outline btn-sm" href="course.html?id=${c.id}">View Details</a>
          <a class="btn btn-primary btn-sm" href="contact.html?type=course&course=${c.id}#enquiry">Enquire Now</a>
        </div>
      </div>
    </article>`;
  };

  const batchCard = b => {
    const st = batchStatus(b);
    const enrol = st === "Enrolling";
    return `
    <article class="card batch-card reveal">
      <div class="batch-top">
        <span class="tool-logo" style="background:${b.color}" aria-hidden="true">${esc(b.logo)}</span>
        <div><h3>${esc(b.title)}</h3><span class="badge ${badgeFor(st)}">${st}</span></div>
        <span class="sample-tag">SAMPLE</span>
      </div>
      <p style="font-size:.92rem">${esc(b.desc)}</p>
      <ul class="batch-meta">
        <li><span>Batch code</span><span>${esc(b.code)}</span></li>
        <li><span>Start date</span><span>${fmtDate(b.start)}</span></li>
        <li><span>Days</span><span>${esc(b.days)}</span></li>
        <li><span>Time</span><span>${esc(b.time)} ${esc(b.tz)}</span></li>
        <li><span>Duration</span><span>${weeksBetween(b.start, b.end)} weeks</span></li>
        <li><span>Mode</span><span>${esc(b.mode)}</span></li>
      </ul>
      ${enrol
        ? `<a class="btn btn-primary" href="contact.html?type=course&batch=${b.code}${b.course ? `&course=${b.course}` : ""}#enquiry">Enrol Now</a>`
        : `<button class="btn btn-outline" disabled>${st}</button>`}
      ${b.course ? `<a class="link-arrow" style="margin-top:12px;justify-content:center" href="course.html?id=${b.course}">View course syllabus ${icon("arrow", 16)}</a>` : ""}
    </article>`;
  };
  const upcoming = () => BATCHES.filter(b => batchStatus(b) !== "Completed");

  const stepsHTML = arr => `<div class="steps" style="--n:${arr.length}">${arr.map(s => `<div class="step reveal"><h3>${esc(s)}</h3></div>`).join("")}</div>`;

  /* ---------- Forms ---------- */
  const F = {
    text: (name, label, o = {}) => `<div class="field ${o.full ? "full" : ""}"><label for="f-${name}">${label}${o.req ? ' <span class="req">*</span>' : o.opt ? ' <span class="opt">(optional)</span>' : ""}</label><input id="f-${name}" name="${name}" type="${o.type || "text"}" ${o.req ? "required" : ""} ${o.auto ? `autocomplete="${o.auto}"` : ""} ${o.value ? `value="${esc(o.value)}"` : ""} ${o.ph ? `placeholder="${esc(o.ph)}"` : ""} ${o.min ? `min="${o.min}"` : ""}><span class="err" role="alert"></span></div>`,
    select: (name, label, opts, o = {}) => `<div class="field ${o.full ? "full" : ""}"><label for="f-${name}">${label}${o.req ? ' <span class="req">*</span>' : o.opt ? ' <span class="opt">(optional)</span>' : ""}</label><select id="f-${name}" name="${name}" ${o.req ? "required" : ""}><option value="">Select…</option>${opts.map(v => { const [val, lab] = Array.isArray(v) ? v : [v, v]; return `<option value="${esc(val)}" ${o.value === val ? "selected" : ""}>${esc(lab)}</option>`; }).join("")}</select><span class="err" role="alert"></span></div>`,
    area: (name, label, o = {}) => `<div class="field full"><label for="f-${name}">${label}${o.req ? ' <span class="req">*</span>' : ""}</label><textarea id="f-${name}" name="${name}" ${o.req ? "required" : ""} ${o.ph ? `placeholder="${esc(o.ph)}"` : ""}></textarea><span class="err" role="alert"></span></div>`,
    consent: () => `<div class="field full"><label class="checkbox"><input type="checkbox" name="consent" required> <span>I agree to be contacted about my enquiry and accept the <a href="legal.html#privacy" target="_blank">Privacy Policy</a>. <span class="req">*</span></span></label><span class="err" role="alert"></span></div>`,
    base: (nameLabel = "Name") => F.text("name", nameLabel, { req: true, auto: "name" }) + F.text("email", "Email Address", { req: true, type: "email", auto: "email" }) + F.text("phone", "Phone Number", { type: "tel", auto: "tel", req: true })
  };
  const courseOptions = COURSES.map(c => [c.id, c.title]).concat([["devops", "DevOps"], ["power-bi", "Microsoft Power BI"], ["other", "Other / not sure"]]);
  const levels = ["Beginner", "Intermediate", "Advanced"];
  const modes = ["Online", "Classroom", "Either"];
  const budget = ["Under 1,000", "1,000 – 5,000", "5,000 – 15,000", "15,000+", "Not sure yet"];
  const timeline = ["ASAP", "1–3 months", "3–6 months", "Flexible"];

  const formBodies = {
    general: () => {
      const pre = params.get("type");
      return F.base() +
        F.select("help", "How Can We Help?", [["web", "Website Development"], ["app", "App Development"], ["training", "Online Training"], ["support", "IT Support"], ["corporate", "Corporate Training"], ["general", "General Enquiry"]], { req: true, value: pre === "course" ? "training" : pre }) +
        `<div class="cond-fields" data-when="web" hidden>${F.select("websiteType", "Website Type", ["Business Website", "E-commerce", "Blog", "Web App", "Landing Page", "Other"])}${F.select("budget", "Budget", budget, { opt: true })}</div>` +
        `<div class="cond-fields" data-when="app" hidden>${F.select("platform", "Platform", ["Android", "iOS", "Windows", "Cross-platform", "Other"])}${F.select("timeline", "Timeline", timeline, { opt: true })}</div>` +
        `<div class="cond-fields" data-when="training" hidden>${F.select("course", "Course of Interest", courseOptions, { value: params.get("course") })}${F.select("level", "Current Skill Level", levels)}</div>` +
        `<div class="cond-fields" data-when="support" hidden>${F.select("supportType", "Support Type", ["Technology consulting", "Troubleshooting", "Technical assistance", "System / software support", "Maintenance"])}${F.select("urgency", "Urgency", ["Low", "Medium", "High"])}</div>` +
        `<div class="cond-fields" data-when="corporate" hidden>${F.text("org", "Organisation")}${F.text("participants", "Number of Participants", { type: "number", min: 1 })}</div>` +
        F.area("message", "Message", { req: true }) + F.consent();
    },
    contact: () => {
      const t = params.get("type");
      const typeMap = { course: "Course Enquiry", web: "Web Development", app: "App Development", training: "Online Training", support: "IT Support", corporate: "Corporate Training" };
      const c = courseById(params.get("course"));
      const batch = params.get("batch");
      return F.text("name", "Full Name", { req: true, auto: "name" }) + F.text("email", "Email", { req: true, type: "email", auto: "email" }) +
        F.text("phone", "Phone", { type: "tel", auto: "tel" }) +
        F.text("subject", "Subject", { value: batch ? `Batch enquiry: ${batch}` : c ? `Course enquiry: ${c.title}` : "" }) +
        F.select("enquiryType", "Enquiry Type", ["General", "Web Development", "App Development", "Online Training", "IT Support", "Corporate Training", "Course Enquiry"], { req: true, value: typeMap[t] || "" }) +
        `<div class="cond-fields" data-when-type="Course Enquiry" ${t === "course" ? "" : "hidden"}>${F.select("course", "Course", courseOptions, { value: c ? c.id : (batch && /DEVOPS/.test(batch) ? "devops" : batch && /PBI/.test(batch) ? "power-bi" : "") })}${F.text("batch", "Preferred Batch / Time", { value: batch || "" })}</div>` +
        F.area("message", "Message", { req: true }) + F.consent();
    },
    course: (c) => F.text("name", "Full Name", { req: true, auto: "name" }) + F.text("email", "Email", { req: true, type: "email", auto: "email" }) +
      F.text("phone", "Phone", { req: true, type: "tel", auto: "tel" }) + F.select("course", "Course", courseOptions, { req: true, value: c.id }) +
      F.select("batch", "Preferred Batch / Time", ["Weekday mornings", "Weekday evenings", "Weekends", "Flexible"]) + F.select("mode", "Training Mode", modes) +
      F.select("level", "Current Skill Level", levels) + `<div class="field"></div>` + F.area("message", "Message") + F.consent(),
    web: () => F.base() + F.select("websiteType", "Website Type", ["Business Website", "E-commerce", "Blog", "Web App", "Landing Page", "Other"], { req: true }) +
      F.text("features", "Required Features", { ph: "e.g. booking, payments, CMS" }) + F.select("budget", "Budget", budget, { opt: true }) + F.select("timeline", "Timeline", timeline, { opt: true }) +
      F.area("message", "Project Description", { req: true }) + F.consent(),
    app: () => F.base() + F.select("platform", "Platform", ["Android", "iOS", "Windows", "Cross-platform", "Other"], { req: true }) +
      F.text("appType", "App Type", { ph: "e.g. booking, e-commerce, internal tool" }) + F.text("features", "Key Features", { full: true }) +
      F.select("budget", "Budget", budget, { opt: true }) + F.select("timeline", "Timeline", timeline, { opt: true }) +
      F.area("message", "Project Description", { req: true }) + F.consent(),
    training: () => F.base() + F.select("course", "Course of Interest", courseOptions, { req: true }) +
      F.select("schedule", "Preferred Schedule", ["Weekday mornings", "Weekday evenings", "Weekends", "Flexible"]) +
      F.select("level", "Current Skill Level", levels) + F.select("mode", "Mode", modes) + F.area("message", "Message") + F.consent(),
    support: () => F.text("name", "Name", { req: true, auto: "name" }) + F.text("org", "Organisation", { auto: "organization" }) +
      F.text("email", "Email", { req: true, type: "email", auto: "email" }) + F.text("phone", "Phone", { req: true, type: "tel", auto: "tel" }) +
      F.select("supportType", "Support Type", ["Technology consulting", "Troubleshooting", "Technical assistance", "System / software support", "Maintenance"], { req: true }) +
      F.select("urgency", "Urgency", ["Low", "Medium", "High", "Critical"], { req: true }) +
      F.select("contactMethod", "Preferred Contact Method", ["Email", "Phone", "Either"]) + `<div class="field"></div>` +
      F.area("message", "Issue Description", { req: true }) + F.consent(),
    corporate: () => F.text("name", "Contact Name", { req: true, auto: "name" }) + F.text("org", "Organisation", { req: true, auto: "organization" }) +
      F.text("email", "Email", { req: true, type: "email", auto: "email" }) + F.text("phone", "Phone", { req: true, type: "tel", auto: "tel" }) +
      F.select("area", "Training Area", CATEGORIES.map(c => c.name).concat(["Soft skills", "Other"]), { req: true }) +
      F.text("participants", "Number of Participants", { type: "number", min: 1 }) + F.select("mode", "Preferred Mode", ["Online", "Classroom", "Hybrid"]) +
      F.text("dates", "Expected Dates", { ph: "e.g. Feb 2027" }) + F.area("message", "Message") + F.consent()
  };

  const formHTML = (kind, arg, btn = "Send Enquiry") => `
    <form class="enquiry-form" novalidate data-kind="${kind}">
      <div class="form-grid">${formBodies[kind](arg)}</div>
      <input type="text" name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
      <div style="margin-top:22px"><button type="submit" class="btn btn-primary">${esc(btn)}</button></div>
      <div class="form-status" role="status" aria-live="polite"></div>
    </form>`;

  function wireForm(form) {
    // conditional fields (home form)
    const help = form.querySelector('[name="help"]');
    const syncHelp = () => $$("[data-when]", form).forEach(g => { g.hidden = g.dataset.when !== help.value; });
    if (help) { help.addEventListener("change", syncHelp); syncHelp(); }
    const et = form.querySelector('[name="enquiryType"]');
    if (et) et.addEventListener("change", () => $$("[data-when-type]", form).forEach(g => { g.hidden = g.dataset.whenType !== et.value; }));

    const validate = el => {
      const f = el.closest(".field"); if (!f) return true;
      let msg = "";
      const v = el.type === "checkbox" ? el.checked : el.value.trim();
      if (el.closest("[hidden]")) msg = "";
      else if (el.required && !v) msg = el.type === "checkbox" ? "Please accept to continue." : "This field is required.";
      else if (v && el.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) msg = "Please enter a valid email address.";
      else if (v && el.type === "tel" && !/^[+]?[\d\s()-]{7,18}$/.test(v)) msg = "Please enter a valid phone number.";
      f.classList.toggle("invalid", !!msg);
      el.setAttribute("aria-invalid", !!msg);
      f.querySelector(".err").textContent = msg;
      return !msg;
    };
    $$("input, select, textarea", form).forEach(el => {
      el.addEventListener("blur", () => validate(el));
      el.addEventListener("input", () => el.closest(".field.invalid") && validate(el));
    });

    form.addEventListener("submit", e => {
      e.preventDefault();
      const status = form.querySelector(".form-status");
      const btn = form.querySelector('button[type="submit"]');
      if (btn.disabled) return; // duplicate-submit guard
      const fields = $$("input:not(.hp), select, textarea", form);
      const ok = fields.map(validate).every(Boolean);
      if (!ok) { status.className = "form-status error"; status.textContent = "Please fix the highlighted fields."; fields.find(f => f.getAttribute("aria-invalid") === "true")?.focus(); return; }
      if (form.website.value) return; // honeypot
      const label = btn.innerHTML;
      btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Sending…';
      status.className = "form-status";
      // DEMO: simulate network request. Replace with a real POST to the backend.
      setTimeout(() => {
        btn.disabled = false; btn.innerHTML = label;
        if (form.querySelector('[name="name"]').value.trim().toLowerCase() === "error") {
          status.className = "form-status error";
          status.innerHTML = 'Something went wrong sending your enquiry. Please try again. <button type="submit" class="btn btn-sm btn-outline" style="margin-left:8px">Retry</button>';
          return;
        }
        status.className = "form-status success";
        status.textContent = "Thank you! Your enquiry has been received. (Demo mode — nothing was actually sent.)";
        form.reset(); $$("[data-when]", form).forEach(g => g.hidden = true);
      }, 1200);
    });
  }

  /* ---------- Page renderers ---------- */
  const R = {};

  R.home = () => {
    $("#services-grid").innerHTML = SERVICES.map(serviceCard).join("");
    $("#tools-grid").innerHTML = TOOLS.map(t => `
      <a class="tool-card reveal" href="${t.course ? `course.html?id=${t.course}` : "courses.html"}">
        <span class="tool-logo" style="background:${t.color}" aria-hidden="true">${t.logo}</span>
        <span><strong>${esc(t.name)}</strong><span>${esc(t.cat)}</span></span>
      </a>`).join("");
    const featured = upcoming().filter(b => ["AWS-SA", "DEVOPS", "PBI"].some(k => b.code.startsWith(k)));
    $("#batches-grid").innerHTML = featured.length ? featured.map(batchCard).join("") : `<p class="muted">No batches are currently scheduled. <a href="contact.html">Ask us about the next intake.</a></p>`;
    $("#home-form").innerHTML = formHTML("general");
  };

  R.services = () => { $("#services-grid").innerHTML = SERVICES.map(serviceCard).join(""); };

  R.service = () => {
    const s = svcById(params.get("s")) || SERVICES[0];
    document.title = `${s.title} | ${SITE.name}`;
    $("#crumb").textContent = s.title;
    $("#svc-title").textContent = s.hero;
    $("#svc-eyebrow").textContent = s.title;
    $("#svc-lead").textContent = s.short;
    const cta = $("#svc-cta"); cta.textContent = s.cta; cta.href = s.ctaHref || "#enquiry";
    $("#svc-art").innerHTML = artFor(s.id)();
    $("#svc-types-title").textContent = s.typesTitle;
    $("#svc-types").innerHTML = s.types.map(t => `<div class="card hover reveal"><div class="icon-box">${icon(s.icon, 24)}</div><h3 style="margin:0">${esc(t)}</h3></div>`).join("");
    $("#svc-caps-title").textContent = s.capsTitle;
    $("#svc-caps").innerHTML = s.caps.map(c => `<li>${esc(c)}</li>`).join("");
    if (s.id === "online-training") {
      $("#svc-extra").innerHTML = `
        <div class="section-head reveal"><span class="eyebrow">Upcoming batches</span><h2>Currently open for enrolment</h2></div>
        <div class="grid grid-3">${upcoming().map(batchCard).join("")}</div>
        <div style="text-align:center;margin-top:32px"><a class="btn btn-outline" href="courses.html">Browse full catalogue</a></div>`;
    }
    if (s.process) { $("#svc-process").innerHTML = `<div class="section-head reveal"><span class="eyebrow">Our process</span><h2>How we work</h2></div>${stepsHTML(s.process)}`; }
    else $("#svc-process-wrap").remove();
    if (s.id === "technical-support" || s.id === "it-support") {
      $("#svc-note").innerHTML = `<div class="notice">${icon("alert", 20)}<span>Support hours, response times and any 24/7 availability will only be shown once verified by management.</span></div>`;
    }
    $("#svc-form-title").textContent = s.cta;
    $("#svc-form").innerHTML = formHTML(s.form, null, s.cta === "Explore Courses" ? "Send Enquiry" : s.cta);
  };

  R.courses = () => {
    const tabs = $("#cat-tabs"), grid = $("#course-grid"), search = $("#course-search"), dur = $("#dur-filter");
    let cat = params.get("cat") || "all";
    const q0 = params.get("q"); if (q0) search.value = q0;
    tabs.innerHTML = [{ id: "all", name: "All" }].concat(CATEGORIES).map(c => {
      const n = c.id === "all" ? COURSES.length : COURSES.filter(x => x.cat === c.id).length;
      return `<button class="tab" role="tab" data-cat="${c.id}" aria-selected="${c.id === cat}">${esc(c.name)}<span class="count">${n}</span></button>`;
    }).join("");
    const render = () => {
      const q = search.value.trim().toLowerCase();
      search.parentElement.classList.toggle("has-value", !!q);
      const list = COURSES.filter(c => (cat === "all" || c.cat === cat) && (!dur.value || c.weeks === +dur.value) &&
        (!q || (c.title + " " + c.tags + " " + catOf(c.cat).name).toLowerCase().includes(q)));
      grid.innerHTML = list.map(courseCard).join("");
      $("#result-count").textContent = `${list.length} course${list.length === 1 ? "" : "s"}`;
      $("#empty").classList.toggle("show", !list.length);
      observeReveals();
      const u = new URL(location); cat === "all" ? u.searchParams.delete("cat") : u.searchParams.set("cat", cat);
      q ? u.searchParams.set("q", q) : u.searchParams.delete("q");
      try { history.replaceState(null, "", u); } catch (_) { /* file:// in some browsers */ }
    };
    tabs.addEventListener("click", e => { const b = e.target.closest(".tab"); if (!b) return; cat = b.dataset.cat; $$(".tab", tabs).forEach(t => t.setAttribute("aria-selected", t === b)); render(); });
    search.addEventListener("input", render);
    dur.addEventListener("change", render);
    $(".s-clear").addEventListener("click", () => { search.value = ""; search.focus(); render(); });
    $("#clear-filters").addEventListener("click", () => { search.value = ""; dur.value = ""; cat = "all"; $$(".tab", tabs).forEach(t => t.setAttribute("aria-selected", t.dataset.cat === "all")); render(); });
    render();
  };

  R.course = () => {
    const c = courseById(params.get("id")) || COURSES[0];
    const cat = catOf(c.cat);
    document.title = `${c.title} Course | ${SITE.name}`;
    $('meta[name="description"]').setAttribute("content", `${c.title} training — ${c.summary}`);
    $("#crumb-cat").innerHTML = `<a href="courses.html?cat=${c.cat}">${esc(cat.name)}</a>`;
    $("#crumb").textContent = c.title;
    $("#c-eyebrow").textContent = cat.name;
    $("#c-title").textContent = c.title;
    $("#c-lead").textContent = c.summary;
    $("#c-art").style.background = `linear-gradient(135deg, ${cat.color}, #1e1b4b)`;
    $("#c-art").innerHTML = `<div style="height:100%;display:grid;place-items:center"><span class="c-logo" style="width:120px;height:120px;border-radius:28px;font-size:2.2rem;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);display:grid;place-items:center;color:#fff;font-weight:800;font-family:var(--font-head)">${esc(c.logo)}</span></div>`;
    if (c.flag) $("#c-flag").innerHTML = `<div class="notice" style="margin-top:20px">${icon("alert", 20)}<span>${esc(c.flag)}</span></div>`;
    $("#c-facts").innerHTML = [
      ["Category", esc(cat.name)], ["Duration", `${c.weeks} weeks`], ["Sessions / hours", TBC], ["Skill level", TBC],
      ["Delivery mode", TBC], ["Schedule", TBC], ["Language", TBC], ["Prerequisites", TBC]
    ].map(([k, v]) => `<li><span>${k}</span><span>${v}</span></li>`).join("");
    $("#c-enquire").href = `#enquiry`;
    const related = COURSES.filter(x => x.cat === c.cat && x.id !== c.id).slice(0, 3);
    $("#related").innerHTML = related.map(courseCard).join("") || '<p class="muted">No related courses.</p>';
    const bs = upcoming().filter(b => b.course === c.id);
    $("#c-batches").innerHTML = bs.length ? `<div class="grid grid-2">${bs.map(batchCard).join("")}</div>` : `<p class="muted">No batches are currently scheduled for this course. <a href="#enquiry">Enquire</a> to be notified of the next intake.</p>`;
    $("#course-form").innerHTML = formHTML("course", c);
  };

  R.batches = () => {
    const up = upcoming(), past = BATCHES.filter(b => batchStatus(b) === "Completed");
    $("#batch-grid").innerHTML = up.length ? up.map(batchCard).join("") : '<p class="muted">No batches currently open.</p>';
    $("#past-grid").innerHTML = past.length ? past.map(batchCard).join("") : '<p class="muted">No archived batches.</p>';
  };

  R.contact = () => {
    $("#c-phone").innerHTML = `<a href="tel:${SITE.phone.replace(/\s/g, "")}">${esc(SITE.phone)}</a>`;
    $("#c-email").innerHTML = `<a href="mailto:${SITE.email}">${esc(SITE.email)}</a>`;
    $("#c-address").textContent = SITE.address;
    $("#c-hours").textContent = SITE.hours;
    $("#contact-form").innerHTML = formHTML("contact");
  };

  R.about = () => {};

  (R[page] || (() => {}))();
  $$("form.enquiry-form").forEach(wireForm);
  $$("[data-art]").forEach(el => { el.innerHTML = window[el.dataset.art](); });

  /* ---------- Scroll reveal with stagger ---------- */
  let io;
  function observeReveals() {
    const els = $$(".reveal:not(.in)");
    if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) { els.forEach(e => e.classList.add("in")); return; }
    io = io || new IntersectionObserver(entries => {
      entries.filter(en => en.isIntersecting).forEach((en, i) => {
        en.target.style.transitionDelay = `${Math.min(i * 80, 400)}ms`;
        en.target.classList.add("in");
        io.unobserve(en.target);
      });
    }, { threshold: .12, rootMargin: "0px 0px -40px 0px" });
    els.forEach(e => io.observe(e));
  }
  observeReveals();
})();
