// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

import AuthPage from "./pages/AuthPage"; // Combined login/register/forgot page
import ResetPassword from "./pages/ResetPassword"; // optional, for OTP reset
import Dashboard from "./pages/Dashboard";
import Categories from "./pages/Categories";
import Products from "./pages/Products";
import ChangePassword from "./pages/ChangePassword";
import Layout from "./components/Layout";

function ProtectedRoute({ children }) {
  const { token } = useContext(AuthContext);
  return token ? children : <Navigate to="/auth" />;
}

function AdminRoute({ children }) {
  const { token, role } = useContext(AuthContext);
  return token && role === "Admin" ? children : <Navigate to="/dashboard" />;
}

export default function App() {
  const { token } = useContext(AuthContext);

  return (
    <Router>
      <Routes>
        {/* Unified Auth page */}
        <Route
          path="/auth"
          element={token ? <Navigate to="/dashboard" /> : <AuthPage />}
        />

        {/* Optional Reset Password if OTP flow is separate */}
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route
            path="categories"
            element={
              <AdminRoute>
                <Categories />
              </AdminRoute>
            }
          />
          <Route path="change-password" element={<ChangePassword />} />
          {/* Default → dashboard */}
          <Route index element={<Navigate to="dashboard" />} />
        </Route>

        {/* Redirect old login/register routes to new unified auth */}
        <Route path="/login" element={<Navigate to="/auth" />} />
        <Route path="/register" element={<Navigate to="/auth" />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/auth" />} />
      </Routes>
    </Router>
  );
}
