
import { bazisaraApi } from "../bazisara";

export const categoryApi = bazisaraApi.injectEndpoints({
  endpoints: (builder) => ({
    createCategory: builder.mutation({
      query: (formData) => ({
        url: "/categories/create",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Category"],
    }),
    getCategories: builder.query({
      query: ({ page = 1, limit = 10, search = "" } = {}) => ({
        url: "/categories/all",
        method: "GET",
        params: { page, limit, ...(search ? { search } : {}) },
      }),
      providesTags: ["Category"],
    }),
    getCategoryTree: builder.query({
      query: () => ({
        url: "/categories/tree",
        method: "GET",
      }),
      providesTags: ["Category"],
    }),
    updateCategory: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/categories/${id}`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["Category"],
    }),
    getCategory: builder.query({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "GET",
      }),
      providesTags: ["Category"],
    }),
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),
  }),
});

export const {
  useCreateCategoryMutation,
  useGetCategoriesQuery,
  useGetCategoryTreeQuery,
  useUpdateCategoryMutation,
  useGetCategoryQuery,
  useDeleteCategoryMutation,
} = categoryApi;

