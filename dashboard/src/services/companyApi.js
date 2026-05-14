import { bazisaraApi } from "./bazisara";

export const companyApi = bazisaraApi.injectEndpoints({
  endpoints: (builder) => ({
    createCompany: builder.mutation({
      query: (formData) => ({
        url: "/companies/create",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Company"],
    }),
    getCompanies: builder.query({
      query: ({ page = 1, limit = 10, search = "" } = {}) => ({
        url: "/companies/all",
        method: "GET",
        params: { page, limit, ...(search ? { search } : {}) },
      }),
      providesTags: ["Company"],
    }),
    getCompany: builder.query({
      query: (id) => ({
        url: `/companies/${id}`,
        method: "GET",
      }),
      providesTags: ["Company"],
    }),
    updateCompany: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/companies/${id}`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["Company"],
    }),
    deleteCompany: builder.mutation({
      query: (id) => ({
        url: `/companies/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Company"],
    }),
  }),
});

export const {
  useCreateCompanyMutation,
  useGetCompaniesQuery,
  useGetCompanyQuery,
  useUpdateCompanyMutation,
  useDeleteCompanyMutation,
} = companyApi;
