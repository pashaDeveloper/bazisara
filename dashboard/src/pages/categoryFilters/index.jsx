import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import ControlPanel from "../ControlPanel";
import AddButton from "@/components/shared/button/AddButton";
import DeleteModal from "@/components/shared/DeleteModal";
import Pagination, { usePaginationState } from "@/components/shared/Pagination";
import SearchBox, { useDebouncedValue } from "@/components/shared/SearchBox";
import Pencil from "@/components/icons/Pencil";
import {
  useDeleteCategoryFilterMutation,
  useGetCategoryFiltersQuery,
  useReorderCategoryFiltersMutation,
} from "../../services/category/categoryFilterApi";
import { useGetCategoryTreeQuery } from "../../services/category/categoryApi";
import renderTreeOptions from "../categories/components/renderTreeOptions";
import { getTypeLabel } from "./filterOptions";

function ColorOptionPreview({ option }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span
        className="h-3 w-3 shrink-0 rounded-full border border-zinc-700"
        style={{ backgroundColor: option.value }}
      />
      <span>{option.label}</span>
    </span>
  );
}

function CategoryFilters() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [search, setSearch] = useState("");
  const [orderedFilters, setOrderedFilters] = useState([]);
  const [draggedId, setDraggedId] = useState(null);
  const debouncedSearch = useDebouncedValue(search);
  const filtersPagination = usePaginationState(5, `${selectedCategory}-${debouncedSearch}`);

  const { data: filtersData, isLoading } = useGetCategoryFiltersQuery({
    category: selectedCategory,
    limit: filtersPagination.pageSize,
    page: filtersPagination.currentPage,
    search: debouncedSearch,
  });
  const { data: treeData } = useGetCategoryTreeQuery();
  const [deleteFilter, { isLoading: isDeleting }] = useDeleteCategoryFilterMutation();
  const [reorderFilters, { isLoading: isReordering }] = useReorderCategoryFiltersMutation();

  const filters = filtersData?.data || [];
  const filtersMeta = filtersData?.pagination;
  const tree = treeData?.data || [];

  useEffect(() => {
    setOrderedFilters(filters);
  }, [filters]);

  const handleDelete = async (id) => {
    try {
      const response = await deleteFilter(id).unwrap();
      toast.success(response.description || "فیلتر حذف شد");
    } catch (error) {
      toast.error(error?.data?.description || "حذف فیلتر انجام نشد");
    }
  };

  const persistOrder = async (items) => {
    try {
      await reorderFilters({
        orderedIds: items.map((item) => item._id),
        startSortOrder: (filtersPagination.currentPage - 1) * filtersPagination.pageSize,
      }).unwrap();
      toast.success("ترتیب فیلترها ذخیره شد");
    } catch (error) {
      toast.error(error?.data?.description || "ذخیره ترتیب انجام نشد");
      setOrderedFilters(filters);
    }
  };

  const handleDrop = (targetId) => {
    if (!draggedId || draggedId === targetId) return;

    const fromIndex = orderedFilters.findIndex((item) => item._id === draggedId);
    const toIndex = orderedFilters.findIndex((item) => item._id === targetId);
    if (fromIndex < 0 || toIndex < 0) return;

    const nextItems = [...orderedFilters];
    const [movedItem] = nextItems.splice(fromIndex, 1);
    nextItems.splice(toIndex, 0, movedItem);

    setOrderedFilters(nextItems);
    setDraggedId(null);
    persistOrder(nextItems);
  };

  return (
    <ControlPanel>
      <section className="space-y-6">
        <div className="rounded-2xl border border-zinc-700 bg-black/80 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs text-zinc-400">اتصال فیلترهای آماده به دسته‌بندی‌ها</p>
              <h1 className="mt-1 text-2xl font-bold text-white">فیلترهای دسته‌بندی</h1>
              <p className="mt-2 max-w-2xl text-sm text-zinc-500">
                فیلترهای مشترک را به دسته‌های مختلف وصل کنید و ترتیب نمایش را با کشیدن ردیف‌ها تغییر دهید.
              </p>
            </div>
            <AddButton link="/category-filters/add" />
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-700 bg-zinc-950 p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">لیست فیلترها</h2>
              <span className="mt-1 block text-xs text-zinc-500">
                {filtersMeta?.totalItems || filters.length} مورد
              </span>
            </div>
            <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
              <SearchBox onChange={setSearch} placeholder="جستجوی عنوان، کلید یا گزینه..." value={search} />
              <select
                className="w-full rounded-xl border border-zinc-800 bg-black px-3 py-3 text-sm text-white outline-none transition focus:border-white md:w-72"
                onChange={(event) => setSelectedCategory(event.target.value)}
                value={selectedCategory}
              >
                <option value="" className="text-left">همه دسته‌بندی‌ها</option>
                {renderTreeOptions(tree)}
              </select>
            </div>
          </div>

          <div className="mt-4 overflow-hidden">
            <table className="w-full table-fixed text-right text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="w-10 pb-3 text-center font-medium">ترتیب</th>
                  <th className="w-[38%] pb-3 font-medium sm:w-[30%]">عنوان</th>
                  <th className="hidden pb-3 font-medium md:table-cell">کلید</th>
                  <th className="hidden pb-3 font-medium lg:table-cell">دسته‌بندی</th>
                  <th className="w-[22%] pb-3 font-medium sm:w-[16%]">نوع</th>
                  <th className="hidden pb-3 font-medium xl:table-cell">گزینه‌ها / بازه</th>
                  <th className="hidden w-24 pb-3 font-medium sm:table-cell">وضعیت</th>
                  <th className="w-16 pb-3 text-center font-medium">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td className="py-6 text-center text-zinc-500" colSpan="8">
                      در حال دریافت...
                    </td>
                  </tr>
                ) : orderedFilters.length ? (
                  orderedFilters.map((item) => (
                    <tr
                      draggable={!isReordering}
                      key={item._id}
                      className={`border-b border-zinc-900 text-zinc-200 transition ${
                        draggedId === item._id
                          ? "bg-zinc-100 opacity-70 dark:bg-zinc-900/70"
                          : "hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
                      }`}
                      onDragEnd={() => setDraggedId(null)}
                      onDragOver={(event) => event.preventDefault()}
                      onDragStart={() => setDraggedId(item._id)}
                      onDrop={() => handleDrop(item._id)}
                    >
                      <td className="py-4 text-center">
                        <button
                          aria-label="تغییر ترتیب"
                          className="inline-flex h-8 w-8 cursor-grab items-center justify-center rounded-lg border border-zinc-300 text-zinc-500 transition hover:border-zinc-400 hover:bg-white hover:text-zinc-900 active:cursor-grabbing dark:border-zinc-800 dark:hover:border-zinc-600 dark:hover:bg-transparent dark:hover:text-white"
                          type="button"
                        >
                          ⋮⋮
                        </button>
                      </td>
                      <td className="py-4 pl-3">
                        <div className="truncate font-medium text-white">{item.label}</div>
                        {item.isRequired ? (
                          <span className="mt-1 block text-xs text-orange-300">اجباری</span>
                        ) : null}
                      </td>
                      <td className="hidden py-4 text-left font-mono text-xs text-zinc-400 md:table-cell" dir="ltr">
                        <span className="block truncate">{item.key}</span>
                      </td>
                      <td className="hidden py-4 text-zinc-400 lg:table-cell">
                        <span className="block truncate">{item.category?.name || "-"}</span>
                      </td>
                      <td className="py-4 text-zinc-300">{getTypeLabel(item.type)}</td>
                      <td className="hidden py-4 pl-3 text-zinc-400 xl:table-cell">
                        <span className="block truncate">
                          {item.options?.length
                            ? item.type === "color"
                              ? item.options.map((option) => <ColorOptionPreview key={option.value} option={option} />).reduce((items, option, index) => (index ? [...items, "، ", option] : [option]), [])
                              : item.options.map((option) => option.label).join("، ")
                            : item.min !== null || item.max !== null
                              ? `${item.min ?? "-"} تا ${item.max ?? "-"} ${item.unit || ""}`
                              : "-"}
                        </span>
                      </td>
                      <td className="hidden py-4 sm:table-cell">
                        <span
                          className={`rounded-full px-3 py-1 text-xs ${
                            item.status === "active"
                              ? "bg-green-500/10 text-green-300"
                              : "bg-zinc-800 text-zinc-400"
                          }`}
                        >
                          {item.status === "active" ? "فعال" : "غیرفعال"}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
                          <Link
                            aria-label="ویرایش فیلتر"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 text-zinc-300 transition hover:border-white hover:text-white"
                            to={`/category-filters/edit/${item._id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <DeleteModal
                            ariaLabel="حذف فیلتر"
                            isLoading={isDeleting}
                            itemTitle={item.label}
                            message="این فیلتر حذف شود؟"
                            onDelete={() => handleDelete(item._id)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-6 text-center text-zinc-500" colSpan="8">
                      هنوز فیلتری ثبت نشده است.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={filtersPagination.currentPage}
            onPageChange={filtersPagination.setCurrentPage}
            onPageSizeChange={filtersPagination.setPageSize}
            pageSize={filtersPagination.pageSize}
            totalItems={filtersMeta?.totalItems || filters.length}
            totalPages={filtersMeta?.totalPages}
          />
        </div>
      </section>
    </ControlPanel>
  );
}

export default CategoryFilters;
