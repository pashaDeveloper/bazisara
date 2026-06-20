import { bazisaraApi } from "./bazisara";

export const gameCollectionApi = bazisaraApi.injectEndpoints({
  endpoints: (builder) => ({
    createGameCollection: builder.mutation({
      query: (body) => ({ url: "/game-collections/create", method: "POST", body }),
      invalidatesTags: ["Game", "GameCollection"],
    }),
    getGameCollections: builder.query({
      query: ({ page = 1, limit = 10, search = "" } = {}) => ({
        url: "/game-collections/all",
        method: "GET",
        params: { page, limit, ...(search ? { search } : {}) },
      }),
      providesTags: ["GameCollection"],
    }),
    getGameCollection: builder.query({
      query: (id) => ({ url: `/game-collections/${id}`, method: "GET" }),
      providesTags: ["GameCollection"],
    }),
    updateGameCollection: builder.mutation({
      query: ({ id, body }) => ({ url: `/game-collections/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Game", "GameCollection"],
    }),
    updateGameCollectionVisibility: builder.mutation({
      query: ({ id, visibility }) => ({
        url: `/game-collections/${id}/visibility`,
        method: "PATCH",
        body: { visibility },
      }),
      invalidatesTags: ["GameCollection"],
    }),
    reorderGameCollections: builder.mutation({
      query: (collections) => ({
        url: "/game-collections/reorder",
        method: "PATCH",
        body: { collections },
      }),
      invalidatesTags: ["GameCollection"],
    }),
    deleteGameCollection: builder.mutation({
      query: (id) => ({ url: `/game-collections/${id}`, method: "DELETE" }),
      invalidatesTags: ["Game", "GameCollection"],
    }),
  }),
});

export const {
  useCreateGameCollectionMutation,
  useDeleteGameCollectionMutation,
  useGetGameCollectionQuery,
  useGetGameCollectionsQuery,
  useReorderGameCollectionsMutation,
  useUpdateGameCollectionVisibilityMutation,
  useUpdateGameCollectionMutation,
} = gameCollectionApi;
