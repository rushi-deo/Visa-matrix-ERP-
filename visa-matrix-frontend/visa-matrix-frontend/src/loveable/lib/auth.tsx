import * as React from "react";

export type Role = "super_admin" | "hr" | "finance" | "crm" | "employee";
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

const KEY = "vm_auth";

function load(): User | null {
  if (typeof window === "undefined") return null;
  try { const v = localStorage.getItem(KEY); return v ? JSON.parse(v) : null; } catch { return null; }
}

interface Ctx {
  user: User | null;
  login: (email: string, role?: Role) => void;
  logout: () => void;
}
const AuthCtx = React.createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  React.useEffect(() => setUser(load()), []);
  const value = React.useMemo<Ctx>(() => ({
    user,
    login: (email, role = "super_admin") => {
      const u: User = {
        id: "u_001",
        name: email.split("@")[0].replace(/\W/g, " ").replace(/\b\w/g, c => c.toUpperCase()) || "Admin User",
        email, role,
      };
      localStorage.setItem(KEY, JSON.stringify(u));
      setUser(u);
    },
    logout: () => { localStorage.removeItem(KEY); setUser(null); },
  }), [user]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const c = React.useContext(AuthCtx);
  if (!c) throw new Error("useAuth outside AuthProvider");
  return c;
}