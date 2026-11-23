/* =========================================================
   DEMO DATA — every value marked "TBC" must be confirmed by
   management before the real site is published.
   ========================================================= */
const SITE = {
  name: "Vertexa Technologies",          // placeholder brand
  short: "V",
  tagline: "Software development, IT support and instructor-led technical training.",
  phone: "+00 000 000 0000",             // TBC
  email: "hello@example.com",            // TBC
  address: "Office address to be confirmed", // TBC
  hours: "Mon–Fri, 9:00 AM – 6:00 PM",  // TBC
  roundTheClock: false                   // set true ONLY if 24/7 support is genuinely provided
};

const CATEGORIES = [
  { id: "admin", name: "Admin", color: "#475569" },
  { id: "ai", name: "Artificial Intelligence", color: "#7c3aed" },
  { id: "backend", name: "Backend", color: "#059669" },
  { id: "cloud", name: "Cloud", color: "#0284c7" },
  { id: "databases", name: "Databases", color: "#b45309" },
  { id: "scripting", name: "Scripting", color: "#0f766e" },
  { id: "testing", name: "Testing", color: "#be185d" },
  { id: "web", name: "Web Development", color: "#4f46e5" }
];

/* Course name + duration from the reference catalogue. Summaries are neutral
   technology descriptions for the demo; syllabus/level/schedule are TBC. */
const COURSES = [
  { id: "linux-administrator", title: "Linux Administrator", cat: "admin", weeks: 4, logo: "LX", tags: "linux unix sysadmin server", summary: "Learn to install, configure and manage Linux servers, users, permissions, services and storage." },
  { id: "salesforce-admin", title: "Salesforce Admin", cat: "admin", weeks: 5, logo: "SF", tags: "salesforce crm admin", summary: "Configure Salesforce orgs, manage users and security, and build declarative automation." },
  { id: "websphere-mq", title: "WebSphere MQ", cat: "admin", weeks: 5, logo: "MQ", tags: "ibm mq messaging middleware", summary: "Administer message queuing: queue managers, channels, clustering and troubleshooting." },
  { id: "machine-learning", title: "Machine Learning", cat: "ai", weeks: 5, logo: "ML", tags: "ml python models ai", summary: "Build and evaluate supervised and unsupervised models using practical, hands-on examples." },
  { id: "deep-learning", title: "Deep Learning", cat: "ai", weeks: 5, logo: "DL", tags: "neural networks ai tensorflow pytorch", summary: "Understand neural networks and train deep learning models for vision and language tasks." },
  { id: "data-science", title: "Data Science", cat: "ai", weeks: 5, logo: "DS", tags: "data analysis python statistics ai", summary: "Work through the data lifecycle: collection, cleaning, analysis, visualisation and modelling." },
  { id: "tableau", title: "Tableau", cat: "ai", weeks: 4, logo: "TB", tags: "bi dashboards visualisation analytics", summary: "Create interactive dashboards and visual reports that turn data into clear insights." },
  { id: "nodejs", title: "Node.js", cat: "backend", weeks: 4, logo: "NJ", tags: "javascript node express api", summary: "Build fast server-side applications and REST APIs with JavaScript and Node.js." },
  { id: "java", title: "Java", cat: "backend", weeks: 5, logo: "JV", tags: "java oop spring", summary: "Learn core Java and object-oriented programming to build reliable backend applications." },
  { id: "csharp-dotnet", title: "C# and .NET", cat: "backend", weeks: 5, logo: "C#", tags: "csharp dotnet microsoft asp.net", summary: "Develop applications with C# and the .NET platform, from fundamentals to web APIs." },
  { id: "aws", title: "Amazon Web Services (AWS)", cat: "cloud", weeks: 4, logo: "AWS", tags: "aws amazon cloud solution architect", summary: "Design and deploy workloads on AWS using core compute, storage, networking and security services." },
  { id: "microsoft-azure", title: "Microsoft Azure", cat: "cloud", weeks: 5, logo: "AZ", tags: "azure microsoft cloud", summary: "Deploy and manage cloud resources on Microsoft Azure.", flag: "Category to confirm — reference list showed this under Databases." },
  { id: "citrix-administration", title: "Citrix Administration", cat: "cloud", weeks: 5, logo: "CX", tags: "citrix virtualisation vdi", summary: "Administer virtual apps and desktops and manage delivery infrastructure." },
  { id: "salesforce-development", title: "Salesforce Development", cat: "cloud", weeks: 4, logo: "SD", tags: "salesforce apex lwc", summary: "Extend Salesforce with code — Apex, components and integrations." },
  { id: "mongodb", title: "MongoDB", cat: "databases", weeks: 4, logo: "MG", tags: "nosql database mongo", summary: "Model, query and manage document data with MongoDB." },
  { id: "sql-server", title: "Microsoft SQL Server", cat: "databases", weeks: 5, logo: "SQL", tags: "sql tsql database microsoft", summary: "Write SQL queries and manage relational databases on SQL Server.", flag: "Course title and duration to confirm." },
  { id: "oracle-db", title: "Oracle DB", cat: "databases", weeks: 5, logo: "OR", tags: "oracle sql plsql database", summary: "Work with Oracle databases, SQL and core administration tasks." },
  { id: "shell-scripting", title: "Shell Scripting", cat: "scripting", weeks: 4, logo: "SH", tags: "bash shell linux automation", summary: "Automate everyday tasks with Bash scripts, pipelines and scheduling." },
  { id: "python-scripting", title: "Python Scripting", cat: "scripting", weeks: 5, logo: "PY", tags: "python automation scripting", summary: "Use Python to automate tasks, process files and work with APIs." },
  { id: "groovy-scripting", title: "Groovy Scripting", cat: "scripting", weeks: 5, logo: "GR", tags: "groovy jvm jenkins", summary: "Write Groovy scripts for the JVM, build tools and pipeline automation." },
  { id: "selenium", title: "Selenium", cat: "testing", weeks: 4, logo: "SE", tags: "automation testing web qa", summary: "Automate web browser testing with Selenium WebDriver and test frameworks." },
  { id: "appium", title: "Appium", cat: "testing", weeks: 5, logo: "AP", tags: "mobile automation testing qa", summary: "Automate testing of Android and iOS mobile applications with Appium." },
  { id: "loadrunner", title: "LoadRunner", cat: "testing", weeks: 5, logo: "LR", tags: "performance load testing", summary: "Plan and run performance and load tests and analyse the results." },
  { id: "manual-testing", title: "Manual Testing", cat: "testing", weeks: 5, logo: "MT", tags: "qa testing test cases", summary: "Learn testing fundamentals, test design, defect reporting and the QA lifecycle." },
  { id: "rpa", title: "Robotic Process Automation (RPA)", cat: "testing", weeks: 5, logo: "RPA", tags: "rpa automation bots", summary: "Automate repetitive business processes with software robots." },
  { id: "angularjs", title: "Angular JS", cat: "web", weeks: 5, logo: "NG", tags: "angular javascript typescript frontend", summary: "Build structured, component-based web applications with Angular." },
  { id: "reactjs", title: "React JS", cat: "web", weeks: 5, logo: "RE", tags: "react javascript frontend", summary: "Build interactive user interfaces with React components, hooks and state." }
];

const SERVICES = [
  {
    id: "web-development", title: "Web Development", icon: "code",
    short: "Full-stack website and web application development, with front-end and back-end solutions that support your business products.",
    hero: "Websites and web apps built around your business",
    cta: "Start a Project",
    typesTitle: "What we build",
    types: ["Business websites", "Landing pages", "E-commerce websites", "Blogs & content sites", "Portals", "Custom web applications"],
    capsTitle: "Capabilities",
    caps: ["Responsive UI", "Front-end development", "Back-end development", "CMS / admin integration", "API & third-party integration", "Testing", "Deployment", "Maintenance"],
    process: ["Requirement Discussion", "Planning", "UI/UX", "Development", "Testing", "Launch & Support"],
    form: "web"
  },
  {
    id: "app-development", title: "App Development", icon: "phone",
    short: "Mobile web and application development, designed and built by a coordinated developer and designer team.",
    hero: "Mobile apps planned, designed and delivered",
    cta: "Discuss Your App",
    typesTitle: "Platforms",
    types: ["Android", "iOS", "Windows", "Cross-platform"],
    capsTitle: "Capabilities",
    caps: ["App planning", "UI/UX design", "Android / iOS / cross-platform development", "Backend & API integration", "Testing", "Store publishing", "Maintenance"],
    process: ["Idea", "Requirements", "Prototype", "Development", "Testing", "Release & Maintenance"],
    form: "app"
  },
  {
    id: "online-training", title: "Online Training", icon: "laptop",
    short: "Instructor-led technical learning to learn, practise and build career skills, with flexible schedules where available.",
    hero: "Instructor-led online training for in-demand tech skills",
    cta: "Explore Courses", ctaHref: "courses.html",
    typesTitle: "How training works",
    types: ["Live instructor-led sessions", "Practical, hands-on learning", "Flexible schedules (where available)", "Course support (where offered)"],
    capsTitle: "Course categories",
    caps: CATEGORIES.map(c => c.name),
    process: null,
    form: "training"
  },
  {
    id: "it-support", title: "IT Support", icon: "wrench",
    short: "Technology expertise and support to improve business performance and resolve your technical needs.",
    hero: "Reliable IT support for growing businesses",
    cta: "Request Support",
    typesTitle: "Support services",
    types: ["Technology consulting", "Troubleshooting", "Technical assistance", "System & software support", "Maintenance"],
    capsTitle: "How a support request works",
    caps: ["Submit a request with issue details", "We review and confirm scope", "A specialist works on the issue", "Resolution and follow-up"],
    process: null,
    form: "support"
  },
  {
    id: "corporate-training", title: "Corporate Training", icon: "users",
    short: "Technical and soft-skills training for organisations and teams, with post-training support where offered.",
    hero: "Training programmes designed for your team",
    cta: "Request Corporate Training",
    typesTitle: "What we offer",
    types: ["Technical training", "Soft-skills training", "Customised programmes", "Online or classroom delivery", "Practical sessions", "Post-training assistance (where offered)"],
    capsTitle: "Training areas",
    caps: CATEGORIES.map(c => c.name).concat(["Soft skills"]),
    process: ["Training Needs", "Programme Design", "Delivery", "Evaluation", "Follow-up"],
    form: "corporate"
  },
  {
    id: "technical-support", title: SITE.roundTheClock ? "24/7 Support" : "Ongoing Technical Support", icon: "headset",
    short: "Continued technical help after launch — updates, fixes and guidance to keep your systems running smoothly.",
    hero: "Ongoing support after go-live",
    cta: "Talk to Us",
    typesTitle: "Coverage",
    types: ["Bug fixes and updates", "Performance checks", "Content and feature changes", "Technical guidance"],
    capsTitle: "Support hours",
    caps: ["Support hours and response times to be confirmed"],
    process: null,
    form: "support"
  }
];

const TOOLS = [
  { name: "AWS", cat: "Cloud", logo: "AWS", color: "#f59e0b", course: "aws" },
  { name: "DevOps", cat: "Practices & tooling", logo: "DO", color: "#0ea5e9" },
  { name: "Tableau", cat: "Analytics", logo: "TB", color: "#2563eb", course: "tableau" },
  { name: "Data Science", cat: "AI & Data", logo: "DS", color: "#7c3aed", course: "data-science" },
  { name: "Power BI", cat: "Analytics", logo: "BI", color: "#eab308" },
  { name: "Python", cat: "Programming", logo: "PY", color: "#16a34a", course: "python-scripting" },
  { name: "React Native", cat: "Mobile", logo: "RN", color: "#06b6d4" },
  { name: "Angular", cat: "Web", logo: "NG", color: "#dc2626", course: "angularjs" }
];

/* SAMPLE batches — replace with real scheduled batches. Status is auto-set to
   "Completed" once the end date has passed. */
const BATCHES = [
  { code: "AWS-SA-2612", title: "AWS Solution Architect", course: "aws", logo: "AWS", color: "#f59e0b", start: "2026-12-07", end: "2027-01-01", days: "Mon – Fri", time: "7:00 – 8:30 PM", tz: "IST", mode: "Online (live)", status: "Enrolling", desc: "Design resilient, cost-aware architectures on AWS with guided labs." },
  { code: "DEVOPS-2612", title: "DevOps", course: null, logo: "DO", color: "#0ea5e9", start: "2026-12-14", end: "2027-01-22", days: "Sat & Sun", time: "10:00 AM – 1:00 PM", tz: "IST", mode: "Online (live)", status: "Enrolling", desc: "CI/CD, containers, infrastructure-as-code and monitoring fundamentals." },
  { code: "PBI-2701", title: "Microsoft Power BI", course: null, logo: "BI", color: "#eab308", start: "2027-01-05", end: "2027-02-02", days: "Tue & Thu", time: "6:30 – 8:30 PM", tz: "IST", mode: "Online (live)", status: "Registration Closed", desc: "Model data, write DAX measures and build interactive reports." },
  { code: "PY-2609", title: "Python Scripting", course: "python-scripting", logo: "PY", color: "#16a34a", start: "2026-09-01", end: "2026-10-06", days: "Mon – Thu", time: "7:00 – 8:30 PM", tz: "IST", mode: "Online (live)", status: "Enrolling", desc: "Automation with Python — files, APIs and scheduling." }
];
