import { bazisaraApi } from "./bazisara";

export const genreApi = bazisaraApi.injectEndpoints({
  endpoints: (builder) => ({
    createGenre: builder.mutation({
      query: (formData) => ({
        url: "/genres/create",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Genre"],
    }),
    getGenres: builder.query({
      query: ({ page = 1, limit = 10, search = "" } = {}) => ({
        url: "/genres/all",
        method: "GET",
        params: { page, limit, ...(search ? { search } : {}) },
      }),
      providesTags: ["Genre"],
    }),
    getGenre: builder.query({
      query: (id) => ({
        url: `/genres/${id}`,
        method: "GET",
      }),
      providesTags: ["Genre"],
    }),
    updateGenre: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/genres/${id}`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["Genre"],
    }),
    deleteGenre: builder.mutation({
      query: (id) => ({
        url: `/genres/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Genre"],
    }),
  }),
});

export const {
  useCreateGenreMutation,
  useGetGenresQuery,
  useGetGenreQuery,
  useUpdateGenreMutation,
  useDeleteGenreMutation,
} = genreApi;
