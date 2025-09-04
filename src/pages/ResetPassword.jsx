// src/pages/ResetPassword.jsx
import { useState, useContext, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Swal from "sweetalert2";

export default function ResetPassword() {
  const { verifyOtp, resetPassword, requestOtp } = useContext(AuthContext);
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const email = params.get("email") || "";
  const [otp, setOtp] = useState("");
  const [newPass, setNewPass] = useState("");

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!otp || !newPass) return;
      const valid = verifyOtp(email, otp);
      if (!valid) {
        Swal.fire({ icon: "error", title: "Invalid or expired OTP" });
        return;
      }
      const ok = await resetPassword(email, newPass);
      if (ok) navigate("/login");
    },
    [otp, newPass, email, verifyOtp, resetPassword, navigate]
  );

  const handleResend = useCallback(() => {
    if (email) requestOtp(email);
  }, [email, requestOtp]);

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
