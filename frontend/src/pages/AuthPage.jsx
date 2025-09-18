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

  const [view, setView] = useState("login");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [forgotEmail, setForgotEmail] = useState("");

  useEffect(() => {
    if (token) navigate("/dashboard");
  }, [token, navigate]);

  useEffect(() => {
    if (error) {
      Swal.fire({ icon: "error", title: error });
      dispatch(clearError());
    }
  }, [error, dispatch]);

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

  const handleRegister = useCallback(
    async (e) => {
      e.preventDefault();
      const { name, mobile, email, password, confirm_password } = registerData;
      if (!name || !mobile || !email || !password || !confirm_password) {
        Swal.fire({ icon: "error", title: "All fields required" });
        return;
      }
      if (password !== confirm_password) {
        Swal.fire({ icon: "error", title: "Passwords do not match" });
        return;
      }
      try {
        await dispatch(registerAsync(registerData)).unwrap();
        Swal.fire({
          icon: "success",
          title: "Registered successfully. Please login now.",
          timer: 2000,
          showConfirmButton: false,
        });
        setView("login");
        setRegisterData({
          name: "",
          mobile: "",
          email: "",
          password: "",
          confirm_password: "",
        });
      } catch (err) {
        Swal.fire({ icon: "error", title: err || "Registration failed" });
      }
    },
    [registerData, dispatch]
  );

  const handleForgotPassword = useCallback(
    async (e) => {
      e.preventDefault();
      if (!forgotEmail) {
        Swal.fire({ icon: "error", title: "Email required" });
        return;
      }
      try {
        await dispatch(requestOtpAsync(forgotEmail)).unwrap();
        Swal.fire({
          icon: "success",
          title: "OTP sent!",
          text: "Check your email for OTP.",
        });
        navigate(`/reset-password?email=${encodeURIComponent(forgotEmail)}`);
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: typeof err === "string" ? err : err.message || "Failed to send OTP",
        });
      }
    },
    [forgotEmail, dispatch, navigate]
  );

  return (
    <div className="auth-container">
      <div className={`auth-card ${view}`}>
        {/* LOGIN */}
        <div className="auth-front">
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <input
              id="login-email"
              name="email"
              type="email"
              placeholder="Email"
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
            />
            <input
              id="login-password"
              name="password"
              type="password"
              placeholder="Password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
            />
            <button type="submit" className="btn-primary">Login</button>
          </form>
          <div className="auth-links">
            <button onClick={() => setView("register")}>Register</button>
            <button onClick={() => setView("forgot")}>Forgot Password?</button>
          </div>
        </div>

        {/* REGISTER */}
        <div className="auth-back">
          <h2>Register</h2>
          <form onSubmit={handleRegister}>
            <input
              id="register-name"
              name="name"
              type="text"
              placeholder="Full Name"
              value={registerData.name}
              onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
            />
            <input
              id="register-mobile"
              name="mobile"
              type="text"
              placeholder="Mobile Number"
              value={registerData.mobile}
              onChange={(e) => setRegisterData({ ...registerData, mobile: e.target.value })}
            />
            <input
              id="register-email"
              name="email"
              type="email"
              placeholder="Email"
              value={registerData.email}
              onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
            />
            <input
              id="register-password"
              name="password"
              type="password"
              placeholder="Password"
              value={registerData.password}
              onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
            />
            <input
              id="register-confirm"
              name="confirm_password"
              type="password"
              placeholder="Confirm Password"
              value={registerData.confirm_password}
              onChange={(e) =>
                setRegisterData({ ...registerData, confirm_password: e.target.value })
              }
            />
            <button type="submit" className="btn-primary">Register</button>
          </form>
          <div className="auth-links">
            <button onClick={() => setView("login")}>Back to Login</button>
          </div>
        </div>

        {/* FORGOT PASSWORD */}
        <div className="auth-forgot">
          <h2>Forgot Password</h2>
          <form onSubmit={handleForgotPassword}>
            <input
              id="forgot-email"
              name="email"
              type="email"
              placeholder="Enter registered email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
            />
            <button type="submit" className="btn-success">Send OTP</button>
          </form>
          <div className="auth-links">
            <button onClick={() => setView("login")}>Back to Login</button>
          </div>
        </div>
      </div>
    </div>
  );
}
