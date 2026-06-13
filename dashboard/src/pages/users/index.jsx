import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import ControlPanel from "../ControlPanel";
import Pagination, { usePaginationState } from "@/components/shared/Pagination";
import SearchBox, { useDebouncedValue } from "@/components/shared/SearchBox";
import StatusSwitch from "@/components/shared/button/StatusSwitch";
import Edit from "@/components/icons/Edit";
import User from "@/components/icons/User";
import {
  useGetAdminsQuery,
  useUpdateAdminMutation,
} from "@/services/adminApi";

const roleLabels = {
  owner: "مدیر کل",
  superAdmin: "مدیر ارشد",
  admin: "مدیر",
  operator: "اپراتور",
  buyer: "خریدار",
};

function Users() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const debouncedSearch = useDebouncedValue(search);
  const pagination = usePaginationState(5, debouncedSearch);
  const { data, isLoading } = useGetAdminsQuery({
    limit: pagination.pageSize,
    page: pagination.currentPage,
    search: debouncedSearch,
    status,
  });
  const [updateAdmin, { isLoading: isUpdating }] = useUpdateAdminMutation();
  const [localAdmins, setLocalAdmins] = useState([]);

  const admins = data?.data?.admins || [];
  const meta = data?.data || {};

  useEffect(() => {
    setLocalAdmins(admins);
  }, [admins]);

  const stats = useMemo(() => {
    const total = admins.length;
    const active = admins.filter((admin) => admin.status === "active").length;
    const inactive = admins.filter((admin) => admin.status === "inactive").length;
    return { total, active, inactive };
  }, [admins]);

  const handleStatusToggle = async (item) => {
    if (item.role === "owner") {
      toast.error("مدیر کل قابل تغییر نیست");
      return;
    }

    const nextStatus = item.status === "active" ? "inactive" : "active";
    try {
      setLocalAdmins((current) =>
        current.map((admin) => (admin._id === item._id ? { ...admin, status: nextStatus } : admin))
      );
      const formData = new FormData();
      formData.append("status", nextStatus);
      const response = await updateAdmin({ id: item._id, formData }).unwrap();
      toast.success(response.description || "وضعیت کاربر به‌روزرسانی شد");
    } catch (error) {
      setLocalAdmins(admins);
      toast.error(error?.data?.description || "تغییر وضعیت کاربر انجام نشد");
    }
  };

  return (
    <ControlPanel>
      <section className="space-y-6">
        <div className="rounded-2xl border border-zinc-700 bg-black/80 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs text-zinc-400">مدیریت کاربران</p>
              <h1 className="mt-1 text-2xl font-bold text-white">لیست کاربران</h1>
              <p className="mt-2 max-w-2xl text-sm text-zinc-500">
                تایید حساب، تعیین نقش و سمت و ویرایش اطلاعات کاربران فقط از همین بخش انجام می‌شود.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-700 bg-zinc-950 p-4">
            <p className="text-xs text-zinc-500">کل کاربران</p>
            <p className="mt-2 text-2xl font-black text-white">{stats.total}</p>
          </div>
          <div className="rounded-2xl border border-zinc-700 bg-zinc-950 p-4">
            <p className="text-xs text-zinc-500">فعال</p>
            <p className="mt-2 text-2xl font-black text-emerald-400">{stats.active}</p>
          </div>
          <div className="rounded-2xl border border-zinc-700 bg-zinc-950 p-4">
            <p className="text-xs text-zinc-500">غیرفعال</p>
            <p className="mt-2 text-2xl font-black text-amber-400">{stats.inactive}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-700 bg-zinc-950 p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">کاربران</h2>
              <span className="mt-1 block text-xs text-zinc-500">{meta.total || localAdmins.length} مورد</span>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <select
                className="h-11 rounded-xl border border-zinc-800 bg-black px-4 text-sm text-white outline-none"
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  pagination.setCurrentPage(1);
                }}
              >
                <option value="all">همه وضعیت‌ها</option>
                <option value="active">فعال</option>
                <option value="inactive">غیرفعال</option>
              </select>
              <SearchBox onChange={setSearch} placeholder="جستجوی نام، ایمیل، تلفن یا سمت..." value={search} />
            </div>
          </div>

          <div className="mt-4 overflow-hidden">
            <table className="w-full table-fixed text-right text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="w-[30%] pb-3 font-medium">کاربر</th>
                  <th className="hidden w-32 pb-3 font-medium md:table-cell">نقش</th>
                  <th className="hidden w-36 pb-3 font-medium lg:table-cell">سمت</th>
                  <th className="hidden w-24 pb-3 font-medium xl:table-cell">سطح</th>
                  <th className="w-40 pb-3 font-medium">تایید</th>
                  <th className="w-24 pb-3 text-center font-medium">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td className="py-6 text-center text-zinc-500" colSpan="6">
                      در حال دریافت...
                    </td>
                  </tr>
                ) : localAdmins.length ? (
                  localAdmins.map((item) => (
                    <tr key={item._id} className="border-b border-zinc-900 text-zinc-200">
                      <td className="py-4 pl-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-zinc-800 bg-zinc-900">
                            {item.avatar?.url ? (
                              <img src={item.avatar.url} alt={item.name} className="h-full w-full object-cover" />
                            ) : (
                              <User className="h-5 w-5 text-zinc-500" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="block truncate font-medium">{item.name || "-"}</span>
                            <span className="mt-1 block truncate text-xs text-zinc-500">{item.email || item.phone || "-"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="hidden py-4 text-zinc-400 md:table-cell">
                        {roleLabels[item.role] || item.role || "-"}
                      </td>
                      <td className="hidden py-4 text-zinc-400 lg:table-cell">{item.position || "-"}</td>
                      <td className="hidden py-4 text-zinc-400 xl:table-cell">
                        <span className="rounded-full bg-zinc-900 px-2 py-1 text-[10px] text-zinc-300">
                          {item.title || "سطح یک"}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <StatusSwitch
                            checked={item.status === "active"}
                            className="!w-auto justify-start gap-0 !border-0 !bg-transparent !px-0 !py-0 hover:!border-transparent hover:!bg-transparent"
                            disabled={isUpdating || item.role === "owner"}
                            id={`admin-status-${item._id}`}
                            name="status"
                            onChange={() => handleStatusToggle(item)}
                          />
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center justify-center gap-2">
                          {item.role === "owner" ? (
                            <span className="text-xs text-zinc-500">قفل</span>
                          ) : (
                            <Link
                              aria-label="ویرایش کاربر"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 text-zinc-300 transition hover:border-white hover:text-white"
                              to={`/users/edit/${item._id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-6 text-center text-zinc-500" colSpan="6">
                      کاربری یافت نشد.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={pagination.currentPage}
            onPageChange={pagination.setCurrentPage}
            onPageSizeChange={pagination.setPageSize}
            pageSize={pagination.pageSize}
            totalItems={meta.total || localAdmins.length}
            totalPages={meta.totalPages}
          />
        </div>
      </section>
    </ControlPanel>
  );
}

export default Users;
