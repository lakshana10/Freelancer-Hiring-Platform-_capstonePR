import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jobsApi } from "../api";
import { apiError } from "../api/client";
import { ErrorBanner, Page } from "../components/ui";

export function PostJob() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    budget: "",
    skills: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      setError("Title and description are required.");
      return;
    }
    if (!form.budget || Number(form.budget) <= 0) {
      setError("Budget must be a positive number.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const { data } = await jobsApi.create({
        title: form.title.trim(),
        description: form.description.trim(),
        budget: Number(form.budget),
        skills: form.skills.trim(),
      });
      navigate(`/jobs/${data.id}`);
    } catch (err) {
      setError(apiError(err, "Failed to post job."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page title="Post a job" subtitle="Describe the work, budget and skills.">
      <form className="form card" onSubmit={onSubmit}>
        <ErrorBanner message={error} />
        <label className="field">
          <span>Title</span>
          <input
            value={form.title}
            onChange={set("title")}
            placeholder="e.g. Build a portfolio website"
            required
          />
        </label>
        <label className="field">
          <span>Description</span>
          <textarea
            value={form.description}
            onChange={set("description")}
            placeholder="Requirements, deliverables, deadline…"
            rows={5}
            required
          />
        </label>
        <label className="field">
          <span>Budget (USD)</span>
          <input
            type="number"
            min="1"
            step="any"
            value={form.budget}
            onChange={set("budget")}
            placeholder="500"
            required
          />
        </label>
        <label className="field">
          <span>Required skills (comma separated)</span>
          <input
            value={form.skills}
            onChange={set("skills")}
            placeholder="React, CSS, Figma"
          />
        </label>
        <button className="btn btn-primary" disabled={busy}>
          {busy ? "Publishing…" : "Publish job"}
        </button>
      </form>
    </Page>
  );
}
