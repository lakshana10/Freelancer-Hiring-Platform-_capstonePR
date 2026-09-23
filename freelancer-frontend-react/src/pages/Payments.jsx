import { useEffect, useState } from "react";
import { paymentsApi } from "../api";
import { apiError } from "../api/client";
import { EmptyState, ErrorBanner, Page } from "../components/ui";
import { useAuth } from "../context/AuthContext";

export function Payments() {
  const { email, role } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        let data;
        if (role === "ADMIN") {
          ({ data } = await paymentsApi.list());
        } else if (role === "CLIENT") {
          ({ data } = await paymentsApi.byClient(email));
        } else {
          ({ data } = await paymentsApi.byFreelancer(email));
        }
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(apiError(err, "Failed to load payments."));
      } finally {
        setLoading(false);
      }
    })();
  }, [email, role]);

  const markPaid = async (p) => {
    setMsg("");
    try {
      const { data } = await paymentsApi.setStatus(p.id, "PAID");
      setItems(items.map((x) => (x.id === p.id ? data : x)));
      setMsg("✓ Marked as paid.");
    } catch (err) {
      setMsg(apiError(err, "Status update failed."));
    }
  };

  return (
    <Page
      title={role === "FREELANCER" ? "My earnings" : "Payments"}
      subtitle={
        role === "FREELANCER"
          ? "What you earned per contract."
          : "Track payment status per milestone."
      }
    >
      <ErrorBanner message={error} />
      {msg && <p className="small">{msg}</p>}
      {loading ? (
        <p className="muted">Loading…</p>
      ) : items.length === 0 ? (
        <EmptyState message="No payments yet." />
      ) : (
        <div className="table-wrap card">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Job</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Counterparty</th>
                {(role === "CLIENT" || role === "ADMIN") && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>
                    {p.jobTitle} (contract #{p.contractId})
                  </td>
                  <td>${p.amount}</td>
                  <td>{p.status}</td>
                  <td>
                    {role === "FREELANCER" ? p.clientEmail : p.freelancerEmail}
                  </td>
                  {(role === "CLIENT" || role === "ADMIN") && (
                    <td>
                      {p.status !== "PAID" && (
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => markPaid(p)}
                        >
                          Mark paid
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Page>
  );
}
