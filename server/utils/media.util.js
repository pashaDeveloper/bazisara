function parseMediaValue(value, fallbackType = "image") {
  if (value === undefined || value === null || value === "") return undefined;

  const raw =
    typeof value === "string"
      ? (() => {
          try {
            return JSON.parse(value);
          } catch (_) {
            return { url: value };
          }
        })()
      : value;

  if (!raw?.url) return undefined;

  return {
    blur: raw.blur || undefined,
    mobile: raw.mobile || undefined,
    position: raw.position || undefined,
    url: String(raw.url || "").trim(),
    public_id: String(raw.public_id || raw.key || "").trim(),
    storage: String(raw.storage || "").trim(),
    type: raw.type === "video" || raw.resource_type === "video" ? "video" : fallbackType,
  };
}

function mediaFromUpload(file, fallbackType = "image") {
  if (!file) return undefined;
  return {
    blur: file.blur,
    mobile: file.mobile,
    position: file.position,
    url: file.url || file.path || "",
    public_id: file.public_id || file.key || file.filename || "",
    storage: file.storage || "",
    type: file.resource_type === "video" ? "video" : file.type || fallbackType,
  };
}

function mediaFromUploadOrBody(uploadedFiles, fieldName, bodyValue, fallbackType = "image") {
  return mediaFromUpload(uploadedFiles?.[fieldName]?.[0], fallbackType) || parseMediaValue(bodyValue, fallbackType);
}

module.exports = {
  mediaFromUpload,
  mediaFromUploadOrBody,
  parseMediaValue,
};
