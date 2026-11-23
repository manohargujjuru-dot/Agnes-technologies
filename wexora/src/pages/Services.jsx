import { Link, Navigate, useParams } from "react-router-dom";
import { Icon, Notice, PageBanner, PageLoader, Photo, Reveal, SectionHead, Steps, useTitle } from "../components/ui.jsx";
import { BatchCard, ServiceCard } from "../components/Cards.jsx";
import EnquiryForm from "../components/EnquiryForm.jsx";
import { useData } from "../context/DataContext.jsx";

export function Services() {
  useTitle("Services", "Web development, app development, online training, IT support and corporate training.");
  const { services, loading } = useData();
  return (
    <>
      <PageBanner crumbs={[{ label: "Services" }]} eyebrow="Our Services" title="Everything you need to build, run and learn technology"
        lead="Pick a service to see what's included, how we work and how to get started."
        actions={<Link to="/contact" className="btn btn-primary">Start a Conversation</Link>} art={<Photo name="analytics" eager />} />
      <section className="section">
        <div className="container grid grid-3">
          {loading ? <PageLoader /> : services.map((s, i) => <ServiceCard key={s.id} service={s} delay={(i % 3) * 90} />)}
        </div>
      </section>
    </>
  );
}

export function ServiceDetail() {
  const { id } = useParams();
  const { upcomingBatches, getService, loading } = useData();
  const s = getService(id);
  useTitle(s?.title, s?.short);
  if (loading) return <PageLoader />;
  if (!s) return <Navigate to="/services" replace />;

  return (
    <>
      <PageBanner crumbs={[{ label: "Services", to: "/services" }, { label: s.title }]} eyebrow={s.title} title={s.hero} lead={s.short}
        actions={<>
          <Link to={s.ctaLink || "#enquiry"} className="btn btn-primary">{s.cta}</Link>
          <Link to="/services" className="btn btn-outline">All Services</Link>
        </>}
        art={<Photo key={s.id} name={s.image || "analytics"} eager />} />

      <section className="section">
        <div className="container">
          <SectionHead title={s.typesTitle} />
          <div className="grid grid-3">
            {s.types.length > 0 && s.types.map((t, i) => (
              <Reveal className="card hover type-card" key={t} delay={(i % 3) * 80}>
                <div className="icon-box sm"><Icon name={s.icon} size={22} /></div><h3>{t}</h3>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container split">
          <Reveal>
            <h2>{s.capsTitle}</h2>
            <ul className="check-list">{s.caps.map(c => <li key={c}>{c}</li>)}</ul>
            {s.showNote && <Notice>Support hours, response times and any 24/7 availability will only be shown once verified by management.</Notice>}
          </Reveal>
          <Reveal className="split-art framed" delay={120}><Photo name={s.formKind === "corporate" ? "classroom" : "developers"} /></Reveal>
        </div>
      </section>

      {s.process.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionHead eyebrow="Our process" title="How we work" />
            <Steps items={s.process} />
          </div>
        </section>
      )}

      {s.showBatches && (
        <section className="section">
          <div className="container">
            <SectionHead eyebrow="Upcoming batches" title="Currently open for enrolment" />
            <div className="grid grid-3">{upcomingBatches.map((b, i) => <BatchCard key={b.id} batch={b} delay={i * 80} />)}</div>
            <div className="center" style={{ marginTop: 32 }}><Link className="btn btn-outline" to="/courses">Browse full catalogue</Link></div>
          </div>
        </section>
      )}

      <section className="section alt" id="enquiry">
        <div className="container narrow">
          <SectionHead eyebrow="Enquiry" title={s.cta}>Share a few details and our team will be in touch.</SectionHead>
          <Reveal className="form-card">
            <EnquiryForm key={s.id} kind={s.formKind} source={s.title} submitLabel={s.ctaLink ? "Send Enquiry" : s.cta} />
          </Reveal>
        </div>
      </section>
    </>
  );
}
