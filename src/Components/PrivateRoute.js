import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

const roleRedirectMap = {
  1: "/PersonalProfilePatient",
  2: "/PersonalProfile",
  19: "/PersonalProfileDoc",
  24: "/PersonalProfilePharma",
  27: "/PersonalProfileSaTeam",
};

const PrivateRoute = ({ children, allowedRoles = [], deniedRoles = [] }) => {
  const { user, isAuthenticated, role } = useAuth();

  // Not logged in
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Admin can access everything
  if (role === 2) {
    return children;
  }

  // Denied role
  if (deniedRoles.includes(role)) {
    return <Navigate to={roleRedirectMap[role] || "/login"} replace />;
  }

  // If no allowedRoles are defined, or role is allowed
  if (allowedRoles.length === 0 || allowedRoles.includes(role)) {
    return children;
  }

  // Not allowed
  return <Navigate to={roleRedirectMap[role] || "/login"} replace />;
};

export default PrivateRoute;
