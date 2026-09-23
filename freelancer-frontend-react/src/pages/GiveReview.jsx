import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { reviewsApi } from "../api";
import { apiError } from "../api/client";
import { ErrorBanner, Page, SuccessBanner } from "../components/ui";

function useQuery() {
  return new URLSearchParams(window.location.search);
}

export function GiveReview() {
  const navigate = useNavigate();
  const q = useQuery();
  const [form, setForm] = useState({
    freelancerEmail: q.get("freelancerEmail") || "",
    jobId: q.get("jobId") || "",
    jobTitle: q.get("jobTitle") || "",
    contractId: q.get("contractId") || "",
    rating: 5,
    comment: "",
  });
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.freelancerEmail.trim() || !form.comment.trim()) {
      setError("Freelancer email and comment are required.");
      return;
    }
    const rating = Number(form.rating);
    if (!rating || rating < 1 || rating > 5) {
      setError("Rating must be between 1 and 5.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await reviewsApi.create({
        freelancerEmail: form.freelancerEmail.trim(),
        jobId: form.jobId ? Number(form.jobId) : undefined,
        jobTitle: form.jobTitle.trim() || undefined,
        contractId: form.contractId ? Number(form.contractId) : undefined,
        rating,
        comment: form.comment.trim(),
      });
      setDone("✓ Review submitted.");
      setTimeout(() => navigate("/reviews"), 1200);
    } catch (err) {
      setError(apiError(err, "Failed to submit review."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page title="Leave a review" subtitle="Rate completed work.">
      <form className="form card" onSubmit={onSubmit}>
        <ErrorBanner message={error} />
        <SuccessBanner message={done} />
        <label className="field">
          <span>Freelancer email</span>
          <input value={form.freelancerEmail} onChange={set("freelancerEmail")} required />
        </label>
        <label className="field">
          <span>Job title</span>
          <input value={form.jobTitle} onChange={set("jobTitle")} />
        </label>
        <div className="row">
          <label className="field">
            <span>Job ID</span>
            <input type="number" value={form.jobId} onChange={set("jobId")} />
          </label>
          <label className="field">
            <span>Contract ID</span>
            <input
              type="number"
              value={form.contractId}
              onChange={set("contractId")}
            />
          </label>
          <label className="field">
            <span>Rating (1–5)</span>
            <input
              type="number"
              min="1"
              max="5"
              value={form.rating}
              onChange={set("rating")}
              required
            />
          </label>
        </div>
        <label className="field">
          <span>Comment</span>
          <textarea
            value={form.comment}
            onChange={set("comment")}
            rows={4}
            required
          />
        </label>
        <button className="btn btn-primary" disabled={busy}>
          {busy ? "Submitting…" : "Submit review"}
        </button>
      </form>
    </Page>
  );
}
