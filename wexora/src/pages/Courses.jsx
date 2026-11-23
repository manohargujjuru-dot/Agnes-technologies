import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Icon, PageBanner, PageLoader, Photo, useTitle } from "../components/ui.jsx";
import { CourseCard } from "../components/Cards.jsx";
import { LEVELS } from "../data/constants.js";
import { useData } from "../context/DataContext.jsx";

export default function Courses() {
  useTitle("Courses", "Explore instructor-led courses in Admin, AI, Backend, Cloud, Databases, Scripting, Testing and Web Development.");
  const { publishedCourses, categories, catName, loading, error, refresh } = useData();
  const [params, setParams] = useSearchParams();
  const cat = params.get("cat") || "all";
  const q = params.get("q") || "";
  const dur = params.get("dur") || "";
  const level = params.get("level") || "";

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    setParams(next, { replace: true });
  };
  const clearAll = () => setParams({}, { replace: true });

  // Only offer filters that have real data
  const durations = useMemo(() => [...new Set(publishedCourses.map(c => c.weeks))].sort((a, b) => a - b), [publishedCourses]);
  const levelsInUse = LEVELS.filter(l => publishedCourses.some(c => c.level === l));

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return publishedCourses.filter(c =>
      (cat === "all" || c.category === cat) &&
      (!dur || String(c.weeks) === dur) &&
      (!level || c.level === level) &&
      (!term || `${c.title} ${c.summary} ${c.tools || ""} ${catName(c.category)}`.toLowerCase().includes(term)));
  }, [publishedCourses, cat, q, dur, level, catName]);

  const tabs = [{ id: "all", name: "All" }, ...categories];

  return (
    <>
      <PageBanner crumbs={[{ label: "Courses" }]} eyebrow="Course Catalogue" title="Explore Our Courses"
        lead="Instructor-led technical training across cloud, AI, development, testing and more — built around practical, hands-on learning."
        actions={<>
          <Link to="/contact?type=course#enquiry" className="btn btn-primary">Enquire About a Course</Link>
          <Link to="/batches" className="btn btn-outline">Upcoming Batches</Link>
        </>}
        art={<Photo name="classroom" eager />} />

      <section className="section courses-section" id="catalogue">
        <div className="container">
          <div className="toolbar">
            <div className={`search-box ${q ? "has-value" : ""}`}>
              <span className="s-icon"><Icon name="search" size={18} /></span>
              <label htmlFor="course-search" className="sr-only">Search courses</label>
              <input id="course-search" type="search" placeholder="Search by course or technology…" autoComplete="off"
                value={q} onChange={e => update("q", e.target.value)} />
              {q && <button className="s-clear" type="button" aria-label="Clear search" onClick={() => update("q", "")}><Icon name="x" size={14} /></button>}
            </div>
            <div className="filters">
              <label htmlFor="dur" className="sr-only">Duration</label>
              <select id="dur" className="filter-select" value={dur} onChange={e => update("dur", e.target.value)}>
                <option value="">Any duration</option>
                {durations.map(d => <option key={d} value={d}>{d} weeks</option>)}
              </select>
              {levelsInUse.length > 0 && (
                <>
                  <label htmlFor="lvl" className="sr-only">Level</label>
                  <select id="lvl" className="filter-select" value={level} onChange={e => update("level", e.target.value)}>
                    <option value="">Any level</option>
                    {levelsInUse.map(l => <option key={l}>{l}</option>)}
                  </select>
                </>
              )}
              <span className="result-count" aria-live="polite">{list.length} course{list.length === 1 ? "" : "s"}</span>
            </div>
          </div>

          <div className="tabs" role="tablist" aria-label="Course categories">
            {tabs.map(t => {
              const n = t.id === "all" ? publishedCourses.length : publishedCourses.filter(c => c.category === t.id).length;
              return (
                <button key={t.id} className="tab" role="tab" aria-selected={cat === t.id} onClick={() => update("cat", t.id === "all" ? "" : t.id)}>
                  {t.name}<span className="count">{n}</span>
                </button>
              );
            })}
          </div>

          {loading ? <PageLoader /> : error ? (
            <div className="empty-state">
              <h3>Couldn't load courses</h3>
              <p className="muted">{error}</p>
              <button className="btn btn-outline" onClick={refresh}>Try again</button>
            </div>
          ) : list.length > 0 ? (
            /* key forces a fresh mount so the card entrance animation replays on each filter change */
            <div className="grid grid-3" key={`${cat}|${dur}|${level}|${q}`}>
              {list.map((c, i) => <CourseCard key={c.id} course={c} index={i} />)}
            </div>
          ) : (
            <div className="empty-state">
              <Icon name="search" size={36} />
              <h3>No courses found</h3>
              <p className="muted">Try a different search term or category.</p>
              <button className="btn btn-outline" onClick={clearAll}>Clear filters</button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
