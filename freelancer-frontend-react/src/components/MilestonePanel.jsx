import { useEffect, useState } from "react";
import { milestonesApi, paymentsApi } from "../api";
import { apiError } from "../api/client";
import { EmptyState, ErrorBanner } from "./ui";
import { useAuth } from "../context/AuthContext";

/**
 * Per-contract milestone tracker. Embedded in both contract lists.
 *
 * CLIENT: create milestones, review submissions (approve / request
 * revision), record milestone-linked payments.
 * FREELANCER: submit work against pending / revision-requested items.
 */
export function MilestonePanel({ contract }) {
  const { role } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", description: "", amount: "" });
  const [creating, setCreating] = useState(false);
  const [submissions, setSubmissions] = useState({});
  const [busyId, setBusyId] = useState(null);
  const [payingId, setPayingId] = useState(null);

  const load = async () => {
    try {
      const { data } = await milestonesApi.byContract(contract.id);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(apiError(err, "Failed to load milestones."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract.id]);

  const refresh = (updated) =>
    setItems(items.map((m) => (m.id === updated.id ? updated : m)));

  const create = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.amount || Number(form.amount) <= 0) {
      setMsg("Title and a positive amount are required.");
      return;
    }
    setCreating(true);
    setMsg("");
    try {
      const { data } = await milestonesApi.create({
        contractId: contract.id,
        title: form.title.trim(),
        description: form.description.trim(),
        amount: Number(form.amount),
      });
      setItems([...items, data]);
      setForm({ title: "", description: "", amount: "" });
      setMsg("✓ Milestone added.");
    } catch (err) {
      setMsg(apiError(err, "Create failed."));
    } finally {
      setCreating(false);
    }
  };

  const submit = async (m) => {
    const text = (submissions[m.id] || "").trim();
    if (!text) {
      setMsg("Describe the completed work before submitting.");
      return;
    }
    setBusyId(m.id);
    setMsg("");
    try {
      const { data } = await milestonesApi.submit(m.id, text);
      refresh(data);
      setSubmissions({ ...submissions, [m.id]: "" });
      setMsg("✓ Work submitted for review.");
    } catch (err) {
      setMsg(apiError(err, "Submit failed."));
    } finally {
      setBusyId(null);
    }
  };

  const review = async (m, status) => {
    setBusyId(m.id);
    setMsg("");
    try {
      const { data } = await milestonesApi.review(m.id, status);
      refresh(data);
      setMsg(
        status === "APPROVED"
          ? "✓ Approved. You can now record its payment."
          : "✓ Revision requested.",
      );
    } catch (err) {
      setMsg(apiError(err, "Review failed."));
    } finally {
      setBusyId(null);
    }
  };

  const payMilestone = async (m) => {
    setPayingId(m.id);
    setMsg("");
    try {
      await paymentsApi.create({
        contractId: contract.id,
        jobId: contract.jobId,
        jobTitle: contract.jobTitle,
        freelancerEmail: contract.freelancerEmail,
        amount: m.amount,
        milestoneId: m.id,
      });
      setMsg(`✓ Payment of $${m.amount} recorded for "${m.title}".`);
    } catch (err) {
      setMsg(apiError(err, "Payment failed."));
    } finally {
      setPayingId(null);
    }
  };

  const isClient = role === "CLIENT" || role === "ADMIN";
  const submittable = (m) =>
    ["PENDING", "REVISION_REQUESTED"].includes(
      (m.status || "").toUpperCase(),
    );

  return (
    <div className="milestones">
      <h4>Milestones</h4>
      <ErrorBanner message={error} />
      {msg && <p className="small">{msg}</p>}
      {loading ? (
        <p className="muted small">Loading…</p>
      ) : items.length === 0 ? (
        <EmptyState message="No milestones yet." />
      ) : (
        items.map((m) => (
          <div className="card milestone" key={m.id}>
            <div className="row row-between">
              <strong>{m.title}</strong>
              <span className="row">
                <span
                  className={`pill status-${(m.status || "").toLowerCase()}`}
                >
                  {m.status}
                </span>
                <span className="pill pill-soft">${m.amount}</span>
              </span>
            </div>
            {m.description && <p className="muted small">{m.description}</p>}
            {m.submission && (
              <p className="small">
                <strong>Submission:</strong> {m.submission}
              </p>
            )}
            {!isClient && submittable(m) && (
              <div className="row">
                <input
                  placeholder="Describe completed work / link…"
                  value={submissions[m.id] || ""}
                  onChange={(e) =>
                    setSubmissions({ ...submissions, [m.id]: e.target.value })
                  }
                />
                <button
                  className="btn btn-primary btn-sm"
                  disabled={busyId === m.id}
                  onClick={() => submit(m)}
                >
                  {busyId === m.id ? "Submitting…" : "Submit work"}
                </button>
              </div>
            )}
            {isClient && (m.status || "").toUpperCase() === "SUBMITTED" && (
              <div className="row">
                <button
                  className="btn btn-primary btn-sm"
                  disabled={busyId === m.id}
                  onClick={() => review(m, "APPROVED")}
                >
                  Approve
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={busyId === m.id}
                  onClick={() => review(m, "REVISION_REQUESTED")}
                >
                  Request revision
                </button>
              </div>
            )}
            {isClient && (m.status || "").toUpperCase() === "APPROVED" && (
              <button
                className="btn btn-ghost btn-sm"
                disabled={payingId === m.id}
                onClick={() => payMilestone(m)}
              >
                {payingId === m.id ? "Paying…" : `Record $${m.amount} payment`}
              </button>
            )}
          </div>
        ))
      )}
      {isClient && (
        <form className="card row" onSubmit={create}>
          <input
            placeholder="Milestone title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <input
            type="number"
            min="1"
            step="any"
            placeholder="$"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
          <input
            placeholder="Details (optional)"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />
          <button className="btn btn-primary btn-sm" disabled={creating}>
            {creating ? "Adding…" : "Add"}
          </button>
        </form>
      )}
    </div>
  );
}
