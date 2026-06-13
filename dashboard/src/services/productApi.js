import { bazisaraApi } from "./bazisara";

export const productApi = bazisaraApi.injectEndpoints({
  endpoints: (builder) => ({
    createProduct: builder.mutation({
      query: (formData) => ({
        url: "/products/create",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Product", "Approval"],
    }),
    getProducts: builder.query({
      query: ({ page = 1, limit = 10, search = "", platform = "", genre = "", maker = "" } = {}) => ({
        url: "/products/all",
        method: "GET",
        params: {
          page,
          limit,
          ...(search ? { search } : {}),
          ...(platform ? { platform } : {}),
          ...(genre ? { genre } : {}),
          ...(maker ? { maker } : {}),
        },
      }),
      providesTags: ["Product"],
    }),
    getProduct: builder.query({
      query: (id) => ({
        url: `/products/${id}`,
        method: "GET",
      }),
      providesTags: ["Product"],
    }),
    updateProduct: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/products/${id}`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["Product", "Approval"],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),
  }),
});

export const {
  useCreateProductMutation,
  useDeleteProductMutation,
  useGetProductQuery,
  useGetProductsQuery,
  useUpdateProductMutation,
} = productApi;
