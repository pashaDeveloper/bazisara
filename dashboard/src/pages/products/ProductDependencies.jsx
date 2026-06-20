import React from "react";
import { Link } from "react-router-dom";
import ControlPanel from "../ControlPanel";
import {
  useGetInsuranceCompaniesQuery,
  useGetInsurancesQuery,
  useGetPricesQuery,
  useGetShippingMethodsQuery,
  useGetWarrantiesQuery,
  useGetWarrantyCompaniesQuery,
} from "@/services/catalogEntityApi";

function formatPrice(value) {
  return Number(value || 0).toLocaleString("fa-IR");
}

function getTitle(item) {
  return item.title_fa || item.name_fa || item.title_en || item.name_en || item.provider || item._id;
}

function DependencyList({ createPath, description, getMeta, getSubtitle, listPath, title, useListQuery }) {
  const { data, isLoading } = useListQuery({ page: 1, limit: 5 });
  const items = data?.data || [];
  const total = data?.pagination?.totalItems || items.length;

  return (
    <section className="rounded-2xl border border-zinc-800 bg-black p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-white">{title}</h2>
          <p className="mt-1 text-xs leading-6 text-zinc-500">{description}</p>
        </div>
        <span className="rounded-full border border-zinc-800 px-3 py-1 text-xs font-bold text-zinc-300">{total} مورد</span>
      </div>

      <div className="mt-4 space-y-2">
        {isLoading ? (
          <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-3 text-center text-xs text-zinc-500">در حال دریافت...</div>
        ) : items.length ? (
          items.map((item) => (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-zinc-900 bg-zinc-950 p-3" key={item._id}>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-zinc-100">{getTitle(item)}</p>
                <p className="mt-1 truncate text-xs text-zinc-500">{getSubtitle?.(item) || "آماده انتخاب در فرم محصول"}</p>
              </div>
              {getMeta ? <span className="shrink-0 text-xs font-bold text-emerald-400">{getMeta(item)}</span> : null}
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-3 text-center text-xs text-zinc-500">هنوز موردی ثبت نشده است.</div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-800 px-3 text-xs font-bold text-zinc-300 transition hover:border-white hover:text-white" to={listPath}>
          مشاهده همه
        </Link>
        <Link className="inline-flex h-9 items-center justify-center rounded-lg bg-emerald-500 px-3 text-xs font-bold text-white transition hover:bg-emerald-400" to={createPath}>
          افزودن
        </Link>
      </div>
    </section>
  );
}

function ProductDependencies() {
  return (
    <ControlPanel>
      <section className="space-y-6">
        <div className="rounded-2xl border border-zinc-700 bg-black/80 p-5">
          <p className="text-xs text-zinc-400">مدیریت فروشگاه</p>
          <h1 className="mt-1 text-2xl font-black text-white">مدل‌های وابسته محصول</h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-zinc-500">
            گارانتی، بیمه، قیمت و نحوه ارسال اینجا یک‌جا دیده می‌شوند و داخل فرم محصول قابل انتخاب هستند.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <DependencyList
            createPath="/warranties/create"
            description="گزینه‌های گارانتی که در فرم محصول انتخاب می‌شوند."
            getMeta={(item) => `${item.duration_months || 0} ماه`}
            getSubtitle={(item) => item.provider?.name_fa || "بدون شرکت"}
            listPath="/warranties"
            title="گارانتی‌ها"
            useListQuery={useGetWarrantiesQuery}
          />
          <DependencyList
            createPath="/insurances/create"
            description="بیمه‌های قابل اتصال به محصول."
            getMeta={(item) => `${item.duration_months || 0} ماه`}
            getSubtitle={(item) => item.provider?.name_fa || "بدون شرکت"}
            listPath="/insurances"
            title="بیمه‌ها"
            useListQuery={useGetInsurancesQuery}
          />
          <DependencyList
            createPath="/shipping-methods/create"
            description="روش‌های ارسال قابل انتخاب برای محصول."
            getMeta={(item) => `${formatPrice(item.price)} تومان`}
            getSubtitle={(item) => item.provider || `${item.estimated_days || 0} روز`}
            listPath="/shipping-methods"
            title="نحوه ارسال"
            useListQuery={useGetShippingMethodsQuery}
          />
          <DependencyList
            createPath="/prices/create"
            description="لیست قیمت‌های مستقل و قیمت‌های ذخیره‌شده محصول."
            getMeta={(item) => `${formatPrice(item.selling_price)} تومان`}
            getSubtitle={(item) => `پایه: ${formatPrice(item.base_price)} تومان`}
            listPath="/prices"
            title="قیمت‌ها"
            useListQuery={useGetPricesQuery}
          />
          <DependencyList
            createPath="/warranty-companies/create"
            description="شرکت‌هایی که برای گارانتی انتخاب می‌شوند."
            getSubtitle={(item) => item.contact?.website || item.website || "شرکت گارانتی"}
            listPath="/warranty-companies"
            title="شرکت‌های گارانتی"
            useListQuery={useGetWarrantyCompaniesQuery}
          />
          <DependencyList
            createPath="/insurance-companies/create"
            description="شرکت‌هایی که برای بیمه انتخاب می‌شوند."
            getSubtitle={(item) => item.contact?.website || item.website || "شرکت بیمه"}
            listPath="/insurance-companies"
            title="شرکت‌های بیمه"
            useListQuery={useGetInsuranceCompaniesQuery}
          />
        </div>
      </section>
    </ControlPanel>
  );
}

export default ProductDependencies;
