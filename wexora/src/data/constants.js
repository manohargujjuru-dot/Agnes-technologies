/* Fixed option lists shared by the website, admin portal and API validation.
   (Database CHECK constraints in server/db/migrations/004_integrity.sql mirror these.) */
export const LEVELS = ["Beginner", "Intermediate", "Advanced"];
export const MODES = ["Online", "Classroom", "Online & Classroom"];
export const BATCH_STATUSES = ["Enrolling", "Registration Closed", "Completed"];
export const ENQUIRY_KINDS = ["general", "contact", "course", "web", "app", "training", "support", "corporate"];

/* Which enquiry form a service page shows */
export const FORM_KINDS = {
  general: "General enquiry",
  web: "Website project",
  app: "App project",
  training: "Training / course",
  support: "IT support request",
  corporate: "Corporate training"
};

/* Icons available for service cards (see components/ui.jsx) */
export const SERVICE_ICONS = ["code", "phone", "laptop", "wrench", "users", "headset", "shield", "book", "grow", "bolt", "star", "cal"];
