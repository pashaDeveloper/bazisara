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
import {
  useDeleteSliderMutation,
  useGetSlidersQuery,
  useReorderSlidersMutation,
  useUpdateSliderStatusMutation,
} from "@/services/sliderApi";

function Sliders() {
  const [search, setSearch] = useState("");
  const [draggedId, setDraggedId] = useState(null);
  const [localSliders, setLocalSliders] = useState([]);
  const debouncedSearch = useDebouncedValue(search);
  const pagination = usePaginationState(5, debouncedSearch);
  const { data, isLoading } = useGetSlidersQuery({
    limit: pagination.pageSize,
    page: pagination.currentPage,
    search: debouncedSearch,
  });
  const [deleteSlider, { isLoading: isDeleting }] = useDeleteSliderMutation();
  const [reorderSliders, { isLoading: isReordering }] = useReorderSlidersMutation();
  const [updateSliderStatus, { isLoading: isUpdatingStatus }] = useUpdateSliderStatusMutation();

  const sliders = data?.data || [];
  const meta = data?.pagination;

  useEffect(() => {
    setLocalSliders(sliders);
  }, [sliders]);

  const handleDelete = async (id) => {
    try {
      const response = await deleteSlider(id).unwrap();
      toast.success(response.description || "اسلایدر حذف شد");
    } catch (error) {
      toast.error(error?.data?.description || "حذف اسلایدر انجام نشد");
    }
  };

  const moveSlider = (targetId) => {
    if (!draggedId || draggedId === targetId) return;

    setLocalSliders((prev) => {
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
    const changed = localSliders.some((item, index) => item._id !== sliders[index]?._id);
    if (!changed) return;

    try {
      const orderOffset = (pagination.currentPage - 1) * pagination.pageSize;
      const payload = localSliders.map((item, index) => ({
        _id: item._id,
        order: orderOffset + index + 1,
      }));
      const response = await reorderSliders(payload).unwrap();
      toast.success(response.description || "ترتیب اسلایدرها ذخیره شد");
    } catch (error) {
      setLocalSliders(sliders);
      toast.error(error?.data?.description || "ذخیره ترتیب اسلایدرها انجام نشد");
    }
  };

  const handleStatusToggle = async (item) => {
    const status = item.status === "active" ? "inactive" : "active";

    try {
      setLocalSliders((prev) =>
        prev.map((slider) => (slider._id === item._id ? { ...slider, status } : slider))
      );
      const response = await updateSliderStatus({ id: item._id, status }).unwrap();
      toast.success(response.description || "وضعیت اسلایدر به‌روزرسانی شد");
    } catch (error) {
      setLocalSliders(sliders);
      toast.error(error?.data?.description || "تغییر وضعیت اسلایدر انجام نشد");
    }
  };

  return (
    <ControlPanel>
      <section className="space-y-6">
        <div className="rounded-2xl border border-zinc-700 bg-black/80 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs text-zinc-400">مدیریت صفحه اول</p>
              <h1 className="mt-1 text-2xl font-bold text-white">اسلایدرها</h1>
              <p className="mt-2 max-w-2xl text-sm text-zinc-500">
                اسلایدهای بنر اصلی صفحه اول از این بخش مدیریت می‌شوند.
              </p>
            </div>
            <AddButton link="/sliders/create" />
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-700 bg-zinc-950 p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">لیست اسلایدرها</h2>
              <span className="mt-1 block text-xs text-zinc-500">
                {meta?.totalItems || localSliders.length} مورد
              </span>
            </div>
            <SearchBox onChange={setSearch} placeholder="جستجوی عنوان..." value={search} />
          </div>

          <div className="mt-4 overflow-hidden">
            <table className="w-full table-fixed text-right text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="w-12 pb-3 text-center font-medium">جابه‌جایی</th>
                  <th className="pb-3 font-medium">عنوان</th>
                  <th className="w-28 pb-3 text-center font-medium">وضعیت</th>
                  <th className="hidden w-32 pb-3 font-medium md:table-cell">تصویر</th>
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
                ) : localSliders.length ? (
                  localSliders.map((item) => (
                    <tr
                      key={item._id}
                      className={`border-b border-zinc-900 text-zinc-200 transition ${
                        draggedId === item._id ? "bg-zinc-900/80 opacity-70" : "hover:bg-zinc-900/40"
                      } ${isReordering ? "pointer-events-none" : ""}`}
                      draggable
                      onDragEnd={handleDragEnd}
                      onDragEnter={() => moveSlider(item._id)}
                      onDragOver={(event) => event.preventDefault()}
                      onDragStart={() => setDraggedId(item._id)}
                    >
                      <td className="py-4 text-center">
                        <span className="inline-flex h-9 w-9 cursor-grab items-center justify-center rounded-lg border border-zinc-800 text-lg leading-none text-zinc-500 active:cursor-grabbing">
                          ::
                        </span>
                      </td>
                      <td className="py-4 pl-3">
                        <span className="block truncate">{item.title}</span>
                        <span className="mt-1 block truncate text-xs text-zinc-500">
                          {item.subtitle || item.link || "-"}
                        </span>
                        <span className="mt-2 inline-flex rounded-full bg-zinc-900 px-2 py-1 text-[10px] text-zinc-300">
                          {item.category?.name || "بدون دسته‌بندی"}
                        </span>
                      </td>
                      <td className="py-4 text-center">
                        <div className="mx-auto flex justify-center" onClick={(event) => event.stopPropagation()}>
                          <StatusSwitch
                            checked={item.status === "active"}
                            className="!w-auto justify-center gap-0 !border-0 !bg-transparent !px-0 !py-0 hover:!border-transparent hover:!bg-transparent"
                            disabled={isUpdatingStatus}
                            id={`slider-status-${item._id}`}
                            name="status"
                            onChange={() => handleStatusToggle(item)}
                          />
                        </div>
                      </td>
                      <td className="hidden py-4 md:table-cell">
                        {item.image?.url ? (
                          <DisplayImages galleryPreview={[{ url: item.image.url, type: "image" }]} imageSize={64} className="mt-0" />
                        ) : (
                          <span className="text-zinc-500">ندارد</span>
                        )}
                      </td>
                      <td className="py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 text-zinc-300 transition hover:border-white hover:text-white"
                            to={`/sliders/edit/${item._id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <DeleteModal
                            isLoading={isDeleting}
                            itemTitle={item.title}
                            message="این اسلایدر حذف شود؟"
                            onDelete={() => handleDelete(item._id)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-6 text-center text-zinc-500" colSpan="5">
                      هنوز اسلایدری ثبت نشده است.
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
            totalItems={meta?.totalItems || localSliders.length}
            totalPages={meta?.totalPages}
          />
        </div>
      </section>
    </ControlPanel>
  );
}

export default Sliders;
