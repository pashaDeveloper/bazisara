import React, { useEffect, useMemo, useState } from "react";
import NextIcon from "@/components/icons/Next";
import PrevIcon from "@/components/icons/Prev";

const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

function getPageNumbers(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) pages.push("start-ellipsis");

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  if (end < totalPages - 1) pages.push("end-ellipsis");

  pages.push(totalPages);
  return pages;
}

export function usePagination(items = [], initialPageSize = 5, resetKey = "") {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    setCurrentPage(1);
  }, [totalItems, pageSize, resetKey]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return items.slice(startIndex, startIndex + pageSize);
  }, [currentPage, items, pageSize]);

  return {
    currentPage,
    endItem: totalItems ? Math.min(currentPage * pageSize, totalItems) : 0,
    pageSize,
    paginatedItems,
    setCurrentPage,
    setPageSize,
    startItem: totalItems ? (currentPage - 1) * pageSize + 1 : 0,
    totalItems,
    totalPages,
  };
}

export function usePaginationState(initialPageSize = 5, resetKey = "") {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize, resetKey]);

  return {
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
  };
}

function Pagination({
  currentPage,
  endItem,
  onPageChange,
  onPageSizeChange,
  pageSize,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  startItem,
  totalItems,
  totalPages,
}) {
  const resolvedCurrentPage = currentPage || 1;
  const resolvedPageSize = pageSize || 5;
  const resolvedTotalPages = totalPages || Math.max(1, Math.ceil(totalItems / resolvedPageSize));
  const resolvedStartItem =
    startItem ?? (totalItems ? (resolvedCurrentPage - 1) * resolvedPageSize + 1 : 0);
  const resolvedEndItem =
    endItem ?? (totalItems ? Math.min(resolvedCurrentPage * resolvedPageSize, totalItems) : 0);
  const pageNumbers = getPageNumbers(resolvedCurrentPage, resolvedTotalPages);
  const isFirstPage = resolvedCurrentPage <= 1;
  const isLastPage = resolvedCurrentPage >= resolvedTotalPages;

  useEffect(() => {
    if (totalItems && resolvedCurrentPage > resolvedTotalPages) {
      onPageChange(resolvedTotalPages);
    }
  }, [onPageChange, resolvedCurrentPage, resolvedTotalPages, totalItems]);

  if (!totalItems || totalItems <= Math.min(...pageSizeOptions)) {
    return null;
  }

  const buttonBase =
    "inline-flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm transition disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="mt-5 flex flex-col gap-4 border-t border-zinc-800 pt-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col gap-3 text-xs text-zinc-500 sm:flex-row sm:items-center">
        <span>
          نمایش {resolvedStartItem} تا {resolvedEndItem} از {totalItems} مورد
        </span>
        <label className="flex items-center gap-2">
          <span>تعداد در صفحه</span>
          <select
            className="h-10 rounded-lg border border-zinc-800 bg-black px-3 text-sm text-white outline-none transition focus:border-white"
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            value={resolvedPageSize}
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <nav aria-label="صفحه‌بندی" className="flex flex-wrap items-center gap-2">
        <button
          aria-label="صفحه قبلی"
          className={`${buttonBase} border-zinc-800 text-zinc-300 hover:border-white hover:text-white`}
          disabled={isFirstPage}
          onClick={() => onPageChange(resolvedCurrentPage - 1)}
          type="button"
        >
          <NextIcon className="h-4 w-4" />
        </button>

        {pageNumbers.map((page) =>
          typeof page === "number" ? (
            <button
              aria-current={page === resolvedCurrentPage ? "page" : undefined}
              className={
                page === resolvedCurrentPage
                  ? `${buttonBase} border-green-400 bg-green-500 text-white shadow-lg shadow-green-500/20`
                  : `${buttonBase} border-zinc-800 text-zinc-300 hover:border-white hover:text-white`
              }
              key={page}
              onClick={() => onPageChange(page)}
              type="button"
            >
              {page}
            </button>
          ) : (
            <span className="inline-flex h-10 min-w-10 items-center justify-center text-zinc-600" key={page}>
              ...
            </span>
          )
        )}

        <button
          aria-label="صفحه بعدی"
          className={`${buttonBase} border-zinc-800 text-zinc-300 hover:border-white hover:text-white`}
          disabled={isLastPage}
          onClick={() => onPageChange(resolvedCurrentPage + 1)}
          type="button"
        >
          <PrevIcon className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
}

export default Pagination;

