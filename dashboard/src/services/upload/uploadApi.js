import { bazisaraApi } from "../bazisara";

export const uploadApi = bazisaraApi.injectEndpoints({
  endpoints: (builder) => ({
    upload: builder.mutation({
      query: (formData) => ({
        url: "/uploads/parspack/create",
        method: "POST",
        body: formData,
      }),
    }),
    deleteUpload: builder.mutation({
      query: (body) => ({
        url: "/uploads/parspack/delete",
        method: "DELETE",
        body,
      }),
    }),
  }),
});

export const { useUploadMutation, useDeleteUploadMutation } = uploadApi;

