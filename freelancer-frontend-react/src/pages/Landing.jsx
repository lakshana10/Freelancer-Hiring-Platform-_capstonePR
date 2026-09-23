import { Link } from "react-router-dom";
import { Page } from "../components/ui";
import { useAuth } from "../context/AuthContext";

export function Landing() {
  const { isLoggedIn, dashboardFor, role } = useAuth();
  return (
    <Page>
      <section className="hero">
        <div className="hero-badge">✦ FreelanceHub</div>
        <h1>
          Find work. Hire talent.
          <br />
          All in one place.
        </h1>
        <p className="muted">
          Clients post projects, freelancers bid with proposals, and both sides
          manage contracts, payments, messages and reviews — end to end.
        </p>
        <div className="row">
          {isLoggedIn ? (
            <Link to={dashboardFor(role)} className="btn btn-primary">
              Go to dashboard →
            </Link>
          ) : (
            <>
              <Link to="/signup" className="btn btn-primary">
                Create account →
              </Link>
              <Link to="/login" className="btn btn-ghost">
                Login
              </Link>
            </>
          )}
          <Link to="/jobs" className="btn btn-ghost">
            Browse jobs
          </Link>
        </div>
      </section>
      <section className="grid grid-3">
        <div className="card">
          <h3>📌 Post &amp; discover</h3>
          <p className="muted">
            Publish projects with budget, skills and deadlines. Search and
            filter the public job board.
          </p>
        </div>
        <div className="card">
          <h3>🤝 Propose &amp; hire</h3>
          <p className="muted">
            Submit proposals, compare applicants, hire and create contracts in
            one flow.
          </p>
        </div>
        <div className="card">
          <h3>💳 Track &amp; review</h3>
          <p className="muted">
            Follow payments per contract, chat in-platform, and rate each other
            after delivery.
          </p>
        </div>
      </section>
    </Page>
  );
}
