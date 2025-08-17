import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,
  expiry: localStorage.getItem("expiry")
    ? parseInt(localStorage.getItem("expiry"))
    : null,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.expiry = Date.now() + 24 * 60 * 60 * 1000; // 1 kun

      // localStorage ga yozish
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("expiry", state.expiry);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.expiry = null;
      state.error = null;

      // localStorage tozalash
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("expiry");
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { login, logout, setError } = authSlice.actions;
export default authSlice.reducer;
