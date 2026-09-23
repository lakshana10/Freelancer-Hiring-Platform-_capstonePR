import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { reviewsApi, usersApi } from "../api";
import { apiError } from "../api/client";
import { EmptyState, ErrorBanner, Page } from "../components/ui";

export function FreelancerProfile() {
  const { email } = useParams();
  const decoded = decodeURIComponent(email || "");
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [{ data: users }, { data: revs }] = await Promise.all([
          usersApi.list(),
          reviewsApi
            .byFreelancer(decoded)
            .catch(() => ({ data: [] })),
        ]);
        const found = (Array.isArray(users) ? users : []).find(
          (u) => u.email?.toLowerCase() === decoded.toLowerCase(),
        );
        if (!found) {
          setError("Freelancer not found.");
          return;
        }
        setProfile(found);
        setReviews(Array.isArray(revs) ? revs : []);
      } catch (err) {
        setError(apiError(err, "Failed to load profile."));
      }
    })();
  }, [decoded]);

  if (error) {
    return (
      <Page title="Profile">
        <ErrorBanner message={error} />
        <Link to="/freelancers">← Back</Link>
      </Page>
    );
  }
  if (!profile) return <Page title="Profile">{<p className="muted">Loading…</p>}</Page>;

  const avg =
    reviews.length > 0
      ? (
          reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length
        ).toFixed(1)
      : null;

  return (
    <Page title={profile.name} subtitle={profile.email}>
      <div className="card">
        {profile.skills && (
          <p>
            <strong>Skills:</strong> {profile.skills}
          </p>
        )}
        {profile.experience && (
          <p>
            <strong>Experience:</strong> {profile.experience}
          </p>
        )}
        {profile.bio && <p className="muted">{profile.bio}</p>}
        {avg && (
          <p>
            <strong>
              {avg}★ across {reviews.length} review
              {reviews.length === 1 ? "" : "s"}
            </strong>
          </p>
        )}
      </div>
      <h2>Reviews</h2>
      {reviews.length === 0 ? (
        <EmptyState message="No reviews yet." />
      ) : (
        <div className="grid grid-2">
          {reviews.map((r) => (
            <div className="card" key={r.id}>
              <strong>{r.rating}★</strong>
              <p className="muted">{r.comment}</p>
              <p className="muted small">
                {r.jobTitle} · {r.clientEmail}
              </p>
            </div>
          ))}
        </div>
      )}
      <Link to="/freelancers">← Back to freelancers</Link>
    </Page>
  );
}
