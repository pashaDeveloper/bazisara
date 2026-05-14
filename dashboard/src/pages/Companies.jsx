import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import ControlPanel from "./ControlPanel";
import AddButton from "@/components/shared/button/AddButton";
import DisplayImages from "@/components/shared/DisplayImages";
import IconPreview from "@/components/shared/IconPreview";
import Pagination, { usePaginationState } from "@/components/shared/Pagination";
import SearchBox, { useDebouncedValue } from "@/components/shared/SearchBox";
import Edit from "@/components/icons/Edit";
import Trash from "@/components/icons/Trash";
import {
  useDeleteCompanyMutation,
  useGetCompaniesQuery,
} from "../services/companyApi";

const companyTypeLabels = {
  developer: "سازنده",
  publisher: "ناشر",
  developer_publisher: "سازنده و ناشر",
};

function Companies() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const companiesPagination = usePaginationState(10, debouncedSearch);
  const { data: companiesData, isLoading } = useGetCompaniesQuery({
    limit: companiesPagination.pageSize,
    page: companiesPagination.currentPage,
    search: debouncedSearch,
  });
  const [deleteCompany, { isLoading: isDeleting }] = useDeleteCompanyMutation();

  const companies = companiesData?.data || [];
  const companiesMeta = companiesData?.pagination;

  const handleDelete = async (id) => {
    if (!window.confirm("این کمپانی حذف شود؟")) return;

    try {
      const response = await deleteCompany(id).unwrap();
      toast.success(response.description || "کمپانی حذف شد");
    } catch (error) {
      toast.error(error?.data?.description || "حذف کمپانی انجام نشد");
    }
  };

  return (
    <ControlPanel>
      <section className="space-y-6">
        <div className="rounded-2xl border border-zinc-700 bg-black/80 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs text-zinc-400">مدیریت ناشرها و سازنده‌ها</p>
              <h1 className="mt-1 text-2xl font-bold text-white">کمپانی‌ها</h1>
              <p className="mt-2 max-w-2xl text-sm text-zinc-500">
                اطلاعات کمپانی شامل آیکون ذخیره‌شده، لوگو، وب‌سایت، کشور، سال تأسیس و نقش در تولید یا انتشار بازی ثبت می‌شود.
              </p>
            </div>
            <AddButton link="/companies/create" />
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-700 bg-zinc-950 p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">لیست کمپانی‌ها</h2>
              <span className="mt-1 block text-xs text-zinc-500">{companiesMeta?.totalItems || companies.length} مورد</span>
            </div>
            <SearchBox onChange={setSearch} placeholder="جستجوی نام، کشور یا وب‌سایت..." value={search} />
          </div>
          <div className="mt-4 overflow-hidden">
            <table className="w-full table-fixed text-right text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="w-[30%] pb-3 font-medium">نام</th>
                  <th className="hidden w-[18%] pb-3 font-medium md:table-cell">نوع</th>
                  <th className="hidden w-[16%] pb-3 font-medium lg:table-cell">کشور</th>
                  <th className="hidden w-24 pb-3 font-medium sm:table-cell">آیکون</th>
                  <th className="hidden w-24 pb-3 font-medium xl:table-cell">لوگو</th>
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
                ) : companies.length ? (
                  companies.map((item) => (
                    <tr key={item._id} className="border-b border-zinc-900 text-zinc-200">
                      <td className="py-4 pl-3">
                        <span className="block truncate">{item.name}</span>
                        <span className="mt-1 block truncate text-xs text-zinc-500">{item.website || "-"}</span>
                      </td>
                      <td className="hidden py-4 text-zinc-400 md:table-cell">{companyTypeLabels[item.type] || "-"}</td>
                      <td className="hidden py-4 text-zinc-400 lg:table-cell">{item.country || "-"}</td>
                      <td className="hidden py-4 sm:table-cell">
                        <IconPreview icon={item.icon} label={item.name} />
                      </td>
                      <td className="hidden py-4 xl:table-cell">
                        {item.logo?.url ? (
                          <DisplayImages
                            galleryPreview={[{ url: item.logo.url, type: "image" }]}
                            imageSize={56}
                            className="mt-0"
                          />
                        ) : (
                          <span className="text-zinc-500">ندارد</span>
                        )}
                      </td>
                      <td className="py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            aria-label="ویرایش کمپانی"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 text-zinc-300 transition hover:border-white hover:text-white"
                            to={`/companies/edit/${item._id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            aria-label="حذف کمپانی"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-900/70 text-red-300 transition hover:border-red-400 hover:text-red-200"
                            disabled={isDeleting}
                            onClick={() => handleDelete(item._id)}
                            type="button"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-6 text-center text-zinc-500" colSpan="6">
                      هنوز کمپانی ثبت نشده است.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={companiesPagination.currentPage}
            onPageChange={companiesPagination.setCurrentPage}
            onPageSizeChange={companiesPagination.setPageSize}
            pageSize={companiesPagination.pageSize}
            totalItems={companiesMeta?.totalItems || companies.length}
            totalPages={companiesMeta?.totalPages}
          />
        </div>
      </section>
    </ControlPanel>
  );
}

export default Companies;
