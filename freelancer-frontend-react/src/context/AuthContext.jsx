import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api";
import { clearToken, getToken, setToken } from "../api/client";

const AuthContext = createContext(null);
const USER_KEY = "loggedInUser";

function loadUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser);
  const [token, setTokenState] = useState(getToken());
  const navigate = useNavigate();

  useEffect(() => {
    // Cross-tab logout/login sync.
    const onStorage = (e) => {
      if (e.key === USER_KEY) setUser(e.newValue ? JSON.parse(e.newValue) : null);
      if (e.key === "authToken") setTokenState(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persist = (auth) => {
    setToken(auth.token);
    setTokenState(auth.token);
    setUser(auth.user);
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
    } catch {
      /* ignore */
    }
  };

  const login = useCallback(async (email, password) => {
    const { data } = await authApi.login({ email, password });
    persist(data);
    return data.user;
  }, []);

  const signup = useCallback(async (payload) => {
    await authApi.signup(payload);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
    setUser(null);
    try {
      localStorage.removeItem(USER_KEY);
    } catch {
      /* ignore */
    }
    navigate("/login");
  }, [navigate]);

  const dashboardFor = (role) => {
    const r = (role || "").toUpperCase();
    if (r === "ADMIN") return "/admin";
    if (r === "CLIENT") return "/client-dashboard";
    if (r === "FREELANCER") return "/freelancer-dashboard";
    return "/home";
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isLoggedIn: !!user && !!token,
      role: (user?.role || "").toUpperCase(),
      email: user?.email || "",
      login,
      signup,
      logout,
      dashboardFor,
    }),
    [user, token, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
