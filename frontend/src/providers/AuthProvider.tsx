import { useEffect, useMemo, useState, type ReactNode } from "react";
import { fetchCurrentUser, login, logout, signup, type AuthUser } from "../lib/api";
import { AuthContext, type AuthContextValue } from "./AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchCurrentUser().then((result) => setUser(result.user)).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    signIn: async (email, password) => setUser((await login(email, password)).user),
    signUp: async (name, phone, email, password, confirmPassword) => {
      await signup(name, phone, email, password, confirmPassword);
    },
    signOut: async () => {
      await logout();
      setUser(null);
    },
  }), [loading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
