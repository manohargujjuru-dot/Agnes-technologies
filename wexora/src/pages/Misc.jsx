import { Link, useSearchParams } from "react-router-dom";
import { Icon, Notice, PageBanner, Reveal, SectionHead, useTitle } from "../components/ui.jsx";
import { BatchCard } from "../components/Cards.jsx";
import EnquiryForm from "../components/EnquiryForm.jsx";
import { telHref } from "../components/Layout.jsx";
import { batchStatus, useData } from "../context/DataContext.jsx";

export function Batches() {
  useTitle("Upcoming Batches", "Currently open training batches — dates, timings, mode and enrolment.");
  const { batches, upcomingBatches } = useData();
  const past = batches.filter(b => batchStatus(b) === "Completed");
  return (
    <>
      <PageBanner crumbs={[{ label: "Upcoming Batches" }]} eyebrow="Training Batches" title="Upcoming Batches"
        lead="Live instructor-led batches · Online & classroom · Limited seats" />
      <section className="section tight-top">
        <div className="container">
          {upcomingBatches.length
            ? <div className="grid grid-3">{upcomingBatches.map((b, i) => <BatchCard key={b.id} batch={b} delay={(i % 3) * 80} />)}</div>
            : <p className="muted">No batches currently open.</p>}
        </div>
      </section>
      <section className="section alt">
        <div className="container">
          <SectionHead title="Completed batches" />
          {past.length ? <div className="grid grid-3">{past.map(b => <BatchCard key={b.id} batch={b} />)}</div> : <p className="muted center">No archived batches.</p>}
        </div>
      </section>
    </>
  );
}

const TYPE_MAP = { course: "Course Enquiry", web: "Web Development", app: "App Development", training: "Online Training", support: "IT Support", corporate: "Corporate Training" };

export function Contact() {
  useTitle("Contact Us", "Contact our team about development, IT support, corporate training or courses.");
  const [params] = useSearchParams();
  const { getCourse, loading, settings } = useData();
  const mapQuery = settings.mapQuery || settings.address;
  const course = getCourse(params.get("course") || "");
  const batch = params.get("batch") || "";
  const initial = {
    enquiryType: TYPE_MAP[params.get("type")] || "",
    course: course?.id || (/DEVOPS/.test(batch) ? "devops" : /PBI/.test(batch) ? "power-bi" : ""),
    batch,
    subject: batch ? `Batch enquiry: ${batch}` : course ? `Course enquiry: ${course.title}` : ""
  };
  const cards = [
    settings.phone && ["tel", "Phone", <a href={telHref(settings.phone)}>{settings.phone}</a>],
    settings.email && ["mail", "Email", <a href={`mailto:${settings.email}`}>{settings.email}</a>],
    settings.address && ["pin", "Office Address", settings.address],
    settings.hours && ["clock", "Working Hours", settings.hours]
  ].filter(Boolean);
  return (
    <>
      <PageBanner crumbs={[{ label: "Contact Us" }]} eyebrow="Contact Us" title="Let's talk"
        lead="Projects · Training · Course enquiries" />
      <section className="section tight-top">
        <div className="container">
          <div className="contact-cards">
            {cards.map(([ic, t, v], i) => (
              <Reveal className="card contact-card" key={t} delay={i * 70}>
                <div className="icon-box"><Icon name={ic} size={24} /></div><h3>{t}</h3><p>{v}</p>
              </Reveal>
            ))}
          </div>
          <div className="split align-start" id="enquiry">
            <Reveal className="form-card">
              <h2 className="h3">Send us a message</h2>
              <p className="muted small">Fields marked <span className="req">*</span> are required.</p>
              <EnquiryForm key={`${params}|${loading}`} kind="contact" initial={initial} source="Contact page" />
            </Reveal>
            <Reveal className="map-card" delay={120}>
              {mapQuery ? (
                <>
                  <iframe title={`Map showing the ${settings.name} office location`} className="map-frame" loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`} />
                  <div className="map-info">
                    <span className="map-pin"><Icon name="pin" size={20} /></span>
                    <div><strong>Visit our office</strong><p>{settings.address}</p></div>
                    <a className="btn btn-primary btn-sm" target="_blank" rel="noopener noreferrer"
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapQuery)}`}>Get directions</a>
                  </div>
                </>
              ) : (
                <div className="map-box"><Icon name="pin" size={40} /><p className="muted">Office location coming soon.</p></div>
              )}
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}

export function Legal() {
  useTitle("Privacy Policy & Terms");
  return (
    <>
      <PageBanner crumbs={[{ label: "Privacy & Terms" }]} title="Privacy Policy & Terms" />
      <section className="section tight-top">
        <div className="container prose">
          <Notice>These are placeholder sections. Final legal text must be supplied and approved before launch.</Notice>
          <h2 id="privacy">Privacy Policy</h2>
          <p>This section will explain what personal information is collected through enquiry forms (such as name, email and phone), how it is used to respond to enquiries, how long it is kept, and how visitors can request access or deletion.</p>
          <h2 id="terms">Terms of Use</h2>
          <p>This section will describe the terms governing use of this website, course enrolment, and service enquiries.</p>
        </div>
      </section>
    </>
  );
}

export function NotFound() {
  useTitle("Page not found");
  return (
    <section className="section center">
      <div className="container">
        <h1 className="big-404">404</h1>
        <h2>Page not found</h2>
        <p className="muted">The page you're looking for doesn't exist or has moved.</p>
        <Link to="/" className="btn btn-primary">Back to Home</Link>
      </div>
    </section>
  );
}
