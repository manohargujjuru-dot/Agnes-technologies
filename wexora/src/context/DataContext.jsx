import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api.js";

/* All public website content comes from the API (database), loaded once and refreshed after admin edits. */
const DataContext = createContext(null);

const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
export const batchStatus = b => (b.end && new Date(b.end + "T00:00:00") < today() ? "Completed" : b.status);

const EMPTY_SITE = { settings: { name: "", shortName: "", social: {} }, categories: [], services: [], technologies: [] };

export function DataProvider({ children }) {
  const [site, setSite] = useState(EMPTY_SITE);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const [s, c, b] = await Promise.all([api("/site"), api("/courses"), api("/batches")]);
      setSite({ ...EMPTY_SITE, ...s, settings: { ...EMPTY_SITE.settings, ...s.settings } });
      setCourses(c);
      setBatches(b);
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const value = useMemo(() => ({
    ...site,                       // settings, categories, services, technologies
    courses,
    publishedCourses: courses,     // the public API only returns published courses
    batches,
    upcomingBatches: batches.filter(b => batchStatus(b) !== "Completed"),
    loading,
    error,
    refresh,
    catName: id => site.categories.find(c => c.id === id)?.name || id,
    getCourse: id => courses.find(c => c.id === id),
    getService: id => site.services.find(s => s.id === id),
    submitEnquiry: data => api("/enquiries", { method: "POST", body: data })
  }), [site, courses, batches, loading, error, refresh]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useData = () => useContext(DataContext);
