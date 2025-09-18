// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import dataReducer from "./dataSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    data: dataReducer,
  },
});
