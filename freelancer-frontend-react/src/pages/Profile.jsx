import { useEffect, useState } from "react";
import { usersApi } from "../api";
import { apiError } from "../api/client";
import { ErrorBanner, Page, SuccessBanner } from "../components/ui";
import { useAuth } from "../context/AuthContext";

export function Profile() {
  const { email } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ skills: "", experience: "", bio: "" });
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await usersApi.list();
        const me = (Array.isArray(data) ? data : []).find(
          (u) => u.email?.toLowerCase() === email.toLowerCase(),
        );
        if (me) {
          setProfile(me);
          setForm({
            skills: me.skills || "",
            experience: me.experience || "",
            bio: me.bio || "",
          });
        }
      } catch (err) {
        setError(apiError(err, "Failed to load profile."));
      }
    })();
  }, [email]);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMsg("");
    try {
      const { data } = await usersApi.update(email, form);
      setProfile(data);
      setMsg("✓ Profile updated.");
    } catch (err) {
      setError(apiError(err, "Update failed."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page title="My profile" subtitle={email}>
      <ErrorBanner message={error} />
      <SuccessBanner message={msg} />
      {profile && (
        <div className="card">
          <p>
            <strong>{profile.name}</strong> · {profile.role}
          </p>
        </div>
      )}
      <form className="form card" onSubmit={save}>
        <label className="field">
          <span>Skills</span>
          <input
            value={form.skills}
            onChange={(e) => setForm({ ...form, skills: e.target.value })}
            placeholder="React, Spring Boot, Figma"
          />
        </label>
        <label className="field">
          <span>Experience</span>
          <input
            value={form.experience}
            onChange={(e) => setForm({ ...form, experience: e.target.value })}
            placeholder="3 years building web apps"
          />
        </label>
        <label className="field">
          <span>Bio</span>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={4}
            placeholder="Tell clients about yourself…"
          />
        </label>
        <button className="btn btn-primary" disabled={busy}>
          {busy ? "Saving…" : "Save profile"}
        </button>
      </form>
    </Page>
  );
}
