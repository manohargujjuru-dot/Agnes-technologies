import { Link } from "react-router-dom";
import { Icon, Reveal, TechLogo } from "./ui.jsx";
import { ICON_BY_TEXT } from "../data/logos.js";
import { batchStatus, useData } from "../context/DataContext.jsx";

const fmtDate = d => (d ? new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—");
const weeksBetween = (a, b) => (a && b ? Math.max(1, Math.round((new Date(b) - new Date(a)) / (7 * 864e5))) : "—");

export function ServiceCard({ service, delay }) {
  return (
    <Reveal as="article" className="card hover service-card" delay={delay}>
      <div className="icon-box"><Icon name={service.icon} size={26} /></div>
      <h3>{service.title}</h3>
      <p>{service.short}</p>
      <Link className="link-arrow" to={`/services/${service.id}`}>Learn More <Icon name="arrow" size={16} /></Link>
    </Reveal>
  );
}

export function CourseCard({ course, index = 0 }) {
  const { catName } = useData();
  return (
    /* Uses a mount animation (not scroll-reveal) so cards always appear after filtering. */
    <article className="card hover course-card card-in" style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}>
      <div className="course-thumb">
        <span className="badge badge-light">{catName(course.category)}</span>
        <TechLogo icon={course.icon} text={course.logo || course.title.slice(0, 2).toUpperCase()} size="lg" />
      </div>
      <div className="course-body">
        <h3>{course.title}</h3>
        <div className="course-facts">
          <span><Icon name="clock" size={16} /> {course.weeks} weeks</span>
          <span><Icon name="level" size={16} /> {course.level || "Level: TBC"}</span>
        </div>
        <p>{course.summary}</p>
        <div className="course-actions">
          <Link className="btn btn-outline btn-sm" to={`/courses/${course.id}`}>View Details</Link>
          <Link className="btn btn-primary btn-sm" to={`/contact?type=course&course=${course.id}#enquiry`}>Enquire Now</Link>
        </div>
      </div>
    </article>
  );
}

export function BatchCard({ batch, delay }) {
  const { getCourse } = useData();
  const st = batchStatus(batch);
  const badge = st === "Enrolling" ? "badge-green" : st === "Completed" ? "badge-gray" : "badge-amber";
  const q = new URLSearchParams({ type: "course", batch: batch.code });
  if (batch.courseId) q.set("course", batch.courseId);
  return (
    <Reveal as="article" className="card batch-card" delay={delay}>
      <div className="batch-top">
        <TechLogo icon={getCourse(batch.courseId)?.icon || ICON_BY_TEXT[batch.logo]} text={batch.logo} />
        <div>
          <h3>{batch.title}</h3>
          <span className={`badge ${badge}`}>{st}</span>
        </div>
      </div>
      <p className="muted small">{batch.desc}</p>
      <ul className="batch-meta">
        <li><span>Batch code</span><span>{batch.code}</span></li>
        <li><span>Start date</span><span>{fmtDate(batch.start)}</span></li>
        <li><span>Days</span><span>{batch.days}</span></li>
        <li><span>Time</span><span>{batch.time} {batch.tz}</span></li>
        <li><span>Duration</span><span>{weeksBetween(batch.start, batch.end)} weeks</span></li>
        <li><span>Mode</span><span>{batch.mode}</span></li>
      </ul>
      {st === "Enrolling"
        ? <Link className="btn btn-primary" to={`/contact?${q}#enquiry`}>Enrol Now</Link>
        : <button className="btn btn-outline" disabled>{st}</button>}
      {batch.courseId && (
        <Link className="link-arrow center" to={`/courses/${batch.courseId}`}>View course syllabus <Icon name="arrow" size={16} /></Link>
      )}
    </Reveal>
  );
}
