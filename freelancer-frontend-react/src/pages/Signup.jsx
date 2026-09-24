import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiError } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { ErrorBanner, Page } from "../components/ui";

// Mirrors backend SignupRequest: min 8 chars, upper + lower +
// digit + special. Single source text shown under the field.
const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "One lowercase letter (a–z)", test: (p) => /[a-z]/.test(p) },
  { label: "One uppercase letter (A–Z)", test: (p) => /[A-Z]/.test(p) },
  { label: "One digit (0–9)", test: (p) => /\d/.test(p) },
  {
    label: "One special character (@$!%*?&^#_+-=:;.)",
    test: (p) => /[@$!%*?&^#_+\-=:;.]/.test(p),
  },
];

export function isStrongPassword(password) {
  return PASSWORD_RULES.every((r) => r.test(password || ""));
}

export function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const trimmedEmail = email.trim();
    if (name.trim().length < 2) return setError("Please enter your full name.");
    if (!trimmedEmail.includes("@"))
      return setError("Please enter a valid email address.");
    if (!role) return setError("Please choose Freelancer or Client.");
    if (!isStrongPassword(password))
      return setError(
        "Password must be 8+ characters with uppercase, lowercase, digit and special character.",
      );
    if (password !== confirmPassword)
      return setError("Passwords do not match.");
    if (!terms) return setError("Please accept the Terms & Conditions.");
    setCreating(true);
    try {
      await signup({
        name: name.trim(),
        email: trimmedEmail,
        password,
        role,
      });
      navigate("/login", { replace: true });
    } catch (err) {
      setError(apiError(err, "Signup failed. Please try again."));
    } finally {
      setCreating(false);
    }
  };

  return (
    <Page title="Create your account" subtitle="Join FreelanceHub today.">
      <form className="form card" onSubmit={onSubmit}>
        <ErrorBanner message={error} />
        <label className="field">
          <span>Full name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            required
          />
        </label>
        <label className="field">
          <span>Email address</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </label>
        <div className="field">
          <span>I want to join as</span>
          <div className="row">
            {["FREELANCER", "CLIENT"].map((r) => (
              <label key={r} className={`role${role === r ? " selected" : ""}`}>
                <input
                  type="radio"
                  name="role"
                  value={r}
                  checked={role === r}
                  onChange={() => setRole(r)}
                />
                {r === "FREELANCER" ? "👩‍💻 Freelancer" : "💼 Client"}
              </label>
            ))}
          </div>
        </div>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a strong password"
            required
          />
          {password && (
            <ul className="pw-checklist">
              {PASSWORD_RULES.map((r) => {
                const ok = r.test(password);
                return (
                  <li key={r.label} className={ok ? "ok" : "bad"}>
                    {ok ? "✓" : "○"} {r.label}
                  </li>
                );
              })}
            </ul>
          )}
        </label>
        <label className="field">
          <span>Confirm password</span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            required
          />
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
          />
          I agree to the Terms &amp; Conditions and Privacy Policy
        </label>
        <button className="btn btn-primary" disabled={creating}>
          {creating ? "Creating…" : "Create account →"}
        </button>
        <p className="muted small">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </Page>
  );
}
