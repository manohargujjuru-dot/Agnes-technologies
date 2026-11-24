import { Link, Navigate, useParams } from "react-router-dom";
import { Notice, PageBanner, PageLoader, Reveal, SectionHead, TechLogo, useTitle } from "../components/ui.jsx";
import { BatchCard, CourseCard, splitTags } from "../components/Cards.jsx";
import EnquiryForm from "../components/EnquiryForm.jsx";
import { useData } from "../context/DataContext.jsx";


export default function CourseDetail() {
  const { id } = useParams();
  const { getCourse, catName, publishedCourses, upcomingBatches, loading } = useData();
  const c = getCourse(id);
  useTitle(c ? `${c.title} Course` : "Course", c?.summary);
  if (loading) return <PageLoader />;
  if (!c) return <Navigate to="/courses" replace />;

  const related = publishedCourses.filter(x => x.category === c.category && x.id !== c.id).slice(0, 3);
  const batches = upcomingBatches.filter(b => b.courseId === c.id);
  const facts = [
    ["Category", catName(c.category)], ["Duration", `${c.weeks} weeks`], ["Skill level", c.level], ["Delivery mode", c.mode],
    ["Schedule", c.schedule], ["Prerequisites", c.prerequisites], ["Target audience", c.audience]
  ];

  return (
    <>
      <PageBanner
        crumbs={[{ label: "Courses", to: "/courses" }, { label: catName(c.category), to: `/courses?cat=${c.category}#catalogue` }, { label: c.title }]}
        eyebrow={catName(c.category)} title={c.title} lead={c.summary}
        actions={<><a href="#enquiry" className="btn btn-primary">Enquire Now</a>{c.modules?.length > 0 && <a href="#syllabus" className="btn btn-outline">View Syllabus</a>}</>}
        art={<div className="course-hero-art"><img src="/images/code.webp" alt="" className="photo" /><TechLogo icon={c.icon} text={c.logo} size="xl" label={`${c.title} logo`} /></div>} />

      <section className="section">
        <div className="container detail-layout">
          <div className="detail-main">
            {c.flag && <Notice style={{ marginBottom: 32 }}>{c.flag}</Notice>}

            {splitTags(c.tools, 12).length > 0 && (
              <Reveal as="section">
                <h2>Key topics &amp; tools</h2>
                <ul className="tech-tags lg">{splitTags(c.tools, 12).map(t => <li key={t}>{t}</li>)}</ul>
              </Reveal>
            )}

            {(c.overview || c.summary) && (
              <Reveal as="section">
                <h2>About the course</h2>
                <p className="muted pre">{c.overview || c.summary}</p>
              </Reveal>
            )}

            {c.outcomes?.length > 0 && (
              <Reveal as="section">
                <h2>Learning outcomes</h2>
                <ul className="check-list">{c.outcomes.map(o => <li key={o}>{o}</li>)}</ul>
              </Reveal>
            )}

            {c.modules?.length > 0 && (
              <Reveal as="section" id="syllabus">
                <h2>Detailed syllabus</h2>
                <div className="accordion">
                  {c.modules.map((m, i) => (
                    <details key={i} open={i === 0}>
                      <summary>Module {i + 1}: {m.title}</summary>
                      {m.topics?.length > 0 && <div className="acc-body"><ul>{m.topics.map(t => <li key={t}>{t}</li>)}</ul></div>}
                    </details>
                  ))}
                </div>
              </Reveal>
            )}

            <Reveal as="section">
              <h2>Upcoming batches</h2>
              {batches.length ? <div className="grid grid-2">{batches.map(b => <BatchCard key={b.id} batch={b} />)}</div>
                : <p className="muted">No open batch right now. <a href="#enquiry">Enquire</a> for the next intake.</p>}
            </Reveal>
          </div>

          <aside className="card facts-card" aria-label="Course facts">
            <h3>Course facts</h3>
            <ul className="facts-list">
              {facts.filter(([, v]) => v).map(([k, v]) => <li key={k}><span>{k}</span><span>{v}</span></li>)}
            </ul>
            <a href="#enquiry" className="btn btn-primary block">Enquire Now</a>
          </aside>
        </div>
      </section>

      <section className="section alt" id="enquiry">
        <div className="container narrow">
          <SectionHead eyebrow="Course Enquiry" title="Ask about this course" />
          <Reveal className="form-card"><EnquiryForm key={c.id} kind="course" initial={{ course: c.id }} source={c.title} /></Reveal>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionHead title="Related courses" />
            <div className="grid grid-3">{related.map((r, i) => <CourseCard key={r.id} course={r} index={i} />)}</div>
            <div className="center" style={{ marginTop: 32 }}><Link to="/courses" className="btn btn-outline">All courses</Link></div>
          </div>
        </section>
      )}
    </>
  );
}
