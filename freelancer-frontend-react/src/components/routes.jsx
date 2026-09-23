import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute() {
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}

export function RoleRoute({ roles }) {
  const { isLoggedIn, role } = useAuth();
  const location = useLocation();
  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  const allowed = (roles || []).map((r) => r.toUpperCase());
  if (!allowed.includes(role)) {
    return <Navigate to="/home" replace />;
  }
  return <Outlet />;
}
