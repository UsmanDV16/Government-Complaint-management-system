import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/common/LoadingSpinner";

function ProtectedRoute({ allowedRoles, children }) {
  const { currentUser, isReady } = useAuth();

  if (!isReady) return <div className="center-screen"><LoadingSpinner label="Preparing your session" size="lg" /></div>;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(currentUser.role)) return <Navigate to="/login" replace />;

  return children;
}

export default ProtectedRoute;
