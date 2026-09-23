import { Link } from "react-router-dom";
import { Page } from "../components/ui";
import { useAuth } from "../context/AuthContext";

function Links({ items }) {
  return (
    <div className="grid grid-2">
      {items.map((l) => (
        <Link key={l.to} to={l.to} className="card link-card">
          <h3>{l.label}</h3>
          <p className="muted small">{l.desc}</p>
        </Link>
      ))}
    </div>
  );
}

export function Home() {
  const { role, dashboardFor } = useAuth();
  return (
    <Page title="Home" subtitle="Pick where to go next.">
      <Links
        items={[
          { to: "/jobs", label: "📌 Job board", desc: "Browse open projects" },
          {
            to: "/freelancers",
            label: "👩‍💻 Freelancers",
            desc: "Browse talent directory",
          },
          {
            to: dashboardFor(role),
            label: "📊 My dashboard",
            desc: "Back to your workspace",
          },
        ]}
      />
    </Page>
  );
}

export function ClientDashboard() {
  const { user } = useAuth();
  return (
    <Page
      title={`Client dashboard`}
      subtitle={`Welcome, ${user?.name || user?.email}. Post jobs, review proposals, hire and pay.`}
    >
      <Links
        items={[
          { to: "/post-job", label: "＋ Post a job", desc: "Publish a project" },
          { to: "/my-jobs", label: "🗂 My jobs", desc: "Manage your postings" },
          {
            to: "/applications",
            label: "📥 Proposals",
            desc: "Compare and accept applicants",
          },
          {
            to: "/contracts",
            label: "📄 Contracts",
            desc: "Hired freelancers per job",
          },
          {
            to: "/payments",
            label: "💳 Payments",
            desc: "Track what you paid",
          },
          {
            to: "/reviews/give",
            label: "⭐ Leave a review",
            desc: "Rate a freelancer",
          },
        ]}
      />
    </Page>
  );
}

export function FreelancerDashboard() {
  const { user } = useAuth();
  return (
    <Page
      title="Freelancer dashboard"
      subtitle={`Welcome, ${user?.name || user?.email}. Find work, apply, deliver, get paid.`}
    >
      <Links
        items={[
          { to: "/jobs", label: "🔎 Find work", desc: "Browse open projects" },
          {
            to: "/my-applications",
            label: "📨 My applications",
            desc: "Track proposal status",
          },
          {
            to: "/my-contracts",
            label: "📄 My contracts",
            desc: "Jobs you were hired for",
          },
          {
            to: "/payments",
            label: "💰 My payments",
            desc: "Track what you earned",
          },
          {
            to: "/reviews",
            label: "⭐ My reviews",
            desc: "What clients said",
          },
        ]}
      />
    </Page>
  );
}

export function AdminDashboard() {
  return (
    <Page
      title="Admin dashboard"
      subtitle="Monitor users, jobs, applications and platform activity."
    >
      <Links
        items={[
          { to: "/admin/users", label: "👥 Users", desc: "Manage accounts" },
          { to: "/admin/jobs", label: "🗂 Jobs", desc: "Monitor postings" },
          {
            to: "/admin/applications",
            label: "📨 Applications",
            desc: "Monitor proposals",
          },
          {
            to: "/contracts",
            label: "📄 Contracts",
            desc: "All contracts",
          },
          {
            to: "/payments",
            label: "💳 Payments",
            desc: "All payment activity",
          },
          {
            to: "/messages",
            label: "💬 Messages",
            desc: "All messages (admin)",
          },
        ]}
      />
    </Page>
  );
}
