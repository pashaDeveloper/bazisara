import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_BASE_URL,
  prepareHeaders: (headers) => {
    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("token");

    headers.set("Cache-Control", "no-cache");
    headers.set("Pragma", "no-cache");

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

const baseQueryWithNoCache = (args, api, extraOptions) => {
  const request =
    typeof args === "string"
      ? { url: args, method: "GET" }
      : { method: "GET", ...args };

  const method = String(request.method || "GET").toUpperCase();
  const nextArgs =
    method === "GET"
      ? {
          ...request,
          cache: "no-store",
          params: {
            ...(request.params || {}),
            _t: Date.now(),
          },
        }
      : request;

  return rawBaseQuery(nextArgs, api, extraOptions);
};

export const bazisaraApi = createApi({
  reducerPath: "bazisaraApi",
  baseQuery: baseQueryWithNoCache,
  keepUnusedDataFor: 0,
  refetchOnFocus: true,
  refetchOnMountOrArgChange: true,
  refetchOnReconnect: true,
  tagTypes: [
    "User",
    "Admin",
    "Address",
    "Category",
    "CategoryFilter",
    "FilterDefinition",
    "Genre",
    "Platform",
    "Company",
    "Brand",
    "WarrantyCompany",
    "Warranty",
    "InsuranceCompany",
    "Insurance",
    "Price",
    "ShippingMethod",
    "Tag",
    "Game",
    "GameCollection",
    "Product",
    "Article",
    "Slider",
    "Icon",
    "Approval",
    "ApprovalMessage",
    "Analytics",
  ],
  endpoints: () => ({})
});

