import SteppedEntityForm from "./entityForms/SteppedEntityForm";
import {
  useCreateTagMutation,
  useGetTagQuery,
  useUpdateTagMutation,
} from "../services/tagApi";

const tagFields = [
  { name: "name", title: "نام", label: "نام تگ", placeholder: "مثلا بازی اکشن" },
  { name: "slug", title: "اسلاگ", label: "اسلاگ", placeholder: "action-games" },
  { name: "image", title: "تصویر", label: "تصویر تگ", type: "image" },
  {
    name: "description",
    title: "توضیح",
    label: "توضیح",
    placeholder: "توضیح کوتاه برای صفحه این تگ",
    type: "textarea",
  },
  {
    name: "seoTitle",
    title: "عنوان سئو",
    label: "عنوان سئو",
    placeholder: "خرید بازی‌های اکشن",
  },
  {
    name: "seoDescription",
    title: "توضیح متا",
    label: "توضیح متا",
    placeholder: "توضیح متا برای صفحه تگ",
    type: "textarea",
  },
  {
    name: "seoKeywords",
    title: "کلمات کلیدی",
    label: "کلمات کلیدی",
    type: "keywords",
    defaultValue: [],
  },
];

function TagCreate({ mode = "create" }) {
  const isEdit = mode === "edit";

  return (
    <SteppedEntityForm
      backPath="/tags"
      createMutation={useCreateTagMutation}
      entityLabel="تگ"
      fields={tagFields}
      getQuery={useGetTagQuery}
      mode={mode}
      title={isEdit ? "ویرایش تگ" : "افزودن تگ"}
      updateMutation={useUpdateTagMutation}
    />
  );
}

export default TagCreate;

