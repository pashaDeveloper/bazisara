import SteppedEntityForm from "./entityForms/SteppedEntityForm";
import {
  useCreateBrandMutation,
  useGetBrandQuery,
  useUpdateBrandMutation,
} from "@/services/brandApi";

const brandFields = [
  { name: "name", title: "نام", label: "نام برند", placeholder: "مثلا سونی" },
  { name: "title_en", title: "نام انگلیسی", label: "نام انگلیسی", placeholder: "Sony" },
  { name: "website", title: "وب‌سایت", label: "وب‌سایت برند", placeholder: "https://example.com" },
  { name: "country", title: "کشور", label: "کشور", placeholder: "مثلا Japan" },
  { name: "foundedYear", title: "سال تأسیس", label: "سال تأسیس برند", placeholder: "مثلا 1946", type: "number" },
  { name: "rate", title: "امتیاز", label: "امتیاز برند", type: "starRating", defaultValue: 0 },
  { name: "logo", title: "لوگو", label: "لوگوی برند", type: "image" },
  {
    name: "description",
    title: "توضیح",
    label: "توضیح برند",
    placeholder: "توضیح کوتاه درباره برند",
    type: "textarea",
  },
];

function BrandForm({ mode = "create" }) {
  const isEdit = mode === "edit";

  return (
    <SteppedEntityForm
      backPath="/brands"
      createMutation={useCreateBrandMutation}
      entityLabel="برند"
      fields={brandFields}
      getQuery={useGetBrandQuery}
      mode={mode}
      title={isEdit ? "ویرایش برند" : "افزودن برند"}
      updateMutation={useUpdateBrandMutation}
    />
  );
}

export default BrandForm;
