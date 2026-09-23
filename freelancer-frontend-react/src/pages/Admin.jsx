import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { jobsApi, usersApi } from "../api";
import { apiError } from "../api/client";
import { EmptyState, ErrorBanner, Page } from "../components/ui";

export function UsersAdmin() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await usersApi.list();
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(apiError(err, "Failed to load users."));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Page title="Users" subtitle="All platform accounts.">
      <ErrorBanner message={error} />
      {loading ? (
        <p className="muted">Loading…</p>
      ) : users.length === 0 ? (
        <EmptyState message="No users." />
      ) : (
        <div className="table-wrap card">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.email}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Page>
  );
}

export function JobsAdmin() {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await jobsApi.list();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(apiError(err, "Failed to load jobs."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    if (!window.confirm("Delete this job?")) return;
    try {
      await jobsApi.remove(id);
      setJobs(jobs.filter((j) => j.id !== id));
      setMsg("✓ Job deleted.");
    } catch (err) {
      setMsg(apiError(err, "Delete failed."));
    }
  };

  return (
    <Page title="All jobs" subtitle="Monitor and moderate postings.">
      <ErrorBanner message={error} />
      {msg && <p className="small">{msg}</p>}
      {loading ? (
        <p className="muted">Loading…</p>
      ) : jobs.length === 0 ? (
        <EmptyState message="No jobs." />
      ) : (
        <div className="table-wrap card">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Client</th>
                <th>Budget</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j.id}>
                  <td>{j.id}</td>
                  <td>
                    <Link to={`/jobs/${j.id}`}>{j.title}</Link>
                  </td>
                  <td>{j.clientEmail}</td>
                  <td>${j.budget}</td>
                  <td>
                    <button
                      className="btn btn-ghost btn-sm danger"
                      onClick={() => remove(j.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Page>
  );
}
