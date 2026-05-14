import { bazisaraApi } from "../bazisara";

export const paymentApi = bazisaraApi.injectEndpoints({
  endpoints: (builder) => ({
    getPaymentStatistics: builder.query({
      query: () => ({ url: "/payments/statistics", method: "GET" }),
    }),
    getPaymentDetails: builder.query({
      query: (paymentId) => ({ url: `/payments/${paymentId}`, method: "GET" }),
    }),
    getSalesCountByProduct: builder.query({
      query: () => ({ url: "/payments/sales-count-by-product", method: "GET" }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPaymentStatisticsQuery,
  useGetPaymentDetailsQuery,
  useGetSalesCountByProductQuery,
} = paymentApi;
