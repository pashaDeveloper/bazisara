import ThumbnailUpload from "@/components/shared/ThumbnailUpload";

function EntityImageStep({
  fieldName = "image",
  imagePreview,
  label,
  setForm,
  setImagePreview,
}) {
  return (
    <div>
      <label className="mb-2 block text-xs text-zinc-400">{label}</label>
      <ThumbnailUpload
        name={fieldName}
        preview={imagePreview}
        setThumbnail={(file) =>
          setForm((prev) => ({
            ...prev,
            [fieldName]: file,
          }))
        }
        setThumbnailPreview={setImagePreview}
        title={`انتخاب ${label}`}
      />
    </div>
  );
}

export default EntityImageStep;

