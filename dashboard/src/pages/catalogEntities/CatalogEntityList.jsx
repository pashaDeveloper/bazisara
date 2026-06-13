import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import ControlPanel from "../ControlPanel";
import AddButton from "@/components/shared/button/AddButton";
import DeleteModal from "@/components/shared/DeleteModal";
import Pagination, { usePaginationState } from "@/components/shared/Pagination";
import SearchBox, { useDebouncedValue } from "@/components/shared/SearchBox";
import Edit from "@/components/icons/Edit";

function valueAt(item, path) {
  return path.split(".").reduce((target, key) => target?.[key], item);
}

function CatalogEntityList({ columns, createPath, deleteMutation, description, editPath, title, useListQuery }) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const pagination = usePaginationState(8, debouncedSearch);
  const { data, isLoading } = useListQuery({
    page: pagination.currentPage,
    limit: pagination.pageSize,
    search: debouncedSearch,
  });
  const [deleteItem, { isLoading: isDeleting }] = deleteMutation();
  const items = data?.data || [];
  const meta = data?.pagination;

  const handleDelete = async (id) => {
    try {
      const response = await deleteItem(id).unwrap();
      toast.success(response.description || "حذف شد");
    } catch (error) {
      toast.error(error?.data?.description || "حذف انجام نشد");
    }
  };

  return (
    <ControlPanel>
      <section className="space-y-6">
        <div className="rounded-2xl border border-zinc-700 bg-black/80 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs text-zinc-400">مدیریت فروشگاه</p>
              <h1 className="mt-1 text-2xl font-bold text-white">{title}</h1>
              <p className="mt-2 max-w-2xl text-sm text-zinc-500">{description}</p>
            </div>
            <AddButton link={createPath} />
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-700 bg-zinc-950 p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">لیست {title}</h2>
              <span className="mt-1 block text-xs text-zinc-500">{meta?.totalItems || items.length} مورد</span>
            </div>
            <SearchBox onChange={setSearch} placeholder="جستجو..." value={search} />
          </div>

          <div className="mt-4 overflow-hidden">
            <table className="w-full table-fixed text-right text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  {columns.map((column) => (
                    <th className={`${column.className || ""} pb-3 font-medium`} key={column.key}>{column.label}</th>
                  ))}
                  <th className="w-24 pb-3 text-center font-medium">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td className="py-6 text-center text-zinc-500" colSpan={columns.length + 1}>در حال دریافت...</td></tr>
                ) : items.length ? (
                  items.map((item) => (
                    <tr className="border-b border-zinc-900 text-zinc-200" key={item._id}>
                      {columns.map((column) => (
                        <td className={`${column.className || ""} py-4 text-zinc-300`} key={column.key}>
                          {column.render ? column.render(item) : valueAt(item, column.key) || "-"}
                        </td>
                      ))}
                      <td className="py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 text-zinc-300 transition hover:border-white hover:text-white" to={editPath(item._id)}>
                            <Edit className="h-4 w-4" />
                          </Link>
                          <DeleteModal
                            isLoading={isDeleting}
                            itemTitle={item.name || item.title || item.label || item.code || item._id}
                            message="این مورد حذف شود؟"
                            onDelete={() => handleDelete(item._id)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td className="py-6 text-center text-zinc-500" colSpan={columns.length + 1}>هنوز موردی ثبت نشده است.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={pagination.currentPage}
            onPageChange={pagination.setCurrentPage}
            onPageSizeChange={pagination.setPageSize}
            pageSize={pagination.pageSize}
            totalItems={meta?.totalItems || items.length}
            totalPages={meta?.totalPages}
          />
        </div>
      </section>
    </ControlPanel>
  );
}

export default CatalogEntityList;
