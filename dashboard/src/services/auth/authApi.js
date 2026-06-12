import { bazisaraApi } from "../bazisara";

export const authApi = bazisaraApi.injectEndpoints({
  endpoints: (builder) => ({
    signInAdmin: builder.mutation({
      query: (body) => ({
        url: "/admin/sign-in",
        method: "POST",
        body,
      }),
    }),
    signUpAdmin: builder.mutation({
      query: (body) => ({
        url: "/admin/sign-up",
        method: "POST",
        body,
      }),
    }),
    persistLogin: builder.query({
      query: () => ({ url: "/admin/me", method: "GET" }),
      providesTags: ["Admin"],
    }),
    updateAdminProfile: builder.mutation({
      query: (body) => ({
        url: "/admin/profile",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Admin"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useSignInAdminMutation,
  useSignUpAdminMutation,
  usePersistLoginQuery,
  useUpdateAdminProfileMutation,
} = authApi;

