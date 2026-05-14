import { bazisaraApi } from "./bazisara";

export const gameApi = bazisaraApi.injectEndpoints({
  endpoints: (builder) => ({
    createGame: builder.mutation({
      query: (formData) => ({
        url: "/games/create",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Game"],
    }),
    getGames: builder.query({
      query: ({ page = 1, limit = 10, search = "" } = {}) => ({
        url: "/games/all",
        method: "GET",
        params: { page, limit, ...(search ? { search } : {}) },
      }),
      providesTags: ["Game"],
    }),
    getGame: builder.query({
      query: (id) => ({
        url: `/games/${id}`,
        method: "GET",
      }),
      providesTags: ["Game"],
    }),
    updateGame: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/games/${id}`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["Game"],
    }),
    deleteGame: builder.mutation({
      query: (id) => ({
        url: `/games/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Game"],
    }),
  }),
});

export const {
  useCreateGameMutation,
  useGetGamesQuery,
  useGetGameQuery,
  useUpdateGameMutation,
  useDeleteGameMutation,
} = gameApi;
