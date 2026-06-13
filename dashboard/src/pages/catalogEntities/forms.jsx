import CatalogEntityForm from "./CatalogEntityForm";
import {
  useCreateInsuranceCompanyMutation,
  useCreatePriceMutation,
  useCreateShippingMethodMutation,
  useCreateWarrantyCompanyMutation,
  useGetInsuranceCompanyQuery,
  useGetPriceQuery,
  useGetShippingMethodQuery,
  useGetWarrantyCompanyQuery,
  useUpdateInsuranceCompanyMutation,
  useUpdatePriceMutation,
  useUpdateShippingMethodMutation,
  useUpdateWarrantyCompanyMutation,
} from "@/services/catalogEntityApi";

const companyFields = [
  { name: "name_fa", title: "نام", label: "نام فارسی", placeholder: "مثلا گارانتی معتبر" },
  { name: "name_en", title: "نام انگلیسی", label: "نام انگلیسی", placeholder: "Valid Warranty" },
  { name: "logo", title: "لوگو", label: "لوگو", type: "image" },
  { name: "website", title: "وب‌سایت", label: "وب‌سایت", placeholder: "https://example.com" },
  { name: "phone", title: "تلفن", label: "تلفن", placeholder: "021..." },
  { name: "email", title: "ایمیل", label: "ایمیل", placeholder: "info@example.com" },
  { name: "license_number", title: "مجوز", label: "شماره مجوز", placeholder: "ABC12345" },
  { name: "description", title: "توضیح", label: "توضیح", type: "textarea" },
];

export function WarrantyCompanyForm({ mode = "create" }) {
  return <CatalogEntityForm backPath="/warranty-companies" createMutation={useCreateWarrantyCompanyMutation} entityLabel="شرکت گارانتی" fields={companyFields} getQuery={useGetWarrantyCompanyQuery} mode={mode} title={mode === "edit" ? "ویرایش شرکت گارانتی" : "افزودن شرکت گارانتی"} updateMutation={useUpdateWarrantyCompanyMutation} />;
}

export function InsuranceCompanyForm({ mode = "create" }) {
  return <CatalogEntityForm backPath="/insurance-companies" createMutation={useCreateInsuranceCompanyMutation} entityLabel="شرکت بیمه" fields={companyFields} getQuery={useGetInsuranceCompanyQuery} mode={mode} title={mode === "edit" ? "ویرایش شرکت بیمه" : "افزودن شرکت بیمه"} updateMutation={useUpdateInsuranceCompanyMutation} />;
}

const priceFields = [
  { name: "selling_price", title: "قیمت فروش", label: "قیمت فروش", type: "number" },
  { name: "rrp_price", title: "قیمت مرجع", label: "قیمت مرجع", type: "number" },
  { name: "order_limit", title: "محدودیت سفارش", label: "محدودیت سفارش", type: "number", defaultValue: 1 },
  { name: "marketable_stock", title: "موجودی", label: "موجودی قابل فروش", type: "number" },
  { name: "discount_percent", title: "تخفیف", label: "درصد تخفیف", type: "number" },
  { name: "is_incredible", title: "شگفت‌انگیز", label: "شگفت‌انگیز است؟", type: "select", defaultValue: "false", options: [{ value: "false", label: "خیر" }, { value: "true", label: "بله" }] },
  { name: "is_promotion", title: "پروموشن", label: "پروموشن است؟", type: "select", defaultValue: "false", options: [{ value: "false", label: "خیر" }, { value: "true", label: "بله" }] },
];

export function PriceForm({ mode = "create" }) {
  return <CatalogEntityForm backPath="/prices" createMutation={useCreatePriceMutation} entityLabel="قیمت" fields={priceFields} getQuery={useGetPriceQuery} mode={mode} title={mode === "edit" ? "ویرایش قیمت" : "افزودن قیمت"} updateMutation={useUpdatePriceMutation} />;
}

const shippingFields = [
  { name: "title_fa", title: "عنوان", label: "عنوان فارسی", placeholder: "مثلا ارسال فوری" },
  { name: "title_en", title: "انگلیسی", label: "عنوان انگلیسی", placeholder: "Express delivery" },
  { name: "provider", title: "ارائه‌دهنده", label: "ارائه‌دهنده", placeholder: "مثلا پست / تیپاکس" },
  { name: "price", title: "هزینه", label: "هزینه ارسال", type: "number" },
  { name: "estimated_days", title: "زمان", label: "زمان تقریبی به روز", type: "number" },
  { name: "is_express", title: "فوری", label: "ارسال فوری است؟", type: "select", defaultValue: "false", options: [{ value: "false", label: "خیر" }, { value: "true", label: "بله" }] },
  { name: "description", title: "توضیح", label: "توضیح", type: "textarea" },
];

export function ShippingMethodForm({ mode = "create" }) {
  return <CatalogEntityForm backPath="/shipping-methods" createMutation={useCreateShippingMethodMutation} entityLabel="نحوه ارسال" fields={shippingFields} getQuery={useGetShippingMethodQuery} mode={mode} title={mode === "edit" ? "ویرایش نحوه ارسال" : "افزودن نحوه ارسال"} updateMutation={useUpdateShippingMethodMutation} />;
}
