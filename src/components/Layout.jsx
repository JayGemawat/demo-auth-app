// src/components/Layout.jsx
import { useState, useContext, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Swal from "sweetalert2";

export default function Layout() {
  const { role, logout } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Extract page name from pathname for title
  const pathTitle = (() => {
    const path = location.pathname.split("/")[1] || "dashboard";
    return path.charAt(0).toUpperCase() + path.slice(1);
  })();

  // Lock body scroll on mobile when sidebar is open
  useEffect(() => {
    if (sidebarOpen && window.innerWidth < 768) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [sidebarOpen]);

  // Handle logout with SweetAlert confirmation
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, logout",
    });

    if (result.isConfirmed) {
      logout();
      Swal.fire({
        icon: "success",
        title: "Logged out successfully",
        timer: 1200,
        showConfirmButton: false,
      });
    }
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
        <h2>My Demo App</h2>
        <ul>
          <li>
            <NavLink to="/dashboard">Dashboard</NavLink>
          </li>
          {role === "Admin" && (
            <li>
              <NavLink to="/categories">Categories</NavLink>
            </li>
          )}
          <li>
            <NavLink to="/products">Products</NavLink>
          </li>
          <li>
            <NavLink to="/change-password">Change Password</NavLink>
          </li>
        </ul>
        <button onClick={handleLogout} className="btn-danger">
          Logout
        </button>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && window.innerWidth < 768 && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Content */}
      <main className="content">
        {/* Topbar */}
        <div className="topbar">
          <button
            className={`hamburger ${sidebarOpen ? "open" : ""}`}
            onClick={() => setSidebarOpen((prev) => !prev)}
          >
            <span className="hamburger-icon" />
          </button>
          <h1 className="topbar-title">{pathTitle}</h1>
        </div>

        {/* Page Content */}
        <Outlet />
      </main>
    </div>
  );
}
