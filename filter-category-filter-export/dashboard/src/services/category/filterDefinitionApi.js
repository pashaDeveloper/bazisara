import { bazisaraApi } from "../bazisara";

export const filterDefinitionApi = bazisaraApi.injectEndpoints({
  endpoints: (builder) => ({
    createFilterDefinition: builder.mutation({
      query: (body) => ({
        url: "/filter-definitions/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["FilterDefinition"],
    }),
    getFilterDefinitions: builder.query({
      query: ({ page = 1, limit = 10, search = "" } = {}) => ({
        url: "/filter-definitions/all",
        method: "GET",
        params: { page, limit, ...(search ? { search } : {}) },
      }),
      providesTags: ["FilterDefinition"],
    }),
    getFilterDefinition: builder.query({
      query: (id) => ({
        url: `/filter-definitions/${id}`,
        method: "GET",
      }),
      providesTags: ["FilterDefinition"],
    }),
    updateFilterDefinition: builder.mutation({
      query: ({ id, body }) => ({
        url: `/filter-definitions/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["FilterDefinition", "CategoryFilter"],
    }),
    deleteFilterDefinition: builder.mutation({
      query: (id) => ({
        url: `/filter-definitions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["FilterDefinition"],
    }),
  }),
});

export const {
  useCreateFilterDefinitionMutation,
  useGetFilterDefinitionsQuery,
  useGetFilterDefinitionQuery,
  useUpdateFilterDefinitionMutation,
  useDeleteFilterDefinitionMutation,
} = filterDefinitionApi;

