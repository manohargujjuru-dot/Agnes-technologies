/* Database row <-> API object conversion, and column lists shared by INSERT/UPDATE queries. */

export const toCourse = r => r && ({
  id: r.id, title: r.title, category: r.category, weeks: r.weeks, logo: r.logo, icon: r.icon || "",
  summary: r.summary, level: r.level, mode: r.mode, schedule: r.schedule, prerequisites: r.prerequisites,
  audience: r.audience, overview: r.overview, outcomes: r.outcomes || [], modules: r.modules || [],
  tools: r.tools, flag: r.flag, published: r.published, updatedAt: r.updated_at
});

export const toBatch = r => r && ({
  id: r.id, code: r.code, title: r.title, courseId: r.course_id || "", logo: r.logo, start: r.start_date, end: r.end_date,
  days: r.days, time: r.class_time, tz: r.tz, mode: r.mode, status: r.status, desc: r.description, featured: r.featured
});

export const toEnquiry = r => r && ({
  ...(r.payload || {}), id: r.id, kind: r.kind, source: r.source, name: r.name, email: r.email, phone: r.phone,
  read: r.is_read, date: new Date(r.created_at).toISOString()
});

export const toCategory = r => r && ({ id: r.id, name: r.name, sort: r.sort, courseCount: r.course_count !== undefined ? Number(r.course_count) : undefined });

export const toService = r => r && ({
  id: r.id, title: r.title, icon: r.icon, short: r.short, hero: r.hero, cta: r.cta, ctaLink: r.cta_link, image: r.image,
  typesTitle: r.types_title, types: r.types || [], capsTitle: r.caps_title, caps: r.caps || [], process: r.process || [],
  formKind: r.form_kind, showBatches: r.show_batches, showNote: r.show_note, published: r.published, sort: r.sort
});

export const toTechnology = r => r && ({
  id: r.id, name: r.name, label: r.label, icon: r.icon, logoText: r.logo_text, courseId: r.course_id || "",
  published: r.published, sort: r.sort
});

/* ---- column lists + value arrays (same order) ---- */
export const COURSE_COLS = ["title", "category", "weeks", "logo", "icon", "summary", "level", "mode", "schedule", "prerequisites", "audience", "overview", "outcomes", "modules", "tools", "flag", "published"];
export const courseValues = c => [c.title, c.category, c.weeks, c.logo || "", c.icon || "", c.summary || "", c.level || "", c.mode || "",
  c.schedule || "", c.prerequisites || "", c.audience || "", c.overview || "", JSON.stringify(c.outcomes || []),
  JSON.stringify(c.modules || []), c.tools || "", c.flag || "", c.published !== false];

export const BATCH_COLS = ["code", "title", "course_id", "logo", "start_date", "end_date", "days", "class_time", "tz", "mode", "status", "description", "featured"];
export const batchValues = b => [b.code, b.title, b.courseId || null, b.logo || "", b.start, b.end, b.days || "", b.time || "",
  b.tz || "", b.mode || "", b.status || "Enrolling", b.desc || "", !!b.featured];

export const SERVICE_COLS = ["title", "icon", "short", "hero", "cta", "cta_link", "image", "types_title", "types", "caps_title", "caps", "process", "form_kind", "show_batches", "show_note", "published"];
export const serviceValues = s => [s.title, s.icon, s.short || "", s.hero || "", s.cta || "", s.ctaLink || "", s.image || "",
  s.typesTitle || "", JSON.stringify(s.types || []), s.capsTitle || "", JSON.stringify(s.caps || []), JSON.stringify(s.process || []),
  s.formKind || "general", !!s.showBatches, !!s.showNote, s.published !== false];

export const TECH_COLS = ["name", "label", "icon", "logo_text", "course_id", "published"];
export const techValues = t => [t.name, t.label || "", t.icon || "", t.logoText || "", t.courseId || null, t.published !== false];

/* SQL helpers */
export const placeholders = (n, start = 1) => Array.from({ length: n }, (_, i) => `$${i + start}`).join(", ");
export const setList = (cols, start = 1) => cols.map((c, i) => `${c} = $${i + start}`).join(", ");
