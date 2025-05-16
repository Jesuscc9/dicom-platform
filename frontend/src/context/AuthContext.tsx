// src/context/AuthContext.tsx
import React, {
  createContext,
  useState,
  useEffect,
  type ReactNode,
  useContext,
} from "react";
import api from "../api";

type Auth = {
  access: string | null;
  refresh: string | null;
  user?: { username: string; email: string; role: string };
};

type AuthCtx = {
  auth: Auth;
  login: (u: string, p: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthCtx>({} as any);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<Auth>({
    access: null,
    refresh: null,
  });

  const loadStored = async () => {
    const access = localStorage.getItem("access");
    const refresh = localStorage.getItem("refresh");
    if (access && refresh) {
      api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
      try {
        const { data } = await api.get("/auth/me/");
        setAuth({ access, refresh, user: data });
      } catch {
        logout();
      }
    }
  };

  useEffect(() => {
    loadStored();
  }, []);

  const login = async (username: string, password: string) => {
    const { data } = await api.post("/auth/login/", { username, password });
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);
    api.defaults.headers.common["Authorization"] = `Bearer ${data.access}`;
    const me = await api.get("/auth/me/");
    setAuth({ access: data.access, refresh: data.refresh, user: me.data });
  };

  const logout = () => {
    localStorage.clear();
    delete api.defaults.headers.common["Authorization"];
    setAuth({ access: null, refresh: null, user: undefined });
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
