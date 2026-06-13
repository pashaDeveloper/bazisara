import React, { useState } from "react";
import Apply from "@/components/icons/Apply";
import Reject from "@/components/icons/Reject";
import Trash from "@/components/icons/Trash";

const defaultTriggerClassName =
  "delete-button inline-flex h-9 w-9 items-center justify-center disabled:cursor-not-allowed disabled:opacity-60";

function getEntityLabel(message) {
  return String(message || "")
    .replace(/^این\s+/, "")
    .replace(/\s+حذف شود\؟?$/, "")
    .replace(/\?$/, "")
    .trim();
}

function DeleteModal({
  ariaLabel = "حذف",
  iconClassName = "h-4 w-4",
  isLoading = false,
  itemTitle = "",
  message = "این مورد حذف شود؟",
  onDelete,
  triggerClassName = defaultTriggerClassName,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const entityLabel = getEntityLabel(message) || "مورد";
  const confirmMessage = itemTitle
    ? `آیا از پاک کردن ${entityLabel} ${itemTitle} مطمئن هستین؟`
    : `آیا از پاک کردن ${entityLabel} مطمئن هستین؟`;

  const handleDelete = async () => {
    if (isLoading) return;
    await onDelete?.();
    setIsOpen(false);
  };

  return (
    <>
      <button
        aria-label={ariaLabel}
        className={triggerClassName}
        disabled={isLoading}
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <Trash className={iconClassName} />
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:p-6">
          <div className="mb-2 w-full rounded-2xl border border-zinc-700 bg-zinc-950 p-5 text-right shadow-2xl shadow-black/50 sm:max-w-md">
            <div className="text-center">
              <h3 className="text-lg font-bold leading-8 text-white">{confirmMessage}</h3>
              <p className="mt-2 text-sm text-red-400">این عملیات غیر قابل بازگشت است.</p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                className="reject-button h-11 gap-2 rounded-xl text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isLoading}
                onClick={handleDelete}
                type="button"
              >
                {isLoading ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-red-200 border-t-transparent" />
                ) : (
                  <Reject className="h-5 w-5 text-red-400" />
                )}
                تایید
              </button>
              <button
                className="apply-button h-11 gap-2 rounded-xl text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isLoading}
                onClick={() => setIsOpen(false)}
                type="button"
              >
                <Apply className="h-5 w-5 text-green-400" />
                لغو
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default DeleteModal;
