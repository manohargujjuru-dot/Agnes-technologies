/* Server-side validation. Every write goes through one of these; they return { errors, value }. */
import { LOGOS } from "../src/data/logos.js";
import { IMAGES } from "../src/data/images.js";
import { BATCH_STATUSES, ENQUIRY_KINDS, FORM_KINDS, LEVELS, MODES, SERVICE_ICONS } from "../src/data/constants.js";

const str = (v, max = 500) => (v == null ? "" : String(v).trim().slice(0, max));
const list = (v, maxItems, maxLen = 200) => (Array.isArray(v) ? v : []).map(x => str(x, maxLen)).filter(Boolean).slice(0, maxItems);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[+]?[\d\s()-]{7,20}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const SLUG = /^[a-z0-9-]+$/;
const URL_RE = /^https:\/\/[^\s]+$/;

export const slugify = s => str(s, 200).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);
export const hasErrors = errors => Object.keys(errors).length > 0;
const shortText = title => title.replace(/[^A-Za-z0-9]/g, "").slice(0, 2).toUpperCase();

export function validateCourse(input = {}) {
  const errors = {};
  const c = {
    title: str(input.title, 120),
    category: str(input.category, 40),
    weeks: Number.parseInt(input.weeks, 10),
    logo: str(input.logo, 4).toUpperCase(),
    icon: str(input.icon, 40),
    summary: str(input.summary, 400),
    level: str(input.level, 30),
    mode: str(input.mode, 40),
    schedule: str(input.schedule, 120),
    prerequisites: str(input.prerequisites, 500),
    audience: str(input.audience, 300),
    overview: str(input.overview, 5000),
    tools: str(input.tools, 300),
    flag: str(input.flag, 300),
    published: input.published === undefined ? true : !!input.published,
    outcomes: list(input.outcomes, 30, 300),
    modules: (Array.isArray(input.modules) ? input.modules : []).slice(0, 40)
      .map(m => ({ title: str(m?.title, 150), topics: list(m?.topics, 40) }))
      .filter(m => m.title)
  };
  if (!c.title) errors.title = "Title is required.";
  if (!SLUG.test(c.category)) errors.category = "Choose a category.";
  if (!Number.isInteger(c.weeks) || c.weeks < 1 || c.weeks > 104) errors.weeks = "Duration must be 1–104 weeks.";
  if (!c.summary) errors.summary = "A short card description is required.";
  if (c.level && !LEVELS.includes(c.level)) errors.level = "Invalid level.";
  if (c.mode && !MODES.includes(c.mode)) errors.mode = "Invalid delivery mode.";
  if (c.icon && !LOGOS[c.icon]) errors.icon = "Choose a logo from the list.";
  if (!c.logo) c.logo = shortText(c.title);
  return { errors, value: c };
}

export function validateBatch(input = {}) {
  const errors = {};
  const b = {
    code: str(input.code, 40).toUpperCase(),
    title: str(input.title, 120),
    courseId: str(input.courseId, 80),
    logo: str(input.logo, 4).toUpperCase(),
    start: str(input.start, 10),
    end: str(input.end, 10),
    days: str(input.days, 60),
    time: str(input.time, 60),
    tz: str(input.tz, 20),
    mode: str(input.mode, 40),
    status: str(input.status, 30) || "Enrolling",
    desc: str(input.desc, 400),
    featured: !!input.featured
  };
  if (!b.code) errors.code = "Batch code is required.";
  if (!b.title) errors.title = "Title is required.";
  if (!DATE.test(b.start)) errors.start = "Valid start date required.";
  if (!DATE.test(b.end)) errors.end = "Valid end date required.";
  if (!errors.start && !errors.end && b.end < b.start) errors.end = "End date must be on or after the start date.";
  if (!BATCH_STATUSES.includes(b.status)) errors.status = "Invalid status.";
  if (!b.logo) b.logo = shortText(b.title);
  return { errors, value: b };
}

const ENQUIRY_FIELDS = ["subject", "enquiryType", "help", "course", "batch", "level", "mode", "schedule", "org", "participants",
  "websiteType", "platform", "appType", "features", "budget", "timeline", "supportType", "urgency", "contactMethod", "area", "dates", "message"];

export function validateEnquiry(input = {}) {
  const errors = {};
  const e = {
    kind: ENQUIRY_KINDS.includes(input.kind) ? input.kind : "general",
    source: str(input.source, 120),
    name: str(input.name, 100),
    email: str(input.email, 160).toLowerCase(),
    phone: str(input.phone, 30),
    payload: {}
  };
  ENQUIRY_FIELDS.forEach(k => { const v = str(input[k], k === "message" ? 5000 : 300); if (v) e.payload[k] = v; });
  if (!e.name) errors.name = "Name is required.";
  if (!EMAIL.test(e.email)) errors.email = "A valid email address is required.";
  if (e.phone && !PHONE.test(e.phone)) errors.phone = "Invalid phone number.";
  if (input.consent !== true) errors.consent = "Consent is required.";
  return { errors, value: e };
}

export function validateCategory(input = {}) {
  const errors = {};
  const c = { name: str(input.name, 60), sort: Number.parseInt(input.sort, 10) || 0 };
  if (!c.name) errors.name = "Name is required.";
  return { errors, value: c };
}

export function validateService(input = {}) {
  const errors = {};
  const s = {
    title: str(input.title, 80),
    icon: str(input.icon, 20) || "code",
    short: str(input.short, 300),
    hero: str(input.hero, 160),
    cta: str(input.cta, 40) || "Send an Enquiry",
    ctaLink: str(input.ctaLink, 200),
    image: str(input.image, 40),
    typesTitle: str(input.typesTitle, 80),
    types: list(input.types, 20, 120),
    capsTitle: str(input.capsTitle, 80),
    caps: list(input.caps, 30, 160),
    process: list(input.process, 10, 60),
    formKind: str(input.formKind, 20) || "general",
    showBatches: !!input.showBatches,
    showNote: !!input.showNote,
    published: input.published === undefined ? true : !!input.published
  };
  if (!s.title) errors.title = "Title is required.";
  if (!s.short) errors.short = "A short description is required.";
  if (!SERVICE_ICONS.includes(s.icon)) errors.icon = "Choose an icon from the list.";
  if (s.image && !IMAGES[s.image]) errors.image = "Choose an image from the list.";
  if (!FORM_KINDS[s.formKind]) errors.formKind = "Choose an enquiry form.";
  if (s.ctaLink && !/^\/[a-z0-9/#?=&_-]*$/i.test(s.ctaLink)) errors.ctaLink = "Use an internal link starting with / (e.g. /courses).";
  return { errors, value: s };
}

export function validateTechnology(input = {}) {
  const errors = {};
  const t = {
    name: str(input.name, 60),
    label: str(input.label, 60),
    icon: str(input.icon, 40),
    logoText: str(input.logoText, 4).toUpperCase(),
    courseId: str(input.courseId, 80),
    published: input.published === undefined ? true : !!input.published
  };
  if (!t.name) errors.name = "Name is required.";
  if (t.icon && !LOGOS[t.icon]) errors.icon = "Choose a logo from the list.";
  if (!t.logoText) t.logoText = shortText(t.name);
  return { errors, value: t };
}

export function validateSettings(input = {}) {
  const errors = {};
  const social = input.social || {};
  const s = {
    name: str(input.name, 80),
    shortName: str(input.shortName, 30),
    tagline: str(input.tagline, 200),
    phone: str(input.phone, 30),
    email: str(input.email, 160).toLowerCase(),
    address: str(input.address, 300),
    hours: str(input.hours, 120),
    mapQuery: str(input.mapQuery, 300),
    social: Object.fromEntries(["linkedin", "facebook", "x", "youtube", "instagram"].map(k => [k, str(social[k], 300)]))
  };
  if (!s.name) errors.name = "Company name is required.";
  if (!s.shortName) s.shortName = s.name.split(" ")[0];
  if (s.email && !EMAIL.test(s.email)) errors.email = "Enter a valid email address.";
  if (s.phone && !PHONE.test(s.phone)) errors.phone = "Enter a valid phone number.";
  for (const [k, v] of Object.entries(s.social)) if (v && !URL_RE.test(v)) errors[`social.${k}`] = "Use a full https:// link.";
  return { errors, value: s };
}
