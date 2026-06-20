import React, { useMemo } from "react";
import CloudUpload from "@/components/icons/CloudUpload";
import DisplayImages from "@/components/shared/DisplayImages";

function ThumbnailUpload({
  setThumbnail,
  setThumbnailPreview,
  register,
  isTitle = true,
  compact = false,
  showPreview = true,
  iconSize = 20,
  imageSize = 96,
  border = true,
  title = "انتخاب فایل",
  name = "thumbnail",
  accept = "image/*",
  multiple = false,
  preview,
  poster = "",
  previewShape = "square",
  className = "",
  disabled = false,
}) {
  const inputRegistration = useMemo(() => register || {}, [register]);
  const galleryPreview = useMemo(
    () => (preview ? [{ url: preview, poster, type: preview.startsWith("data:video") || accept.includes("video") ? "video" : "image" }] : []),
    [accept, poster, preview]
  );

  const handleThumbnailPreview = (event) => {
    const files = event.target.files;
    const file = multiple ? Array.from(files || []) : files?.[0] || null;

    if (typeof setThumbnail === "function") {
      setThumbnail(file);
    }

    const previewFile = multiple ? file?.[0] : file;

    if (previewFile && typeof setThumbnailPreview === "function") {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(previewFile);
      return;
    }

    if (!previewFile && typeof setThumbnailPreview === "function") {
      setThumbnailPreview("");
    }
  };

  const handleChange = (event) => {
    if (typeof inputRegistration.onChange === "function") {
      inputRegistration.onChange(event);
    }

    handleThumbnailPreview(event);
  };

  return (
    <div className={`flex flex-col items-center ${compact ? "gap-y-2" : "gap-y-3"} ${className}`.trim()}>
      <label htmlFor={name} className={`relative block w-fit ${disabled ? "pointer-events-none opacity-60" : ""}`.trim()}>
        <span
          className={`inline-flex items-center gap-x-2 text-zinc-100 transition ${
            border
              ? `cursor-pointer rounded-2xl border border-zinc-700 bg-zinc-950 hover:border-white ${compact ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"}`
              : `rounded-md bg-zinc-900 ${compact ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"}`
          }`}
        >
          <CloudUpload style={{ width: iconSize, height: iconSize }} />
          {isTitle && <span>{title}</span>}
        </span>

        <input
          {...inputRegistration}
          accept={accept}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          disabled={disabled}
          id={name}
          multiple={multiple}
          name={name}
          onChange={handleChange}
          type="file"
        />
      </label>

      {showPreview ? <DisplayImages galleryPreview={galleryPreview} imageSize={imageSize} rounded={previewShape} /> : null}

    </div>
  );
}

export default ThumbnailUpload;

