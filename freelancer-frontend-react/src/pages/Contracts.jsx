import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { contractsApi, paymentsApi } from "../api";
import { apiError } from "../api/client";
import { EmptyState, ErrorBanner, Page } from "../components/ui";
import { MilestonePanel } from "../components/MilestonePanel";
import { useAuth } from "../context/AuthContext";

function ContractList({ items, onPay, payingId, showParty }) {
  const [openId, setOpenId] = useState(null);

  return (
    <div className="grid grid-2">
      {items.map((c) => (
        <div className="card" key={c.id}>
          <h3>{c.jobTitle}</h3>
          <p className="muted small">
            Contract #{c.id} · Job #{c.jobId}
          </p>
          {showParty === "freelancer" && (
            <p className="muted small">Freelancer: {c.freelancerEmail}</p>
          )}
          {showParty === "client" && (
            <p className="muted small">Client: {c.clientEmail}</p>
          )}
          <span className={`pill status-${(c.status || "").toLowerCase()}`}>
            {c.status}
          </span>
          <div className="row">
            <Link
              to={`/reviews/give?freelancerEmail=${encodeURIComponent(c.freelancerEmail)}&jobId=${c.jobId}&jobTitle=${encodeURIComponent(c.jobTitle || "")}&contractId=${c.id}`}
              className="btn btn-ghost btn-sm"
            >
              Review
            </Link>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setOpenId(openId === c.id ? null : c.id)}
            >
              {openId === c.id ? "Hide milestones" : "Milestones"}
            </button>
            {onPay && (
              <button
                className="btn btn-primary btn-sm"
                disabled={payingId === c.id}
                onClick={() => onPay(c)}
              >
                {payingId === c.id ? "Paying…" : "Record payment"}
              </button>
            )}
          </div>
          {openId === c.id && <MilestonePanel contract={c} />}
        </div>
      ))}
    </div>
  );
}

// Client: contracts I created + record payments.
export function ClientContracts() {
  const { email, role } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } =
          role === "ADMIN"
            ? await contractsApi.list()
            : await contractsApi.byClient(email);
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(apiError(err, "Failed to load contracts."));
      } finally {
        setLoading(false);
      }
    })();
  }, [email, role]);

  const recordPayment = async (contract) => {
    const raw = window.prompt(
      `Payment amount for "${contract.jobTitle}" (USD):`,
      "",
    );
    if (!raw) return;
    const amount = Number(raw);
    if (!amount || amount <= 0) {
      setMsg("Amount must be a positive number.");
      return;
    }
    setPayingId(contract.id);
    setMsg("");
    try {
      await paymentsApi.create({
        contractId: contract.id,
        jobId: contract.jobId,
        jobTitle: contract.jobTitle,
        freelancerEmail: contract.freelancerEmail,
        amount,
      });
      setMsg(`✓ Payment of $${amount} recorded.`);
    } catch (err) {
      setMsg(apiError(err, "Payment failed."));
    } finally {
      setPayingId(null);
    }
  };

  return (
    <Page title="Contracts" subtitle="Hired freelancers per job.">
      <ErrorBanner message={error} />
      {msg && <p className="small">{msg}</p>}
      {loading ? (
        <p className="muted">Loading…</p>
      ) : items.length === 0 ? (
        <EmptyState message="No contracts yet. Hire from Proposals." />
      ) : (
        <ContractList
          items={items}
          showParty="freelancer"
          onPay={role !== "FREELANCER" ? recordPayment : undefined}
          payingId={payingId}
        />
      )}
    </Page>
  );
}

// Freelancer: contracts where I was hired.
export function MyContracts() {
  const { email } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await contractsApi.byFreelancer(email);
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(apiError(err, "Failed to load contracts."));
      } finally {
        setLoading(false);
      }
    })();
  }, [email]);

  return (
    <Page title="My contracts" subtitle="Jobs you were hired for.">
      <ErrorBanner message={error} />
      {loading ? (
        <p className="muted">Loading…</p>
      ) : items.length === 0 ? (
        <EmptyState message="No contracts yet." />
      ) : (
        <ContractList items={items} showParty="client" />
      )}
    </Page>
  );
}
