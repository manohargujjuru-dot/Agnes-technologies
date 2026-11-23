import { Link, Navigate, useParams } from "react-router-dom";
import { Notice, PageBanner, PageLoader, Reveal, SectionHead, TBC, TechLogo, useTitle } from "../components/ui.jsx";
import { BatchCard, CourseCard } from "../components/Cards.jsx";
import EnquiryForm from "../components/EnquiryForm.jsx";
import { useData } from "../context/DataContext.jsx";

const FAQ = ["Is this course suitable for me?", "What are the prerequisites?", "What are the class timings and mode?", "Are session recordings available?", "Will I receive a certificate?", "What support is available after the course?"];

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
        actions={<><a href="#enquiry" className="btn btn-primary">Enquire Now</a><a href="#syllabus" className="btn btn-outline">View Syllabus</a></>}
        art={<div className="course-hero-art"><img src="/images/code.webp" alt="" className="photo" /><TechLogo icon={c.icon} text={c.logo} size="xl" label={`${c.title} logo`} /></div>} />

      <section className="section">
        <div className="container detail-layout">
          <div className="detail-main">
            {c.flag && <Notice style={{ marginBottom: 32 }}>{c.flag}</Notice>}

            <Reveal as="section">
              <h2>About the course</h2>
              {c.overview ? <p className="muted pre">{c.overview}</p>
                : <Notice>Full course overview — what it covers, why the skill is useful and what learners will practise — will be supplied by the trainer/management.</Notice>}
            </Reveal>

            <Reveal as="section">
              <h2>Learning outcomes</h2>
              {c.outcomes?.length ? <ul className="check-list">{c.outcomes.map(o => <li key={o}>{o}</li>)}</ul>
                : <p className="muted">Skills and knowledge learners gain after completing the course: <TBC />.</p>}
            </Reveal>

            <Reveal as="section" id="syllabus">
              <h2>Detailed syllabus</h2>
              <div className="accordion">
                {c.modules?.length ? c.modules.map((m, i) => (
                  <details key={i} open={i === 0}>
                    <summary>Module {i + 1} — {m.title}</summary>
                    <div className="acc-body">
                      {m.topics?.length ? <ul>{m.topics.map(t => <li key={t}>{t}</li>)}</ul> : <TBC />}
                    </div>
                  </details>
                )) : [1, 2, 3].map(n => (
                  <details key={n}><summary>Module {n} — title to be confirmed</summary><div className="acc-body">Topic list will be added from the approved syllabus.</div></details>
                ))}
              </div>
            </Reveal>

            <Reveal as="section">
              <h2>Tools, software &amp; prerequisites</h2>
              <p className="muted"><strong>Tools:</strong> {c.tools || <TBC />}</p>
              <p className="muted"><strong>Prerequisites:</strong> {c.prerequisites || <TBC />}</p>
            </Reveal>

            <Reveal as="section">
              <h2>Frequently asked questions</h2>
              <div className="accordion">
                {FAQ.map(q => <details key={q}><summary>{q}</summary><div className="acc-body"><TBC /></div></details>)}
              </div>
            </Reveal>

            <Reveal as="section">
              <h2>Upcoming batches</h2>
              {batches.length ? <div className="grid grid-2">{batches.map(b => <BatchCard key={b.id} batch={b} />)}</div>
                : <p className="muted">No batches are currently scheduled for this course. <a href="#enquiry">Enquire</a> to be notified of the next intake.</p>}
            </Reveal>
          </div>

          <aside className="card facts-card" aria-label="Course facts">
            <h3>Course facts</h3>
            <ul className="facts-list">
              {facts.map(([k, v]) => <li key={k}><span>{k}</span><span>{v || <TBC />}</span></li>)}
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
