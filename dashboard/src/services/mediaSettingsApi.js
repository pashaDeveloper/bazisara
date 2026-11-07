import { bazisaraApi } from "./bazisara";

export const mediaSettingsApi = bazisaraApi.injectEndpoints({
  endpoints: (builder) => ({
    getMediaSettings: builder.query({
      query: () => "/media-settings/image-preview",
      providesTags: ["MediaSettings"],
    }),
    updateMediaSettings: builder.mutation({
      query: (body) => ({ url: "/media-settings/image-preview", method: "PATCH", body }),
      invalidatesTags: ["MediaSettings"],
    }),
  }),
});

export const { useGetMediaSettingsQuery, useUpdateMediaSettingsMutation } = mediaSettingsApi;
