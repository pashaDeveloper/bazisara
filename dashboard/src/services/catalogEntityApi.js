import { bazisaraApi } from "./bazisara";

const endpoints = {
  warrantyCompanies: "/warranty-companies",
  warranties: "/warranties",
  insuranceCompanies: "/insurance-companies",
  insurances: "/insurances",
  prices: "/prices",
  shippingMethods: "/shipping-methods",
};

const tags = {
  warrantyCompanies: "WarrantyCompany",
  warranties: "Warranty",
  insuranceCompanies: "InsuranceCompany",
  insurances: "Insurance",
  prices: "Price",
  shippingMethods: "ShippingMethod",
};

function listQuery(resource) {
  return ({ page = 1, limit = 10, search = "", status = "" } = {}) => ({
    url: `${endpoints[resource]}/all`,
    method: "GET",
    params: {
      page,
      limit,
      ...(search ? { search } : {}),
      ...(status ? { status } : {}),
    },
  });
}

export const catalogEntityApi = bazisaraApi.injectEndpoints({
  endpoints: (builder) => ({
    getWarrantyCompanies: builder.query({
      query: listQuery("warrantyCompanies"),
      providesTags: [tags.warrantyCompanies],
    }),
    getWarrantyCompany: builder.query({
      query: (id) => `${endpoints.warrantyCompanies}/${id}`,
      providesTags: [tags.warrantyCompanies],
    }),
    createWarrantyCompany: builder.mutation({
      query: (formData) => ({ url: `${endpoints.warrantyCompanies}/create`, method: "POST", body: formData }),
      invalidatesTags: [tags.warrantyCompanies],
    }),
    updateWarrantyCompany: builder.mutation({
      query: ({ id, formData }) => ({ url: `${endpoints.warrantyCompanies}/${id}`, method: "PATCH", body: formData }),
      invalidatesTags: [tags.warrantyCompanies],
    }),
    deleteWarrantyCompany: builder.mutation({
      query: (id) => ({ url: `${endpoints.warrantyCompanies}/${id}`, method: "DELETE" }),
      invalidatesTags: [tags.warrantyCompanies],
    }),

    getWarranties: builder.query({
      query: listQuery("warranties"),
      providesTags: [tags.warranties],
    }),
    getWarranty: builder.query({
      query: (id) => `${endpoints.warranties}/${id}`,
      providesTags: [tags.warranties],
    }),
    createWarranty: builder.mutation({
      query: (formData) => ({ url: `${endpoints.warranties}/create`, method: "POST", body: formData }),
      invalidatesTags: [tags.warranties],
    }),
    updateWarranty: builder.mutation({
      query: ({ id, formData }) => ({ url: `${endpoints.warranties}/${id}`, method: "PATCH", body: formData }),
      invalidatesTags: [tags.warranties],
    }),
    deleteWarranty: builder.mutation({
      query: (id) => ({ url: `${endpoints.warranties}/${id}`, method: "DELETE" }),
      invalidatesTags: [tags.warranties],
    }),

    getInsuranceCompanies: builder.query({
      query: listQuery("insuranceCompanies"),
      providesTags: [tags.insuranceCompanies],
    }),
    getInsuranceCompany: builder.query({
      query: (id) => `${endpoints.insuranceCompanies}/${id}`,
      providesTags: [tags.insuranceCompanies],
    }),
    createInsuranceCompany: builder.mutation({
      query: (formData) => ({ url: `${endpoints.insuranceCompanies}/create`, method: "POST", body: formData }),
      invalidatesTags: [tags.insuranceCompanies],
    }),
    updateInsuranceCompany: builder.mutation({
      query: ({ id, formData }) => ({ url: `${endpoints.insuranceCompanies}/${id}`, method: "PATCH", body: formData }),
      invalidatesTags: [tags.insuranceCompanies],
    }),
    deleteInsuranceCompany: builder.mutation({
      query: (id) => ({ url: `${endpoints.insuranceCompanies}/${id}`, method: "DELETE" }),
      invalidatesTags: [tags.insuranceCompanies],
    }),

    getInsurances: builder.query({
      query: listQuery("insurances"),
      providesTags: [tags.insurances],
    }),
    getInsurance: builder.query({
      query: (id) => `${endpoints.insurances}/${id}`,
      providesTags: [tags.insurances],
    }),
    createInsurance: builder.mutation({
      query: (formData) => ({ url: `${endpoints.insurances}/create`, method: "POST", body: formData }),
      invalidatesTags: [tags.insurances],
    }),
    updateInsurance: builder.mutation({
      query: ({ id, formData }) => ({ url: `${endpoints.insurances}/${id}`, method: "PATCH", body: formData }),
      invalidatesTags: [tags.insurances],
    }),
    deleteInsurance: builder.mutation({
      query: (id) => ({ url: `${endpoints.insurances}/${id}`, method: "DELETE" }),
      invalidatesTags: [tags.insurances],
    }),

    getPrices: builder.query({
      query: listQuery("prices"),
      providesTags: [tags.prices],
    }),
    getPrice: builder.query({
      query: (id) => `${endpoints.prices}/${id}`,
      providesTags: [tags.prices],
    }),
    createPrice: builder.mutation({
      query: (formData) => ({ url: `${endpoints.prices}/create`, method: "POST", body: formData }),
      invalidatesTags: [tags.prices],
    }),
    updatePrice: builder.mutation({
      query: ({ id, formData }) => ({ url: `${endpoints.prices}/${id}`, method: "PATCH", body: formData }),
      invalidatesTags: [tags.prices],
    }),
    deletePrice: builder.mutation({
      query: (id) => ({ url: `${endpoints.prices}/${id}`, method: "DELETE" }),
      invalidatesTags: [tags.prices],
    }),

    getShippingMethods: builder.query({
      query: listQuery("shippingMethods"),
      providesTags: [tags.shippingMethods],
    }),
    getShippingMethod: builder.query({
      query: (id) => `${endpoints.shippingMethods}/${id}`,
      providesTags: [tags.shippingMethods],
    }),
    createShippingMethod: builder.mutation({
      query: (formData) => ({ url: `${endpoints.shippingMethods}/create`, method: "POST", body: formData }),
      invalidatesTags: [tags.shippingMethods],
    }),
    updateShippingMethod: builder.mutation({
      query: ({ id, formData }) => ({ url: `${endpoints.shippingMethods}/${id}`, method: "PATCH", body: formData }),
      invalidatesTags: [tags.shippingMethods],
    }),
    deleteShippingMethod: builder.mutation({
      query: (id) => ({ url: `${endpoints.shippingMethods}/${id}`, method: "DELETE" }),
      invalidatesTags: [tags.shippingMethods],
    }),
  }),
});

export const {
  useCreateInsuranceCompanyMutation,
  useCreateInsuranceMutation,
  useCreatePriceMutation,
  useCreateShippingMethodMutation,
  useCreateWarrantyCompanyMutation,
  useCreateWarrantyMutation,
  useDeleteInsuranceCompanyMutation,
  useDeleteInsuranceMutation,
  useDeletePriceMutation,
  useDeleteShippingMethodMutation,
  useDeleteWarrantyCompanyMutation,
  useDeleteWarrantyMutation,
  useGetInsuranceCompaniesQuery,
  useGetInsuranceCompanyQuery,
  useGetInsuranceQuery,
  useGetInsurancesQuery,
  useGetPriceQuery,
  useGetPricesQuery,
  useGetShippingMethodQuery,
  useGetShippingMethodsQuery,
  useGetWarrantiesQuery,
  useGetWarrantyCompaniesQuery,
  useGetWarrantyCompanyQuery,
  useGetWarrantyQuery,
  useUpdateInsuranceCompanyMutation,
  useUpdateInsuranceMutation,
  useUpdatePriceMutation,
  useUpdateShippingMethodMutation,
  useUpdateWarrantyCompanyMutation,
  useUpdateWarrantyMutation,
} = catalogEntityApi;
