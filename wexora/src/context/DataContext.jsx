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
  const [logoVersion, setLogoVersion] = useState(null); // null = built-in logo, number = custom upload

  const refresh = useCallback(async () => {
    try {
      const [s, c, b] = await Promise.all([api("/site"), api("/courses"), api("/batches")]);
      setSite({ ...EMPTY_SITE, ...s, settings: { ...EMPTY_SITE.settings, ...s.settings } });
      setLogoVersion(s.logoVersion ?? null);
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

  // browser-tab icon follows the uploaded logo
  useEffect(() => {
    const href = logoVersion ? `/api/logo?v=${logoVersion}` : "/favicon-32.png";
    document.querySelectorAll('link[rel="icon"]').forEach(l => l.setAttribute("href", href));
  }, [logoVersion]);

  const value = useMemo(() => ({
    ...site,                       // settings, categories, services, technologies
    courses,
    publishedCourses: courses,     // the public API only returns published courses
    batches,
    upcomingBatches: batches.filter(b => batchStatus(b) !== "Completed"),
    loading,
    error,
    refresh,
    logoVersion,
    setLogoVersion,
    logoUrl: logoVersion ? `/api/logo?v=${logoVersion}` : "/logo-square.png",
    catName: id => site.categories.find(c => c.id === id)?.name || id,
    getCourse: id => courses.find(c => c.id === id),
    getService: id => site.services.find(s => s.id === id),
    submitEnquiry: data => api("/enquiries", { method: "POST", body: data })
  }), [site, courses, batches, loading, error, refresh, logoVersion]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useData = () => useContext(DataContext);
