// src/pages/AuthPage.jsx
import { useState, useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import {
  loginAsync,
  registerAsync,
  requestOtpAsync,
} from "../redux/authSlice"; // async thunks

export default function AuthPage() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const [view, setView] = useState("login"); // "login", "register", "forgot"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Auto-redirect if logged in
  useEffect(() => {
    if (token) navigate("/dashboard");
  }, [token, navigate]);

  // --- LOGIN & REGISTER ---
  const handleLoginRegister = useCallback(
    async (e) => {
      e.preventDefault();
      if (!email || (!password && view !== "forgot")) {
        Swal.fire({ icon: "error", title: "All fields required" });
        return;
      }

      try {
        if (view === "login") {
          await dispatch(loginAsync({ email, password })).unwrap();
          Swal.fire({
            icon: "success",
            title: "Login successful",
            timer: 1500,
            showConfirmButton: false,
          });
          navigate("/dashboard");
        } else if (view === "register") {
          await dispatch(registerAsync({ email, password })).unwrap();
          Swal.fire({
            icon: "success",
            title: "Registered successfully",
          });
          setView("login");
          setEmail("");
          setPassword("");
        }
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: err.message || "Operation failed",
        });
      }
    },
    [email, password, view, dispatch, navigate]
  );

  // --- FORGOT PASSWORD ---
  const handleForgotPassword = useCallback(
    async (e) => {
      e.preventDefault();
      if (!email) {
        Swal.fire({ icon: "error", title: "Email required" });
        return;
      }

      try {
        await dispatch(requestOtpAsync(email)).unwrap();
        Swal.fire({
          icon: "success",
          title: "OTP sent to your email",
        });
        navigate(`/reset-password?email=${encodeURIComponent(email)}`);
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: err.message || "Failed to send OTP",
        });
      }
    },
    [email, dispatch, navigate]
  );

  return (
    <div className="auth-container">
      <div className={`auth-card ${view}`}>
        {/* Login */}
        <div className="auth-front">
          <h2>Login</h2>
          <form onSubmit={handleLoginRegister}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="btn-primary">
              Login
            </button>
          </form>
          <div className="auth-links">
            <button type="button" onClick={() => setView("register")}>
              Register
            </button>
            <button type="button" onClick={() => setView("forgot")}>
              Forgot Password?
            </button>
          </div>
        </div>

        {/* Register */}
        <div className="auth-back">
          <h2>Register</h2>
          <form onSubmit={handleLoginRegister}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="btn-primary">
              Register
            </button>
          </form>
          <div className="auth-links">
            <button type="button" onClick={() => setView("login")}>
              Back to Login
            </button>
          </div>
        </div>

        {/* Forgot Password */}
        <div className="auth-forgot">
          <h2>Forgot Password</h2>
          <form onSubmit={handleForgotPassword}>
            <input
              type="email"
              placeholder="Enter registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className="btn-success">
              Send OTP
            </button>
          </form>
          <div className="auth-links">
            <button type="button" onClick={() => setView("login")}>
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
