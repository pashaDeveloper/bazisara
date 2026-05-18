import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import ControlPanel from "./ControlPanel";
import AddButton from "@/components/shared/button/AddButton";
import DisplayImages from "@/components/shared/DisplayImages";
import Pagination, { usePaginationState } from "@/components/shared/Pagination";
import SearchBox, { useDebouncedValue } from "@/components/shared/SearchBox";
import Edit from "@/components/icons/Edit";
import Trash from "@/components/icons/Trash";
import { useDeleteTagMutation, useGetTagsQuery } from "../services/tagApi";

function Tags() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const tagsPagination = usePaginationState(10, debouncedSearch);
  const { data: tagsData, isLoading } = useGetTagsQuery({
    limit: tagsPagination.pageSize,
    page: tagsPagination.currentPage,
    search: debouncedSearch,
  });
  const [deleteTag, { isLoading: isDeleting }] = useDeleteTagMutation();

  const tags = tagsData?.data || [];
  const tagsMeta = tagsData?.pagination;

  const handleDelete = async (id) => {
    if (!window.confirm("این تگ حذف شود؟")) return;

    try {
      const response = await deleteTag(id).unwrap();
      toast.success(response.description || "تگ حذف شد");
    } catch (error) {
      toast.error(error?.data?.description || "حذف تگ انجام نشد");
    }
  };

  const formatKeywords = (keywords) => {
    if (Array.isArray(keywords) && keywords.length) return keywords.join("، ");
    return "-";
  };

  return (
    <ControlPanel>
      <section className="space-y-6">
        <div className="rounded-2xl border border-zinc-700 bg-black/80 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs text-zinc-400">مدیریت صفحات سئویی بازی‌ها</p>
              <h1 className="mt-1 text-2xl font-bold text-white">تگ‌ها</h1>
              <p className="mt-2 max-w-2xl text-sm text-zinc-500">
                تگ‌ها برای ساخت صفحه‌های سئو، گروه‌بندی محتوایی و اتصال به بازی‌ها استفاده می‌شوند.
                برای هر تگ می‌توانید اسلاگ، تصویر، توضیح و اطلاعات متا ثبت کنید.
              </p>
            </div>
            <AddButton link="/tags/create" />
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-700 bg-zinc-950 p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">لیست تگ‌ها</h2>
              <span className="mt-1 block text-xs text-zinc-500">
                {tagsMeta?.totalItems || tags.length} مورد
              </span>
            </div>
            <SearchBox
              onChange={setSearch}
              placeholder="جستجوی نام، اسلاگ یا کلمات کلیدی..."
              value={search}
            />
          </div>

          <div className="mt-4 overflow-hidden">
            <table className="w-full table-fixed text-right text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="w-[30%] pb-3 font-medium">نام و اسلاگ</th>
                  <th className="hidden pb-3 font-medium md:table-cell">سئو</th>
                  <th className="hidden w-28 pb-3 font-medium sm:table-cell">تصویر</th>
                  <th className="w-24 pb-3 text-center font-medium">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td className="py-6 text-center text-zinc-500" colSpan="4">
                      در حال دریافت...
                    </td>
                  </tr>
                ) : tags.length ? (
                  tags.map((item) => (
                    <tr key={item._id} className="border-b border-zinc-900 text-zinc-200">
                      <td className="py-4 pl-3">
                        <span className="block truncate">{item.name}</span>
                        <span className="mt-1 block truncate text-xs text-zinc-500" dir="ltr">
                          {item.slug}
                        </span>
                      </td>
                      <td className="hidden py-4 pl-3 text-zinc-400 md:table-cell">
                        <span className="block truncate">{item.seoTitle || "-"}</span>
                        <span className="mt-1 block truncate text-xs text-zinc-500">
                          {formatKeywords(item.seoKeywords)}
                        </span>
                      </td>
                      <td className="hidden py-4 sm:table-cell">
                        {item.image?.url ? (
                          <DisplayImages
                            galleryPreview={[{ url: item.image.url, type: "image" }]}
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
                            aria-label="ویرایش تگ"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 text-zinc-300 transition hover:border-white hover:text-white"
                            to={`/tags/edit/${item._id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            aria-label="حذف تگ"
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
                    <td className="py-6 text-center text-zinc-500" colSpan="4">
                      هنوز تگی ثبت نشده است.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={tagsPagination.currentPage}
            onPageChange={tagsPagination.setCurrentPage}
            onPageSizeChange={tagsPagination.setPageSize}
            pageSize={tagsPagination.pageSize}
            totalItems={tagsMeta?.totalItems || tags.length}
            totalPages={tagsMeta?.totalPages}
          />
        </div>
      </section>
    </ControlPanel>
  );
}

export default Tags;
