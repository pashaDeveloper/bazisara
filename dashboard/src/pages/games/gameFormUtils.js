export function toIdArray(value) {
  return (value || []).map((item) => item?._id || item).filter(Boolean);
}

export function formatDate(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export function formatDateForInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseInputDate(value) {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
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

