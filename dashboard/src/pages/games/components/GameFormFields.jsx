import React, { useEffect, useMemo, useRef, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Calendar from "@/components/icons/Calendar";
import { formatDateForInput, parseInputDate } from "../gameFormUtils";

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function TextField({ label, name, onChange, placeholder, type = "text", value, dir }) {
  return (
    <label className="space-y-2">
      <span className="text-sm text-zinc-300">{label}</span>
      <input
        className="w-full rounded-xl border border-zinc-800 bg-black px-3 py-3 text-sm text-white outline-none transition focus:border-white"
        dir={dir}
        name={name}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </label>
  );
}

export function TextareaField({ label, name, onChange, rows = 4, value }) {
  return (
    <label className="space-y-2">
      <span className="text-sm text-zinc-300">{label}</span>
      <textarea
        className="w-full rounded-xl border border-zinc-800 bg-black px-3 py-3 text-sm text-white outline-none transition focus:border-white"
        name={name}
        onChange={onChange}
        rows={rows}
        value={value}
      />
    </label>
  );
}

function WheelColumn({ disabled = false, items, label, onSelect, value }) {
  const selectedRef = useRef(null);

  useEffect(() => {
    if (!selectedRef.current || disabled) return;
    selectedRef.current.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [disabled, value]);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-zinc-800 bg-black ${
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
                  isSelected ? "bg-white text-black" : "text-zinc-300 hover:bg-zinc-900"
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
    const digits = normalizeDigits(input)
      .replace(/[^0-9]/g, "")
      .slice(0, 8);

    if (digits.length <= 4) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
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
    <div className="space-y-2">
      <span className="text-sm text-zinc-300">{label}</span>
      <div className="relative">
        <input
          className="w-full rounded-xl border border-zinc-800 bg-black px-3 py-3 pr-11 text-sm text-white outline-none transition focus:border-white"
          inputMode="numeric"
          placeholder="YYYY-MM-DD"
          value={textValue}
          onChange={handleInputChange}
        />
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex h-full items-center justify-center rounded-r-xl border-l border-zinc-800 bg-zinc-900 px-3 text-zinc-400 transition hover:text-white"
              aria-label="باز کردن تقویم"
            >
              <Calendar className="h-4 w-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[360px] border-zinc-800 bg-zinc-950 p-3">
            <div className="space-y-3" dir="rtl">
              <div className="grid grid-cols-3 gap-2 rounded-2xl border border-zinc-800 bg-black p-2 text-center text-[11px] text-zinc-500">
                <div className={pickerStep === "year" ? "text-white" : ""}>سال</div>
                <div className={pickerStep === "month" ? "text-white" : ""}>ماه</div>
                <div className={pickerStep === "day" ? "text-white" : ""}>روز</div>
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

              <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-black px-3 py-2 text-xs text-zinc-400">
                <span>
                  مرحله بعدی: {pickerStep === "year" ? "ماه" : pickerStep === "month" ? "روز" : "ثبت"}
                </span>
                <button
                  className="rounded-lg border border-zinc-800 px-3 py-1.5 text-zinc-300 transition hover:border-white hover:text-white"
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

