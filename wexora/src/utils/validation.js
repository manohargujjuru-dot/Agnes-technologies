/* Shared email + phone validation — imported by the browser forms AND the server,
   so the rules can never drift apart. Each validator returns "" when valid, or a
   specific, human-readable message explaining what is wrong. */

const MAX_EMAIL = 254;
const MAX_LOCAL = 64;
const LOCAL_RE = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*$/;
const LABEL_RE = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/;
const TLD_RE = /^[A-Za-z]{2,24}$/;

const COMMON_DOMAINS = [
  "gmail.com", "yahoo.com", "yahoo.co.in", "outlook.com", "hotmail.com", "live.com",
  "icloud.com", "rediffmail.com", "protonmail.com", "zoho.com", "aol.com", "msn.com"
];
const DISPOSABLE = new Set([
  "mailinator.com", "10minutemail.com", "guerrillamail.com", "tempmail.com", "temp-mail.org",
  "yopmail.com", "trashmail.com", "sharklasers.com", "getnada.com", "dispostable.com",
  "throwawaymail.com", "fakeinbox.com", "maildrop.cc", "mintemail.com", "emailondeck.com"
]);

/** Levenshtein distance (small strings only). */
function distance(a, b) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0]; row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return row[b.length];
}

export const normalizeEmail = v => String(v ?? "").trim().toLowerCase();

/** Validate an email address. Returns "" if valid, otherwise the reason. */
export function validateEmail(raw) {
  const v = String(raw ?? "").trim();
  if (!v) return "";
  if (/\s/.test(v)) return "Email addresses can't contain spaces.";
  const at = v.split("@").length - 1;
  if (at === 0) return "Email is missing the “@” symbol — e.g. name@example.com.";
  if (at > 1) return "Email can only contain one “@” symbol.";
  if (v.length > MAX_EMAIL) return `Email is too long (max ${MAX_EMAIL} characters).`;
  const [local, domain] = v.split("@");
  if (!local) return "Add the part before the “@” — e.g. name@example.com.";
  if (!domain) return "Add the domain after the “@” — e.g. name@gmail.com.";
  if (local.length > MAX_LOCAL) return `The part before “@” is too long (max ${MAX_LOCAL} characters).`;
  if (local.startsWith(".") || local.endsWith(".") || local.includes("..")) return "Dots can't be at the start/end or repeated before the “@”.";
  if (!LOCAL_RE.test(local)) return "The part before “@” contains characters that aren't allowed.";
  if (!domain.includes(".")) return "The domain needs an ending like .com or .in.";
  const labels = domain.split(".");
  if (labels.some(l => !l)) return "The domain has an empty part — check for extra dots.";
  if (!labels.every(l => LABEL_RE.test(l))) return "The domain contains characters that aren't allowed.";
  if (!TLD_RE.test(labels[labels.length - 1])) return "The domain ending (like .com) doesn't look right.";
  if (DISPOSABLE.has(domain.toLowerCase())) return "Please use a permanent email — temporary inboxes aren't accepted.";
  return "";
}

/** Suggest a corrected address for common domain typos (gmial.com → gmail.com). */
export function suggestEmail(raw) {
  const v = normalizeEmail(raw);
  const i = v.lastIndexOf("@");
  if (i < 1) return "";
  const domain = v.slice(i + 1);
  if (!domain || COMMON_DOMAINS.includes(domain)) return "";
  let best = "", bestD = 3;
  for (const d of COMMON_DOMAINS) {
    const dist = distance(domain, d);
    if (dist < bestD) { best = d; bestD = dist; }
  }
  return best && bestD <= 2 ? `${v.slice(0, i)}@${best}` : "";
}

/* ---------------- Phone ---------------- */

/** Strip anything that can never be part of a phone number (used while typing). */
export const sanitizePhoneInput = v => String(v ?? "").replace(/[^\d+\s().-]/g, "").replace(/(?!^)\+/g, "").slice(0, 22);

/** Parse a phone into { cc, national } or { error }. India (+91) is the default country. */
function parsePhone(raw) {
  const v = String(raw ?? "").trim();
  if (!/^[+\d\s().-]+$/.test(v)) return { error: "Phone can only contain digits, spaces, +, - and ( )." };
  if (v.indexOf("+") > 0) return { error: "“+” can only appear at the start (for the country code)." };
  let digits = v.replace(/\D/g, "");
  if (v.startsWith("+")) {
    if (digits.startsWith("91")) return { cc: "91", national: digits.slice(2) };
    if (digits.startsWith("0")) return { error: "Country codes can't start with 0." };
    if (digits.length < 8) return { error: `International number is too short (${digits.length} digits).` };
    if (digits.length > 15) return { error: "International numbers can have at most 15 digits." };
    return { cc: "", national: digits, intl: true };
  }
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return { cc: "91", national: digits };
}

/** Validate a phone number. Returns "" if valid, otherwise the reason. */
export function validatePhone(raw) {
  const v = String(raw ?? "").trim();
  if (!v) return "";
  const p = parsePhone(v);
  if (p.error) return p.error;
  const n = p.national;
  if (!p.intl) {
    if (n.length < 10) return `Phone number is too short — Indian numbers have 10 digits (you entered ${n.length}).`;
    if (n.length > 10) return `Phone number is too long — Indian numbers have 10 digits (you entered ${n.length}).`;
    if (n.startsWith("0")) return "Remove the leading 0 — enter the 10-digit number.";
  }
  if (/^(\d)\1+$/.test(n)) return "This doesn't look like a real phone number.";
  if ("01234567890".includes(n) || "98765432109876".includes(n)) return "This doesn't look like a real phone number.";
  return "";
}

/** Canonical display form: "+91 91234 56789" (India) or "+<digits>" (international). */
export function formatPhone(raw) {
  if (!String(raw ?? "").trim() || validatePhone(raw)) return String(raw ?? "").trim();
  const p = parsePhone(raw);
  if (p.intl) return `+${p.national}`;
  return `+91 ${p.national.slice(0, 5)} ${p.national.slice(5)}`;
}
