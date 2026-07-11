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

function formatFileSize(size) {
  const value = Number(size || 0);
  if (!value) return "";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(2)} MB`;
}

function UploadOverlay({ state }) {
  if (!state || state.status !== "uploading") return null;

  const progress = Math.max(0, Math.min(100, Number(state.progress || 0)));

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center rounded-full bg-black/45 text-white">
      <span
        className="h-8 w-8 animate-spin rounded-full"
        style={{
          background: `conic-gradient(rgb(255 255 255) ${progress * 3.6}deg, rgba(255,255,255,.24) 0deg)`,
          WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px))",
          mask: "radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px))",
        }}
      />
    </div>
  );
}

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
  profilePreview = false,
  previewShape = "square",
  className = "",
  disabled = false,
  immediateUpload = false,
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

  const renderProfilePreview = () => {
    const item = galleryPreview[0];
    const previewUrl = item?.url || "";
    const isVideoPreview = item?.type === "video" || accept.includes("video");
    const originalSize = formatFileSize(uploadStateToRender?.originalSize);
    const uploadedSize = formatFileSize(uploadStateToRender?.uploadedSize);

    return (
      <div className="mb-4 flex flex-col items-center gap-2">
        <div className="profile-container profile-avatar-container shine-effect group mb-0 flex justify-center rounded-full">
          {previewUrl ? (
            isVideoPreview ? (
              <video
                className="profile-pic h-[100px] w-[100px] rounded-full object-cover"
                height={100}
                muted
                playsInline
                poster={poster || undefined}
                src={previewUrl}
                width={100}
              />
            ) : (
              <img
                alt={name}
                className="profile-pic h-[100px] w-[100px] rounded-full"
                height={100}
                src={previewUrl}
                width={100}
              />
            )
          ) : (
            <div className="profile-pic h-[100px] w-[100px] animate-pulse rounded-full bg-white/50 dark:bg-white/20" />
          )}
          <UploadOverlay state={uploadStateToRender} />
          {previewUrl ? (
            <>
              {typeof onRemove === "function" ? (
                <button
                  aria-label="حذف تصویر"
                  className="absolute right-3 top-1/2 z-40 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-red-600/90 !text-white opacity-0 shadow-lg transition hover:bg-red-500 group-hover:opacity-100 [&_svg]:!text-white [&_svg]:stroke-white"
                  onClick={() => handleRemove(item, 0)}
                  type="button"
                >
                  <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "#fff" }} viewBox="0 0 24 24">
                    <path d="M3 6h18" />
                    <path d="M8 6V4h8v2" />
                    <path d="M6 6l1 16h10l1-16" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                  </svg>
                </button>
              ) : null}
              <label
                aria-label="ویرایش تصویر"
                className="absolute left-3 top-1/2 z-40 inline-flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-gray-200 text-gray-700 opacity-0 shadow-lg transition hover:bg-gray-300 group-hover:opacity-100 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                htmlFor={name}
                title="ویرایش تصویر"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
              </label>
            </>
          ) : null}
        </div>
        {originalSize || uploadedSize ? (
          <div className="flex flex-wrap justify-center gap-1 text-[10px]">
            {originalSize ? <span className="rounded-md bg-red-600/90 px-1.5 py-0.5 !text-white">قبل: {originalSize}</span> : null}
            {uploadedSize ? <span className="rounded-md bg-emerald-600/90 px-1.5 py-0.5 !text-white">بعد: {uploadedSize}</span> : null}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className={`flex flex-col items-center ${compact ? "gap-y-2" : "gap-y-3"} ${className}`.trim()}>
      {showPreview && profilePreview ? renderProfilePreview() : null}

      <label htmlFor={name} className={`relative block w-fit ${disabled ? "pointer-events-none opacity-60" : ""}`.trim()}>
        <span className="py-1 px-4 flex flex-row gap-x-2 dark:bg-blue-100 bg-green-100 border dark:text-blue-700 dark:border-blue-900 border-green-900 text-green-900 rounded-secondary w-fit text-sm cursor-pointer">
          <CloudUpload className="h-5 w-5 dark:!text-blue-700" />
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

      {showPreview ? (
        profilePreview ? null : (
          <DisplayImages galleryPreview={galleryPreview} imageSize={imageSize} onRemove={onRemove || shouldUploadImmediately ? handleRemove : undefined} rounded={previewShape} />
        )
      ) : null}

    </div>
  );
}

export default ThumbnailUpload;

