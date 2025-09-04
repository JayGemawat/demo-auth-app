// src/components/Layout.jsx
import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Swal from "sweetalert2";
import { logout as logoutAction } from "../redux/authSlice";

export default function Layout() {
  const dispatch = useDispatch();
  const { role } = useSelector((state) => state.auth); // Redux state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Dynamic page title
  const pathTitle = (() => {
    const path = location.pathname.split("/")[1] || "dashboard";
    return path.charAt(0).toUpperCase() + path.slice(1);
  })();

  // Lock body scroll on mobile
  useEffect(() => {
    document.body.style.overflow =
      sidebarOpen && window.innerWidth < 768 ? "hidden" : "";
  }, [sidebarOpen]);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

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
      dispatch(logoutAction()); // Redux logout
      Swal.fire({
        icon: "success",
        title: "Logged out successfully",
        timer: 1200,
        showConfirmButton: false,
      });
    }
  };

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", roles: ["Admin", "User"] },
    { name: "Categories", path: "/categories", roles: ["Admin"] },
    { name: "Products", path: "/products", roles: ["Admin", "User"] },
    { name: "Change Password", path: "/change-password", roles: ["Admin", "User"] },
  ];

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
        <h2>My Demo App</h2>
        <ul>
          {menuItems.map(
            (item) =>
              item.roles.includes(role) && (
                <li key={item.path}>
                  <NavLink to={item.path} onClick={() => setSidebarOpen(false)}>
                    {item.name}
                  </NavLink>
                </li>
              )
          )}
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
