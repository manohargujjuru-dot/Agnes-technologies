/* Small fetch wrapper for the Wexora API (/api is proxied to the Express server in dev). */
const TOKEN_KEY = "wx_admin_token";

export const tokenStore = {
  get() { try { return sessionStorage.getItem(TOKEN_KEY); } catch { return null; } },
  set(t) { try { sessionStorage.setItem(TOKEN_KEY, t); } catch { /* ignore */ } },
  clear() { try { sessionStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ } }
};

export class ApiError extends Error {
  constructor(message, status, details) { super(message); this.status = status; this.details = details; }
}

export async function api(path, { method = "GET", body, auth = false } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) { const t = tokenStore.get(); if (t) headers.Authorization = `Bearer ${t}`; }

  let res;
  try {
    res = await fetch(`/api${path}`, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
  } catch {
    throw new ApiError("Cannot reach the server. Check your connection and try again.", 0);
  }
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && auth) window.dispatchEvent(new Event("wx:unauthorized"));
    throw new ApiError(data?.error || `Request failed (${res.status})`, res.status, data?.details);
  }
  return data;
}

/* Password reset (no sign-in needed) */
export const passwordApi = {
  options: () => api("/auth/reset-options"),
  forgot: email => api("/auth/forgot-password", { method: "POST", body: { email } }),
  reset: (token, password) => api("/auth/reset-password", { method: "POST", body: { token, password } })
};

/* Admin endpoints */
export const adminApi = {
  courses: () => api("/admin/courses", { auth: true }),
  createCourse: c => api("/admin/courses", { method: "POST", body: c, auth: true }),
  updateCourse: (id, c) => api(`/admin/courses/${encodeURIComponent(id)}`, { method: "PUT", body: c, auth: true }),
  setPublished: (id, published) => api(`/admin/courses/${encodeURIComponent(id)}/publish`, { method: "PATCH", body: { published }, auth: true }),
  deleteCourse: id => api(`/admin/courses/${encodeURIComponent(id)}`, { method: "DELETE", auth: true }),

  batches: () => api("/admin/batches", { auth: true }),
  createBatch: b => api("/admin/batches", { method: "POST", body: b, auth: true }),
  updateBatch: (id, b) => api(`/admin/batches/${encodeURIComponent(id)}`, { method: "PUT", body: b, auth: true }),
  deleteBatch: id => api(`/admin/batches/${encodeURIComponent(id)}`, { method: "DELETE", auth: true }),

  enquiries: () => api("/admin/enquiries", { auth: true }),
  setRead: (id, read) => api(`/admin/enquiries/${id}`, { method: "PATCH", body: { read }, auth: true }),
  deleteEnquiry: id => api(`/admin/enquiries/${id}`, { method: "DELETE", auth: true }),

  categories: () => api("/admin/categories", { auth: true }),
  createCategory: c => api("/admin/categories", { method: "POST", body: c, auth: true }),
  updateCategory: (id, c) => api(`/admin/categories/${encodeURIComponent(id)}`, { method: "PUT", body: c, auth: true }),
  deleteCategory: id => api(`/admin/categories/${encodeURIComponent(id)}`, { method: "DELETE", auth: true }),

  services: () => api("/admin/services", { auth: true }),
  createService: s => api("/admin/services", { method: "POST", body: s, auth: true }),
  updateService: (id, s) => api(`/admin/services/${encodeURIComponent(id)}`, { method: "PUT", body: s, auth: true }),
  deleteService: id => api(`/admin/services/${encodeURIComponent(id)}`, { method: "DELETE", auth: true }),

  technologies: () => api("/admin/technologies", { auth: true }),
  createTechnology: t => api("/admin/technologies", { method: "POST", body: t, auth: true }),
  updateTechnology: (id, t) => api(`/admin/technologies/${id}`, { method: "PUT", body: t, auth: true }),
  deleteTechnology: id => api(`/admin/technologies/${id}`, { method: "DELETE", auth: true }),

  settings: () => api("/admin/settings", { auth: true }),
  saveSettings: s => api("/admin/settings", { method: "PUT", body: s, auth: true }),
  changePassword: (currentPassword, newPassword) => api("/auth/change-password", { method: "POST", body: { currentPassword, newPassword }, auth: true }),
  me: () => api("/auth/me", { auth: true }),
  updateProfile: p => api("/auth/profile", { method: "PUT", body: p, auth: true }),
  logoutAll: () => api("/auth/logout-all", { method: "POST", auth: true }),

  system: () => api("/admin/system", { auth: true })
};
