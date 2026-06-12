import { bazisaraApi } from "./bazisara";

export const analyticsApi = bazisaraApi.injectEndpoints({
  endpoints: (builder) => ({
    getAnalyticsSummary: builder.query({
      query: () => ({
        url: "/analytics/summary",
        method: "GET",
      }),
      providesTags: ["Analytics"],
    }),
  }),
});

export const { useGetAnalyticsSummaryQuery } = analyticsApi;

