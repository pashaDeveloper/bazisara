"use client";

// Extracted game date picker. Requires React, @radix-ui/react-popover,
// clsx, tailwind-merge, and Tailwind CSS. Include this file in Tailwind content.
// Usage: <DatePickerField label="????? ??????" value={date} onChange={setDate} />
// value and onChange use a Gregorian date string: MM-DD-YYYY.
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs) => twMerge(clsx(inputs));

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverContent = React.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-lg border border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-800 p-4 shadow-lg outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName


const Calendar = (props) => {
  return (
    <svg
    {...props}

  xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
	<path d="M0 0h24v24H0z" fill="none" />
	<path fill="currentColor" d="M19.5 4h-3V2.5a.5.5 0 0 0-1 0V4h-7V2.5a.5.5 0 0 0-1 0V4h-3A2.503 2.503 0 0 0 2 6.5v13A2.503 2.503 0 0 0 4.5 22h15a2.5 2.5 0 0 0 2.5-2.5v-13A2.5 2.5 0 0 0 19.5 4M21 19.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 19.5V11h18zm0-9.5H3V6.5C3 5.672 3.67 5 4.5 5h3v1.5a.5.5 0 0 0 1 0V5h7v1.5a.5.5 0 0 0 1 0V5h3A1.5 1.5 0 0 1 21 6.5z" />
</svg>

  );
};


function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
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

function WheelColumn({ disabled = false, items, label, onSelect, value }) {
  const selectedRef = useRef(null);

  useEffect(() => {
    if (!selectedRef.current || disabled) return;
    selectedRef.current.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [disabled, value]);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black ${
        disabled ? "opacity-45" : ""
      }`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b from-black to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-10 bg-gradient-to-t from-black to-transparent" />
      <div className="pointer-events-none absolute inset-x-3 top-1/2 z-10 h-10 -translate-y-1/2 rounded-xl border border-white/10 bg-white/5" />
      <div className="no-scrollbar max-h-60 overflow-y-auto py-10">
        <div className="px-2 pb-1 text-center text-[11px] text-zinc-500">{label}</div>
        <div className="space-y-1 px-2">
          {items.map((item) => {
            const isSelected = item.value === value;

            return (
              <button
                className={`flex h-10 w-full items-center justify-center rounded-xl text-sm transition ${
                  isSelected ? "bg-white text-black" : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:bg-zinc-900"
                }`}
                disabled={disabled}
                key={item.value}
                onClick={() => onSelect(item.value)}
                ref={isSelected ? selectedRef : null}
                type="button"
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function DatePickerField({ label, onChange, value }) {
  const [isOpen, setIsOpen] = useState(false);
  const [textValue, setTextValue] = useState(value || "");
  const selectedDate = parseInputDate(value);
  const initialDate = selectedDate || new Date();
  const [pickerYear, setPickerYear] = useState(initialDate.getFullYear());
  const [pickerMonth, setPickerMonth] = useState(initialDate.getMonth());
  const [pickerDay, setPickerDay] = useState(initialDate.getDate());
  const [pickerStep, setPickerStep] = useState("year");

  const currentYear = new Date().getFullYear();
  const years = useMemo(
    () => Array.from({ length: 81 }, (_, index) => currentYear - 60 + index),
    [currentYear]
  );
  const monthLabels = [
    "ژانویه",
    "فوریه",
    "مارس",
    "آوریل",
    "مه",
    "ژوئن",
    "ژوئیه",
    "اوت",
    "سپتامبر",
    "اکتبر",
    "نوامبر",
    "دسامبر",
  ];
  const daysInMonth = getDaysInMonth(pickerYear, pickerMonth);
  const days = useMemo(
    () =>
      Array.from({ length: daysInMonth }, (_, index) => ({
        label: String(index + 1).padStart(2, "0"),
        value: index + 1,
      })),
    [daysInMonth]
  );

  useEffect(() => {
    setTextValue(value || "");
  }, [value]);

  useEffect(() => {
    const nextDate = parseInputDate(value) || new Date();
    setPickerYear(nextDate.getFullYear());
    setPickerMonth(nextDate.getMonth());
    setPickerDay(nextDate.getDate());
    setPickerStep("year");
  }, [isOpen, value]);

  useEffect(() => {
    setPickerDay((currentDay) => clamp(currentDay, 1, daysInMonth));
  }, [daysInMonth]);

  const normalizeDigits = (input) => {
    return String(input || "").replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 1776));
  };

  const formatDateInput = (input) => {
    const normalized = normalizeDigits(input).trim();
    const separatedParts = normalized.split(/[/-]/).filter(Boolean);

    if (separatedParts.length === 3) {
      const [month, day, year] = separatedParts.map((part) => part.replace(/[^0-9]/g, ""));
      if (month && day && year) {
        return `${month.padStart(2, "0").slice(0, 2)}-${day.padStart(2, "0").slice(0, 2)}-${year.slice(0, 4)}`;
      }
    }

    const digits = normalized.replace(/[^0-9]/g, "").slice(0, 8);

    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, 8)}`;
  };

  const handleInputChange = (event) => {
    const nextValue = formatDateInput(event.target.value);
    setTextValue(nextValue);
    onChange?.(nextValue);
  };

  const handleYearSelect = (year) => {
    setPickerYear(year);
    setPickerStep("month");
  };

  const handleMonthSelect = (month) => {
    setPickerMonth(month);
    setPickerStep("day");
  };

  const handleDaySelect = (day) => {
    const formatted = formatDateForInput(new Date(pickerYear, pickerMonth, day));
    setTextValue(formatted);
    onChange?.(formatted);
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col gap-y-1">
      <span className="text-sm text-zinc-700 dark:text-gray-100">{label}</span>
      <div className="relative">
        <input
          className="h-10 w-full border bg-white py-2 pl-3 pr-14 text-sm text-zinc-900 outline-none transition focus:border-green-400 focus:ring-0 dark:bg-[#0a2d4d] dark:text-gray-100 dark:focus:border-blue-500"
          inputMode="numeric"
          placeholder="MM-DD-YYYY"
          value={textValue}
          onChange={handleInputChange}
        />
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="absolute right-0 top-0 flex h-full w-12 items-center justify-center rounded-r-primary rounded-l-none border border-l border-gray-300 bg-gray-200 text-gray-700 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              aria-label="باز کردن تقویم"
            >
              <Calendar className="h-5 w-5" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[360px] border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-3">
            <div className="space-y-3" dir="rtl">
              <div className="grid grid-cols-3 gap-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-2 text-center text-[11px] text-zinc-500">
                <div className={pickerStep === "year" ? "text-zinc-950 dark:text-white" : ""}>سال</div>
                <div className={pickerStep === "month" ? "text-zinc-950 dark:text-white" : ""}>ماه</div>
                <div className={pickerStep === "day" ? "text-zinc-950 dark:text-white" : ""}>روز</div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <WheelColumn
                  items={years.map((year) => ({ label: String(year), value: year }))}
                  label="سال"
                  onSelect={handleYearSelect}
                  value={pickerYear}
                />
                <WheelColumn
                  disabled={pickerStep === "year"}
                  items={monthLabels.map((month, index) => ({ label: month, value: index }))}
                  label="ماه"
                  onSelect={handleMonthSelect}
                  value={pickerMonth}
                />
                <WheelColumn
                  disabled={pickerStep !== "day"}
                  items={days}
                  label="روز"
                  onSelect={handleDaySelect}
                  value={pickerDay}
                />
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black px-3 py-2 text-xs text-zinc-600 dark:text-zinc-400">
                <span>
                  مرحله بعدی: {pickerStep === "year" ? "ماه" : pickerStep === "month" ? "روز" : "ثبت"}
                </span>
                <button
                  className="rounded-lg border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-zinc-700 dark:text-zinc-300 transition hover:border-white hover:text-zinc-950 dark:text-white"
                  onClick={() => setIsOpen(false)}
                  type="button"
                >
                  بستن
                </button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

export default DatePickerField;
