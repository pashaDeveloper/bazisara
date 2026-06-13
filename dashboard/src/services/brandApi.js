import { bazisaraApi } from "./bazisara";

export const brandApi = bazisaraApi.injectEndpoints({
  endpoints: (builder) => ({
    createBrand: builder.mutation({
      query: (formData) => ({
        url: "/brands/create",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Brand"],
    }),
    getBrands: builder.query({
      query: ({ page = 1, limit = 10, search = "" } = {}) => ({
        url: "/brands/all",
        method: "GET",
        params: { page, limit, ...(search ? { search } : {}) },
      }),
      providesTags: ["Brand"],
    }),
    getBrand: builder.query({
      query: (id) => ({
        url: `/brands/${id}`,
        method: "GET",
      }),
      providesTags: ["Brand"],
    }),
    updateBrand: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/brands/${id}`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["Brand", "Product"],
    }),
    deleteBrand: builder.mutation({
      query: (id) => ({
        url: `/brands/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Brand"],
    }),
  }),
});

export const {
  useCreateBrandMutation,
  useDeleteBrandMutation,
  useGetBrandQuery,
  useGetBrandsQuery,
  useUpdateBrandMutation,
} = brandApi;
