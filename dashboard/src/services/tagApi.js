import { bazisaraApi } from "./bazisara";

export const tagApi = bazisaraApi.injectEndpoints({
  endpoints: (builder) => ({
    createTag: builder.mutation({
      query: (formData) => ({
        url: "/tags/create",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Tag"],
    }),
    getTags: builder.query({
      query: ({ page = 1, limit = 10, search = "" } = {}) => ({
        url: "/tags/all",
        method: "GET",
        params: { page, limit, ...(search ? { search } : {}) },
      }),
      providesTags: ["Tag"],
    }),
    getTag: builder.query({
      query: (id) => ({
        url: `/tags/${id}`,
        method: "GET",
      }),
      providesTags: ["Tag"],
    }),
    updateTag: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/tags/${id}`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["Tag"],
    }),
    deleteTag: builder.mutation({
      query: (id) => ({
        url: `/tags/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Tag"],
    }),
  }),
});

export const {
  useCreateTagMutation,
  useGetTagsQuery,
  useGetTagQuery,
  useUpdateTagMutation,
  useDeleteTagMutation,
} = tagApi;
