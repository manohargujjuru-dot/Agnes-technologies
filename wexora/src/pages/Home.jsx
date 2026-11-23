import { Link } from "react-router-dom";
import { Icon, Photo, Reveal, SectionHead, TechLogo, useTitle } from "../components/ui.jsx";
import { BatchCard, ServiceCard } from "../components/Cards.jsx";
import EnquiryForm from "../components/EnquiryForm.jsx";
import { useData } from "../context/DataContext.jsx";

export default function Home() {
  useTitle(null, "Web and app development, IT support, corporate training and instructor-led online courses.");
  const { upcomingBatches, getCourse, services, technologies } = useData();
  const featured = upcomingBatches.filter(b => b.featured);

  return (
    <>
      {/* HERO */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-bg" aria-hidden="true"><span className="blob b1" /><span className="blob b2" /><span className="ring" /></div>
        <div className="container hero-grid">
          <div>
            <span className="eyebrow anim">Technology Services &amp; Training</span>
            <h1 id="hero-title" className="anim d1">Build software. <span className="hl">Build skills.</span> Grow faster.</h1>
            <p className="hero-lead anim d2">We design and develop websites and mobile apps, support your IT, and run instructor-led training that helps people and teams master in-demand technology.</p>
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

      {/* WHAT WE SERVE */}
      <section className="section">
        <div className="container">
          <SectionHead eyebrow="What We Serve" title="Services that move your business forward">
            From your first website to upskilling an entire team — one partner for building, supporting and learning technology.
          </SectionHead>
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
            <p className="muted">We are a technology services company focused on software and mobile app development. Alongside building products for our clients, we deliver practical technical training and dependable IT support.</p>
            <ul className="check-list">
              <li>Custom websites, web applications and mobile apps</li>
              <li>Instructor-led online and corporate training</li>
              <li>IT support and ongoing technical assistance</li>
            </ul>
            <Link to="/about" className="btn btn-primary">Read More</Link>
          </Reveal>
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
          <SectionHead eyebrow="Upcoming Project Training Batches" title="Join the next batch">
            Live, instructor-led batches currently open for enrolment.
          </SectionHead>
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
            <p className="muted">Choose a topic and the form will ask for the details that matter. We'll get back to you to discuss next steps.</p>
            <ul className="check-list">
              <li>Website or app project quotes</li>
              <li>Course and batch information</li>
              <li>IT support and corporate training requests</li>
            </ul>
          </Reveal>
          <Reveal className="form-card" delay={120}><EnquiryForm kind="general" source="Home page" /></Reveal>
        </div>
      </section>
    </>
  );
}
