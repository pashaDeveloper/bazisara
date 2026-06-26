import { bazisaraApi } from "./bazisara";

export const gameKeywordApi = bazisaraApi.injectEndpoints({
  endpoints: (builder) => ({
    createGameKeyword: builder.mutation({
      query: (formData) => ({
        url: "/game-keywords/create",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["GameKeyword"],
    }),
    getGameKeywords: builder.query({
      query: ({ page = 1, limit = 10, search = "" } = {}) => ({
        url: "/game-keywords/all",
        method: "GET",
        params: { page, limit, ...(search ? { search } : {}) },
      }),
      providesTags: ["GameKeyword"],
    }),
    getGameKeyword: builder.query({
      query: (id) => ({
        url: `/game-keywords/${id}`,
        method: "GET",
      }),
      providesTags: ["GameKeyword"],
    }),
    updateGameKeyword: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/game-keywords/${id}`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["GameKeyword", "Game"],
    }),
    deleteGameKeyword: builder.mutation({
      query: (id) => ({
        url: `/game-keywords/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["GameKeyword", "Game"],
    }),
  }),
});

export const {
  useCreateGameKeywordMutation,
  useDeleteGameKeywordMutation,
  useGetGameKeywordQuery,
  useGetGameKeywordsQuery,
  useUpdateGameKeywordMutation,
} = gameKeywordApi;
