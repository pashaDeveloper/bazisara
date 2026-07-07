export function toIdArray(value) {
  return (value || []).map((item) => item?._id || item).filter(Boolean);
}

export function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return formatDateForInput(date);
}

export function makeGameSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^\u0600-\u06ff\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function formatDateForInput(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}-${day}-${year}`;
}

export function parseInputDate(value) {
  if (!value) return undefined;
  const parts = String(value).split(/[/-]/).map(Number);
  if (parts.length !== 3) return undefined;
  const [first, second, third] = parts;
  const [year, month, day] = first > 31 ? [first, second, third] : [third, first, second];
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
}

export function normalizeOptionValue(value, options, fallback = "") {
  if (!value || (Array.isArray(value) && value.length === 0)) return fallback;
  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeOptionValue(item, options, null))
      .filter(Boolean);
  }

  const selectedOption = options.find((option) => {
    return option.value === value || option.legacyValues?.includes(value);
  });

  return selectedOption?.value || value;
}

export function stripHtml(value) {
  return String(value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

