// src/redux/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_URL = import.meta.env.VITE_API_URL;


// ---------------- LOGIN ----------------
export const loginAsync = createAsyncThunk(
  "auth/loginAsync",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Invalid credentials");
      }
      return await res.json(); // { access_token, token_type, user }
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ---------------- REGISTER ----------------
export const registerAsync = createAsyncThunk(
  "auth/registerAsync",
  async ({ name, mobile, email, password, confirm_password }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, mobile, email, password, confirm_password }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Registration failed");
      }
      return await res.json();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ---------------- REQUEST OTP ----------------
export const requestOtpAsync = createAsyncThunk(
  "auth/requestOtpAsync",
  async (email, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_URL}/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Failed to send OTP");
      }
      return await res.json();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ---------------- RESET PASSWORD ----------------
export const resetPasswordAsync = createAsyncThunk(
  "auth/resetPasswordAsync",
  async ({ email, otp, new_password }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, new_password }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Failed to reset password");
      }
      return await res.json(); // { message }
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ---------------- CHANGE PASSWORD ----------------
export const changePasswordAsync = createAsyncThunk(
  "auth/changePasswordAsync",
  async ({ email, old_password, new_password }, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const res = await fetch(`${API_URL}/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, old_password, new_password }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Failed to change password");
      }
      return await res.json(); // { message }
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ---------------- SLICE ----------------
const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: localStorage.getItem("token") || null,
    role: localStorage.getItem("role") || null,
    currentUserEmail: localStorage.getItem("currentUserEmail") || null,
    currentUserName: localStorage.getItem("currentUserName") || null,
    currentUserMobile: localStorage.getItem("currentUserMobile") || null,
    currentUserId: localStorage.getItem("currentUserId")
      ? Number(localStorage.getItem("currentUserId"))
      : null,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.token = null;
      state.role = null;
      state.currentUserEmail = null;
      state.currentUserName = null;
      state.currentUserMobile = null;
      state.currentUserId = null;
      localStorage.clear();
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.fulfilled, (state, { payload }) => {
        state.token = payload.access_token;
        state.role = payload.user.role;
        state.currentUserEmail = payload.user.email;
        state.currentUserName = payload.user.name;
        state.currentUserMobile = payload.user.mobile;
        if (payload.user.id !== undefined) {
          state.currentUserId = payload.user.id;
          localStorage.setItem("currentUserId", payload.user.id);
        }
        localStorage.setItem("token", payload.access_token);
        localStorage.setItem("role", payload.user.role);
        localStorage.setItem("currentUserEmail", payload.user.email);
        localStorage.setItem("currentUserName", payload.user.name);
        localStorage.setItem("currentUserMobile", payload.user.mobile);
        state.error = null;
      })
      .addCase(loginAsync.rejected, (state, { payload }) => {
        state.error = payload;
      })
      .addCase(registerAsync.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(registerAsync.rejected, (state, { payload }) => {
        state.error = payload;
      })
      .addCase(requestOtpAsync.rejected, (state, { payload }) => {
        state.error = payload;
      })
      .addCase(resetPasswordAsync.rejected, (state, { payload }) => {
        state.error = payload;
      })
      .addCase(changePasswordAsync.rejected, (state, { payload }) => {
        state.error = payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
