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
  useDeleteGenreMutation,
  useGetGenresQuery,
} from "../services/genreApi";

function Genres() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const genresPagination = usePaginationState(5, debouncedSearch);
  const { data: genresData, isLoading } = useGetGenresQuery({
    limit: genresPagination.pageSize,
    page: genresPagination.currentPage,
    search: debouncedSearch,
  });
  const [deleteGenre, { isLoading: isDeleting }] = useDeleteGenreMutation();

  const genres = genresData?.data || [];
  const genresMeta = genresData?.pagination;

  const handleDelete = async (id) => {
    if (!window.confirm("این ژانر حذف شود؟")) return;

    try {
      const response = await deleteGenre(id).unwrap();
      toast.success(response.description || "ژانر حذف شد");
    } catch (error) {
      toast.error(error?.data?.description || "حذف ژانر انجام نشد");
    }
  };

  return (
    <ControlPanel>
      <section className="space-y-6">
        <div className="rounded-2xl border border-zinc-700 bg-black/80 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs text-zinc-400">مدیریت ویژگی‌های بازی</p>
              <h1 className="mt-1 text-2xl font-bold text-white">ژانرها</h1>
              <p className="mt-2 max-w-2xl text-sm text-zinc-500">
                ژانرها مستقل از دسته‌بندی ذخیره می‌شوند و برای نمایش می‌توانند تصویر و آیکون SVG داشته باشند.
              </p>
            </div>
            <AddButton link="/genres/create" />
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-700 bg-zinc-950 p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">لیست ژانرها</h2>
              <span className="mt-1 block text-xs text-zinc-500">{genresMeta?.totalItems || genres.length} مورد</span>
            </div>
            <SearchBox onChange={setSearch} placeholder="جستجوی نام یا توضیح ژانر..." value={search} />
          </div>
          <div className="mt-4 overflow-hidden">
            <table className="w-full table-fixed text-right text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="w-[40%] pb-3 font-medium sm:w-[32%]">نام</th>
                  <th className="w-[24%] pb-3 font-medium">آیکون</th>
                  <th className="hidden pb-3 font-medium lg:table-cell">توضیح</th>
                  <th className="hidden w-24 pb-3 font-medium sm:table-cell">تصویر</th>
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
                ) : genres.length ? (
                  genres.map((item) => (
                    <tr key={item._id} className="border-b border-zinc-900 text-zinc-200">
                      <td className="py-4 pl-3">
                        <span className="block truncate">{item.name}</span>
                      </td>
                      <td className="py-4">
                        <IconPreview icon={item.icon} label={item.name} />
                      </td>
                      <td className="hidden py-4 pl-3 text-zinc-400 lg:table-cell">
                        <span className="block truncate">{item.description || "-"}</span>
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
                            aria-label="ویرایش ژانر"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 text-zinc-300 transition hover:border-white hover:text-white"
                            to={`/genres/edit/${item._id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            aria-label="حذف ژانر"
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
                      هنوز ژانری ثبت نشده است.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={genresPagination.currentPage}
            onPageChange={genresPagination.setCurrentPage}
            onPageSizeChange={genresPagination.setPageSize}
            pageSize={genresPagination.pageSize}
            totalItems={genresMeta?.totalItems || genres.length}
            totalPages={genresMeta?.totalPages}
          />
        </div>
      </section>
    </ControlPanel>
  );
}

export default Genres;

