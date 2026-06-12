import SteppedEntityForm from "./entityForms/SteppedEntityForm";
import {
  useCreateCompanyMutation,
  useGetCompanyQuery,
  useUpdateCompanyMutation,
} from "../services/companyApi";

const companyFields = [
  { name: "name", title: "نام", label: "نام", placeholder: "مثلا Ubisoft" },
  { name: "logo", title: "لوگو", label: "لوگوی کمپانی", type: "image" },
  { name: "icon", title: "آیکون", label: "آیکون", type: "icon" },
  {
    name: "type",
    title: "نوع",
    label: "نوع کمپانی",
    type: "select",
    defaultValue: "developer_publisher",
    options: [
      { value: "developer_publisher", label: "سازنده و ناشر" },
      { value: "developer", label: "سازنده" },
      { value: "publisher", label: "ناشر" },
    ],
  },
  { name: "website", title: "وب‌سایت", label: "وب‌سایت", placeholder: "https://example.com" },
  { name: "socialLinks", title: "شبکه‌ها", label: "شبکه‌های اجتماعی", type: "socialLinks", defaultValue: [] },
  { name: "country", title: "کشور", label: "کشور", placeholder: "مثلا France" },
  { name: "foundedYear", title: "تأسیس", label: "سال تأسیس", placeholder: "مثلا 1986", type: "number" },
  {
    name: "description",
    title: "توضیح",
    label: "توضیح",
    placeholder: "توضیح کوتاه درباره کمپانی",
    type: "textarea",
  },
];

function CompanyCreate({ mode = "create" }) {
  const isEdit = mode === "edit";

  return (
    <SteppedEntityForm
      backPath="/companies"
      createMutation={useCreateCompanyMutation}
      entityLabel="کمپانی"
      fields={companyFields}
      getQuery={useGetCompanyQuery}
      mode={mode}
      title={isEdit ? "ویرایش کمپانی" : "افزودن کمپانی"}
      updateMutation={useUpdateCompanyMutation}
    />
  );
}

export default CompanyCreate;

