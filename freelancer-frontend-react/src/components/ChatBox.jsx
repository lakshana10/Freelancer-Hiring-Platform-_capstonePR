import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { messagesApi } from "../api";
import { apiError, getToken } from "../api/client";
import { useAuth } from "../context/AuthContext";

const API_BASE =
  import.meta.env.VITE_API_URL?.trim() || "http://localhost:8080";

/**
 * Realtime project room for one job.
 *
 * Transport: STOMP over SockJS -> /ws, send /app/chat/{jobId},
 * receive /topic/jobs/{jobId}. The JWT travels in the STOMP
 * CONNECT header (browsers can't set headers on the WS handshake).
 *
 * Resilience: history always loads over REST; if the socket drops,
 * sends fall back to POST /api/messages so chat keeps working with
 * slightly higher latency. Status pill shows LIVE / OFFLINE.
 */
export function ChatBox({ jobId, peerEmail }) {
  const { email } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [live, setLive] = useState(false);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const clientRef = useRef(null);
  const bottomRef = useRef(null);

  // REST history (participants only — backend enforces).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await messagesApi.historyByJob(jobId);
        if (!cancelled) setMessages(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setNotice(apiError(err, "Chat unavailable."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  // STOMP socket with auto-reconnect.
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE}/ws`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        setLive(true);
        setNotice("");
        client.subscribe(`/topic/jobs/${jobId}`, (frame) => {
          try {
            const incoming = JSON.parse(frame.body);
            setMessages((prev) =>
              prev.some((m) => m.id === incoming.id)
                ? prev
                : [...prev, incoming],
            );
          } catch {
            /* ignore malformed frames */
          }
        });
      },
      onStompError: () => {
        setLive(false);
        setNotice("Live feed unavailable — messages send via backup.");
      },
      onWebSocketClose: () => setLive(false),
    });

    client.activate();
    clientRef.current = client;
    return () => {
      client.deactivate();
      clientRef.current = null;
    };
  }, [jobId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setText("");

    // 1) Realtime path.
    const client = clientRef.current;
    if (client?.active) {
      try {
        client.publish({
          destination: `/app/chat/${jobId}`,
          body: JSON.stringify({ message: trimmed }),
        });
        return;
      } catch {
        /* fall through to REST */
      }
    }

    // 2) REST fallback (needs the other party's email).
    if (!peerEmail) {
      setNotice("Offline and no chat partner resolved — retry when live.");
      setText(trimmed);
      return;
    }
    try {
      const { data } = await messagesApi.send({
        receiverEmail: peerEmail,
        message: trimmed,
        jobId,
      });
      setMessages((prev) => [...prev, data]);
    } catch (err) {
      setText(trimmed);
      setNotice(apiError(err, "Send failed."));
    }
  };

  return (
    <div className="card">
      <div className="row row-between">
        <h3>Project chat</h3>
        <span className={`pill ${live ? "status-accepted" : "status-pending"}`}>
          {live ? "● LIVE" : "○ OFFLINE"}
        </span>
      </div>
      {notice && <p className="small bad">{notice}</p>}
      <div className="thread">
        {loading ? (
          <p className="muted">Loading history…</p>
        ) : messages.length === 0 ? (
          <p className="muted">
            No messages yet. Say hello to kick off the project.
          </p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id ?? `${m.createdAt}-${m.message}`}
              className={`bubble${m.senderEmail === email ? " mine" : ""}`}
            >
              <p>{m.message}</p>
              <span className="muted small">{m.senderEmail}</span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
      <form className="row" onSubmit={send}>
        <input
          placeholder="Message the project room…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="btn btn-primary btn-sm">Send</button>
      </form>
    </div>
  );
}
