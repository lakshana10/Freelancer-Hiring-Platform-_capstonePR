import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiError } from "../api/client";
import { ErrorBanner, Page } from "../components/ui";

export function Login() {
  const { login, dashboardFor } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please enter email and password.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const user = await login(email.trim(), password);
      const from = location.state?.from;
      navigate(from || dashboardFor(user.role), { replace: true });
    } catch (err) {
      setError(apiError(err, "Login failed. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page title="Welcome back" subtitle="Login to your FreelanceHub account.">
      <form className="form card" onSubmit={onSubmit}>
        <ErrorBanner message={error} />
        <label className="field">
          <span>Email address</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </label>
        <label className="field">
          <span>Password</span>
          <div className="password-wrap">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              required
            />
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>
        </label>
        <button className="btn btn-primary" disabled={busy}>
          {busy ? "Logging in…" : "Login →"}
        </button>
        <p className="muted small">
          No account? <Link to="/signup">Create one</Link>
        </p>
      </form>
    </Page>
  );
}
