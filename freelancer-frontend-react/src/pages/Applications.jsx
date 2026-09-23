import { useEffect, useState } from "react";
import { applicationsApi, contractsApi, jobsApi } from "../api";
import { apiError } from "../api/client";
import { EmptyState, ErrorBanner, Page } from "../components/ui";
import { useAuth } from "../context/AuthContext";

// Freelancer: track my proposal statuses.
export function MyApplications() {
  const { email } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await applicationsApi.byFreelancer(email);
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(apiError(err, "Failed to load applications."));
      } finally {
        setLoading(false);
      }
    })();
  }, [email]);

  return (
    <Page title="My applications" subtitle="Proposal status per job.">
      <ErrorBanner message={error} />
      {loading ? (
        <p className="muted">Loading…</p>
      ) : items.length === 0 ? (
        <EmptyState message="You haven't applied to any job yet." />
      ) : (
        <div className="grid grid-2">
          {items.map((a) => (
            <div className="card" key={a.id}>
              <h3>{a.jobTitle}</h3>
              <p className="muted small">Job #{a.jobId}</p>
              <span className={`pill status-${(a.status || "").toLowerCase()}`}>
                {a.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </Page>
  );
}

// Client: compare proposals across my jobs, accept/reject, hire.
export function ClientApplications() {
  const { email } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [apps, setApps] = useState([]);
  const [jobFilter, setJobFilter] = useState("all");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [{ data: allJobs }, { data: allApps }] = await Promise.all([
          jobsApi.list(),
          applicationsApi.list(),
        ]);
        const mine = (Array.isArray(allJobs) ? allJobs : []).filter(
          (j) => j.clientEmail?.toLowerCase() === email.toLowerCase(),
        );
        const mineIds = new Set(mine.map((j) => j.id));
        setJobs(mine);
        setApps(
          (Array.isArray(allApps) ? allApps : []).filter((a) =>
            mineIds.has(a.jobId),
          ),
        );
      } catch (err) {
        setError(apiError(err, "Failed to load proposals."));
      } finally {
        setLoading(false);
      }
    })();
  }, [email]);

  const act = async (app, status) => {
    setMsg("");
    try {
      await applicationsApi.setStatus(app.id, status);
      setApps(apps.map((a) => (a.id === app.id ? { ...a, status } : a)));
      setMsg(`✓ Application ${status.toLowerCase()}.`);
    } catch (err) {
      setMsg(apiError(err, "Status update failed."));
    }
  };

  const hire = async (app) => {
    setMsg("");
    try {
      await contractsApi.create({
        jobId: app.jobId,
        jobTitle: app.jobTitle,
        freelancerEmail: app.freelancerEmail,
      });
      await applicationsApi.setStatus(app.id, "ACCEPTED");
      setApps(apps.map((a) => (a.id === app.id ? { ...a, status: "ACCEPTED" } : a)));
      setMsg(`✓ Hired ${app.freelancerEmail}. Contract created.`);
    } catch (err) {
      setMsg(apiError(err, "Hiring failed."));
    }
  };

  const visible =
    jobFilter === "all"
      ? apps
      : apps.filter((a) => String(a.jobId) === jobFilter);

  return (
    <Page title="Proposals" subtitle="Compare applicants and hire.">
      <ErrorBanner message={error} />
      {msg && <p className="small">{msg}</p>}
      <div className="filters card">
        <select
          value={jobFilter}
          onChange={(e) => setJobFilter(e.target.value)}
        >
          <option value="all">All my jobs</option>
          {jobs.map((j) => (
            <option key={j.id} value={String(j.id)}>
              {j.title}
            </option>
          ))}
        </select>
      </div>
      {loading ? (
        <p className="muted">Loading…</p>
      ) : visible.length === 0 ? (
        <EmptyState message="No proposals yet." />
      ) : (
        <div className="grid grid-2">
          {visible.map((a) => (
            <div className="card" key={a.id}>
              <h3>{a.jobTitle}</h3>
              <p className="muted small">
                {a.freelancerEmail} · Job #{a.jobId}
              </p>
              <span className={`pill status-${(a.status || "").toLowerCase()}`}>
                {a.status}
              </span>
              <div className="row">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => act(a, "ACCEPTED")}
                >
                  Accept
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => act(a, "REJECTED")}
                >
                  Reject
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => hire(a)}
                >
                  Hire →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Page>
  );
}

// Admin: monitor every application.
export function AdminApplications() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await applicationsApi.list();
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(apiError(err, "Failed to load applications."));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Page title="All applications" subtitle="Platform-wide proposal activity.">
      <ErrorBanner message={error} />
      {loading ? (
        <p className="muted">Loading…</p>
      ) : items.length === 0 ? (
        <EmptyState message="No applications on the platform." />
      ) : (
        <div className="table-wrap card">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Job</th>
                <th>Freelancer</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id}>
                  <td>{a.id}</td>
                  <td>
                    {a.jobTitle} (#{a.jobId})
                  </td>
                  <td>{a.freelancerEmail}</td>
                  <td>{a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Page>
  );
}
