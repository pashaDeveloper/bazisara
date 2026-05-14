import React from "react";
import Plus from "@/components/icons/Plus";
import Trash from "@/components/icons/Trash";
import { SingleSelectDropdown } from "@/components/shared/Dropdown";

export const socialNetworkOptions = [
  { label: "Instagram - اینستاگرام", value: "instagram", name: "اینستاگرام" },
  { label: "Telegram - تلگرام", value: "telegram", name: "تلگرام" },
  { label: "X / Twitter - ایکس / توییتر", value: "x", name: "ایکس / توییتر" },
  { label: "YouTube - یوتیوب", value: "youtube", name: "یوتیوب" },
  { label: "Twitch - توییچ", value: "twitch", name: "توییچ" },
  { label: "Discord - دیسکورد", value: "discord", name: "دیسکورد" },
  { label: "Facebook - فیسبوک", value: "facebook", name: "فیسبوک" },
  { label: "LinkedIn - لینکدین", value: "linkedin", name: "لینکدین" },
  { label: "TikTok - تیک‌تاک", value: "tiktok", name: "تیک‌تاک" },
  { label: "Website - وب‌سایت", value: "website", name: "وب‌سایت" },
];

const emptyLink = { platform: "", label: "", url: "" };

function normalizeLinks(value) {
  return (Array.isArray(value) ? value : [])
    .map((item) => ({
      platform: item?.platform || "",
      label: item?.label || socialNetworkOptions.find((option) => option.value === item?.platform)?.name || "",
      url: item?.url || "",
    }));
}

function SocialLinksInput({
  label = "شبکه‌های اجتماعی",
  onChange,
  value = [],
}) {
  const links = normalizeLinks(value);
  const rows = links.length ? links : [{ ...emptyLink }];

  const updateRows = (nextRows) => {
    onChange?.(
      nextRows
        .map((item) => ({
          platform: item.platform || "",
          label: item.label || socialNetworkOptions.find((option) => option.value === item.platform)?.name || "",
          url: String(item.url || "").trim(),
        }))
    );
  };

  const updateRow = (index, patch) => {
    const nextRows = rows.map((item, itemIndex) => {
      if (itemIndex !== index) return item;
      const nextItem = { ...item, ...patch };
      const selectedOption = socialNetworkOptions.find((option) => option.value === nextItem.platform);
      return selectedOption ? { ...nextItem, label: selectedOption.name } : nextItem;
    });
    updateRows(nextRows);
  };

  const addRow = () => {
    updateRows([...rows, { ...emptyLink }]);
  };

  const removeRow = (index) => {
    updateRows(rows.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-zinc-300">{label}</span>
        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-black text-zinc-200 transition hover:border-white hover:text-white"
          onClick={addRow}
          title="افزودن شبکه"
          type="button"
        >
          <Plus />
        </button>
      </div>

      <div className="space-y-3">
        {rows.map((item, index) => (
          <div className="grid gap-3 rounded-xl border border-zinc-800 bg-black p-3 md:grid-cols-[minmax(0,220px)_minmax(0,1fr)_40px]" key={`${item.platform}-${index}`}>
            <SingleSelectDropdown
              label="شبکه"
              name={`social-platform-${index}`}
              onChange={(event) => updateRow(index, { platform: event.target.value })}
              options={socialNetworkOptions}
              value={item.platform}
            />
            <label className="space-y-2">
              <span className="text-xs text-zinc-400">آدرس</span>
              <input
                className="h-12 w-full rounded-xl border border-zinc-800 bg-black px-3 text-left text-sm text-white outline-none transition placeholder:text-right focus:border-white"
                dir="ltr"
                onChange={(event) => updateRow(index, { url: event.target.value })}
                placeholder="https://"
                type="url"
                value={item.url}
              />
            </label>
            <button
              className="mt-6 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 text-zinc-400 transition hover:border-red-500 hover:text-red-400"
              onClick={() => removeRow(index)}
              title="حذف شبکه"
              type="button"
            >
              <Trash className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SocialLinksInput;
