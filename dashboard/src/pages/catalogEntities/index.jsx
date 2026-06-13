import CatalogEntityList from "./CatalogEntityList";
import {
  useDeleteInsuranceCompanyMutation,
  useDeleteInsuranceMutation,
  useDeletePriceMutation,
  useDeleteShippingMethodMutation,
  useDeleteWarrantyCompanyMutation,
  useDeleteWarrantyMutation,
  useGetInsuranceCompaniesQuery,
  useGetInsurancesQuery,
  useGetPricesQuery,
  useGetShippingMethodsQuery,
  useGetWarrantiesQuery,
  useGetWarrantyCompaniesQuery,
} from "@/services/catalogEntityApi";

const commonNameColumns = [
  { key: "name_fa", label: "نام", className: "w-[32%]", render: (item) => item.name_fa || item.title_fa },
  { key: "name_en", label: "انگلیسی", className: "hidden w-[20%] md:table-cell", render: (item) => item.name_en || item.title_en || "-" },
  { key: "contact.website", label: "وب‌سایت", className: "hidden w-[24%] lg:table-cell", render: (item) => item.contact?.website || item.website || "-" },
];

export function WarrantyCompanies() {
  return <CatalogEntityList columns={commonNameColumns} createPath="/warranty-companies/create" deleteMutation={useDeleteWarrantyCompanyMutation} description="شرکت‌های گارانتی اینجا ثبت می‌شوند و داخل گارانتی انتخاب می‌شوند." editPath={(id) => `/warranty-companies/edit/${id}`} title="شرکت‌های گارانتی" useListQuery={useGetWarrantyCompaniesQuery} />;
}

export function InsuranceCompanies() {
  return <CatalogEntityList columns={commonNameColumns} createPath="/insurance-companies/create" deleteMutation={useDeleteInsuranceCompanyMutation} description="شرکت‌های بیمه جداگانه ثبت می‌شوند و داخل بیمه انتخاب می‌شوند." editPath={(id) => `/insurance-companies/edit/${id}`} title="شرکت‌های بیمه" useListQuery={useGetInsuranceCompaniesQuery} />;
}

const policyColumns = [
  { key: "title_fa", label: "عنوان", className: "w-[32%]" },
  { key: "provider", label: "ارائه‌دهنده", className: "hidden w-[24%] md:table-cell", render: (item) => item.provider?.name_fa || "-" },
  { key: "duration_months", label: "مدت", className: "hidden w-24 lg:table-cell", render: (item) => `${item.duration_months || 0} ماه` },
  { key: "global_discount_percent", label: "تخفیف", className: "hidden w-24 xl:table-cell", render: (item) => `${item.global_discount_percent || 0}%` },
];

export function Warranties() {
  return <CatalogEntityList columns={policyColumns} createPath="/warranties/create" deleteMutation={useDeleteWarrantyMutation} description="گارانتی‌ها مستقل ثبت می‌شوند و در فرم محصول انتخاب می‌شوند." editPath={(id) => `/warranties/edit/${id}`} title="گارانتی‌ها" useListQuery={useGetWarrantiesQuery} />;
}

export function Insurances() {
  return <CatalogEntityList columns={policyColumns} createPath="/insurances/create" deleteMutation={useDeleteInsuranceMutation} description="بیمه‌ها مستقل ثبت می‌شوند و در فرم محصول انتخاب می‌شوند." editPath={(id) => `/insurances/edit/${id}`} title="بیمه‌ها" useListQuery={useGetInsurancesQuery} />;
}

const priceColumns = [
  { key: "selling_price", label: "قیمت فروش", className: "w-[25%]", render: (item) => Number(item.selling_price || 0).toLocaleString("fa-IR") },
  { key: "rrp_price", label: "قیمت مرجع", className: "hidden w-[25%] md:table-cell", render: (item) => Number(item.rrp_price || 0).toLocaleString("fa-IR") },
  { key: "discount_percent", label: "تخفیف", className: "hidden w-24 lg:table-cell", render: (item) => `${item.discount_percent || 0}%` },
  { key: "marketable_stock", label: "موجودی", className: "hidden w-24 xl:table-cell", render: (item) => item.marketable_stock ?? "-" },
];

export function Prices() {
  return <CatalogEntityList columns={priceColumns} createPath="/prices/create" deleteMutation={useDeletePriceMutation} description="قیمت‌ها جداگانه ساخته می‌شوند و داخل محصول انتخاب می‌شوند." editPath={(id) => `/prices/edit/${id}`} title="قیمت‌ها" useListQuery={useGetPricesQuery} />;
}

const shippingColumns = [
  { key: "title_fa", label: "عنوان", className: "w-[32%]" },
  { key: "provider", label: "ارائه‌دهنده", className: "hidden w-[20%] md:table-cell" },
  { key: "price", label: "هزینه", className: "hidden w-28 lg:table-cell", render: (item) => Number(item.price || 0).toLocaleString("fa-IR") },
  { key: "estimated_days", label: "زمان", className: "hidden w-24 xl:table-cell", render: (item) => `${item.estimated_days || 0} روز` },
];

export function ShippingMethods() {
  return <CatalogEntityList columns={shippingColumns} createPath="/shipping-methods/create" deleteMutation={useDeleteShippingMethodMutation} description="روش‌های ارسال جداگانه ثبت می‌شوند و داخل محصول انتخاب می‌شوند." editPath={(id) => `/shipping-methods/edit/${id}`} title="نحوه ارسال" useListQuery={useGetShippingMethodsQuery} />;
}
