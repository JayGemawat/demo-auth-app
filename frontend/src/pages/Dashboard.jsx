// src/pages/Dashboard.jsx
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { logout } from "../redux/authSlice";

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const role = useSelector((state) => state.auth.role);
  const name = useSelector((state) => state.auth.currentUserName);
  const email = useSelector((state) => state.auth.currentUserEmail);
  const mobile = useSelector((state) => state.auth.currentUserMobile);
  const token = useSelector((state) => state.auth.token);

  // Redirect if not logged in
  useEffect(() => {
    if (!token) {
      navigate("/auth");
    }
  }, [token, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/auth");
  };

  return (
    <div className="content">
      <h1>Dashboard</h1>
      <p>Welcome, <strong>{name || "User"}</strong> 👋</p>

      <div className="card">
        <h2>User Info</h2>
        <ul>
          <li><strong>Email:</strong> {email}</li>
          <li><strong>Mobile:</strong> {mobile}</li>
          <li><strong>Role:</strong> {role}</li>
        </ul>
      </div>

      <div className="card">
        <h2>Quick Links</h2>
        <ul>
          {role === "Admin" && (
            <li>
              <Link to="/categories">Manage Categories</Link>
            </li>
          )}
          <li>
            <Link to="/products">View Products</Link>
          </li>
          <li>
            <Link to="/change-password">Change Password</Link>
          </li>
        </ul>
      </div>

      <button onClick={handleLogout} className="btn-danger" style={{ marginTop: "20px" }}>
        Logout
      </button>
    </div>
  );
}
