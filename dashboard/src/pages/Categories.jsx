import React from "react";
import toast from "react-hot-toast";
import { useState } from "react";
import ControlPanel from "./ControlPanel";
import AddButton from "@/components/shared/button/AddButton";
import DeleteModal from "@/components/shared/DeleteModal";
import DisplayImages from "@/components/shared/DisplayImages";
import Pagination, { usePaginationState } from "@/components/shared/Pagination";
import SearchBox, { useDebouncedValue } from "@/components/shared/SearchBox";
import {
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
  useGetCategoryTreeQuery,
} from "../services/category/categoryApi";

function SvgPreview({ svg, label }) {
  if (!svg?.trim()) {
    return <span className="text-zinc-500">ندارد</span>;
  }

  return (
    <div
      aria-label={label}
      className="flex h-12 w-12 items-center justify-center rounded-lg border border-zinc-800 bg-black text-white [&_svg]:h-6 [&_svg]:w-6"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

function renderTreePreview(nodes, depth = 0) {
  return nodes.map((node) => (
    <div key={node._id} className="space-y-2">
      <div className="rounded-xl border border-zinc-800 bg-black px-3 py-3 text-sm text-zinc-200">
        <span className="text-zinc-500">{`${"- ".repeat(depth)}`}</span>
        <span className="mx-2 inline-flex align-middle">
          <SvgPreview svg={node.icon} label={node.name} />
        </span>
        {node.name}
      </div>
      {node.children?.length ? (
        <div className="mr-4 space-y-2 border-r border-zinc-800 pr-4">
          {renderTreePreview(node.children, depth + 1)}
        </div>
      ) : null}
    </div>
  ));
}

function collectParentPaths(nodes, parentNames = [], paths = {}) {
  nodes.forEach((node) => {
    paths[node._id] = parentNames;
    if (node.children?.length) {
      collectParentPaths(node.children, [...parentNames, node.name], paths);
    }
  });

  return paths;
}

function getCategoryParentPath(item, parentPathById) {
  const parentNames = parentPathById[item._id];
  if (parentNames?.length) return parentNames.join(" / ");
  return item.parent?.name || "ندارد";
}

function Categories() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const categoriesPagination = usePaginationState(5, debouncedSearch);
  const { data: categoriesData, isLoading } = useGetCategoriesQuery({
    limit: categoriesPagination.pageSize,
    page: categoriesPagination.currentPage,
    search: debouncedSearch,
  });
  const { data: treeData } = useGetCategoryTreeQuery();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  const categories = categoriesData?.data || [];
  const categoriesMeta = categoriesData?.pagination;
  const tree = treeData?.data || [];
  const parentPathById = React.useMemo(() => collectParentPaths(tree), [tree]);

  const handleDelete = async (id) => {
    try {
      const response = await deleteCategory(id).unwrap();
      toast.success(response.description || "دسته‌بندی حذف شد");
    } catch (error) {
      toast.error(error?.data?.description || "حذف دسته‌بندی ناموفق بود");
    }
  };

  return (
    <ControlPanel>
      <section className="space-y-6">
        <div className="rounded-2xl border border-zinc-700 bg-black/80 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs text-zinc-400">مدیریت دسته‌بندی‌ها</p>
              <h1 className="mt-1 text-2xl font-bold text-white">دسته‌بندی‌ها</h1>
              <p className="mt-2 max-w-2xl text-sm text-zinc-500">
                دسته‌بندی‌های محصولات را مدیریت کنید، ساختار درختی بسازید و آیکون SVG اختصاصی قرار دهید.
              </p>
            </div>
            <AddButton link="/categories/create" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="space-y-6 xl:col-span-5">
            <div className="rounded-2xl border border-zinc-700 bg-zinc-950 p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white">درخت دسته‌بندی‌ها</h2>
                <span className="text-xs text-zinc-500">{tree.length} مورد</span>
              </div>
              <div className="mt-4 space-y-3">
                {tree.length ? (
                  renderTreePreview(tree)
                ) : (
                  <div className="rounded-xl border border-zinc-800 bg-black px-4 py-6 text-sm text-zinc-500">
                    هنوز دسته‌بندی‌ای ثبت نشده است.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-700 bg-zinc-950 p-5 xl:col-span-7">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-sm font-bold text-white">لیست دسته‌بندی‌ها</h2>
                <span className="mt-1 block text-xs text-zinc-500">{categoriesMeta?.totalItems || categories.length} مورد</span>
              </div>
              <SearchBox onChange={setSearch} placeholder="جستجو نام یا توضیح دسته‌بندی..." value={search} />
            </div>
            <div className="mt-4 overflow-hidden">
              <table className="w-full table-fixed text-right text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500">
                    <th className="w-[42%] pb-3 font-medium sm:w-[34%]">نام</th>
                    <th className="w-[24%] pb-3 font-medium">آیکون</th>
                    <th className="hidden pb-3 font-medium md:table-cell">والد</th>
                    <th className="hidden w-24 pb-3 font-medium sm:table-cell">تصویر</th>
                    <th className="w-16 pb-3 text-center font-medium">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td className="py-6 text-center text-zinc-500" colSpan="5">
                        در حال دریافت...
                      </td>
                    </tr>
                  ) : categories.length ? (
                    categories.map((item) => (
                      <tr key={item._id} className="border-b border-zinc-900 text-zinc-200">
                        <td className="py-4 pl-3">
                          <span className="block truncate">{item.name}</span>
                        </td>
                        <td className="py-4">
                          <SvgPreview svg={item.icon} label={item.name} />
                        </td>
                        <td className="hidden py-4 text-zinc-400 md:table-cell">{getCategoryParentPath(item, parentPathById)}</td>
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
                          <DeleteModal
                            ariaLabel="حذف دسته‌بندی"
                            isLoading={isDeleting}
                            itemTitle={item.name}
                            message="این دسته‌بندی حذف شود؟"
                            onDelete={() => handleDelete(item._id)}
                            triggerClassName="delete-button mx-auto inline-flex h-9 w-9 items-center justify-center disabled:cursor-not-allowed disabled:opacity-60"
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="py-6 text-center text-zinc-500" colSpan="5">
                        دسته‌بندی‌ای با این جستجو پیدا نشد.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={categoriesPagination.currentPage}
              onPageChange={categoriesPagination.setCurrentPage}
              onPageSizeChange={categoriesPagination.setPageSize}
              pageSize={categoriesPagination.pageSize}
              totalItems={categoriesMeta?.totalItems || categories.length}
              totalPages={categoriesMeta?.totalPages}
            />
          </div>
        </div>
      </section>
    </ControlPanel>
  );
}

export default Categories;
