/* Initial content loaded by `npm run db:seed` (inserts only what is missing — never overwrites edits).
   After seeding, everything here is managed from the admin portal. */
import { COURSE_ICONS } from "../../src/data/logos.js";

export const DEFAULT_SETTINGS = {
  name: "Agnes Technologies",
  shortName: "Agnes",
  tagline: "Software development, IT support and instructor-led technical training.",
  phone: "91828357117",
  email: "",
  address: "Dondaparthy, Visakhapatnam, Andhra Pradesh, India",
  hours: "Mon–Fri, 9:00 AM – 6:00 PM",
  mapQuery: "Dondaparthy, Visakhapatnam, Andhra Pradesh, India",
  social: { linkedin: "", facebook: "", x: "", youtube: "", instagram: "" }
};

const course = (id, title, category, weeks, logo, summary, extra = {}) => ({
  id, title, category, weeks, logo, summary, icon: COURSE_ICONS[id] || "",
  level: "", mode: "", schedule: "", prerequisites: "", audience: "",
  overview: "", outcomes: [], modules: [], tools: "", published: true, flag: "",
  ...extra
});

export const SEED_COURSES = [
  course("linux-administrator", "Linux Administrator", "admin", 4, "LX", "Learn to install, configure and manage Linux servers, users, permissions, services and storage."),
  course("salesforce-admin", "Salesforce Admin", "admin", 5, "SF", "Configure Salesforce orgs, manage users and security, and build declarative automation."),
  course("websphere-mq", "WebSphere MQ", "admin", 5, "MQ", "Administer message queuing: queue managers, channels, clustering and troubleshooting."),
  course("machine-learning", "Machine Learning", "ai", 5, "ML", "Build and evaluate supervised and unsupervised models with practical, hands-on examples."),
  course("deep-learning", "Deep Learning", "ai", 5, "DL", "Understand neural networks and train deep learning models for vision and language tasks."),
  course("data-science", "Data Science", "ai", 5, "DS", "Work through the data lifecycle: collection, cleaning, analysis, visualisation and modelling."),
  course("tableau", "Tableau", "ai", 4, "TB", "Create interactive dashboards and visual reports that turn data into clear insights."),
  course("nodejs", "Node.js", "backend", 4, "NJ", "Build fast server-side applications and REST APIs with JavaScript and Node.js."),
  course("java", "Java", "backend", 5, "JV", "Learn core Java and object-oriented programming to build reliable backend applications."),
  course("csharp-dotnet", "C# and .NET", "backend", 5, "C#", "Develop applications with C# and the .NET platform, from fundamentals to web APIs."),
  course("aws", "Amazon Web Services (AWS)", "cloud", 4, "AWS", "Design and deploy workloads on AWS using core compute, storage, networking and security services."),
  course("microsoft-azure", "Microsoft Azure", "cloud", 5, "AZ", "Deploy and manage cloud resources on Microsoft Azure.", { flag: "Category to confirm — reference list showed this under Databases." }),
  course("citrix-administration", "Citrix Administration", "cloud", 5, "CX", "Administer virtual apps and desktops and manage delivery infrastructure."),
  course("salesforce-development", "Salesforce Development", "cloud", 4, "SD", "Extend Salesforce with code — Apex, components and integrations."),
  course("mongodb", "MongoDB", "databases", 4, "MG", "Model, query and manage document data with MongoDB."),
  course("sql-server", "Microsoft SQL Server", "databases", 5, "SQL", "Write SQL queries and manage relational databases on SQL Server.", { flag: "Course title and duration to confirm." }),
  course("oracle-db", "Oracle DB", "databases", 5, "OR", "Work with Oracle databases, SQL and core administration tasks."),
  course("shell-scripting", "Shell Scripting", "scripting", 4, "SH", "Automate everyday tasks with Bash scripts, pipelines and scheduling."),
  course("python-scripting", "Python Scripting", "scripting", 5, "PY", "Use Python to automate tasks, process files and work with APIs."),
  course("groovy-scripting", "Groovy Scripting", "scripting", 5, "GR", "Write Groovy scripts for the JVM, build tools and pipeline automation."),
  course("selenium", "Selenium", "testing", 4, "SE", "Automate web browser testing with Selenium WebDriver and test frameworks."),
  course("appium", "Appium", "testing", 5, "AP", "Automate testing of Android and iOS mobile applications with Appium."),
  course("loadrunner", "LoadRunner", "testing", 5, "LR", "Plan and run performance and load tests and analyse the results."),
  course("manual-testing", "Manual Testing", "testing", 5, "MT", "Learn testing fundamentals, test design, defect reporting and the QA lifecycle."),
  course("rpa", "Robotic Process Automation (RPA)", "testing", 5, "RPA", "Automate repetitive business processes with software robots."),
  course("angularjs", "Angular JS", "web", 5, "NG", "Build structured, component-based web applications with Angular."),
  course("reactjs", "React JS", "web", 5, "RE", "Build interactive user interfaces with React components, hooks and state.")
];

export const SEED_BATCHES = [
  { id: "b1", code: "AWS-SA-2612", title: "AWS Solution Architect", courseId: "aws", logo: "AWS", start: "2026-12-07", end: "2027-01-01", days: "Mon – Fri", time: "7:00 – 8:30 PM", tz: "IST", mode: "Online (live)", status: "Enrolling", desc: "Design resilient, cost-aware architectures on AWS with guided labs.", featured: true },
  { id: "b2", code: "DEVOPS-2612", title: "DevOps", courseId: "", logo: "DO", start: "2026-12-14", end: "2027-01-22", days: "Sat & Sun", time: "10:00 AM – 1:00 PM", tz: "IST", mode: "Online (live)", status: "Enrolling", desc: "CI/CD, containers, infrastructure-as-code and monitoring fundamentals.", featured: true },
  { id: "b3", code: "PBI-2701", title: "Microsoft Power BI", courseId: "", logo: "BI", start: "2027-01-05", end: "2027-02-02", days: "Tue & Thu", time: "6:30 – 8:30 PM", tz: "IST", mode: "Online (live)", status: "Registration Closed", desc: "Model data, write DAX measures and build interactive reports.", featured: true },
  { id: "b4", code: "PY-2609", title: "Python Scripting", courseId: "python-scripting", logo: "PY", start: "2026-09-01", end: "2026-10-06", days: "Mon – Thu", time: "7:00 – 8:30 PM", tz: "IST", mode: "Online (live)", status: "Enrolling", desc: "Automation with Python — files, APIs and scheduling.", featured: false }
];

const CATEGORY_NAMES = ["Admin", "Artificial Intelligence", "Backend", "Cloud", "Databases", "Scripting", "Testing", "Web Development"];

export const SEED_SERVICES = [
  {
    id: "web-development", title: "Web Development", icon: "code", image: "webWorkspace", formKind: "web",
    short: "Full-stack website and web application development, with front-end and back-end solutions that support your business products.",
    hero: "Websites and web apps built around your business", cta: "Start a Project", ctaLink: "",
    typesTitle: "What we build",
    types: ["Business websites", "Landing pages", "E-commerce websites", "Blogs & content sites", "Portals", "Custom web applications"],
    capsTitle: "Capabilities",
    caps: ["Responsive UI", "Front-end development", "Back-end development", "CMS / admin integration", "API & third-party integration", "Testing", "Deployment", "Maintenance"],
    process: ["Requirement Discussion", "Planning", "UI/UX", "Development", "Testing", "Launch & Support"]
  },
  {
    id: "app-development", title: "App Development", icon: "phone", image: "mobileApp", formKind: "app",
    short: "Mobile web and application development, designed and built by a coordinated developer and designer team.",
    hero: "Mobile apps planned, designed and delivered", cta: "Discuss Your App", ctaLink: "",
    typesTitle: "Platforms", types: ["Android", "iOS", "Windows", "Cross-platform"],
    capsTitle: "Capabilities",
    caps: ["App planning", "UI/UX design", "Android / iOS / cross-platform development", "Backend & API integration", "Testing", "Store publishing", "Maintenance"],
    process: ["Idea", "Requirements", "Prototype", "Development", "Testing", "Release & Maintenance"]
  },
  {
    id: "online-training", title: "Online Training", icon: "laptop", image: "onlineLearning", formKind: "training", showBatches: true,
    short: "Instructor-led technical learning to learn, practise and build career skills, with flexible schedules where available.",
    hero: "Instructor-led online training for in-demand tech skills", cta: "Explore Courses", ctaLink: "/courses",
    typesTitle: "How training works",
    types: ["Live instructor-led sessions", "Practical, hands-on learning", "Flexible schedules (where available)", "Course support (where offered)"],
    capsTitle: "Course categories", caps: CATEGORY_NAMES, process: []
  },
  {
    id: "it-support", title: "IT Support", icon: "wrench", image: "itSupport", formKind: "support", showNote: true,
    short: "Technology expertise and support to improve business performance and resolve your technical needs.",
    hero: "Reliable IT support for growing businesses", cta: "Request Support", ctaLink: "",
    typesTitle: "Support services",
    types: ["Technology consulting", "Troubleshooting", "Technical assistance", "System & software support", "Maintenance"],
    capsTitle: "How a support request works",
    caps: ["Submit a request with issue details", "We review and confirm scope", "A specialist works on the issue", "Resolution and follow-up"],
    process: []
  },
  {
    id: "corporate-training", title: "Corporate Training", icon: "users", image: "workshop", formKind: "corporate",
    short: "Technical and soft-skills training for organisations and teams, with post-training support where offered.",
    hero: "Training programmes designed for your team", cta: "Request Corporate Training", ctaLink: "",
    typesTitle: "What we offer",
    types: ["Technical training", "Soft-skills training", "Customised programmes", "Online or classroom delivery", "Practical sessions", "Post-training assistance (where offered)"],
    capsTitle: "Training areas", caps: [...CATEGORY_NAMES, "Soft skills"],
    process: ["Training Needs", "Programme Design", "Delivery", "Evaluation", "Follow-up"]
  },
  {
    id: "technical-support", title: "Ongoing Technical Support", icon: "headset", image: "servers", formKind: "support", showNote: true,
    short: "Continued technical help after launch — updates, fixes and guidance to keep your systems running smoothly.",
    hero: "Ongoing support after go-live", cta: "Talk to Us", ctaLink: "",
    typesTitle: "Coverage", types: ["Bug fixes and updates", "Performance checks", "Content and feature changes", "Technical guidance"],
    capsTitle: "Support hours", caps: ["Support hours and response times to be confirmed"], process: []
  }
];

export const SEED_TECHNOLOGIES = [
  { name: "AWS", label: "Cloud", icon: "aws", logoText: "AWS", courseId: "aws" },
  { name: "DevOps", label: "Practices & tooling", icon: "topic-devops", logoText: "DO", courseId: "" },
  { name: "Tableau", label: "Analytics", icon: "tableau", logoText: "TB", courseId: "tableau" },
  { name: "Data Science", label: "AI & Data", icon: "topic-datascience", logoText: "DS", courseId: "data-science" },
  { name: "Power BI", label: "Analytics", icon: "topic-bi", logoText: "BI", courseId: "" },
  { name: "Python", label: "Programming", icon: "python", logoText: "PY", courseId: "python-scripting" },
  { name: "React Native", label: "Mobile", icon: "react", logoText: "RN", courseId: "" },
  { name: "Angular", label: "Web", icon: "angular", logoText: "NG", courseId: "angularjs" }
];
