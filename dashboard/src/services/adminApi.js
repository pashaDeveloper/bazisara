import { bazisaraApi } from "./bazisara";

export const adminApi = bazisaraApi.injectEndpoints({
  endpoints: (builder) => ({
    getApprovals: builder.query({
      query: () => ({
        url: "/admin/approvals",
        method: "GET",
      }),
      providesTags: ["Approval"],
    }),
    approveApproval: builder.mutation({
      query: ({ type, id }) => ({
        url: `/admin/approvals/${type}/${id}/approve`,
        method: "PATCH",
      }),
      invalidatesTags: ["Approval", "Game", "Article", "Slider", "Admin"],
    }),
    rejectApproval: builder.mutation({
      query: ({ type, id, reason }) => ({
        url: `/admin/approvals/${type}/${id}/reject`,
        method: "PATCH",
        body: { reason },
      }),
      invalidatesTags: ["Approval", "ApprovalMessage", "Game", "Article", "Slider", "Admin"],
    }),
    getApprovalMessages: builder.query({
      query: () => ({
        url: "/admin/approval-messages",
        method: "GET",
      }),
      providesTags: ["ApprovalMessage"],
    }),
    getAdmins: builder.query({
      query: (params = {}) => ({
        url: "/admin/all-admins",
        method: "GET",
        params,
      }),
      providesTags: ["Admin"],
    }),
    getAdmin: builder.query({
      query: (id) => ({
        url: `/admin/get-admin/${id}`,
        method: "GET",
      }),
      providesTags: ["Admin"],
    }),
    updateAdmin: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/admin/update-admin/${id}`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["Admin"],
    }),
    deleteAdmin: builder.mutation({
      query: (id) => ({
        url: `/admin/delete-admin/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Admin"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetApprovalsQuery,
  useGetApprovalMessagesQuery,
  useApproveApprovalMutation,
  useRejectApprovalMutation,
  useGetAdminsQuery,
  useGetAdminQuery,
  useUpdateAdminMutation,
  useDeleteAdminMutation,
} = adminApi;

