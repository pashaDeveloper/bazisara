export function flattenPlatforms(items = [], depth = 0) {
  return items.flatMap((item) => [
    {
      ...item,
      depth,
      label: `${"— ".repeat(depth)}${item.name}`,
      value: item._id,
    },
    ...flattenPlatforms(item.children || [], depth + 1),
  ]);
}

export function toDateInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

