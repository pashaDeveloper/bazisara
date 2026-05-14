import SteppedEntityForm from "./entityForms/SteppedEntityForm";
import {
  useCreateGenreMutation,
  useGetGenreQuery,
  useUpdateGenreMutation,
} from "../services/genreApi";

const genreFields = [
  { name: "name", title: "نام", label: "نام", placeholder: "مثلا ماجراجویی" },
  { name: "image", title: "تصویر", label: "تصویر ژانر", type: "image" },
  { name: "icon", title: "آیکون", label: "آیکون", type: "icon" },
  {
    name: "description",
    title: "توضیح",
    label: "توضیح",
    placeholder: "توضیح کوتاه برای ژانر",
    type: "textarea",
  },
];

function GenreCreate({ mode = "create" }) {
  const isEdit = mode === "edit";

  return (
    <SteppedEntityForm
      backPath="/genres"
      createMutation={useCreateGenreMutation}
      entityLabel="ژانر"
      fields={genreFields}
      getQuery={useGetGenreQuery}
      mode={mode}
      title={isEdit ? "ویرایش ژانر" : "افزودن ژانر"}
      updateMutation={useUpdateGenreMutation}
    />
  );
}

export default GenreCreate;
