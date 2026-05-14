import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import ControlPanel from "../ControlPanel";
import AddButton from "@/components/shared/button/AddButton";
import DisplayImages from "@/components/shared/DisplayImages";
import Pagination, { usePaginationState } from "@/components/shared/Pagination";
import SearchBox, { useDebouncedValue } from "@/components/shared/SearchBox";
import Edit from "@/components/icons/Edit";
import Trash from "@/components/icons/Trash";
import { useDeleteGameMutation, useGetGamesQuery } from "../../services/gameApi";

function Games() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const gamesPagination = usePaginationState(10, debouncedSearch);
  const { data: gamesData, isLoading } = useGetGamesQuery({
    limit: gamesPagination.pageSize,
    page: gamesPagination.currentPage,
    search: debouncedSearch,
  });
  const [deleteGame, { isLoading: isDeleting }] = useDeleteGameMutation();

  const games = gamesData?.data || [];
  const gamesMeta = gamesData?.pagination;

  const handleDelete = async (id) => {
    if (!window.confirm("این بازی حذف شود؟")) return;

    try {
      const response = await deleteGame(id).unwrap();
      toast.success(response.description || "بازی حذف شد");
    } catch (error) {
      toast.error(error?.data?.description || "حذف بازی انجام نشد");
    }
  };

  return (
    <ControlPanel>
      <section className="space-y-6">
        <div className="rounded-2xl border border-zinc-700 bg-black/80 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs text-zinc-400">مدیریت معرفی بازی‌ها</p>
              <h1 className="mt-1 text-2xl font-bold text-white">بازی‌ها</h1>
              <p className="mt-2 max-w-2xl text-sm text-zinc-500">
                پروفایل معرفی بازی شامل دسته‌بندی، ژانر، سازنده، ناشر، پلتفرم، رسانه و سئو است.
              </p>
            </div>
            <AddButton link="/games/create" />
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-700 bg-zinc-950 p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">لیست بازی‌ها</h2>
              <span className="mt-1 block text-xs text-zinc-500">{gamesMeta?.totalItems || games.length} مورد</span>
            </div>
            <SearchBox onChange={setSearch} placeholder="جستجوی عنوان، اسلاگ یا توضیحات..." value={search} />
          </div>
          <div className="mt-4 overflow-hidden">
            <table className="w-full table-fixed text-right text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="w-[34%] pb-3 font-medium">بازی</th>
                  <th className="hidden pb-3 font-medium md:table-cell">دسته / ژانر</th>
                  <th className="hidden w-36 pb-3 font-medium lg:table-cell">انتشار</th>
                  <th className="hidden w-28 pb-3 font-medium xl:table-cell">امتیاز</th>
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
                ) : games.length ? (
                  games.map((item) => (
                    <tr key={item._id} className="border-b border-zinc-900 text-zinc-200">
                      <td className="py-4 pl-3">
                        <div className="flex min-w-0 items-center gap-3">
                          {item.cover?.url ? (
                            <DisplayImages
                              galleryPreview={[{ url: item.cover.url, type: item.cover.type || "image" }]}
                              imageSize={56}
                              className="mt-0"
                            />
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
                          {(item.genres || []).map((genre) => genre.name).join("، ") || "-"}
                        </span>
                      </td>
                      <td className="hidden py-4 text-zinc-400 lg:table-cell">
                        {item.releaseDate ? new Date(item.releaseDate).toLocaleDateString("fa-IR") : "-"}
                      </td>
                      <td className="hidden py-4 text-zinc-400 xl:table-cell">
                        {item.metacriticScore ?? "-"}
                      </td>
                      <td className="py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            aria-label="ویرایش بازی"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 text-zinc-300 transition hover:border-white hover:text-white"
                            to={`/games/edit/${item._id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            aria-label="حذف بازی"
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
                    <td className="py-6 text-center text-zinc-500" colSpan="5">
                      هنوز بازی ثبت نشده است.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={gamesPagination.currentPage}
            onPageChange={gamesPagination.setCurrentPage}
            onPageSizeChange={gamesPagination.setPageSize}
            pageSize={gamesPagination.pageSize}
            totalItems={gamesMeta?.totalItems || games.length}
            totalPages={gamesMeta?.totalPages}
          />
        </div>
      </section>
    </ControlPanel>
  );
}

export default Games;
