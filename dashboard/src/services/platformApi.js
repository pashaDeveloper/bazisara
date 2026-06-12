import { bazisaraApi } from "./bazisara";

export const platformApi = bazisaraApi.injectEndpoints({
  endpoints: (builder) => ({
    createPlatform: builder.mutation({
      query: (body) => ({
        url: "/platforms/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Platform"],
    }),
    getPlatforms: builder.query({
      query: ({ page = 1, limit = 10, search = "", tree = false } = {}) => ({
        url: "/platforms/all",
        method: "GET",
        params: { page, limit, tree, ...(search ? { search } : {}) },
      }),
      providesTags: ["Platform"],
    }),
    getPlatform: builder.query({
      query: (id) => ({
        url: `/platforms/${id}`,
        method: "GET",
      }),
      providesTags: ["Platform"],
    }),
    updatePlatform: builder.mutation({
      query: ({ id, body }) => ({
        url: `/platforms/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Platform"],
    }),
    deletePlatform: builder.mutation({
      query: (id) => ({
        url: `/platforms/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Platform"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreatePlatformMutation,
  useDeletePlatformMutation,
  useGetPlatformQuery,
  useGetPlatformsQuery,
  useUpdatePlatformMutation,
} = platformApi;

