import { bazisaraApi } from "../bazisara";

export const categoryFilterApi = bazisaraApi.injectEndpoints({
  endpoints: (builder) => ({
    createCategoryFilter: builder.mutation({
      query: (body) => ({
        url: "/category-filters/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["CategoryFilter", "Category"],
    }),
    getCategoryFilters: builder.query({
      query: (params = {}) => {
        const queryParams =
          typeof params === "string" ? { category: params } : params;

        return {
          url: "/category-filters/all",
          method: "GET",
          params: {
            page: queryParams.page || 1,
            limit: queryParams.limit || 10,
            ...(queryParams.search ? { search: queryParams.search } : {}),
            ...(queryParams.category ? { category: queryParams.category } : {}),
          },
        };
      },
      providesTags: ["CategoryFilter"],
    }),
    getCategoryFilter: builder.query({
      query: (id) => ({
        url: `/category-filters/${id}`,
        method: "GET",
      }),
      providesTags: ["CategoryFilter"],
    }),
    updateCategoryFilter: builder.mutation({
      query: ({ id, body }) => ({
        url: `/category-filters/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["CategoryFilter"],
    }),
    reorderCategoryFilters: builder.mutation({
      query: (body) => ({
        url: "/category-filters/reorder",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["CategoryFilter"],
    }),
    deleteCategoryFilter: builder.mutation({
      query: (id) => ({
        url: `/category-filters/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CategoryFilter"],
    }),
  }),
});

export const {
  useCreateCategoryFilterMutation,
  useGetCategoryFiltersQuery,
  useGetCategoryFilterQuery,
  useUpdateCategoryFilterMutation,
  useReorderCategoryFiltersMutation,
  useDeleteCategoryFilterMutation,
} = categoryFilterApi;

