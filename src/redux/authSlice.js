import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: null,
  expiry: null, // token muddati
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.expiry = Date.now() + 24 * 60 * 60 * 1000; // 1 kun (ms formatida)
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.expiry = null;
      state.error = null;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { login, logout, setError } = authSlice.actions;
export default authSlice.reducer;
