/* Technology logos in /public/logos (see public/logos/CREDITS.txt).
   Product logos are used only for courses/tools named after that product;
   topic-* icons are original artwork for subject areas. */
export const LOGOS = {
  aws: "Amazon Web Services",
  azure: "Microsoft Azure",
  python: "Python",
  java: "Java",
  csharp: "C#",
  nodejs: "Node.js",
  react: "React",
  angular: "Angular",
  angularjs: "AngularJS",
  mongodb: "MongoDB",
  sqlserver: "Microsoft SQL Server",
  oracle: "Oracle",
  linux: "Linux",
  bash: "Bash / Shell",
  groovy: "Groovy",
  selenium: "Selenium",
  appium: "Appium",
  tableau: "Tableau",
  salesforce: "Salesforce",
  citrix: "Citrix",
  "topic-ml": "Machine learning (icon)",
  "topic-dl": "Deep learning (icon)",
  "topic-datascience": "Data science (icon)",
  "topic-devops": "DevOps (icon)",
  "topic-bi": "Business intelligence (icon)",
  "topic-loadtest": "Performance testing (icon)",
  "topic-manualtest": "Manual testing (icon)",
  "topic-rpa": "Automation / RPA (icon)",
  "topic-mq": "Messaging / queues (icon)"
};

export const logoSrc = key => (key && LOGOS[key] ? `/logos/${key}.svg` : null);

/* Default logo for each catalogue course */
export const COURSE_ICONS = {
  "linux-administrator": "linux",
  "salesforce-admin": "salesforce",
  "websphere-mq": "topic-mq",
  "machine-learning": "topic-ml",
  "deep-learning": "topic-dl",
  "data-science": "topic-datascience",
  tableau: "tableau",
  nodejs: "nodejs",
  java: "java",
  "csharp-dotnet": "csharp",
  aws: "aws",
  "microsoft-azure": "azure",
  "citrix-administration": "citrix",
  "salesforce-development": "salesforce",
  mongodb: "mongodb",
  "sql-server": "sqlserver",
  "oracle-db": "oracle",
  "shell-scripting": "bash",
  "python-scripting": "python",
  "groovy-scripting": "groovy",
  selenium: "selenium",
  appium: "appium",
  loadrunner: "topic-loadtest",
  "manual-testing": "topic-manualtest",
  rpa: "topic-rpa",
  angularjs: "angularjs",
  reactjs: "react"
};

/* Batches without a linked course: pick a logo from their short logo text */
export const ICON_BY_TEXT = { AWS: "aws", DO: "topic-devops", BI: "topic-bi", PY: "python" };
