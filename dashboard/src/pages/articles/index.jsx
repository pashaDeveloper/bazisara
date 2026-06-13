import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import ControlPanel from "../ControlPanel";
import AddButton from "@/components/shared/button/AddButton";
import DeleteModal from "@/components/shared/DeleteModal";
import DisplayImages from "@/components/shared/DisplayImages";
import Pagination, { usePaginationState } from "@/components/shared/Pagination";
import SearchBox, { useDebouncedValue } from "@/components/shared/SearchBox";
import Edit from "@/components/icons/Edit";
import { useDeleteArticleMutation, useGetArticlesQuery } from "@/services/articleApi";

const statusLabels = {
  active: "فعال",
  inactive: "غیرفعال",
  pending: "در انتظار تایید",
};

function Articles() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const articlesPagination = usePaginationState(5, debouncedSearch);
  const { data: articlesData, isLoading } = useGetArticlesQuery({
    limit: articlesPagination.pageSize,
    page: articlesPagination.currentPage,
    search: debouncedSearch,
  });
  const [deleteArticle, { isLoading: isDeleting }] = useDeleteArticleMutation();

  const articles = articlesData?.data || [];
  const articlesMeta = articlesData?.pagination;

  const handleDelete = async (id) => {
    try {
      const response = await deleteArticle(id).unwrap();
      toast.success(response.description || "مطلب حذف شد");
    } catch (error) {
      toast.error(error?.data?.description || "حذف مطلب انجام نشد");
    }
  };

  return (
    <ControlPanel>
      <section className="space-y-6">
        <div className="rounded-2xl border border-zinc-700 bg-black/80 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs text-zinc-400">مدیریت مطلب‌نویس</p>
              <h1 className="mt-1 text-2xl font-bold text-white">مطلب‌نویس</h1>
              <p className="mt-2 max-w-2xl text-sm text-zinc-500">
                مقاله‌ها شامل تیتر، کاور، دسته‌بندی، تگ، بازی‌های مرتبط، محتوای صفحه‌ساز و تنظیمات سئو هستند.
              </p>
            </div>
            <AddButton link="/articles/create" />
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-700 bg-zinc-950 p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">لیست مطالب</h2>
              <span className="mt-1 block text-xs text-zinc-500">{articlesMeta?.totalItems || articles.length} مورد</span>
            </div>
            <SearchBox onChange={setSearch} placeholder="جستجوی عنوان، اسلاگ، نویسنده یا متن..." value={search} />
          </div>

          <div className="mt-4 overflow-hidden">
            <table className="w-full table-fixed text-right text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="w-[38%] pb-3 font-medium">مطلب</th>
                  <th className="hidden pb-3 font-medium md:table-cell">دسته / تگ‌ها</th>
                  <th className="hidden w-36 pb-3 font-medium lg:table-cell">انتشار</th>
                  <th className="hidden w-28 pb-3 font-medium xl:table-cell">وضعیت</th>
                  <th className="w-24 pb-3 text-center font-medium">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td className="py-6 text-center text-zinc-500" colSpan="5">
                      در حال دریافت...
                    </td>
                  </tr>
                ) : articles.length ? (
                  articles.map((item) => (
                    <tr key={item._id} className="border-b border-zinc-900 text-zinc-200">
                      <td className="py-4 pl-3">
                        <div className="flex min-w-0 items-center gap-3">
                          {item.cover?.url ? (
                            <DisplayImages galleryPreview={[{ url: item.cover.url, type: "image" }]} imageSize={56} className="mt-0" />
                          ) : null}
                          <div className="min-w-0">
                            <span className="block truncate">{item.title}</span>
                            <span className="mt-1 block truncate text-xs text-zinc-500">{item.slug}</span>
                          </div>
                        </div>
                      </td>
                      <td className="hidden py-4 pl-3 text-zinc-400 md:table-cell">
                        <span className="block truncate">{item.category?.name || "-"}</span>
                        <span className="mt-1 block truncate text-xs text-zinc-500">
                          {(item.tags || []).map((tag) => tag.name).join("، ") || "-"}
                        </span>
                      </td>
                      <td className="hidden py-4 text-zinc-400 lg:table-cell">
                        {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString("fa-IR") : "-"}
                      </td>
                      <td className="hidden py-4 text-zinc-400 xl:table-cell">{statusLabels[item.status] || item.status || "-"}</td>
                      <td className="py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            aria-label="ویرایش مطلب"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 text-zinc-300 transition hover:border-white hover:text-white"
                            to={`/articles/edit/${item._id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <DeleteModal
                            ariaLabel="حذف مطلب"
                            isLoading={isDeleting}
                            itemTitle={item.title}
                            message="این مطلب حذف شود؟"
                            onDelete={() => handleDelete(item._id)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-6 text-center text-zinc-500" colSpan="5">
                      هنوز مطلبی ثبت نشده است.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={articlesPagination.currentPage}
            onPageChange={articlesPagination.setCurrentPage}
            onPageSizeChange={articlesPagination.setPageSize}
            pageSize={articlesPagination.pageSize}
            totalItems={articlesMeta?.totalItems || articles.length}
            totalPages={articlesMeta?.totalPages}
          />
        </div>
      </section>
    </ControlPanel>
  );
}

export default Articles;
