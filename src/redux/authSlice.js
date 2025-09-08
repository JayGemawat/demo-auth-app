// src/redux/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Swal from "sweetalert2";

// ---------------- LOGIN ----------------
export const loginAsync = createAsyncThunk(
  "auth/loginAsync",
  async ({ email, password }, { getState }) => {
    const users = getState().auth.users;
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) throw new Error("Invalid email or password");

    localStorage.setItem("token", "dummy-token");
    localStorage.setItem("role", user.role);
    localStorage.setItem("currentUserEmail", user.email);

    return { email: user.email, role: user.role, id: user.id };
  }
);

// ---------------- REGISTER ----------------
export const registerAsync = createAsyncThunk(
  "auth/registerAsync",
  async ({ email, password }, { getState }) => {
    const users = getState().auth.users;
    if (users.find(u => u.email === email)) {
      throw new Error("Email already registered");
    }

    const newUser = { id: Date.now(), email, password, role: "User" };

    // POST to json-server
    await fetch("http://localhost:5000/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });

    // Update localStorage safely
    const updatedUsers = [...users, newUser];
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    localStorage.setItem("token", "dummy-token");
    localStorage.setItem("role", newUser.role);
    localStorage.setItem("currentUserEmail", newUser.email);

    return newUser;
  }
);

// ---------------- REQUEST OTP ----------------
export const requestOtpAsync = createAsyncThunk(
  "auth/requestOtpAsync",
  async (email, { getState }) => {
    const users = getState().auth.users;
    const user = users.find(u => u.email === email);
    if (!user) throw new Error("Email not found");

    const otp = Math.floor(100000 + Math.random() * 900000);
    const store = JSON.parse(localStorage.getItem("otpStore") || "{}");
    store[email] = { code: String(otp), expiresAt: Date.now() + 10 * 60 * 1000 };
    localStorage.setItem("otpStore", JSON.stringify(store));

    Swal.fire({ icon: "info", title: `Your OTP is ${otp}`, timer: 2000, showConfirmButton: true });
    return otp;
  }
);

// ---------------- RESET PASSWORD ----------------
export const resetPasswordAsync = createAsyncThunk(
  "auth/resetPasswordAsync",
  async ({ email, newPassword }, { getState }) => {
    const users = getState().auth.users;
    const updatedUsers = users.map(u =>
      u.email === email ? { ...u, password: newPassword } : u
    );

    localStorage.setItem("users", JSON.stringify(updatedUsers));

    const store = JSON.parse(localStorage.getItem("otpStore") || "{}");
    delete store[email];
    localStorage.setItem("otpStore", JSON.stringify(store));

    return true;
  }
);

// ---------------- CHANGE PASSWORD ----------------
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async ({ email, oldPassword, newPassword }, { getState }) => {
    const users = getState().auth.users;
    const userExists = users.find(u => u.email === email && u.password === oldPassword);
    if (!userExists) throw new Error("Old password is incorrect");

    const updatedUsers = users.map(u =>
      u.email === email ? { ...u, password: newPassword } : u
    );
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    return true;
  }
);

// ---------------- SLICE ----------------
const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: localStorage.getItem("token") || null,
    role: localStorage.getItem("role") || null,
    currentUserEmail: localStorage.getItem("currentUserEmail") || null,
    users: JSON.parse(localStorage.getItem("users") || "null") || [
      { id: 1, email: "admin@gmail.com", password: "123456", role: "Admin" },
      { id: 2, email: "user@gmail.com", password: "123456", role: "User" },
    ],
    otp: null,
  },
  reducers: {
    logout: (state) => {
      state.token = null;
      state.role = null;
      state.currentUserEmail = null;
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("currentUserEmail");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.token = "dummy-token";
        state.role = action.payload.role;
        state.currentUserEmail = action.payload.email;
      })
      .addCase(registerAsync.fulfilled, (state, action) => {
        state.token = "dummy-token";
        state.role = action.payload.role;
        state.currentUserEmail = action.payload.email;

        // ✅ Safely update users array
        state.users = [...state.users, {
          id: action.payload.id,
          email: action.payload.email,
          password: action.payload.password,
          role: action.payload.role
        }];
      })
      .addCase(requestOtpAsync.fulfilled, (state, action) => {
        state.otp = action.payload;
      })
      .addCase(resetPasswordAsync.fulfilled, (state) => {
        state.otp = null;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
