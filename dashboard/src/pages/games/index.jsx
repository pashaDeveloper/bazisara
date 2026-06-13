import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import ControlPanel from "../ControlPanel";
import AddButton from "@/components/shared/button/AddButton";
import DeleteModal from "@/components/shared/DeleteModal";
import DisplayImages from "@/components/shared/DisplayImages";
import Pagination, { usePaginationState } from "@/components/shared/Pagination";
import SearchBox, { useDebouncedValue } from "@/components/shared/SearchBox";
import StatusSwitch from "@/components/shared/button/StatusSwitch";
import Edit from "@/components/icons/Edit";
import Plus from "@/components/icons/Plus";
import { useDeleteGameMutation, useGetGamesQuery, useUpdateGameMutation } from "../../services/gameApi";

function Games() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const gamesPagination = usePaginationState(5, debouncedSearch);
  const { data: gamesData, isLoading } = useGetGamesQuery({
    limit: gamesPagination.pageSize,
    page: gamesPagination.currentPage,
    search: debouncedSearch,
  });
  const [deleteGame, { isLoading: isDeleting }] = useDeleteGameMutation();
  const [updateGame, { isLoading: isUpdating }] = useUpdateGameMutation();
  const [contextMenu, setContextMenu] = useState(null);
  const [localGames, setLocalGames] = useState([]);

  const games = gamesData?.data || [];
  const gamesMeta = gamesData?.pagination;

  useEffect(() => {
    setLocalGames(games);
  }, [games]);

  useEffect(() => {
    const closeMenu = () => setContextMenu(null);

    window.addEventListener("click", closeMenu);
    window.addEventListener("scroll", closeMenu, true);
    window.addEventListener("resize", closeMenu);

    return () => {
      window.removeEventListener("click", closeMenu);
      window.removeEventListener("scroll", closeMenu, true);
      window.removeEventListener("resize", closeMenu);
    };
  }, []);

  const handleDelete = async (id) => {
    try {
      const response = await deleteGame(id).unwrap();
      toast.success(response.description || "بازی حذف شد");
    } catch (error) {
      toast.error(error?.data?.description || "حذف بازی انجام نشد");
    }
  };

  const handleStatusToggle = async (item) => {
    if (item.status === "pending") {
      toast.error("مورد در انتظار تایید را از بخش تاییدیه‌ها بررسی کنید");
      return;
    }

    const status = item.status === "active" ? "inactive" : "active";
    const formData = new FormData();
    formData.append("status", status);

    try {
      setLocalGames((prev) => prev.map((game) => (game._id === item._id ? { ...game, status } : game)));
      const response = await updateGame({ id: item._id, formData }).unwrap();
      toast.success(response.description || "وضعیت بازی به‌روزرسانی شد");
    } catch (error) {
      setLocalGames(games);
      toast.error(error?.data?.description || "تغییر وضعیت بازی انجام نشد");
    }
  };

  const openContextMenu = (event, item) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({
      item,
      x: event.clientX,
      y: event.clientY,
    });
  };

  const addQuickItem = async (field, label) => {
    const currentItem = contextMenu?.item;
    if (!currentItem) return;

    const rawValue = window.prompt(`نام ${label} را وارد کنید`);
    if (!rawValue || !rawValue.trim()) return;

    const nextValues = [...(Array.isArray(currentItem[field]) ? currentItem[field] : []), rawValue.trim()];
    const formData = new FormData();
    formData.append(field, JSON.stringify(nextValues));

    try {
      await updateGame({ id: currentItem._id, formData }).unwrap();
      toast.success(`${label} اضافه شد`);
      setContextMenu(null);
    } catch (error) {
      toast.error(error?.data?.description || `افزودن ${label} انجام نشد`);
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
                ) : localGames.length ? (
                  localGames.map((item) => (
                    <tr
                      key={item._id}
                      className="cursor-context-menu border-b border-zinc-900 text-zinc-200"
                      onContextMenu={(event) => openContextMenu(event, item)}
                    >
                      <td className="py-4 pl-3">
                        <div className="flex min-w-0 items-center gap-3">
                          {(item.cardDesktopCover?.url || item.cover?.url) ? (
                            <DisplayImages
                              galleryPreview={[{
                                url: item.cardDesktopCover?.url || item.cover.url,
                                type: item.cardDesktopCover?.type || item.cover?.type || "image",
                              }]}
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
                        <div className="flex items-center justify-between gap-2">
                          <span>{item.metacriticScore ?? "-"}</span>
                          <StatusSwitch
                            checked={item.status === "active"}
                            className="!w-auto justify-center gap-0 !border-0 !bg-transparent !px-0 !py-0 hover:!border-transparent hover:!bg-transparent"
                            disabled={isUpdating || item.status === "pending"}
                            id={`game-status-${item._id}`}
                            name="status"
                            onChange={() => handleStatusToggle(item)}
                          />
                        </div>
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
                          <DeleteModal
                            ariaLabel="حذف بازی"
                            isLoading={isDeleting}
                            itemTitle={item.title}
                            message="این بازی حذف شود؟"
                            onDelete={() => handleDelete(item._id)}
                          />
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

      {contextMenu ? (
        <div
          className="fixed z-50 w-56 rounded-xl border border-zinc-800 bg-zinc-950 p-1 shadow-2xl shadow-black/40"
          onClick={(event) => event.stopPropagation()}
          style={{
            left: `${Math.min(contextMenu.x, window.innerWidth - 240)}px`,
            top: `${Math.min(contextMenu.y, window.innerHeight - 170)}px`,
          }}
        >
          <Link
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-200 transition hover:bg-zinc-900 hover:text-white"
            to={`/games/edit/${contextMenu.item._id}`}
          >
            <Edit className="h-4 w-4" />
            ویرایش
          </Link>
          <button
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-right text-sm text-zinc-200 transition hover:bg-zinc-900 hover:text-white disabled:opacity-60"
            disabled={isUpdating}
            onClick={() => addQuickItem("dlcs", "DLC")}
            type="button"
          >
            <Plus className="h-4 w-4" />
            افزودن DLC
          </button>
          <button
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-right text-sm text-zinc-200 transition hover:bg-zinc-900 hover:text-white disabled:opacity-60"
            disabled={isUpdating}
            onClick={() => addQuickItem("extraEditions", "Edition")}
            type="button"
          >
            <Plus className="h-4 w-4" />
            افزودن Edition
          </button>
        </div>
      ) : null}
    </ControlPanel>
  );
}

export default Games;
