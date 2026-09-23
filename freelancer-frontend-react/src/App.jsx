import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute, RoleRoute } from "./components/routes";
import { Navbar } from "./components/ui";
import { AuthProvider } from "./context/AuthContext";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { Jobs } from "./pages/Jobs";
import { JobDetails } from "./pages/JobDetails";
import { Freelancers } from "./pages/Freelancers";
import { FreelancerProfile } from "./pages/FreelancerProfile";
import {
  AdminDashboard,
  ClientDashboard,
  FreelancerDashboard,
  Home,
} from "./pages/Dashboards";
import { PostJob } from "./pages/PostJob";
import { MyJobs } from "./pages/MyJobs";
import {
  AdminApplications,
  ClientApplications,
  MyApplications,
} from "./pages/Applications";
import { ClientContracts, MyContracts } from "./pages/Contracts";
import { Payments } from "./pages/Payments";
import { Messages } from "./pages/Messages";
import { Notifications } from "./pages/Notifications";
import { MyReviews } from "./pages/MyReviews";
import { GiveReview } from "./pages/GiveReview";
import { Profile } from "./pages/Profile";
import { JobsAdmin, UsersAdmin } from "./pages/Admin";

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="/freelancers" element={<Freelancers />} />
        <Route path="/freelancers/:email" element={<FreelancerProfile />} />

        {/* Any logged-in user */}
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/reviews" element={<MyReviews />} />
          <Route path="/reviews/give" element={<GiveReview />} />
          <Route path="/payments" element={<Payments />} />
        </Route>

        {/* Client + Admin */}
        <Route element={<RoleRoute roles={["CLIENT", "ADMIN"]} />}>
          <Route path="/client-dashboard" element={<ClientDashboard />} />
          <Route path="/post-job" element={<PostJob />} />
          <Route path="/my-jobs" element={<MyJobs />} />
          <Route path="/applications" element={<ClientApplications />} />
          <Route path="/contracts" element={<ClientContracts />} />
        </Route>

        {/* Freelancer + Admin */}
        <Route element={<RoleRoute roles={["FREELANCER", "ADMIN"]} />}>
          <Route
            path="/freelancer-dashboard"
            element={<FreelancerDashboard />}
          />
          <Route path="/my-applications" element={<MyApplications />} />
          <Route path="/my-contracts" element={<MyContracts />} />
        </Route>

        {/* Admin only */}
        <Route element={<RoleRoute roles={["ADMIN"]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UsersAdmin />} />
          <Route path="/admin/jobs" element={<JobsAdmin />} />
          <Route
            path="/admin/applications"
            element={<AdminApplications />}
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <footer className="footer">
        © 2026 FreelanceHub · React + Vite build
      </footer>
    </AuthProvider>
  );
}
