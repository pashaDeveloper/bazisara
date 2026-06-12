import { bazisaraApi } from "./bazisara";

export const articleApi = bazisaraApi.injectEndpoints({
  endpoints: (builder) => ({
    createArticle: builder.mutation({
      query: (formData) => ({
        url: "/articles/create",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Article"],
    }),
    getArticles: builder.query({
      query: ({ page = 1, limit = 10, search = "" } = {}) => ({
        url: "/articles/all",
        method: "GET",
        params: { page, limit, ...(search ? { search } : {}) },
      }),
      providesTags: ["Article"],
    }),
    getArticle: builder.query({
      query: (id) => ({
        url: `/articles/${id}`,
        method: "GET",
      }),
      providesTags: ["Article"],
    }),
    generateArticleSlug: builder.mutation({
      query: (title) => ({
        url: "/articles/slug",
        method: "POST",
        body: { title },
      }),
    }),
    updateArticle: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/articles/${id}`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["Article"],
    }),
    deleteArticle: builder.mutation({
      query: (id) => ({
        url: `/articles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Article"],
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

