// src/pages/AuthPage.jsx
import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import {
  loginAsync,
  registerAsync,
  requestOtpAsync,
  clearError,
} from "../redux/authSlice";

export default function AuthPage() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const error = useSelector((state) => state.auth.error);
  const navigate = useNavigate();

  // --- State ---
  const [view, setView] = useState("login"); // "login" | "register" | "forgot"
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ email: "", password: "" });
  const [forgotEmail, setForgotEmail] = useState("");

  // Auto-redirect if logged in
  useEffect(() => {
    if (token) navigate("/dashboard");
  }, [token, navigate]);

  // Show error via SweetAlert when registration fails
  useEffect(() => {
    if (error) {
      Swal.fire({ icon: "error", title: error });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // --- LOGIN ---
  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault();
      const { email, password } = loginData;
      if (!email || !password) {
        Swal.fire({ icon: "error", title: "All fields required" });
        return;
      }

      try {
        await dispatch(loginAsync({ email, password })).unwrap();
        Swal.fire({
          icon: "success",
          title: "Login successful",
          timer: 1500,
          showConfirmButton: false,
        });
        navigate("/dashboard");
      } catch (err) {
        Swal.fire({ icon: "error", title: err.message || "Login failed" });
      }
    },
    [loginData, dispatch, navigate]
  );

  // --- REGISTER ---
  const handleRegister = useCallback(
    async (e) => {
      e.preventDefault();
      const { email, password } = registerData;
      if (!email || !password) {
        Swal.fire({ icon: "error", title: "All fields required" });
        return;
      }

      try {
        await dispatch(registerAsync({ email, password })).unwrap();
        Swal.fire({
          icon: "success",
          title: "Registered successfully",
          timer: 1500,
          showConfirmButton: false,
        });
        setView("login");
        setRegisterData({ email: "", password: "" });
      } catch (err) {
        Swal.fire({ icon: "error", title: err.message || "Registration failed" });
      }
    },
    [registerData, dispatch]
  );

  // --- FORGOT PASSWORD ---
  const handleForgotPassword = useCallback(
    async (e) => {
      e.preventDefault();
      if (!forgotEmail) {
        Swal.fire({ icon: "error", title: "Email required" });
        return;
      }

      try {
        const otp = await dispatch(requestOtpAsync(forgotEmail)).unwrap();
        Swal.fire({
          icon: "success",
          title: "OTP sent!",
          text: `Your OTP is: ${otp}`,
        });
        navigate(`/reset-password?email=${encodeURIComponent(forgotEmail)}`);
      } catch (err) {
        Swal.fire({ icon: "error", title: err.message || "Failed to send OTP" });
      }
    },
    [forgotEmail, dispatch, navigate]
  );

  return (
    <div className="auth-container">
      <div className={`auth-card ${view}`}>
        {/* Login Form */}
        <div className="auth-front">
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={loginData.email}
              onChange={(e) =>
                setLoginData({ ...loginData, email: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="Password"
              value={loginData.password}
              onChange={(e) =>
                setLoginData({ ...loginData, password: e.target.value })
              }
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

        {/* Register Form */}
        <div className="auth-back">
          <h2>Register</h2>
          <form onSubmit={handleRegister}>
            <input
              type="email"
              placeholder="Email"
              value={registerData.email}
              onChange={(e) =>
                setRegisterData({ ...registerData, email: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="Password"
              value={registerData.password}
              onChange={(e) =>
                setRegisterData({ ...registerData, password: e.target.value })
              }
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

        {/* Forgot Password Form */}
        <div className="auth-forgot">
          <h2>Forgot Password</h2>
          <form onSubmit={handleForgotPassword}>
            <input
              type="email"
              placeholder="Enter registered email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
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
