// src/pages/ResetPassword.jsx
import { useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Swal from "sweetalert2";
import { resetPasswordAsync, requestOtpAsync } from "../redux/authSlice";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const email = params.get("email") || "";
  const [otp, setOtp] = useState("");
  const [newPass, setNewPass] = useState("");

  // Submit reset request
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!otp || !newPass) {
        Swal.fire({ icon: "error", title: "All fields required" });
        return;
      }

      try {
        await dispatch(resetPasswordAsync({ email, otp, new_password: newPass })).unwrap();
        Swal.fire({ icon: "success", title: "Password reset successfully" });
        navigate("/auth");
      } catch (err) {
        Swal.fire({ icon: "error", title: err || "Reset failed" });
      }
    },
    [otp, newPass, email, dispatch, navigate]
  );

  // Resend OTP email
  const handleResend = useCallback(async () => {
    try {
      await dispatch(requestOtpAsync(email)).unwrap();
      Swal.fire({
        icon: "info",
        title: "OTP resent",
        text: "Check your email for the new OTP",
      });
    } catch (err) {
      Swal.fire({ icon: "error", title: err || "Failed to resend OTP" });
    }
  }, [dispatch, email]);

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Reset Password</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
          />
          <button type="submit" className="btn-success">Reset</button>
        </form>
        <button className="btn-ghost" onClick={handleResend}>Resend OTP</button>
      </div>
    </div>
  );
}
