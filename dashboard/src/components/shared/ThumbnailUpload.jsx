import React, { useMemo, useState } from "react";
import CloudUpload from "@/components/icons/CloudUpload";
import DisplayImages from "@/components/shared/DisplayImages";
import {
  deleteUploadedMedia,
  getUploadErrorMessage,
  isMediaObject,
  normalizeUploadedMedia,
  uploadImageWithProgress,
} from "@/utils/immediateUpload";

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
  onRemove,
  preview,
  poster = "",
  uploadState,
  previewShape = "square",
  className = "",
  disabled = false,
  immediateUpload = true,
  onUploadError,
}) {
  const inputRegistration = useMemo(() => register || {}, [register]);
  const [internalUploadState, setInternalUploadState] = useState(null);
  const [internalMedia, setInternalMedia] = useState(null);
  const uploadStateToRender = uploadState || internalUploadState;
  const galleryPreview = useMemo(
    () => (preview ? [{ url: uploadStateToRender?.status === "uploading" || uploadStateToRender?.status === "error" ? uploadStateToRender?.localPreview || preview : preview, poster, type: preview.startsWith("data:video") || accept.includes("video") ? "video" : "image", uploadState: uploadStateToRender }] : []),
    [accept, poster, preview, uploadStateToRender]
  );

  const shouldUploadImmediately = immediateUpload && !multiple && accept.includes("image");

  const handleThumbnailPreview = async (event) => {
    const files = event.target.files;
    const file = multiple ? Array.from(files || []) : files?.[0] || null;

    if (shouldUploadImmediately && file instanceof File) {
      const localPreview = URL.createObjectURL(file);
      setThumbnailPreview?.(localPreview);
      setInternalUploadState({
        error: "",
        localPreview,
        originalSize: file.size,
        progress: 1,
        status: "uploading",
        uploadedSize: null,
      });

      try {
        const response = await uploadImageWithProgress(file, (progress) => {
          setInternalUploadState((prev) => ({
            ...(prev || {}),
            progress,
            status: "uploading",
          }));
        });
        const media = normalizeUploadedMedia(response, "image");
        if (!media) throw new Error("Uploaded image response is invalid");

        setInternalMedia(media);
        setThumbnail?.(media);
        setThumbnailPreview?.(media.url);
        setInternalUploadState((prev) => ({
          ...(prev || {}),
          localPreview: media.url,
          progress: 100,
          status: "done",
          uploadedSize: media.uploadedSize,
        }));
      } catch (error) {
        const message = getUploadErrorMessage(error);
        setThumbnail?.(null);
        setInternalUploadState((prev) => ({
          ...(prev || {}),
          error: message,
          progress: 0,
          status: "error",
        }));
        onUploadError?.(message);
      } finally {
        URL.revokeObjectURL(localPreview);
      }
      return;
    }

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

  const handleRemove = async (item, index) => {
    const current = internalMedia || item?.media || item;
    if (isMediaObject(current)) {
      try {
        await deleteUploadedMedia(current);
      } catch (_) {}
    }
    setThumbnail?.(null);
    setThumbnailPreview?.("");
    setInternalUploadState(null);
    setInternalMedia(null);
    onRemove?.(item, index);
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
          className="hidden"
          disabled={disabled}
          id={name}
          multiple={multiple}
          name={name}
          onChange={handleChange}
          type="file"
        />
      </label>

      {showPreview ? <DisplayImages galleryPreview={galleryPreview} imageSize={imageSize} onRemove={onRemove || shouldUploadImmediately ? handleRemove : undefined} rounded={previewShape} /> : null}

    </div>
  );
}

export default ThumbnailUpload;

