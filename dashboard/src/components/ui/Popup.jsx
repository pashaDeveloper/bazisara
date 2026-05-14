import React, { useEffect } from "react";

function Popup({ children, footer, isOpen, onClose, title }) {
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6" role="dialog" aria-modal="true">
      <button className="absolute inset-0 bg-black/70" onClick={onClose} type="button" aria-label="بستن" />
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <h2 className="text-base font-bold text-white">{title}</h2>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 transition hover:border-white hover:text-white"
            onClick={onClose}
            type="button"
            aria-label="بستن"
          >
            ×
          </button>
        </div>
        <div className="max-h-[calc(90vh-140px)] overflow-y-auto px-5 py-5">{children}</div>
        {footer ? <div className="border-t border-zinc-800 px-5 py-4">{footer}</div> : null}
      </div>
    </div>
  );
}

export default Popup;
