import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { applicationsApi, jobsApi } from "../api";
import { apiError } from "../api/client";
import { EmptyState, ErrorBanner, JobCard, Page } from "../components/ui";
import { useAuth } from "../context/AuthContext";

export function Jobs() {
  const { role, isLoggedIn } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState({ q: "", skills: "", maxBudget: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  const [applyMsg, setApplyMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await jobsApi.list();
        setJobs(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(apiError(err, "Failed to load jobs."));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const apply = async (job) => {
    setApplyingId(job.id);
    setApplyMsg("");
    try {
      await applicationsApi.apply({ jobId: job.id, jobTitle: job.title });
      setApplyMsg(`✓ Applied to "${job.title}".`);
    } catch (err) {
      setApplyMsg(apiError(err, "Application failed."));
    } finally {
      setApplyingId(null);
    }
  };

  const visible = jobs.filter((j) => {
    const q = filter.q.trim().toLowerCase();
    const s = filter.skills.trim().toLowerCase();
    if (
      q &&
      !`${j.title} ${j.description}`.toLowerCase().includes(q)
    )
      return false;
    if (s && !(j.skills || "").toLowerCase().includes(s)) return false;
    if (filter.maxBudget && Number(j.budget) > Number(filter.maxBudget))
      return false;
    return true;
  });

  const canApply = isLoggedIn && role === "FREELANCER";

  // Clients never browse other clients' offers: their workspace is
  // My Jobs -> proposals per job -> hire -> project chat.
  if (role === "CLIENT") {
    return <Navigate to="/my-jobs" replace />;
  }

  return (
    <Page
      title="Browse jobs"
      subtitle="Public job board. Freelancers can apply directly."
    >
      <div className="filters card">
        <input
          placeholder="Search title or description…"
          value={filter.q}
          onChange={(e) => setFilter({ ...filter, q: e.target.value })}
        />
        <input
          placeholder="Skill (e.g. React)…"
          value={filter.skills}
          onChange={(e) => setFilter({ ...filter, skills: e.target.value })}
        />
        <input
          type="number"
          min="0"
          placeholder="Max budget"
          value={filter.maxBudget}
          onChange={(e) => setFilter({ ...filter, maxBudget: e.target.value })}
        />
      </div>
      <ErrorBanner message={error} />
      {applyMsg && <p className="small">{applyMsg}</p>}
      {loading ? (
        <p className="muted">Loading jobs…</p>
      ) : visible.length === 0 ? (
        <EmptyState message="No jobs match your filters." />
      ) : (
        <div className="grid grid-2">
          {visible.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onApply={canApply ? apply : undefined}
              applying={applyingId === job.id}
            />
          ))}
        </div>
      )}
    </Page>
  );
}
