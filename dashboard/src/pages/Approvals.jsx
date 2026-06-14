import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import ControlPanel from "./ControlPanel";
import {
  useApproveApprovalMutation,
  useGetApprovalsQuery,
  useRejectApprovalMutation,
} from "@/services/adminApi";

const typeLabels = {
  "profile-level": "سطح پروفایل",
  game: "بازی",
  product: "محصول",
  article: "مجله",
  slider: "اسلایدر",
};

function stripHtml(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getPreviewText(item) {
  if (!item) return "";
  if (item.type === "profile-level") {
    return [
      item.excerpt,
      item.email,
      item.phone,
      item.profile?.position,
      item.profile?.department,
      item.profile?.biography,
    ]
      .filter(Boolean)
      .join(" | ");
  }
  return stripHtml(item.content || item.excerpt || item.link || item.slug || "-");
}

function Approvals() {
  const admin = useSelector((state) => state.auth.admin);
  const { data, isLoading } = useGetApprovalsQuery();
  const [approveApproval, { isLoading: isApproving }] = useApproveApprovalMutation();
  const [rejectApproval, { isLoading: isRejecting }] = useRejectApprovalMutation();
  const [selectedKey, setSelectedKey] = useState("");
  const [rejectMode, setRejectMode] = useState(false);
  const [reason, setReason] = useState("");

  const approvals = useMemo(() => data?.data || [], [data]);
  const selectedItem = approvals.find((item) => `${item.type}-${item._id}` === selectedKey) || approvals[0] || null;
  const selectedPreview = getPreviewText(selectedItem);
  const selectedImage = selectedItem?.cover?.url || selectedItem?.avatar?.url || "";

  useEffect(() => {
    if (!approvals.length) {
      setSelectedKey("");
      return;
    }
    if (!selectedKey || !approvals.some((item) => `${item.type}-${item._id}` === selectedKey)) {
      setSelectedKey(`${approvals[0].type}-${approvals[0]._id}`);
    }
  }, [approvals, selectedKey]);

  const handleApprove = async () => {
    if (!selectedItem) return;
    try {
      const response = await approveApproval({ type: selectedItem.type, id: selectedItem._id }).unwrap();
      toast.success(response.description || "محتوا تایید شد");
      setRejectMode(false);
      setReason("");
    } catch (error) {
      toast.error(error?.data?.description || "تایید محتوا انجام نشد");
    }
  };

  const handleReject = async () => {
    if (!selectedItem) return;
    if (!reason.trim()) {
      toast.error("علت رد کردن را بنویسید");
      return;
    }
    try {
      const response = await rejectApproval({ type: selectedItem.type, id: selectedItem._id, reason }).unwrap();
      toast.success(response.description || "پیام رد شدن ثبت شد");
      setRejectMode(false);
      setReason("");
    } catch (error) {
      toast.error(error?.data?.description || "رد کردن محتوا انجام نشد");
    }
  };

  if (admin?.role !== "owner") {
    return (
      <ControlPanel>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
          این بخش فقط برای مدیر کل در دسترس است.
        </div>
      </ControlPanel>
    );
  }

  return (
    <ControlPanel>
      <section className="space-y-4 pb-40">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs font-bold text-zinc-500">صف تایید</p>
          <h1 className="mt-1 text-2xl font-black text-zinc-950 dark:text-white">درخواست‌های در انتظار تایید</h1>
        </div>

        <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
          <div className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="mb-2 flex items-center justify-between px-2">
              <h2 className="text-sm font-black text-zinc-900 dark:text-white">لیست</h2>
              <span className="text-xs text-zinc-500">{approvals.length} مورد</span>
            </div>

            <div className="space-y-2">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-16 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-900" />
                ))
              ) : approvals.length ? (
                approvals.map((item) => {
                  const itemKey = `${item.type}-${item._id}`;
                  const isSelected = itemKey === `${selectedItem?.type}-${selectedItem?._id}`;
                  return (
                    <button
                      key={itemKey}
                      type="button"
                      onClick={() => {
                        setSelectedKey(itemKey);
                        setRejectMode(false);
                        setReason("");
                      }}
                      className={`w-full rounded-xl border p-3 text-right transition ${
                        isSelected
                          ? "border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-zinc-950"
                          : "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="truncate text-sm font-black">{item.title}</span>
                        <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-bold ${isSelected ? "bg-white/15" : "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300"}`}>
                          {typeLabels[item.type] || item.type}
                        </span>
                      </div>
                      <p className={`mt-1 truncate text-xs ${isSelected ? "text-white/70 dark:text-zinc-600" : "text-zinc-500"}`}>
                        {item.excerpt || item.slug || item.email || "-"}
                      </p>
                    </button>
                  );
                })
              ) : (
                <div className="rounded-xl border border-dashed border-zinc-300 p-5 text-center text-sm text-zinc-500 dark:border-zinc-800">
                  چیزی برای تایید وجود ندارد.
                </div>
              )}
            </div>
          </div>

          <div className="min-h-[420px] rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            {selectedItem ? (
              <article className="space-y-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                  {selectedImage ? (
                    <img src={selectedImage} alt="" className="h-36 w-full rounded-xl object-cover lg:w-56" />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
                        در انتظار تایید
                      </span>
                      <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-black text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {typeLabels[selectedItem.type] || selectedItem.type}
                      </span>
                    </div>
                    <h2 className="mt-3 text-2xl font-black leading-9 text-zinc-950 dark:text-white">{selectedItem.title}</h2>
                    <p className="mt-2 text-xs text-zinc-500">
                      {selectedItem.updatedAt ? new Date(selectedItem.updatedAt).toLocaleString("fa-IR") : "-"}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-zinc-50 p-4 text-sm leading-8 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                  {selectedPreview || "محتوایی برای پیش‌نمایش ثبت نشده است."}
                </div>
              </article>
            ) : (
              <div className="flex h-full min-h-[360px] items-center justify-center text-sm text-zinc-500">
                یک مورد را برای پیش‌نمایش انتخاب کنید.
              </div>
            )}
          </div>
        </div>

        {selectedItem ? (
          <div className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-5xl rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-zinc-950 dark:text-white">{selectedItem.title}</p>
                <p className="mt-1 text-xs text-zinc-500">برای تایید مستقیم علت لازم نیست؛ برای رد کردن، علت را بنویسید.</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  disabled={isApproving || isRejecting}
                  onClick={handleApprove}
                  className="h-11 rounded-xl bg-green-600 px-5 text-sm font-black text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  تایید
                </button>
                <button
                  type="button"
                  disabled={isApproving || isRejecting}
                  onClick={() => setRejectMode((value) => !value)}
                  className="h-11 rounded-xl bg-red-600 px-5 text-sm font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  رد کردن
                </button>
              </div>
            </div>
            {rejectMode ? (
              <div className="mt-4 space-y-3">
                <textarea
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm leading-7 text-zinc-800 outline-none transition focus:border-red-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                  placeholder="علت رد شدن را بنویسید تا اپراتور در پیام‌ها ببیند..."
                />
                <button
                  type="button"
                  disabled={isRejecting}
                  onClick={handleReject}
                  className="h-11 rounded-xl bg-zinc-950 px-5 text-sm font-black text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-950"
                >
                  ثبت علت و رد کردن
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
    </ControlPanel>
  );
}

export default Approvals;
