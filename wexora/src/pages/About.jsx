import { Link } from "react-router-dom";
import { Icon, Notice, PageBanner, Photo, Reveal, SectionHead, Steps, useTitle } from "../components/ui.jsx";

const VALUES = [
  ["Integrity", "shield", "Honest advice and transparent work."],
  ["Relationships", "heart", "Long-term partnerships built on trust."],
  ["Personal Growth", "grow", "Continuous learning for learners and our team."],
  ["Agility", "bolt", "Adapting quickly to changing needs."],
  ["Excellence", "star", "High standards in every deliverable."],
  ["Collaboration", "users", "Working closely with clients and learners."]
];
const PROCESS = [
  { title: "Understand Requirements", text: "We listen to your goals and constraints." },
  { title: "Assess & Plan", text: "Scope, timeline and approach agreed up front." },
  { title: "Design / Customise", text: "Solutions and programmes tailored to you." },
  { title: "Deliver", text: "Build, launch or train — with regular updates." },
  { title: "Review & Support", text: "Feedback, refinements and ongoing help." }
];

export default function About() {
  useTitle("About Us", "Learn about our software development, IT support and technical training team.");
  return (
    <>
      <PageBanner crumbs={[{ label: "About Us" }]} eyebrow="About Us" title="Technology built and taught by practitioners"
        lead="We help businesses build software and help people build skills — combining development, IT services and hands-on training under one roof."
        art={<Photo name="officeTeam" eager />} />

      <section className="section">
        <div className="container split">
          <Reveal>
            <span className="eyebrow">Company Overview</span>
            <h2>Who we are and who we serve</h2>
            <p className="muted">We are a technology services company specialising in software and mobile app development. Our team builds websites, web applications and mobile apps, provides IT support, and delivers instructor-led technical training.</p>
            <p className="muted">We work with small and growing businesses that need dependable technology, organisations looking to upskill their teams, and individual learners building careers in technology.</p>
            <Notice>Company background, founding year and milestones will be added once verified by management. No statistics or client logos are shown until confirmed.</Notice>
          </Reveal>
          <div className="grid grid-2">
            <Reveal className="split-art framed span-2"><Photo name="workshop" /></Reveal>
            {[["Software & Web", "Websites, portals and custom web applications."], ["Mobile Apps", "Android, iOS and cross-platform apps."], ["Training", "Online and corporate technical training."], ["IT Services", "Consulting, troubleshooting and support."]].map(([t, d], i) => (
              <Reveal className="card mini-card" key={t} delay={i * 80}><h3>{t}</h3><p>{d}</p></Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container grid grid-2">
          <Reveal className="mv-card">
            <span className="eyebrow on-dark">Mission</span>
            <h2>Our Mission</h2>
            <p>To deliver reliable technology solutions and practical training that help businesses perform better and help people build lasting careers. <em>(Draft — awaiting approved wording.)</em></p>
          </Reveal>
          <Reveal className="mv-card red" delay={120}>
            <span className="eyebrow on-dark">Vision</span>
            <h2>Our Vision</h2>
            <p>To be a trusted partner for building software and building skills. <em>(Draft — awaiting approved wording.)</em></p>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead eyebrow="Core Values" title="What guides our work">Final values to be confirmed by management.</SectionHead>
          <div className="grid grid-3">
            {VALUES.map(([t, ic, d], i) => (
              <Reveal className="card hover value-card" key={t} delay={(i % 3) * 90}>
                <div className="icon-box"><Icon name={ic} size={26} /></div><h3>{t}</h3><p>{d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <SectionHead eyebrow="How We Work" title="A clear, collaborative process" />
          <Steps items={PROCESS} />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead eyebrow="Our Team" title="Team & instructors" />
          <Notice info style={{ maxWidth: 680, margin: "0 auto" }}>Team and instructor profiles (photo, name, designation, bio, expertise) will appear here once approved for publication.</Notice>
          <div className="center btn-row justify-center" style={{ marginTop: 40 }}>
            <Link to="/services" className="btn btn-primary">Our Services</Link>
            <Link to="/contact" className="btn btn-outline">Contact Us</Link>
          </div>
        </div>
      </section>
    </>
  );
}
