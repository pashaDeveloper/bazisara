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
    suggestGames: builder.query({
      query: (input) => {
        const params =
          typeof input === "object" && input !== null
            ? {
                ...(input.q ? { q: input.q } : {}),
                ...(input.titleId ? { titleId: input.titleId } : {}),
              }
            : { q: input };

        return {
        url: "/games/suggestions",
        method: "GET",
          params,
        };
      },
    }),
    suggestPlayStationGallery: builder.query({
      query: (input) => {
        const params =
          typeof input === "object" && input !== null
            ? {
                ...(input.q ? { q: input.q } : {}),
                ...(input.titleId ? { titleId: input.titleId } : {}),
              }
            : { q: input };

        return {
        url: "/games/playstation-gallery",
        method: "GET",
          params,
        };
      },
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
    translateGameSearchTitleSlug: builder.mutation({
      query: (title) => ({
        url: "/games/search-title-slug",
        method: "POST",
        body: { title },
      }),
    }),
    translateGameIntro: builder.mutation({
      query: (body) => ({
        url: "/games/translate-intro",
        method: "POST",
        body,
      }),
    }),
    importGameScores: builder.mutation({
      query: (body) => ({
        url: "/games/import-scores",
        method: "POST",
        body,
      }),
    }),
    importPsxHubDownloads: builder.mutation({
      query: (body) => ({
        url: "/games/import-psxhub-downloads",
        method: "POST",
        body,
      }),
    }),
    fetchXboxAchievements: builder.mutation({
      query: (body) => ({
        url: "/games/xbox-achievements",
        method: "POST",
        body,
      }),
    }),
    fetchPlayStationTrophies: builder.mutation({
      query: (body) => ({
        url: "/games/playstation-trophies",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useCreateGameMutation,
  useFetchPlayStationTrophiesMutation,
  useGetGamesQuery,
  useGetGameQuery,
  useSuggestGamesQuery,
  useSuggestPlayStationGalleryQuery,
  useImportGameScoresMutation,
  useImportPsxHubDownloadsMutation,
  useFetchXboxAchievementsMutation,
  useUpdateGameMutation,
  useDeleteGameMutation,
  useTranslateGameIntroMutation,
  useTranslateGameSearchTitleSlugMutation,
} = gameApi;

