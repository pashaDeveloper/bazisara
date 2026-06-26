import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import ControlPanel from "../ControlPanel";
import AddButton from "@/components/shared/button/AddButton";
import DeleteModal from "@/components/shared/DeleteModal";
import DisplayImages from "@/components/shared/DisplayImages";
import Edit from "@/components/icons/Edit";
import SearchBox, { useDebouncedValue } from "@/components/shared/SearchBox";
import Pagination, { usePaginationState } from "@/components/shared/Pagination";
import StatusSwitch from "@/components/shared/button/StatusSwitch";
import {
  useDeleteGameCollectionMutation,
  useGetGameCollectionsQuery,
  useReorderGameCollectionsMutation,
  useUpdateGameCollectionVisibilityMutation,
} from "@/services/gameCollectionApi";

function GameCollections() {
  const [search, setSearch] = useState("");
  const [draggedId, setDraggedId] = useState(null);
  const [localCollections, setLocalCollections] = useState([]);
  const debouncedSearch = useDebouncedValue(search);
  const pagination = usePaginationState(8, debouncedSearch);
  const { data, isLoading } = useGetGameCollectionsQuery({
    page: pagination.currentPage,
    limit: pagination.pageSize,
    search: debouncedSearch,
  });
  const [deleteCollection, { isLoading: isDeleting }] = useDeleteGameCollectionMutation();
  const [reorderCollections, { isLoading: isReordering }] = useReorderGameCollectionsMutation();
  const [updateVisibility, { isLoading: isUpdatingVisibility }] = useUpdateGameCollectionVisibilityMutation();
  const collections = data?.data || [];
  const meta = data?.pagination;

  useEffect(() => {
    setLocalCollections(collections);
  }, [collections]);

  const handleDelete = async (id) => {
    try {
      const response = await deleteCollection(id).unwrap();
      toast.success(response.description || "کالکشن حذف شد");
    } catch (error) {
      toast.error(error?.data?.description || "حذف کالکشن انجام نشد");
    }
  };

  const moveCollection = (targetId) => {
    if (!draggedId || draggedId === targetId) return;

    setLocalCollections((prev) => {
      const fromIndex = prev.findIndex((item) => item._id === draggedId);
      const toIndex = prev.findIndex((item) => item._id === targetId);
      if (fromIndex < 0 || toIndex < 0) return prev;

      const next = [...prev];
      const [movedItem] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, movedItem);
      return next;
    });
  };

  const handleDragEnd = async () => {
    setDraggedId(null);
    const changed = localCollections.some((item, index) => item._id !== collections[index]?._id);
    if (!changed) return;

    try {
      const orderOffset = (pagination.currentPage - 1) * pagination.pageSize;
      const payload = localCollections.map((item, index) => ({
        _id: item._id,
        order: orderOffset + index + 1,
      }));
      const response = await reorderCollections(payload).unwrap();
      toast.success(response.description || "ترتیب کالکشن‌ها ذخیره شد");
    } catch (error) {
      setLocalCollections(collections);
      toast.error(error?.data?.description || "ذخیره ترتیب کالکشن‌ها انجام نشد");
    }
  };

  const handleVisibilityToggle = async (item) => {
    const visibility = !item.visibility;
    try {
      setLocalCollections((prev) =>
        prev.map((collection) => (collection._id === item._id ? { ...collection, visibility } : collection))
      );
      const response = await updateVisibility({ id: item._id, visibility }).unwrap();
      toast.success(response.description || "وضعیت نمایش کالکشن به‌روزرسانی شد");
    } catch (error) {
      setLocalCollections(collections);
      toast.error(error?.data?.description || "تغییر وضعیت نمایش انجام نشد");
    }
  };

  return (
    <ControlPanel>
      <section className="space-y-6">
        <div className="rounded-2xl border border-zinc-700 bg-black/80 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs text-zinc-400">مدیریت صفحه اصلی</p>
              <h1 className="mt-1 text-2xl font-bold text-white">کالکشن‌های بازی</h1>
              <p className="mt-2 max-w-2xl text-sm text-zinc-500">کالکشن‌های بازی را برای استفاده در فرم بازی و نمایش‌های سایت مدیریت کنید.</p>
            </div>
            <AddButton link="/game-collections/create" />
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-700 bg-zinc-950 p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">لیست کالکشن‌ها</h2>
              <span className="mt-1 block text-xs text-zinc-500">{meta?.totalItems || localCollections.length} مورد</span>
            </div>
            <SearchBox onChange={setSearch} placeholder="جستجوی عنوان یا جایگاه..." value={search} />
          </div>

          <div className="mt-4 overflow-hidden">
            <table className="w-full table-fixed text-right text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="w-12 pb-3 text-center font-medium">جابجایی</th>
                  <th className="pb-3 font-medium">عنوان</th>
                  <th className="hidden pb-3 font-medium md:table-cell">جایگاه</th>
                  <th className="hidden w-24 pb-3 font-medium lg:table-cell">تصویر</th>
                  <th className="w-28 pb-3 text-center font-medium">نمایش</th>
                  <th className="w-24 pb-3 text-center font-medium">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td className="py-6 text-center text-zinc-500" colSpan="6">در حال دریافت...</td></tr>
                ) : localCollections.length ? (
                  localCollections.map((item) => (
                    <tr
                      className={`border-b border-zinc-900 text-zinc-200 transition ${
                        draggedId === item._id ? "bg-zinc-900/80 opacity-70" : "hover:bg-zinc-900/40"
                      } ${isReordering ? "pointer-events-none" : ""}`}
                      draggable
                      key={item._id}
                      onDragEnd={handleDragEnd}
                      onDragEnter={() => moveCollection(item._id)}
                      onDragOver={(event) => event.preventDefault()}
                      onDragStart={() => setDraggedId(item._id)}
                    >
                      <td className="py-4 text-center">
                        <span className="inline-flex h-9 w-9 cursor-grab items-center justify-center rounded-lg border border-zinc-800 text-lg leading-none text-zinc-500 active:cursor-grabbing">
                          ::
                        </span>
                      </td>
                      <td className="py-4 pl-3">
                        <span className="block truncate">{item.title_fa}</span>
                        <span className="mt-1 block truncate text-xs text-zinc-500">{item.slug}</span>
                      </td>
                      <td className="hidden py-4 text-zinc-400 md:table-cell">{item.placement || "-"}</td>
                      <td className="hidden py-4 lg:table-cell">
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
                      <td className="py-4 text-center">
                        <div className="mx-auto flex justify-center" onClick={(event) => event.stopPropagation()}>
                          <StatusSwitch
                            checked={item.visibility !== false}
                            className="!w-auto justify-center gap-0 !border-0 !bg-transparent !px-0 !py-0 hover:!border-transparent hover:!bg-transparent"
                            disabled={isUpdatingVisibility}
                            id={`collection-visibility-${item._id}`}
                            name="visibility"
                            onChange={() => handleVisibilityToggle(item)}
                          />
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 text-zinc-300 transition hover:border-white hover:text-white" to={`/game-collections/edit/${item._id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                          <DeleteModal
                            isLoading={isDeleting}
                            itemTitle={item.title_fa}
                            message="این کالکشن حذف شود؟"
                            onDelete={() => handleDelete(item._id)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td className="py-6 text-center text-zinc-500" colSpan="6">هنوز کالکشنی ثبت نشده است.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={pagination.currentPage}
            onPageChange={pagination.setCurrentPage}
            onPageSizeChange={pagination.setPageSize}
            pageSize={pagination.pageSize}
            totalItems={meta?.totalItems || localCollections.length}
            totalPages={meta?.totalPages}
          />
        </div>
      </section>
    </ControlPanel>
  );
}

export default GameCollections;
