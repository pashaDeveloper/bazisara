
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
  },
});

export const { addAdmin } = authSlice.actions;
export default authSlice.reducer;
