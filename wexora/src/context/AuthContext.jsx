import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, tokenStore } from "../api.js";

/* Admin session: JWT from the API kept in sessionStorage (cleared when the browser tab closes). */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [account, setAccount] = useState(null); // { id, username, email, lastLoginAt }
  const [checking, setChecking] = useState(() => !!tokenStore.get());

  const logout = useCallback(() => { tokenStore.clear(); setAccount(null); }, []);

  // Validate an existing token on page load
  useEffect(() => {
    if (!tokenStore.get()) return;
    api("/auth/me", { auth: true })
      .then(d => setAccount(d.user))
      .catch(() => tokenStore.clear())
      .finally(() => setChecking(false));
  }, []);

  // Any 401 from an admin call (expired / signed out elsewhere) logs the user out
  useEffect(() => {
    window.addEventListener("wx:unauthorized", logout);
    return () => window.removeEventListener("wx:unauthorized", logout);
  }, [logout]);

  const login = async (username, password) => {
    const d = await api("/auth/login", { method: "POST", body: { username, password } });
    tokenStore.set(d.token);
    setAccount(d.user);
  };

  /* After profile/password changes the API returns a fresh token */
  const updateSession = useCallback((token, user) => {
    if (token) tokenStore.set(token);
    if (user) setAccount(user);
  }, []);

  return (
    <AuthContext.Provider value={{ user: account?.username || null, account, checking, login, logout, updateSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
