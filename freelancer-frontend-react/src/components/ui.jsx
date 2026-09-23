import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Navbar() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const dashboardLink =
    role === "ADMIN"
      ? "/admin"
      : role === "CLIENT"
        ? "/client-dashboard"
        : role === "FREELANCER"
          ? "/freelancer-dashboard"
          : "/home";

  return (
    <header className="nav">
      <Link to="/" className="logo">
        <span className="logo-icon">✦</span>
        <span>
          Freelance<span className="accent">Hub</span>
        </span>
      </Link>
      <nav className="nav-links">
        {role === "CLIENT" ? (
          <Link to="/my-jobs">My Jobs</Link>
        ) : (
          <Link to="/jobs">Jobs</Link>
        )}
        {role !== "CLIENT" && <Link to="/freelancers">Freelancers</Link>}
        {user ? (
          <>
            <Link to={dashboardLink}>Dashboard</Link>
            {role === "CLIENT" && <Link to="/applications">Proposals</Link>}
            {role === "CLIENT" && <Link to="/contracts">Contracts</Link>}
            {role === "FREELANCER" && (
              <Link to="/my-applications">Applications</Link>
            )}
            <Link to="/messages">Messages</Link>
            <Link to="/notifications">Notifications</Link>
            <Link to="/profile">Profile</Link>
            <button
              className="btn btn-ghost"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup" className="btn btn-primary">
              Sign up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

export function Page({ title, subtitle, children, wide }) {
  return (
    <main className={`page${wide ? " page-wide" : ""}`}>
      {(title || subtitle) && (
        <div className="page-head">
          {title && <h1>{title}</h1>}
          {subtitle && <p className="muted">{subtitle}</p>}
        </div>
      )}
      {children}
    </main>
  );
}

export function EmptyState({ message }) {
  return <div className="empty">{message || "Nothing here yet."}</div>;
}

export function ErrorBanner({ message }) {
  if (!message) return null;
  return <div className="alert alert-error">{message}</div>;
}

export function SuccessBanner({ message }) {
  if (!message) return null;
  return <div className="alert alert-success">{message}</div>;
}

export function JobCard({ job, onApply, applying }) {
  return (
    <article className="card">
      <h3>
        <Link to={`/jobs/${job.id}`}>{job.title}</Link>
      </h3>
      <p className="muted clamp">{job.description}</p>
      <div className="row">
        <span className="pill">${job.budget}</span>
        {job.skills && <span className="pill pill-soft">{job.skills}</span>}
      </div>
      <div className="row row-between">
        <span className="muted small">{job.clientEmail}</span>
        {onApply && (
          <button
            className="btn btn-primary btn-sm"
            disabled={applying}
            onClick={() => onApply(job)}
          >
            {applying ? "Applying…" : "Apply"}
          </button>
        )}
      </div>
    </article>
  );
}
