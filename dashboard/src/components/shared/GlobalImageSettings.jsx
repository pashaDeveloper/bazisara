import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useGetMediaSettingsQuery, useUpdateMediaSettingsMutation } from "@/services/mediaSettingsApi";

function SettingsDialog({ onClose, canEdit }) {
  const { data, isLoading, isError, refetch } = useGetMediaSettingsQuery();
  const [save, { isLoading: isSaving }] = useUpdateMediaSettingsMutation();
  const [form, setForm] = useState(null);
  useEffect(() => { if (data?.data) setForm(data.data); }, [data]);
  useEffect(() => {
    const onKey = (event) => { if (event.key === "Escape" && !isSaving) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, isSaving]);
  const change = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const submit = async (event) => {
    event.preventDefault();
    try {
      const result = await save(form).unwrap();
      toast.success(result.description || "تنظیمات تصویر ذخیره شد");
      onClose();
    } catch (error) {
      toast.error(error?.data?.description || "ذخیره تنظیمات انجام نشد");
    }
  };
  const numberField = (key, label, min, max) => (
    <label className="block space-y-2">
      <span className="text-sm text-zinc-700 dark:text-zinc-300">{label}</span>
      <input className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-black dark:text-white" type="number" required min={min} max={max} step="1" value={form[key]} onChange={(event) => change(key, event.target.value === "" ? "" : Number(event.target.value))} />
    </label>
  );
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onClick={() => { if (!isSaving) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="image-settings-title" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xl dark:border-zinc-700 dark:bg-zinc-950" dir="rtl" onClick={(event) => event.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 id="image-settings-title" className="font-bold text-zinc-900 dark:text-white">تنظیمات عمومی تصاویر</h2>
          <button autoFocus type="button" disabled={isSaving} className="rounded-lg border border-zinc-300 px-3 py-1 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-300" onClick={onClose}>بستن</button>
        </div>
        {isLoading ? <p className="text-sm text-zinc-500">در حال دریافت تنظیمات...</p> : isError ? (
          <div className="space-y-3 text-sm text-red-500"><p>تنظیمات دریافت نشد.</p><button type="button" onClick={refetch}>تلاش دوباره</button></div>
        ) : form ? (
          <form onSubmit={submit} className="space-y-5">
            <p className="text-sm leading-7 text-zinc-500">این تنظیمات برای آپلودهای جدید در همه بخش‌های پنل ذخیره می‌شوند. تصاویر قبلی با تنظیمات زمان آپلود خود باقی می‌مانند.</p>
            <fieldset disabled={!canEdit || isSaving} className="space-y-5 disabled:opacity-60">
              <label className="block space-y-2">
                <span className="flex justify-between text-sm text-zinc-700 dark:text-zinc-300"><span>میزان بلور</span><output>{form.blurAmount} px</output></span>
                <input className="w-full accent-green-600" type="range" min="0" max="40" value={form.blurAmount} onChange={(event) => change("blurAmount", Number(event.target.value))} />
              </label>
              <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
                <div className="h-24 scale-110" style={{ filter: `blur(${form.blurAmount}px)`, background: "radial-gradient(circle at 75% 30%, #fde68a 0 10%, transparent 11%), linear-gradient(145deg, transparent 40%, #166534 41% 65%, #14532d 66%), linear-gradient(#38bdf8, #bae6fd)" }} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {numberField("quality", "کیفیت نسخه کم‌کیفیت (۱ تا ۱۰۰)", 1, 100)}
                {numberField("maxDimension", "بیشترین ضلع پیش‌نمایش (پیکسل)", 16, 256)}
              </div>
              <label className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                <input type="checkbox" className="rounded accent-green-600" checked={form.hashEnabled} onChange={(event) => change("hashEnabled", event.target.checked)} />
                تولید خودکار هش تصویر (BlurHash)
              </label>
              {form.hashEnabled ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {numberField("hashComponentsX", "دقت افقی هش (۱ تا ۹)", 1, 9)}
                  {numberField("hashComponentsY", "دقت عمودی هش (۱ تا ۹)", 1, 9)}
                </div>
              ) : null}
              <p className="text-xs leading-6 text-zinc-500">هش از خود هر تصویر ساخته می‌شود. دقت بیشتر، جزئیات و طول هش را افزایش می‌دهد.</p>
            </fieldset>
            {canEdit ? <button type="submit" disabled={isSaving} className="w-full rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{isSaving ? "در حال ذخیره..." : "ذخیره تنظیمات عمومی"}</button> : <p className="text-xs text-zinc-500">ویرایش تنظیمات توسط مدیر انجام می‌شود.</p>}
          </form>
        ) : null}
      </section>
    </div>, document.body
  );
}

export default function GlobalImageSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const role = useSelector((state) => state.auth.admin?.role);
  if (!["owner", "superAdmin", "admin", "operator"].includes(role)) return null;
  const canEdit = ["owner", "superAdmin", "admin"].includes(role);
  return (
    <>
      <button type="button" className="rounded-xl border border-zinc-300 px-3 py-2 text-xs text-zinc-700 transition hover:border-green-500 dark:border-zinc-700 dark:text-zinc-200" onClick={() => setIsOpen(true)}>تنظیمات تصویر</button>
      {isOpen ? <SettingsDialog canEdit={canEdit} onClose={() => setIsOpen(false)} /> : null}
    </>
  );
}
