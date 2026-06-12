import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  admin: {},
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    addAdmin: (state, { payload }) => {
      state.admin = payload;
    },
    clearAdmin: (state) => {
      state.admin = {};
    },
  },
});

export const { addAdmin, clearAdmin } = authSlice.actions;
export default authSlice.reducer;

