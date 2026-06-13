import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import ControlPanel from "../ControlPanel";
import AddButton from "@/components/shared/button/AddButton";
import DeleteModal from "@/components/shared/DeleteModal";
import Pagination, { usePaginationState } from "@/components/shared/Pagination";
import SearchBox, { useDebouncedValue } from "@/components/shared/SearchBox";
import StatusSwitch from "@/components/shared/button/StatusSwitch";
import Edit from "@/components/icons/Edit";
import { useDeleteProductMutation, useGetProductsQuery, useUpdateProductMutation } from "@/services/productApi";

function Products() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const pagination = usePaginationState(8, debouncedSearch);
  const { data, isLoading } = useGetProductsQuery({
    page: pagination.currentPage,
    limit: pagination.pageSize,
    search: debouncedSearch,
  });
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [updateProduct, { isLoading: isUpdatingStatus }] = useUpdateProductMutation();
  const [localProducts, setLocalProducts] = useState([]);

  const products = data?.data || [];
  const meta = data?.pagination;

  useEffect(() => {
    setLocalProducts(products);
  }, [products]);

  const handleDelete = async (id) => {
    try {
      const response = await deleteProduct(id).unwrap();
      toast.success(response.description || "محصول حذف شد");
    } catch (error) {
      toast.error(error?.data?.description || "حذف محصول انجام نشد");
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
      setLocalProducts((prev) => prev.map((product) => (product._id === item._id ? { ...product, status } : product)));
      const response = await updateProduct({ id: item._id, formData }).unwrap();
      toast.success(response.description || "وضعیت محصول به‌روزرسانی شد");
    } catch (error) {
      setLocalProducts(products);
      toast.error(error?.data?.description || "تغییر وضعیت محصول انجام نشد");
    }
  };

  return (
    <ControlPanel>
      <section className="space-y-6">
        <div className="rounded-2xl border border-zinc-700 bg-black/80 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs text-zinc-400">مدیریت فروشگاه</p>
              <h1 className="mt-1 text-2xl font-bold text-white">محصولات</h1>
              <p className="mt-2 max-w-2xl text-sm text-zinc-500">
                محصولاتی که در صفحه فروشگاه client نمایش داده می‌شوند را از اینجا مدیریت کنید.
              </p>
            </div>
            <AddButton link="/products/create" />
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-700 bg-zinc-950 p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">لیست محصولات</h2>
              <span className="mt-1 block text-xs text-zinc-500">{meta?.totalItems || products.length} مورد</span>
            </div>
            <SearchBox onChange={setSearch} placeholder="جستجوی عنوان، پلتفرم، سازنده..." value={search} />
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {isLoading ? (
              <div className="col-span-full rounded-xl border border-zinc-800 bg-black p-6 text-center text-sm text-zinc-500">در حال دریافت...</div>
            ) : localProducts.length ? (
              localProducts.map((item) => (
                <article className="rounded-xl border border-zinc-800 bg-black p-3 text-right" key={item._id}>
                  <div className="aspect-square overflow-hidden rounded-xl bg-white">
                    {item.image?.url ? (
                      <img alt={item.title || ""} className="h-full w-full object-contain p-4" src={item.image.url} />
                    ) : (
                      <div className="h-full w-full bg-zinc-900" />
                    )}
                  </div>
                  <h3 className="mt-3 line-clamp-2 min-h-12 text-sm font-black leading-6 text-white">{item.title}</h3>
                  <p className="line-clamp-1 text-xs text-zinc-500">{item.subtitle || item.platform}</p>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-sm font-black text-emerald-400">{Number(item.price || 0).toLocaleString("fa-IR")} تومان</span>
                    <StatusSwitch
                      checked={item.status === "active"}
                      className="!w-auto justify-center gap-0 !border-0 !bg-transparent !px-0 !py-0 hover:!border-transparent hover:!bg-transparent"
                      disabled={isUpdatingStatus || item.status === "pending"}
                      id={`product-status-${item._id}`}
                      name="status"
                      onChange={() => handleStatusToggle(item)}
                    />
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <Link className="inline-flex h-9 flex-1 items-center justify-center rounded-lg border border-zinc-800 text-zinc-300 transition hover:border-white hover:text-white" to={`/products/edit/${item._id}`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                    <DeleteModal
                      isLoading={isDeleting}
                      itemTitle={item.title}
                      message="این محصول حذف شود؟"
                      onDelete={() => handleDelete(item._id)}
                      triggerClassName="delete-button inline-flex h-9 flex-1 items-center justify-center disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                </article>
              ))
            ) : (
              <div className="col-span-full rounded-xl border border-zinc-800 bg-black p-6 text-center text-sm text-zinc-500">هنوز محصولی ثبت نشده است.</div>
            )}
          </div>

          <Pagination
            currentPage={pagination.currentPage}
            onPageChange={pagination.setCurrentPage}
            onPageSizeChange={pagination.setPageSize}
            pageSize={pagination.pageSize}
            totalItems={meta?.totalItems || products.length}
            totalPages={meta?.totalPages}
          />
        </div>
      </section>
    </ControlPanel>
  );
}

export default Products;
