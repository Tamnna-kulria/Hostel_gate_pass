import { Navigate } from "react-router-dom";
import { getAuthToken, getLoggedInUser } from "../api";

function ProtectedRoute({ children, allowedRoles }) {
  const token = getAuthToken();
  const user = getLoggedInUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;