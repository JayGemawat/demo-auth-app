// src/pages/Dashboard.jsx
import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Dashboard() {
  const { role } = useContext(AuthContext);

  return (
    <div className="content">
      <h1>Dashboard</h1>
      <p>Welcome to the demo app. Use the sidebar to navigate.</p>

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
    </div>
  );
}
