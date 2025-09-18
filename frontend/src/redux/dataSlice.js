// src/redux/dataSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;



// ================== CATEGORY THUNKS ==================
export const fetchCategories = createAsyncThunk("data/fetchCategories", async () => {
  const res = await axios.get(`${API_URL}/categories`);
  return res.data;
});


export const addCategoryAsync = createAsyncThunk("data/addCategory", async (category) => {
  const token = localStorage.getItem("token");
  const res = await axios.post(`${API_URL}/categories`, category, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
});

export const removeCategoryAsync = createAsyncThunk("data/removeCategory", async (id) => {
  const token = localStorage.getItem("token");
  await axios.delete(`${API_URL}/categories/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return id;
});

// ================== PRODUCT THUNKS ==================
export const fetchProducts = createAsyncThunk("data/fetchProducts", async () => {
  const res = await axios.get(`${API_URL}/products`);
  return res.data;
});

export const addProductAsync = createAsyncThunk("data/addProduct", async (product) => {
  const token = localStorage.getItem("token");
  const res = await axios.post(`${API_URL}/products`, product, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
});

export const updateProductAsync = createAsyncThunk("data/updateProduct", async (product) => {
  const token = localStorage.getItem("token");
  const res = await axios.put(`${API_URL}/products/${product.id}`, product, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
});

export const removeProductAsync = createAsyncThunk("data/removeProduct", async (id) => {
  const token = localStorage.getItem("token");
  await axios.delete(`${API_URL}/products/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return id;
});


// ================== INITIAL STATE ==================
const initialState = {
  categories: [],
  products: [],
  colors: ["Black", "White", "Yellow", "Green", "Blue", "Red"],
};

// ================== SLICE ==================
const dataSlice = createSlice({
  name: "data",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Categories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      .addCase(addCategoryAsync.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      })
      .addCase(removeCategoryAsync.fulfilled, (state, action) => {
        state.categories = state.categories.filter((c) => c.id !== action.payload);
      })

      // Products
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.products = action.payload;
      })
      .addCase(addProductAsync.fulfilled, (state, action) => {
        state.products.push(action.payload);
      })
      .addCase(updateProductAsync.fulfilled, (state, action) => {
        const index = state.products.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      .addCase(removeProductAsync.fulfilled, (state, action) => {
        state.products = state.products.filter((p) => p.id !== action.payload);
      });
  },
});

export default dataSlice.reducer;
