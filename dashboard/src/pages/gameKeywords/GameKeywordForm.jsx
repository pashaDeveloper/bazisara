import SteppedEntityForm from "../entityForms/SteppedEntityForm";
import {
  useCreateGameKeywordMutation,
  useGetGameKeywordQuery,
  useUpdateGameKeywordMutation,
} from "@/services/gameKeywordApi";

const fields = [
  { name: "name", title: "نام", label: "عنوان فارسی", placeholder: "مثلا اکشن" },
  { name: "slug", title: "اسلاگ", label: "اسلاگ", placeholder: "action" },
  { name: "title_en", title: "نام انگلیسی", label: "نام انگلیسی", placeholder: "Action" },
  { name: "image", title: "تصویر", label: "تصویر کلمه کلیدی", type: "image" },
  {
    name: "description",
    title: "توضیح",
    label: "توضیح",
    placeholder: "توضیح کوتاه برای این کلمه کلیدی",
    type: "textarea",
  },
];

function GameKeywordForm({ mode = "create" }) {
  const isEdit = mode === "edit";

  return (
    <SteppedEntityForm
      backPath="/game-keywords"
      createMutation={useCreateGameKeywordMutation}
      entityLabel="کلمه کلیدی بازی"
      fields={fields}
      getQuery={useGetGameKeywordQuery}
      mode={mode}
      title={isEdit ? "ویرایش کلمه کلیدی بازی" : "افزودن کلمه کلیدی بازی"}
      updateMutation={useUpdateGameKeywordMutation}
    />
  );
}

export default GameKeywordForm;
