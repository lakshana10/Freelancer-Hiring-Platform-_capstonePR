import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { usersApi } from "../api";
import { apiError } from "../api/client";
import { EmptyState, ErrorBanner, Page } from "../components/ui";

export function Freelancers() {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await usersApi.list();
        setUsers(
          (Array.isArray(data) ? data : []).filter(
            (u) => (u.role || "").toUpperCase() === "FREELANCER",
          ),
        );
      } catch (err) {
        setError(apiError(err, "Failed to load freelancers."));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const visible = users.filter((u) => {
    const needle = q.trim().toLowerCase();
    if (!needle) return true;
    return `${u.name} ${u.email} ${u.skills || ""}`
      .toLowerCase()
      .includes(needle);
  });

  return (
    <Page
      title="Freelancers"
      subtitle="Public directory. Open a profile to review skills and ratings."
    >
      <div className="filters card">
        <input
          placeholder="Search name, email or skill…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <ErrorBanner message={error} />
      {loading ? (
        <p className="muted">Loading…</p>
      ) : visible.length === 0 ? (
        <EmptyState message="No freelancers found." />
      ) : (
        <div className="grid grid-2">
          {visible.map((u) => (
            <article className="card" key={u.email}>
              <h3>{u.name}</h3>
              <p className="muted small">{u.email}</p>
              {u.skills && (
                <span className="pill pill-soft">{u.skills}</span>
              )}
              {u.bio && <p className="muted clamp">{u.bio}</p>}
              <Link
                className="btn btn-ghost btn-sm"
                to={`/freelancers/${encodeURIComponent(u.email)}`}
              >
                View profile →
              </Link>
            </article>
          ))}
        </div>
      )}
    </Page>
  );
}
