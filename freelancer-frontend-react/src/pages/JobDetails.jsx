import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  applicationsApi,
  contractsApi,
  jobsApi,
  reviewsApi,
} from "../api";
import { apiError } from "../api/client";
import { EmptyState, ErrorBanner, Page } from "../components/ui";
import { ChatBox } from "../components/ChatBox";
import { useAuth } from "../context/AuthContext";

/**
 * Role-scoped job workspace.
 *
 * CLIENT (owner): Overview | Proposals | Chat. Never sees other
 * clients' jobs — the /jobs board redirects clients to /my-jobs.
 * FREELANCER: Overview (+ Apply) | Chat once accepted/contracted.
 * ADMIN: everything.
 */
export function JobDetails() {
  const { id } = useParams();
  const jobId = Number(id);
  const { email, role, isLoggedIn } = useAuth();
  const [job, setJob] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [myApp, setMyApp] = useState(null);
  const [myContract, setMyContract] = useState(null);
  const [tab, setTab] = useState("overview");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const isOwner =
    !!job && email && job.clientEmail?.toLowerCase() === email.toLowerCase();
  const isAdmin = role === "ADMIN";
  const canManage = isOwner || isAdmin;

  useEffect(() => {
    (async () => {
      try {
        const [{ data: j }, { data: r }] = await Promise.all([
          jobsApi.get(id),
          reviewsApi.byJob(id).catch(() => ({ data: [] })),
        ]);
        setJob(j);
        setReviews(Array.isArray(r) ? r : []);

        if (isLoggedIn) {
          // Proposals on this job (owner/admin view).
          const { data: apps } = await applicationsApi
            .list()
            .catch(() => ({ data: [] }));
          const mine = (Array.isArray(apps) ? apps : []).filter(
            (a) => String(a.jobId) === String(id),
          );
          setProposals(mine);
          setMyApp(
            mine.find(
              (a) =>
                a.freelancerEmail?.toLowerCase() === email.toLowerCase(),
            ) || null,
          );

          // Contract check for chat eligibility.
          if (role === "FREELANCER") {
            const { data: contracts } = await contractsApi
              .byFreelancer(email)
              .catch(() => ({ data: [] }));
            setMyContract(
              (Array.isArray(contracts) ? contracts : []).find(
                (c) => String(c.jobId) === String(id),
              ) || null,
            );
          }
        }
      } catch (err) {
        setError(apiError(err, "Failed to load job."));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (error) {
    return (
      <Page title="Job">
        <ErrorBanner message={error} />
        <Link to="/jobs">← Back to jobs</Link>
      </Page>
    );
  }
  if (!job) return <Page title="Job">{<p className="muted">Loading…</p>}</Page>;

  // Outsiders (non-owner clients) see nothing but the overview shell.
  const showProposals = canManage;
  const acceptedFreelancer =
    proposals.find((a) => (a.status || "").toUpperCase() === "ACCEPTED")
      ?.freelancerEmail || null;
  const chatPeer =
    role === "FREELANCER"
      ? job.clientEmail
      : acceptedFreelancer;
  const canChat =
    isAdmin ||
    isOwner ||
    (role === "FREELANCER" &&
      (myContract ||
        (myApp && (myApp.status || "").toUpperCase() === "ACCEPTED")));

  const apply = async () => {
    setBusy(true);
    setMsg("");
    try {
      const { data } = await applicationsApi.apply({
        jobId: job.id,
        jobTitle: job.title,
      });
      setMyApp(data);
      setProposals([...proposals, data]);
      setMsg(`✓ Applied to "${job.title}".`);
    } catch (err) {
      setMsg(apiError(err, "Application failed."));
    } finally {
      setBusy(false);
    }
  };

  const setStatus = async (app, status) => {
    setMsg("");
    try {
      await applicationsApi.setStatus(app.id, status);
      setProposals(
        proposals.map((a) => (a.id === app.id ? { ...a, status } : a)),
      );
      setMsg(`✓ Proposal ${status.toLowerCase()}.`);
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
      setProposals(
        proposals.map((a) =>
          a.id === app.id ? { ...a, status: "ACCEPTED" } : a,
        ),
      );
      setMsg(`✓ Hired ${app.freelancerEmail}. Chat unlocked.`);
      setTab("chat");
    } catch (err) {
      setMsg(apiError(err, "Hiring failed."));
    }
  };

  return (
    <Page title={job.title} subtitle={`Posted by ${job.clientEmail}`}>
      {msg && <p className="small">{msg}</p>}
      <div className="row tabs">
        <button
          className={`btn btn-sm ${tab === "overview" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setTab("overview")}
        >
          Overview
        </button>
        {showProposals && (
          <button
            className={`btn btn-sm ${tab === "proposals" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setTab("proposals")}
          >
            Proposals ({proposals.length})
          </button>
        )}
        {canChat && (
          <button
            className={`btn btn-sm ${tab === "chat" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setTab("chat")}
          >
            💬 Project chat
          </button>
        )}
      </div>

      {tab === "overview" && (
        <>
          <div className="card">
            <p>{job.description}</p>
            <div className="row">
              <span className="pill">${job.budget}</span>
              {job.skills && (
                <span className="pill pill-soft">{job.skills}</span>
              )}
            </div>
            {isLoggedIn && role === "FREELANCER" && !myApp && (
              <button
                className="btn btn-primary"
                disabled={busy}
                onClick={apply}
              >
                {busy ? "Applying…" : "Apply to this job"}
              </button>
            )}
            {myApp && (
              <p className="small">
                Your proposal status: <strong>{myApp.status}</strong>
              </p>
            )}
          </div>
          <h2>Reviews for this job</h2>
          {reviews.length === 0 ? (
            <EmptyState message="No reviews yet." />
          ) : (
            <div className="grid grid-2">
              {reviews.map((r) => (
                <div className="card" key={r.id}>
                  <strong>
                    {r.rating}★ — {r.freelancerEmail}
                  </strong>
                  <p className="muted">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "proposals" && showProposals && (
        <>
          {proposals.length === 0 ? (
            <EmptyState message="No proposals yet." />
          ) : (
            <div className="grid grid-2">
              {proposals.map((a) => (
                <div className="card" key={a.id}>
                  <h3>{a.freelancerEmail}</h3>
                  <span
                    className={`pill status-${(a.status || "").toLowerCase()}`}
                  >
                    {a.status}
                  </span>
                  <div className="row">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setStatus(a, "ACCEPTED")}
                    >
                      Accept
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setStatus(a, "REJECTED")}
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
        </>
      )}

      {tab === "chat" && canChat && (
        <ChatBox jobId={job.id} peerEmail={chatPeer} />
      )}

      <p>
        <Link to={role === "CLIENT" ? "/my-jobs" : "/jobs"}>← Back</Link>
      </p>
    </Page>
  );
}
