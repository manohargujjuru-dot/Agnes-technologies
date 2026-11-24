import { useRef } from "react";
import { Link } from "react-router-dom";
import { Icon, Photo, Reveal, SectionHead, TechLogo, useTitle } from "../components/ui.jsx";
import { BatchCard, ServiceCard } from "../components/Cards.jsx";
import EnquiryForm from "../components/EnquiryForm.jsx";
import { useData } from "../context/DataContext.jsx";
import { CountUp, TechMarquee, useParallax } from "../components/Effects.jsx";

export default function Home() {
  useTitle(null, "Web and app development, IT support, corporate training and instructor-led online courses.");
  const { upcomingBatches, getCourse, services, technologies, courses, categories } = useData();
  const featured = upcomingBatches.filter(b => b.featured);
  const heroRef = useRef(null);
  useParallax(heroRef);
  const stats = [
    { icon: "book", value: courses.length, label: "Courses offered" },
    { icon: "code", value: technologies.length, label: "Technologies" },
    { icon: "grid", value: categories.length, label: "Learning tracks" },
    { icon: "cal", value: upcomingBatches.length, label: "Open batches" }
  ].filter(s => s.value > 0);

  return (
    <>
      {/* HERO */}
      <section className="hero" aria-labelledby="hero-title" ref={heroRef}>
        <div className="hero-bg" aria-hidden="true"><span className="blob b1" /><span className="blob b2" /><span className="ring" /></div>
        <div className="container hero-grid">
          <div>
            <span className="eyebrow anim">Technology Services &amp; Training</span>
            <h1 id="hero-title" className="anim d1">Build software. <span className="hl">Build skills.</span> Grow faster.</h1>
            <ul className="hero-points anim d2">
              <li><Icon name="code" size={18} /> Full-stack web &amp; mobile app development</li>
              <li><Icon name="wrench" size={18} /> Cloud, DevOps &amp; IT support</li>
              <li><Icon name="laptop" size={18} /> Instructor-led training: AI/ML, Cloud, Testing, Data</li>
            </ul>
            <div className="btn-row anim d3">
              <Link to="/services" className="btn btn-primary">Explore Services <Icon name="arrow" size={18} /></Link>
              <Link to="/courses" className="btn btn-outline-light">Explore Courses</Link>
            </div>
          </div>
          <div className="hero-visual anim-scale">
            <div className="hero-panel"><Photo name="hero" eager /></div>
            <div className="hero-deco" aria-hidden="true" />
            <div className="float-card f1"><span className="fc-icon"><Icon name="laptop" size={18} /></span><span>Online Training<small>Instructor-led</small></span></div>
            <div className="float-card f2"><span className="fc-icon red"><Icon name="code" size={18} /></span><span>Web &amp; App Solutions<small>Design to launch</small></span></div>
            <div className="float-card f3"><span className="fc-icon gold"><Icon name="wrench" size={18} /></span><span>IT Support<small>For businesses</small></span></div>
          </div>
        </div>
      </section>

      <TechMarquee />

      {/* WHAT WE SERVE */}
      <section className="section">
        <div className="container">
          <SectionHead eyebrow="What We Serve" title="Services that move your business forward" />
          <div className="grid grid-3">
            {services.map((s, i) => <ServiceCard key={s.id} service={s} delay={(i % 3) * 90} />)}
          </div>
        </div>
      </section>

      {/* WHO WE ARE */}
      <section className="section alt">
        <div className="container split">
          <Reveal className="split-art framed"><Photo name="mentor" /></Reveal>
          <Reveal delay={120}>
            <span className="eyebrow">Who We Are</span>
            <h2>A software and training team in one place</h2>
            <ul className="check-list">
              <li><span><strong>Web apps</strong> — React, Angular, Node.js, .NET</span></li>
              <li><span><strong>Mobile apps</strong> — Android, iOS, cross-platform</span></li>
              <li><span><strong>Cloud &amp; DevOps</strong> — AWS, Azure, CI/CD</span></li>
              <li><span><strong>Training</strong> — AI/ML, Data Science, Testing, Scripting</span></li>
              <li><span><strong>IT support</strong> — troubleshooting, maintenance, upgrades</span></li>
            </ul>
            <Link to="/about" className="btn btn-primary">Read More</Link>
          </Reveal>
        </div>
      </section>

      {/* STATS — photo background with a slow parallax */}
      <section className="stats-band" aria-label="At a glance">
        <div className="stats-bg" aria-hidden="true"><Photo name="classroom" /></div>
        <div className="container stats-grid">
          {stats.map((s, i) => (
            <Reveal key={s.label} className="stat-tile" delay={i * 90}>
              <span className="st-icon"><Icon name={s.icon} size={22} /></span>
              <strong><CountUp value={s.value} suffix="+" /></strong>
              <span>{s.label}</span>
            </Reveal>
          ))}
        </div>
      </section>

      {/* TOOLS */}
      <section className="section">
        <div className="container">
          <SectionHead eyebrow="Popular Tools & Technologies" title="Technologies we work with and teach" />
          <div className="tools-grid">
            {technologies.map((t, i) => (
              <Reveal key={t.name} delay={(i % 4) * 70}>
                <Link className="tool-card" to={t.courseId && getCourse(t.courseId) ? `/courses/${t.courseId}` : "/courses"}>
                  <TechLogo icon={t.icon} text={t.logoText} />
                  <span><strong>{t.name}</strong><span className="tool-cat">{t.label}</span></span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* BATCHES */}
      <section className="section alt">
        <div className="container">
          <SectionHead eyebrow="Upcoming Project Training Batches" title="Join the next batch" />
          {featured.length ? (
            <div className="grid grid-3">{featured.map((b, i) => <BatchCard key={b.id} batch={b} delay={i * 90} />)}</div>
          ) : (
            <p className="muted center">No batches are currently scheduled. <Link to="/contact">Ask us about the next intake.</Link></p>
          )}
          <div className="center" style={{ marginTop: 36 }}><Link to="/batches" className="btn btn-outline">View all batches</Link></div>
        </div>
      </section>

      {/* ENQUIRY */}
      <section className="section" id="enquiry">
        <div className="container split align-start">
          <Reveal>
            <span className="eyebrow">Enquiry</span>
            <h2>Tell us what you need</h2>
            <ul className="check-list">
              <li>Web / mobile app project quotes</li>
              <li>Course syllabus, batches &amp; fees</li>
              <li>IT support &amp; corporate training</li>
            </ul>
          </Reveal>
          <Reveal className="form-card" delay={120}><EnquiryForm kind="general" source="Home page" /></Reveal>
        </div>
      </section>
    </>
  );
}
