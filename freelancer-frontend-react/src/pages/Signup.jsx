import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { otpApi } from "../api";
import { apiError } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { ErrorBanner, Page, SuccessBanner } from "../components/ui";

const RESEND_COOLDOWN_MS = 60000;

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
  const [otp, setOtp] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [otpMessage, setOtpMessage] = useState({ text: "", ok: true });
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [creating, setCreating] = useState(false);
  const cooldownUntil = useRef(0);

  const onEmailChange = (value) => {
    setEmail(value);
    setOtpVerified(false);
    setVerifiedEmail("");
    setOtpMessage({ text: "", ok: true });
  };

  const sendOtp = async () => {
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setError("Please enter a valid email address first.");
      return;
    }
    const waitMs = cooldownUntil.current - Date.now();
    if (waitMs > 0) {
      setError(`Please wait ${Math.ceil(waitMs / 1000)}s before resending.`);
      return;
    }
    setSending(true);
    setError("");
    try {
      await otpApi.generate(trimmed);
      setOtpMessage({
        text: "✓ OTP sent. Check your email.",
        ok: true,
      });
      setOtpVerified(false);
      setVerifiedEmail("");
      cooldownUntil.current = Date.now() + RESEND_COOLDOWN_MS;
    } catch (err) {
      const status = err?.response?.status;
      setError(
        status === 429
          ? "Too many OTP requests. Wait a minute and try again."
          : apiError(err, "Failed to send OTP."),
      );
      if (status === 429) cooldownUntil.current = Date.now() + RESEND_COOLDOWN_MS;
    } finally {
      setSending(false);
    }
  };

  const verifyOtp = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Please enter your email address.");
      return;
    }
    if (!otp.trim() || otp.trim().length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }
    setVerifying(true);
    setError("");
    try {
      await otpApi.verify(trimmed, otp.trim());
      setOtpVerified(true);
      setVerifiedEmail(trimmed.toLowerCase());
      setOtpMessage({ text: "✓ Email verified successfully.", ok: true });
    } catch (err) {
      setOtpVerified(false);
      setVerifiedEmail("");
      setOtpMessage({ text: "Invalid or expired OTP.", ok: false });
      setError(apiError(err, "Invalid or expired OTP."));
    } finally {
      setVerifying(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const trimmedEmail = email.trim();
    if (name.trim().length < 2) return setError("Please enter your full name.");
    if (!trimmedEmail.includes("@"))
      return setError("Please enter a valid email address.");
    if (!otpVerified || verifiedEmail !== trimmedEmail.toLowerCase())
      return setError("Please verify your email with the OTP first.");
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
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </label>
        <div className="field">
          <span>Email verification OTP</span>
          <div className="row">
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="6-digit OTP"
              maxLength={6}
              inputMode="numeric"
            />
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={sending}
              onClick={sendOtp}
            >
              {sending ? "Sending…" : "Get OTP"}
            </button>
          </div>
          <div className="row">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              disabled={verifying}
              onClick={verifyOtp}
            >
              {verifying ? "Verifying…" : "Verify OTP"}
            </button>
          </div>
          {otpMessage.text && (
            <SuccessBanner message={otpVerified ? otpMessage.text : ""} />
          )}
          {!otpVerified && otpMessage.text && (
            <p className={`small ${otpMessage.ok ? "ok" : "bad"}`}>
              {otpMessage.text}
            </p>
          )}
        </div>
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
