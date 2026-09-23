import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { jobsApi } from "../api";
import { apiError } from "../api/client";
import { EmptyState, ErrorBanner, Page } from "../components/ui";
import { useAuth } from "../context/AuthContext";

export function MyJobs() {
  const { email, role } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await jobsApi.list();
      const mine = (Array.isArray(data) ? data : []).filter(
        (j) =>
          role === "ADMIN" ||
          j.clientEmail?.toLowerCase() === email.toLowerCase(),
      );
      setJobs(mine);
    } catch (err) {
      setError(apiError(err, "Failed to load jobs."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remove = async (id) => {
    if (!window.confirm("Delete this job?")) return;
    setMsg("");
    try {
      await jobsApi.remove(id);
      setJobs(jobs.filter((j) => j.id !== id));
      setMsg("✓ Job deleted.");
    } catch (err) {
      setMsg(apiError(err, "Delete failed."));
    }
  };

  return (
    <Page title="My jobs" subtitle="Jobs you posted.">
      <ErrorBanner message={error} />
      {msg && <p className="small">{msg}</p>}
      {loading ? (
        <p className="muted">Loading…</p>
      ) : jobs.length === 0 ? (
        <EmptyState message="No jobs yet. Post your first job!" />
      ) : (
        <div className="grid grid-2">
          {jobs.map((j) => (
            <article className="card" key={j.id}>
              <h3>
                <Link to={`/jobs/${j.id}`}>{j.title}</Link>
              </h3>
              <p className="muted clamp">{j.description}</p>
              <div className="row">
                <span className="pill">${j.budget}</span>
                {j.skills && (
                  <span className="pill pill-soft">{j.skills}</span>
                )}
              </div>
              <div className="row">
                <Link to="/applications" className="btn btn-ghost btn-sm">
                  View proposals
                </Link>
                <button
                  className="btn btn-ghost btn-sm danger"
                  onClick={() => remove(j.id)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </Page>
  );
}
