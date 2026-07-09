import { bazisaraApi } from "./bazisara";

export const articleApi = bazisaraApi.injectEndpoints({
  endpoints: (builder) => ({
    createArticle: builder.mutation({
      query: (formData) => ({
        url: "/magazines/create",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Magazine", "Article"],
    }),
    getArticles: builder.query({
      query: ({ page = 1, limit = 10, search = "" } = {}) => ({
        url: "/magazines/all",
        method: "GET",
        params: { page, limit, ...(search ? { search } : {}) },
      }),
      providesTags: ["Magazine"],
    }),
    getArticle: builder.query({
      query: (id) => ({
        url: `/magazines/${id}`,
        method: "GET",
      }),
      providesTags: ["Magazine"],
    }),
    generateArticleSlug: builder.mutation({
      query: (title) => ({
        url: "/magazines/slug",
        method: "POST",
        body: { title },
      }),
    }),
    updateArticle: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/magazines/${id}`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["Magazine", "Article"],
    }),
    deleteArticle: builder.mutation({
      query: (id) => ({
        url: `/magazines/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Magazine", "Article"],
    }),
  }),
});

export const {
  useCreateArticleMutation,
  useDeleteArticleMutation,
  useGenerateArticleSlugMutation,
  useGetArticleQuery,
  useGetArticlesQuery,
  useUpdateArticleMutation,
} = articleApi;

