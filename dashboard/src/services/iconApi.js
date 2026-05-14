import { bazisaraApi } from "./bazisara";

export const iconApi = bazisaraApi.injectEndpoints({
  endpoints: (builder) => ({
    createIcon: builder.mutation({
      query: (body) => ({
        url: "/icons/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Icon"],
    }),
    getIcons: builder.query({
      query: ({ page = 1, limit = 10, search = "" } = {}) => ({
        url: "/icons/all",
        method: "GET",
        params: { page, limit, ...(search ? { search } : {}) },
      }),
      providesTags: ["Icon"],
    }),
    updateIcon: builder.mutation({
      query: ({ id, body }) => ({
        url: `/icons/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Icon"],
    }),
    deleteIcon: builder.mutation({
      query: (id) => ({
        url: `/icons/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Icon"],
    }),
  }),
});

export const {
  useCreateIconMutation,
  useGetIconsQuery,
  useUpdateIconMutation,
  useDeleteIconMutation,
} = iconApi;
