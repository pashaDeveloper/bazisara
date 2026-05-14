export const filterTypes = [
  { value: "text", label: "متن" },
  { value: "number", label: "عدد" },
  { value: "range", label: "بازه" },
  { value: "boolean", label: "درست / غلط" },
  { value: "select", label: "انتخاب تکی" },
  { value: "multi_select", label: "چند انتخابی" },
  { value: "color", label: "رنگ" },
];

export const optionTypes = ["select", "multi_select", "color"];
export const numericTypes = ["number", "range"];

export function parseOptions(value) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, rawValue] = line.split("|").map((item) => item.trim());
      return {
        label,
        value: rawValue || label,
      };
    });
}

export function stringifyOptions(options = []) {
  return options
    .map((option) => `${option.label}${option.value !== option.label ? `|${option.value}` : ""}`)
    .join("\n");
}

export function getTypeLabel(type) {
  return filterTypes.find((item) => item.value === type)?.label || type;
}
