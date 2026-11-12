import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem("accessToken")));

  const signOut = useCallback(() => {
    localStorage.removeItem("accessToken");
    setUser(null);
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) return;
    api
      .get("/auth/me")
      .then(({ data }) => setUser(data.data.user))
      .catch(signOut)
      .finally(() => setLoading(false));
  }, [signOut]);

  const signIn = useCallback((payload) => {
    localStorage.setItem("accessToken", payload.accessToken);
    setUser(payload.user);
  }, []);

  const value = useMemo(
    () => ({ user, loading, signIn, signOut }),
    [user, loading, signIn, signOut],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
