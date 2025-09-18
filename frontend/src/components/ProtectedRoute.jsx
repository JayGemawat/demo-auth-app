// src/components/ProtectedRoute.jsx
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, roleRequired }) {
  const token = useSelector((state) => state.auth.token);
  const role = useSelector((state) => state.auth.role);

  if (!token) {
    // Not logged in → redirect to login page
    return <Navigate to="/auth" replace />;
  }

  if (roleRequired && role !== roleRequired) {
    // Logged in but not enough privilege
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
