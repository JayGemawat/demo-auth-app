import { useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Swal from "sweetalert2";
import { resetPasswordAsync } from "../redux/authSlice";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const email = params.get("email") || "";
  const [otp, setOtp] = useState("");
  const [newPass, setNewPass] = useState("");

  const verifyOtp = (email, otp) => {
    try {
      const store = JSON.parse(localStorage.getItem("otpStore") || "{}");
      if (!store[email]) return false;
      const { code, expiresAt } = store[email];
      if (Date.now() > expiresAt) return false;
      return code === otp;
    } catch {
      return false;
    }
  };

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!otp || !newPass) {
        Swal.fire({ icon: "error", title: "All fields required" });
        return;
      }

      const valid = verifyOtp(email, otp);
      if (!valid) {
        Swal.fire({ icon: "error", title: "Invalid or expired OTP" });
        return;
      }

      dispatch(resetPasswordAsync({ email, newPassword: newPass }));

      Swal.fire({ icon: "success", title: "Password reset successfully" });
      navigate("/auth");
    },
    [otp, newPass, email, dispatch, navigate]
  );

  const handleResend = useCallback(() => {
    if (!email) {
      Swal.fire({ icon: "error", title: "Email missing" });
      return;
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const store = JSON.parse(localStorage.getItem("otpStore") || "{}");
    store[email] = { code, expiresAt: Date.now() + 10 * 60 * 1000 };
    localStorage.setItem("otpStore", JSON.stringify(store));

    Swal.fire({
      icon: "info",
      title: "OTP Resent",
      text: `Your OTP is ${code}`,
    });
  }, [email]);

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
