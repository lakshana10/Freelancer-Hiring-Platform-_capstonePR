import { useEffect, useState } from "react";
import { messagesApi } from "../api";
import { apiError } from "../api/client";
import { ErrorBanner, Page } from "../components/ui";
import { useAuth } from "../context/AuthContext";

export function Messages() {
  const { email, role } = useAuth();
  const [peer, setPeer] = useState("");
  const [thread, setThread] = useState([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const loadThread = async (other) => {
    if (!other.trim()) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await messagesApi.conversation(email, other.trim());
      const list = Array.isArray(data) ? data : [];
      setThread(list);
      // Mark peer messages as read.
      await Promise.all(
        list
          .filter((m) => m.receiverEmail === email && !m.read)
          .map((m) => messagesApi.markRead(m.id).catch(() => null)),
      );
    } catch (err) {
      setError(apiError(err, "Failed to load conversation."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const to = params.get("to");
    if (to) {
      setPeer(to);
      loadThread(to);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const send = async (e) => {
    e.preventDefault();
    if (!peer.trim() || !text.trim()) {
      setMsg("Enter a recipient and a message.");
      return;
    }
    setSending(true);
    setMsg("");
    try {
      const { data } = await messagesApi.send({
        receiverEmail: peer.trim(),
        message: text.trim(),
      });
      setThread([...thread, data]);
      setText("");
    } catch (err) {
      setMsg(apiError(err, "Send failed."));
    } finally {
      setSending(false);
    }
  };

  return (
    <Page title="Messages" subtitle="Project-based messaging.">
      {role === "ADMIN" && <AdminInbox />}
      <ErrorBanner message={error} />
      <div className="card">
        <div className="row">
          <input
            placeholder="Conversation with (email)…"
            value={peer}
            onChange={(e) => setPeer(e.target.value)}
          />
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => loadThread(peer)}
            disabled={loading}
          >
            {loading ? "Loading…" : "Open"}
          </button>
        </div>
      </div>
      <div className="card thread">
        {thread.length === 0 ? (
          <p className="muted">No messages in this conversation.</p>
        ) : (
          thread.map((m) => (
            <div
              key={m.id}
              className={`bubble${m.senderEmail === email ? " mine" : ""}`}
            >
              <p>{m.message}</p>
              <span className="muted small">
                {m.senderEmail} · {m.read ? "read" : "sent"}
              </span>
            </div>
          ))
        )}
      </div>
      <form className="card row" onSubmit={send}>
        <input
          placeholder="Type a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="btn btn-primary btn-sm" disabled={sending}>
          {sending ? "Sending…" : "Send"}
        </button>
      </form>
      {msg && <p className="small">{msg}</p>}
    </Page>
  );
}

function AdminInbox() {
  const [all, setAll] = useState([]);
  useEffect(() => {
    messagesApi
      .list()
      .then(({ data }) => setAll(Array.isArray(data) ? data.slice(-10) : []))
      .catch(() => {});
  }, []);
  if (all.length === 0) return null;
  return (
    <div className="card">
      <h3>Recent platform messages</h3>
      {all.map((m) => (
        <p key={m.id} className="muted small">
          {m.senderEmail} → {m.receiverEmail}: {m.message}
        </p>
      ))}
    </div>
  );
}
