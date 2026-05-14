import ThumbnailUpload from "@/components/shared/ThumbnailUpload";

function CategoryImageStep({ imagePreview, setForm, setImagePreview }) {
  return (
    <div>
      <label className="mb-2 block text-xs text-zinc-400">تصویر</label>
      <ThumbnailUpload
        name="image"
        preview={imagePreview}
        setThumbnail={(file) =>
          setForm((prev) => ({
            ...prev,
            image: file,
          }))
        }
        setThumbnailPreview={setImagePreview}
        title="انتخاب تصویر دسته‌بندی"
      />
    </div>
  );
}

export default CategoryImageStep;
