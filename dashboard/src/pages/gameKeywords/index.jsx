import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import ControlPanel from "../ControlPanel";
import AddButton from "@/components/shared/button/AddButton";
import DeleteModal from "@/components/shared/DeleteModal";
import DisplayImages from "@/components/shared/DisplayImages";
import Edit from "@/components/icons/Edit";
import SearchBox, { useDebouncedValue } from "@/components/shared/SearchBox";
import Pagination, { usePaginationState } from "@/components/shared/Pagination";
import {
  useDeleteGameKeywordMutation,
  useGetGameKeywordsQuery,
} from "@/services/gameKeywordApi";

function GameKeywords() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const pagination = usePaginationState(8, debouncedSearch);
  const { data, isLoading } = useGetGameKeywordsQuery({
    page: pagination.currentPage,
    limit: pagination.pageSize,
    search: debouncedSearch,
  });
  const [deleteKeyword, { isLoading: isDeleting }] = useDeleteGameKeywordMutation();
  const keywords = data?.data || [];
  const meta = data?.pagination;

  const handleDelete = async (id) => {
    try {
      const response = await deleteKeyword(id).unwrap();
      toast.success(response.description || "کلمه کلیدی حذف شد");
    } catch (error) {
      toast.error(error?.data?.description || "حذف کلمه کلیدی انجام نشد");
    }
  };

  return (
    <ControlPanel>
      <section className="space-y-6">
        <div className="rounded-2xl border border-zinc-700 bg-black/80 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs text-zinc-400">ارتباط داخلی بین بازی‌ها</p>
              <h1 className="mt-1 text-2xl font-bold text-white">کلمات کلیدی بازی</h1>
              <p className="mt-2 max-w-2xl text-sm text-zinc-500">
                این کلمات برای ارتباط و پیشنهاد بین بازی‌ها هستند و به سئو وابسته نیستند.
              </p>
            </div>
            <AddButton link="/game-keywords/create" />
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-700 bg-zinc-950 p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">لیست کلمات کلیدی</h2>
              <span className="mt-1 block text-xs text-zinc-500">{meta?.totalItems || keywords.length} مورد</span>
            </div>
            <SearchBox onChange={setSearch} placeholder="جستجوی عنوان، اسلاگ یا توضیح..." value={search} />
          </div>

          <div className="mt-4 overflow-hidden">
            <table className="w-full table-fixed text-right text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="pb-3 font-medium">عنوان</th>
                  <th className="hidden pb-3 font-medium md:table-cell">توضیح</th>
                  <th className="hidden w-24 pb-3 font-medium sm:table-cell">تصویر</th>
                  <th className="w-24 pb-3 text-center font-medium">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td className="py-6 text-center text-zinc-500" colSpan="4">در حال دریافت...</td></tr>
                ) : keywords.length ? (
                  keywords.map((item) => (
                    <tr className="border-b border-zinc-900 text-zinc-200" key={item._id}>
                      <td className="py-4 pl-3">
                        <span className="block truncate">{item.name}</span>
                        <span className="mt-1 block truncate text-xs text-zinc-500" dir="ltr">{item.slug}</span>
                      </td>
                      <td className="hidden py-4 pl-3 text-zinc-400 md:table-cell">
                        <span className="block truncate">{item.description || item.title_en || "-"}</span>
                      </td>
                      <td className="hidden py-4 sm:table-cell">
                        {item.image?.url ? (
                          <DisplayImages galleryPreview={[{ url: item.image.url, type: "image" }]} imageSize={56} className="mt-0" />
                        ) : (
                          <span className="text-zinc-500">ندارد</span>
                        )}
                      </td>
                      <td className="py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 text-zinc-300 transition hover:border-white hover:text-white"
                            to={`/game-keywords/edit/${item._id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <DeleteModal
                            isLoading={isDeleting}
                            itemTitle={item.name}
                            message="این کلمه کلیدی حذف شود؟"
                            onDelete={() => handleDelete(item._id)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td className="py-6 text-center text-zinc-500" colSpan="4">هنوز کلمه کلیدی ثبت نشده است.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={pagination.currentPage}
            onPageChange={pagination.setCurrentPage}
            onPageSizeChange={pagination.setPageSize}
            pageSize={pagination.pageSize}
            totalItems={meta?.totalItems || keywords.length}
            totalPages={meta?.totalPages}
          />
        </div>
      </section>
    </ControlPanel>
  );
}

export default GameKeywords;
