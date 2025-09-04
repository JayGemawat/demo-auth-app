// src/pages/ChangePassword.jsx
import { useState, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ChangePassword() {
  const { changePassword, logout } = useContext(AuthContext);
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const navigate = useNavigate();
  const email = localStorage.getItem("currentUserEmail");

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!email) return;
      const ok = await changePassword(email, oldPass, newPass);
      if (ok) {
        logout();
        navigate("/login");
      }
    },
    [email, oldPass, newPass, changePassword, logout, navigate]
  );

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Change Password</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Old Password"
            value={oldPass}
            onChange={(e) => setOldPass(e.target.value)}
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
          />
          <button type="submit" className="btn-primary">Update Password</button>
        </form>
      </div>
    </div>
  );
}
