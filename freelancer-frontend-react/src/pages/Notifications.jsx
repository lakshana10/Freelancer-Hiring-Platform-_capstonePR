import { useEffect, useState } from "react";
import { notificationsApi } from "../api";
import { apiError } from "../api/client";
import { EmptyState, ErrorBanner, Page } from "../components/ui";
import { useAuth } from "../context/AuthContext";

export function Notifications() {
  const { email } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await notificationsApi.byUser(email);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(apiError(err, "Failed to load notifications."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  const markRead = async (n) => {
    try {
      const { data } = await notificationsApi.markRead(n.id);
      setItems(items.map((x) => (x.id === n.id ? data : x)));
    } catch {
      /* non-blocking */
    }
  };

  const remove = async (n) => {
    try {
      await notificationsApi.remove(n.id);
      setItems(items.filter((x) => x.id !== n.id));
    } catch {
      /* non-blocking */
    }
  };

  const unread = items.filter((n) => !n.read).length;

  return (
    <Page
      title="Notifications"
      subtitle={unread > 0 ? `${unread} unread.` : "You're all caught up."}
    >
      <ErrorBanner message={error} />
      {loading ? (
        <p className="muted">Loading…</p>
      ) : items.length === 0 ? (
        <EmptyState message="No notifications." />
      ) : (
        <div className="grid">
          {items.map((n) => (
            <div className={`card${n.read ? "" : " unread"}`} key={n.id}>
              <p>{n.message}</p>
              <div className="row">
                {!n.read && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => markRead(n)}
                  >
                    Mark read
                  </button>
                )}
                <button
                  className="btn btn-ghost btn-sm danger"
                  onClick={() => remove(n)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Page>
  );
}
