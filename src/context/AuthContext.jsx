// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useCallback, useMemo } from "react";
import Swal from "sweetalert2";

const AuthContext = createContext();
export { AuthContext };

const seedUsers = [
  { id: 1, email: "admin@gmail.com", password: "123456", role: "Admin" },
  { id: 2, email: "user@gmail.com", password: "123456", role: "User" },
];

const readOtpStore = () => {
  try {
    return JSON.parse(localStorage.getItem("otpStore") || "{}");
  } catch {
    return {};
  }
};
const writeOtpStore = (obj) => localStorage.setItem("otpStore", JSON.stringify(obj));

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [role, setRole] = useState(() => localStorage.getItem("role"));
  const [users, setUsers] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("users")) || seedUsers;
    } catch {
      return seedUsers;
    }
  });

  // persist users once users change
  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);

  // persist auth (token/role/currentUserEmail)
  useEffect(() => {
    if (token && role) {
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("currentUserEmail");
    }
  }, [token, role]);

  // LOGIN
  const login = useCallback(
    (email, password) => {
      const u = users.find((x) => x.email === email && x.password === password);
      if (u) {
        setToken("dummy-token");
        setRole(u.role);
        localStorage.setItem("currentUserEmail", u.email);
        return true;
      }
      return false;
    },
    [users]
  );

  // REGISTER
  const register = useCallback(
    async ({ email, password }) => {
      if (users.some((u) => u.email === email)) {
        await Swal.fire({ icon: "error", title: "Email already registered" });
        return false;
      }
      const next = { id: Date.now(), email, password, role: "User" };
      setUsers((prev) => [...prev, next]);
      await Swal.fire({ icon: "success", title: "Registered successfully!" });
      return true;
    },
    [users]
  );

  // REQUEST OTP (demo)
  const requestOtp = useCallback(
    async (email) => {
      const u = users.find((x) => x.email === email);
      if (!u) {
        await Swal.fire({ icon: "error", title: "Email not found" });
        return false;
      }
      const code = String(Math.floor(100000 + Math.random() * 900000));
      const store = readOtpStore();
      store[email] = { code, expiresAt: Date.now() + 10 * 60 * 1000 }; // 10 min
      writeOtpStore(store);

      // DEMO-only: show OTP via alert
      await Swal.fire({
        icon: "info",
        title: "OTP sent to email (demo)",
        text: `For demo purposes, your OTP is ${code}`,
      });
      return true;
    },
    [users]
  );

  // VERIFY OTP
  const verifyOtp = useCallback((email, code) => {
    const store = readOtpStore();
    const rec = store[email];
    if (!rec) return false;
    return rec.code === code && Date.now() < rec.expiresAt;
  }, []);

  // RESET PASSWORD (via OTP)
  const resetPassword = useCallback(async (email, newPassword) => {
    let updated = false;

    setUsers((prev) =>
      prev.map((u) => {
        if (u.email === email) {
          if (u.password === newPassword) {
            // new equals old
            // show alert (non-blocking here, caller can await)
            Swal.fire({ icon: "error", title: "New password cannot be same as old password" });
            updated = false;
            return u;
          }
          updated = true;
          return { ...u, password: newPassword };
        }
        return u;
      })
    );

    if (updated) {
      const store = readOtpStore();
      delete store[email];
      writeOtpStore(store);
      await Swal.fire({ icon: "success", title: "Password updated successfully!" });
      return true;
    }
    return false;
  }, []);

  // CHANGE PASSWORD (logged-in user; requires old password)
  const changePassword = useCallback(async (email, oldPassword, newPassword) => {
    let updated = false;

    setUsers((prev) =>
      prev.map((u) => {
        if (u.email === email) {
          if (u.password !== oldPassword) {
            Swal.fire({ icon: "error", title: "Old password is incorrect" });
            updated = false;
            return u;
          }
          if (u.password === newPassword) {
            Swal.fire({ icon: "error", title: "New password cannot be same as old password" });
            updated = false;
            return u;
          }
          updated = true;
          return { ...u, password: newPassword };
        }
        return u;
      })
    );

    if (updated) {
      await Swal.fire({ icon: "success", title: "Password changed successfully!" });
      return true;
    }
    return false;
  }, []);

  // LOGOUT
  const logout = useCallback(() => {
    setToken(null);
    setRole(null);
    localStorage.removeItem("currentUserEmail");
  }, []);

  const value = useMemo(
    () => ({
      token,
      role,
      login,
      register,
      requestOtp,
      verifyOtp,
      resetPassword,
      changePassword,
      logout,
    }),
    [token, role, login, register, requestOtp, verifyOtp, resetPassword, changePassword, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
