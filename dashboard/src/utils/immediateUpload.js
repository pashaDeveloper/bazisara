export function formatFileSize(size) {
  const value = Number(size || 0);
  if (!value) return "";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(2)} MB`;
}

export function isMediaObject(value) {
  return Boolean(value && typeof value === "object" && !(value instanceof File) && value.url);
}

export function normalizeUploadedMedia(response, fallbackType = "image") {
  const file = response?.data || response;
  if (!file?.url) return null;

  return {
    blur: file.blur,
    mobile: file.mobile,
    position: file.position,
    url: file.url,
    public_id: file.public_id || file.key || "",
    type: file.resource_type === "video" ? "video" : file.type || fallbackType,
    originalSize: file.original_size || file.originalSize || null,
    uploadedSize: file.size || file.bytes || null,
    storage: file.storage || "",
  };
}

export function getUploadErrorMessage(error) {
  if (!error) return "خطای نامشخص در آپلود";
  if (typeof error === "string") return error;
  if (error?.data?.description) return error.data.description;
  if (error?.data?.message) return error.data.message;
  if (error?.description) return error.description;
  if (error?.message) return error.message;
  if (error?.status) return `خطای آپلود با کد ${error.status}`;
  return "خطای نامشخص در آپلود";
}

export function uploadImageWithProgress(file, onProgress, options = {}) {
  const baseUrl = String(import.meta.env.VITE_BASE_URL || "").replace(/\/$/, "");
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
  const formData = new FormData();
  formData.append("file", file);
  if (options.entityType) formData.append("entityType", options.entityType);
  if (options.entityName) formData.append("entityName", options.entityName);
  if (options.requireEntityName) formData.append("requireEntityName", "true");
  if (options.resizeWidth) formData.append("resizeWidth", String(options.resizeWidth));
  if (options.resizeHeight) formData.append("resizeHeight", String(options.resizeHeight));
  if (options.resizeFit) formData.append("resizeFit", String(options.resizeFit));
  if (options.allowEnlargement) formData.append("allowEnlargement", "true");

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${baseUrl}/uploads/arvan/create`);
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) {
        onProgress?.(35);
        return;
      }
      onProgress?.(Math.min(95, Math.round((event.loaded / event.total) * 100)));
    };

    xhr.onload = () => {
      let payload = null;
      try {
        payload = JSON.parse(xhr.responseText || "{}");
      } catch (_) {
        payload = { description: xhr.responseText };
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve(payload);
        return;
      }

      reject({
        status: xhr.status,
        message: payload?.description || payload?.message || xhr.statusText,
        data: payload,
      });
    };

    xhr.onerror = () => reject({ message: "ارتباط با سرور آپلود برقرار نشد؛ CORS یا شبکه را بررسی کنید" });
    xhr.onabort = () => reject({ message: "آپلود لغو شد" });
    xhr.send(formData);
  });
}

export async function deleteUploadedMedia(media) {
  if (!media?.public_id) return;

  const baseUrl = String(import.meta.env.VITE_BASE_URL || "").replace(/\/$/, "");
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");

  await fetch(`${baseUrl}/uploads/arvan/delete`, {
    body: JSON.stringify({
      public_id: media.public_id,
      resource_type: media.type || "image",
    }),
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    method: "DELETE",
  });
}

export function mediaToFormValue(value) {
  if (value instanceof File) return value;
  if (isMediaObject(value)) return JSON.stringify(value);
  return value;
}
