// src/pages/AuthPage.jsx
import { useState, useContext, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const { login, register, requestOtp } = useContext(AuthContext);
  const [view, setView] = useState("login"); // "login", "register", "forgot"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLoginRegister = useCallback(
    async (e) => {
      e.preventDefault();

      if (!email || (!password && view !== "forgot")) {
        Swal.fire({ icon: "error", title: "All fields required" });
        return;
      }

      if (view === "login") {
        const ok = await login(email, password);
        if (ok) {
          Swal.fire({
            icon: "success",
            title: "Login successful",
            showConfirmButton: false,
            timer: 1500,
          });
          navigate("/dashboard");
        } else {
          Swal.fire({ icon: "error", title: "Invalid credentials" });
        }
      } else if (view === "register") {
        const ok = await register({ email, password });
        if (ok) {
          Swal.fire({ icon: "success", title: "Registered successfully" });
          setView("login");
          setEmail("");
          setPassword("");
        }
      }
    },
    [email, password, view, login, register, navigate]
  );

  const handleForgotPassword = useCallback(
    async (e) => {
      e.preventDefault();
      if (!email) {
        Swal.fire({ icon: "error", title: "Email required" });
        return;
      }
      const ok = await requestOtp(email);
      if (ok) {
        Swal.fire({ icon: "success", title: "OTP sent to email" });
        navigate(`/reset-password?email=${encodeURIComponent(email)}`);
      } else {
        Swal.fire({ icon: "error", title: "Failed to send OTP" });
      }
    },
    [email, requestOtp, navigate]
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
