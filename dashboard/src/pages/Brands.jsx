import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import ControlPanel from "./ControlPanel";
import AddButton from "@/components/shared/button/AddButton";
import DeleteModal from "@/components/shared/DeleteModal";
import DisplayImages from "@/components/shared/DisplayImages";
import Pagination, { usePaginationState } from "@/components/shared/Pagination";
import SearchBox, { useDebouncedValue } from "@/components/shared/SearchBox";
import Edit from "@/components/icons/Edit";
import { useDeleteBrandMutation, useGetBrandsQuery } from "@/services/brandApi";

function Brands() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const pagination = usePaginationState(8, debouncedSearch);
  const { data, isLoading } = useGetBrandsQuery({
    page: pagination.currentPage,
    limit: pagination.pageSize,
    search: debouncedSearch,
  });
  const [deleteBrand, { isLoading: isDeleting }] = useDeleteBrandMutation();
  const brands = data?.data || [];
  const meta = data?.pagination;

  const handleDelete = async (id) => {
    try {
      const response = await deleteBrand(id).unwrap();
      toast.success(response.description || "برند حذف شد");
    } catch (error) {
      toast.error(error?.data?.description || "حذف برند انجام نشد");
    }
  };

  return (
    <ControlPanel>
      <section className="space-y-6">
        <div className="rounded-2xl border border-zinc-700 bg-black/80 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs text-zinc-400">مدیریت برندهای فروشگاه</p>
              <h1 className="mt-1 text-2xl font-bold text-white">برندها</h1>
              <p className="mt-2 max-w-2xl text-sm text-zinc-500">
                برندها اینجا ساخته می‌شوند و در فرم محصول فقط از لیست انتخاب می‌شوند.
              </p>
            </div>
            <AddButton link="/brands/create" />
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-700 bg-zinc-950 p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">لیست برندها</h2>
              <span className="mt-1 block text-xs text-zinc-500">{meta?.totalItems || brands.length} مورد</span>
            </div>
            <SearchBox onChange={setSearch} placeholder="جستجوی نام، کشور، وب‌سایت یا توضیح..." value={search} />
          </div>

          <div className="mt-4 overflow-hidden">
            <table className="w-full table-fixed text-right text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="w-[30%] pb-3 font-medium">نام</th>
                  <th className="hidden w-[18%] pb-3 font-medium md:table-cell">کشور</th>
                  <th className="hidden w-[20%] pb-3 font-medium lg:table-cell">وب‌سایت</th>
                  <th className="hidden w-28 pb-3 font-medium lg:table-cell">تأسیس</th>
                  <th className="hidden w-28 pb-3 font-medium xl:table-cell">امتیاز</th>
                  <th className="hidden w-24 pb-3 font-medium sm:table-cell">لوگو</th>
                  <th className="w-24 pb-3 text-center font-medium">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td className="py-6 text-center text-zinc-500" colSpan="7">در حال دریافت...</td>
                  </tr>
                ) : brands.length ? (
                  brands.map((item) => (
                    <tr className="border-b border-zinc-900 text-zinc-200" key={item._id}>
                      <td className="py-4 pl-3">
                        <span className="block truncate">{item.title_fa || item.name}</span>
                        <span className="mt-1 block truncate text-xs text-zinc-500">{item.title_en || "-"}</span>
                      </td>
                      <td className="hidden py-4 text-zinc-400 md:table-cell">{item.country || "-"}</td>
                      <td className="hidden py-4 text-zinc-400 lg:table-cell">
                        {item.website ? (
                          <a className="block truncate transition hover:text-white" href={item.website} rel="noreferrer" target="_blank">
                            {item.website}
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="hidden py-4 text-zinc-400 lg:table-cell">{item.foundedYear || "-"}</td>
                      <td className="hidden py-4 text-amber-300 xl:table-cell">
                        {Number(item.rate || 0).toLocaleString("fa-IR")} ★
                      </td>
                      <td className="hidden py-4 sm:table-cell">
                        {item.logo?.url ? (
                          <DisplayImages galleryPreview={[{ url: item.logo.url, type: "image" }]} imageSize={56} className="mt-0" />
                        ) : (
                          <span className="text-zinc-500">ندارد</span>
                        )}
                      </td>
                      <td className="py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 text-zinc-300 transition hover:border-white hover:text-white" to={`/brands/edit/${item._id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                          <DeleteModal
                            isLoading={isDeleting}
                            itemTitle={item.title_fa || item.name}
                            message="این برند حذف شود؟"
                            onDelete={() => handleDelete(item._id)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-6 text-center text-zinc-500" colSpan="7">هنوز برندی ثبت نشده است.</td>
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
            totalItems={meta?.totalItems || brands.length}
            totalPages={meta?.totalPages}
          />
        </div>
      </section>
    </ControlPanel>
  );
}

export default Brands;
