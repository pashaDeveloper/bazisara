import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const bazisaraApi = createApi({
  reducerPath: "bazisaraApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASE_URL,
    prepareHeaders: (headers) => {
      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: [
    "User",
    "Address",
    "Category",
    "CategoryFilter",
    "FilterDefinition",
    "Genre",
    "Company",
    "Tag",
    "Game",
    "Icon",
  ],
  endpoints: () => ({})
});
