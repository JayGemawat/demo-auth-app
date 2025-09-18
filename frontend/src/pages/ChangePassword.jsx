// src/pages/ChangePassword.jsx
import { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { changePasswordAsync, logout } from "../redux/authSlice";

export default function ChangePassword() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const email = useSelector((state) => state.auth.currentUserEmail);
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!email || !oldPass || !newPass) {
        Swal.fire({ icon: "error", title: "All fields are required" });
        return;
      }

      try {
        await dispatch(
          changePasswordAsync({ email, old_password: oldPass, new_password: newPass })
        ).unwrap();

        Swal.fire({
          icon: "success",
          title: "Password changed! Logging out...",
          timer: 1500,
          showConfirmButton: false,
        });

        dispatch(logout());
        navigate("/auth");
      } catch (err) {
        Swal.fire({ icon: "error", title: err || "Failed to change password" });
      }

      setOldPass("");
      setNewPass("");
    },
    [email, oldPass, newPass, dispatch, navigate]
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
          <button type="submit" className="btn-primary">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
