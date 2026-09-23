import axios from "axios";

// Base URL: VITE_API_URL in production, local Spring Boot in dev.
// Mirrors the old auth.js behaviour (local pages -> localhost,
// deployed pages -> Render) but driven by a single env var.
const baseURL =
  import.meta.env.VITE_API_URL?.trim() || "http://localhost:8080";

export const api = axios.create({ baseURL });

const TOKEN_KEY = "authToken";

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* storage unavailable */
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable */
  }
}

// Attach JWT to every non-public request.
api.interceptors.request.use((config) => {
  const token = getToken();
  const url = config.url || "";
  const isPublic =
    /\/api\/(users\/(login|signup)|otp\/)/.test(url) ||
    (config.method === "get" &&
      (/\/api\/jobs/.test(url) || /\/api\/users$/.test(url)));
  if (token && !isPublic && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401 with a stored session, drop it so the app
// redirects to login instead of looping on bad tokens.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    const url = err?.config?.url || "";
    const isAuthEndpoint = /\/api\/(users\/(login|signup)|otp\/)/.test(url);
    if (status === 401 && getToken() && !isAuthEndpoint) {
      clearToken();
      try {
        localStorage.removeItem("loggedInUser");
      } catch {
        /* ignore */
      }
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  },
);

// Backend returns either JSON {message} or plain text errors.
// Normalise to a readable string for the UI.
export function apiError(err, fallback) {
  const data = err?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data?.message) return data.message;
  if (err?.code === "ERR_NETWORK") {
    return "Cannot reach the server. Is the backend running?";
  }
  return fallback || "Something went wrong. Please try again.";
}
