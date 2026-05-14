import { bazisaraApi } from "../bazisara";

export const uploadApi = bazisaraApi.injectEndpoints({
  endpoints: (builder) => ({
    upload: builder.mutation({
      query: (formData) => ({
        url: "/uploads/create",
        method: "POST",
        body: formData,
      }),
    }),
    deleteUpload: builder.mutation({
      query: (body) => ({
        url: "/uploads/delete",
        method: "DELETE",
        body,
      }),
    }),
  }),
});

export const { useUploadMutation, useDeleteUploadMutation } = uploadApi;
