import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import { bazisaraApi } from "./services/bazisara";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [bazisaraApi.reducerPath]: bazisaraApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(bazisaraApi.middleware),
});

