import { useEffect, useState } from "react";
import { reviewsApi } from "../api";
import { apiError } from "../api/client";
import { EmptyState, ErrorBanner, Page } from "../components/ui";
import { useAuth } from "../context/AuthContext";

export function MyReviews() {
  const { email, role } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } =
          role === "CLIENT"
            ? await reviewsApi.byClient(email)
            : await reviewsApi.byFreelancer(email);
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(apiError(err, "Failed to load reviews."));
      } finally {
        setLoading(false);
      }
    })();
  }, [email, role]);

  return (
    <Page
      title={role === "CLIENT" ? "Reviews I gave" : "My reviews"}
      subtitle="Ratings tied to completed work."
    >
      <ErrorBanner message={error} />
      {loading ? (
        <p className="muted">Loading…</p>
      ) : items.length === 0 ? (
        <EmptyState message="No reviews yet." />
      ) : (
        <div className="grid grid-2">
          {items.map((r) => (
            <div className="card" key={r.id}>
              <strong>{r.rating}★ — {r.jobTitle}</strong>
              <p className="muted">{r.comment}</p>
              <p className="muted small">
                {r.clientEmail} → {r.freelancerEmail}
              </p>
            </div>
          ))}
        </div>
      )}
    </Page>
  );
}
