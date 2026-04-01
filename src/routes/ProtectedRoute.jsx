import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ allowedRoles, children }) {
  const { currentUser, isReady } = useAuth();

  if (!isReady) return <div className="center-screen">Loading...</div>;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(currentUser.role)) return <Navigate to="/login" replace />;

  return children;
}

export default ProtectedRoute;
