import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const nabApi = createApi({
  reducerPath: "nabApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("x-lang", "fa");
      return headers;
    }
  }),
  tagTypes: [
    "User",
    "Admin",
    "Product",
    "Brand",
    "Category",
    "Store",
    "Cart",
    "Favorite",
    "Purchase",
    "Review",
    "Tag",
    "Unit",
    "Magazine",
    "Blog",
    "Gallery",
    "FeaturedProduct",
    "Payment",
    "Order",
    "Address"
  ],
  endpoints: () => ({})
});