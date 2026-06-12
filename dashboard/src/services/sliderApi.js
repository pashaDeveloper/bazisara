import { bazisaraApi } from "./bazisara";

export const sliderApi = bazisaraApi.injectEndpoints({
  endpoints: (builder) => ({
    createSlider: builder.mutation({
      query: (formData) => ({
        url: "/sliders/create",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Slider"],
    }),
    getSliders: builder.query({
      query: ({ page = 1, limit = 10, search = "" } = {}) => ({
        url: "/sliders/all",
        method: "GET",
        params: { page, limit, ...(search ? { search } : {}) },
      }),
      providesTags: ["Slider"],
    }),
    getSlider: builder.query({
      query: (id) => ({
        url: `/sliders/${id}`,
        method: "GET",
      }),
      providesTags: ["Slider"],
    }),
    updateSlider: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/sliders/${id}`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["Slider"],
    }),
    updateSliderStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/sliders/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Slider"],
    }),
    reorderSliders: builder.mutation({
      query: (sliders) => ({
        url: "/sliders/reorder",
        method: "PATCH",
        body: { sliders },
      }),
      invalidatesTags: ["Slider"],
    }),
    deleteSlider: builder.mutation({
      query: (id) => ({
        url: `/sliders/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Slider"],
    }),
  }),
});

export const {
  useCreateSliderMutation,
  useDeleteSliderMutation,
  useGetSliderQuery,
  useGetSlidersQuery,
  useReorderSlidersMutation,
  useUpdateSliderStatusMutation,
  useUpdateSliderMutation,
} = sliderApi;

