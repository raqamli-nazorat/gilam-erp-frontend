"use client"

import * as React from "react"
import { useEffect, useId, useState } from "react"
import dayjs from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"
import { uz } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

dayjs.extend(customParseFormat)

// Date | string | null -> JS Date | null
const toDateObj = (v) => {
  if (!v) return null
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v
  if (typeof v === "string") {
    const s = v.trim()
    if (!s) return null
    if (/^\d{2}\.\d{2}\.\d{4}/.test(s)) {
      const p = dayjs(s, s.length > 10 ? DATETIME_FORMAT : DATE_FORMAT, true)
      if (p.isValid()) return p.toDate()
    }
    const d = new Date(s)
    return Number.isNaN(d.getTime()) ? null : d
  }
  return null
}

// Forma state'i uchun: Date -> "YYYY-MM-DD" (mahalliy vaqt) va aksincha
export const toISODate = (d) => (d ? dayjs(d).format("YYYY-MM-DD") : "")
export const fromISODate = (s) => (s ? dayjs(s, "YYYY-MM-DD").toDate() : null)

const DATE_FORMAT = "DD.MM.YYYY"
const DATETIME_FORMAT = "DD.MM.YYYY HH:mm"
const DATE_MAX = 10   // "DD.MM.YYYY"
const DATETIME_MAX = 16 // "DD.MM.YYYY HH:mm"

// Faqat raqamlardan format hosil qiladi — sana yoki sana+vaqt
function applyMask(raw, showTime) {
  // Faqat raqamlarni olamiz, max 8 yoki 12 ta
  const maxDigits = showTime ? 12 : 8
  let d = raw.replace(/\D/g, "").slice(0, maxDigits)

  if (!showTime) {
    // Faqat sana: DD.MM.YYYY
    if (d.length <= 2) return d
    if (d.length <= 4) return `${d.slice(0, 2)}.${d.slice(2)}`
    return `${d.slice(0, 2)}.${d.slice(2, 4)}.${d.slice(4, 8)}`
  }

  // Sana + vaqt: DD.MM.YYYY HH:mm
  let out = ""
  const date = d.slice(0, 8)
  const time = d.slice(8, 12)

  if (date.length <= 2) out = date
  else if (date.length <= 4) out = `${date.slice(0, 2)}.${date.slice(2)}`
  else out = `${date.slice(0, 2)}.${date.slice(2, 4)}.${date.slice(4, 8)}`

  if (time.length > 0) {
    // Soat validatsiyasi: birinchi raqam max 2, ikki raqam max 23
    let hh = time.slice(0, 2)
    if (hh.length === 1 && parseInt(hh) > 2) hh = "2"
    if (hh.length === 2 && parseInt(hh) > 23) hh = "23"

    out += ` ${hh}`

    // Daqiqa validatsiyasi: birinchi raqam max 5, ikki raqam max 59
    if (time.length > 2) {
      let mm = time.slice(2, 4)
      if (mm.length === 1 && parseInt(mm) > 5) mm = "5"
      if (mm.length === 2 && parseInt(mm) > 59) mm = "59"
      out += `:${mm}`
    }
  }

  return out
}

// Matndan Date obyektini ajratib oladi
function parseText(text, showTime) {
  if (!showTime) {
    const parsed = dayjs(text, DATE_FORMAT, true)
    return parsed.isValid() ? parsed.toDate() : null
  }
  const parsed = dayjs(text, DATETIME_FORMAT, true)
  return parsed.isValid() ? parsed.toDate() : null
}

// Date-dan ko'rsatish matni
function formatText(d, showTime) {
  if (!d) return ""
  return dayjs(d).format(showTime ? DATETIME_FORMAT : DATE_FORMAT)
}

export function DatePicker({
  value,
  onChange,
  placeholder,
  showTime = false,
  label,
  className = "",
  inputClassName = "",
  disabled = false,
  error = false,
  id,
  ...props
}) {
  const autoId = useId()
  const fieldId = id || `date-${autoId}`
  const MAX = showTime ? DATETIME_MAX : DATE_MAX
  const defaultPlaceholder = placeholder ?? (showTime ? "KK.OO.YYYY SS:DD" : "KK.OO.YYYY")

  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const [date, setDate] = useState(() => toDateObj(value))
  const [month, setMonth] = useState(() => toDateObj(value) || new Date())
  const [text, setText] = useState(() => formatText(toDateObj(value), showTime))

  const isActive = focused || Boolean(text) || open

  // Tashqi value o'zgarsa — ichki holatni sinxronlaymiz
  useEffect(() => {
    if (value === undefined) return
    const next = toDateObj(value)
    setDate(next)
    setText(formatText(next, showTime))
    if (next) setMonth(next)
  }, [value, showTime])

  const emit = (d) => {
    setDate(d)
    onChange?.(d)
  }

  const handleType = (e) => {
    const raw = e.target.value
    const masked = applyMask(raw, showTime)
    setText(masked)

    if (masked === "") {
      emit(null)
      return
    }
    if (masked.length === MAX) {
      const parsed = parseText(masked, showTime)
      if (parsed) {
        emit(parsed)
        setMonth(parsed)
      }
    }
  }

  // Kalendardan sana tanlanganida: showTime bo'lsa vaqtni 23:59 qilamiz
  const handleCalendarSelect = (d) => {
    if (!d) return
    let chosen = d
    if (showTime) {
      chosen = new Date(d)
      chosen.setHours(23, 59, 0, 0)
    }
    emit(chosen)
    setText(formatText(chosen, showTime))
    setOpen(false)
  }

  const calendarNode = (
    <Calendar
      mode="single"
      captionLayout="dropdown"
      startMonth={new Date(new Date().getFullYear() - 5, 0)}
      endMonth={new Date(new Date().getFullYear() + 5, 11)}
      selected={date}
      month={month}
      onMonthChange={setMonth}
      locale={uz}
      onSelect={handleCalendarSelect}
    />
  )

  if (label) {
    return (
      <div
        onClick={() => document.getElementById(fieldId)?.focus()}
        className={cn(
          "relative flex h-10 flex-col justify-end rounded-[10px] border bg-white px-3 pb-1 pt-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all duration-200 cursor-text focus-within:border-[#0052D2] focus-within:ring-2 focus-within:ring-[#0052D2]/20 dark:bg-card",
          error ? "border-destructive" : "border-[#E5E5E5] dark:border-white/10",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        <label
          htmlFor={fieldId}
          className={cn(
            "pointer-events-none absolute left-3 transition-all duration-200 ease-out select-none",
            isActive
              ? "top-1 text-[11px] font-normal leading-[14px] text-[#737373] dark:text-muted-foreground"
              : "top-1/2 -translate-y-1/2 text-[14px] font-normal text-[#737373] dark:text-muted-foreground"
          )}
        >
          {label}
        </label>
        <input
          id={fieldId}
          value={text}
          placeholder={isActive ? defaultPlaceholder : ""}
          maxLength={MAX}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false)
            setText(formatText(date, showTime))
          }}
          onChange={handleType}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true) }
          }}
          className={cn(
            "h-5 w-full bg-transparent pr-7 text-[13px] font-normal text-[#0A0A0A] outline-none transition-opacity duration-150 placeholder:text-[#A3A3A3] dark:text-white",
            !isActive && "opacity-0",
            inputClassName
          )}
          {...props}
        />

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            render={
              <button
                type="button"
                disabled={disabled}
                aria-label="Sanani tanlash"
                className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-[#737373] transition-colors hover:bg-[#F5F5F5] hover:text-[#0A0A0A] disabled:opacity-50 dark:hover:bg-white/5 dark:hover:text-white cursor-pointer"
              >
                <CalendarIcon className="size-4" />
              </button>
            }
          />
          <PopoverContent className="w-auto overflow-hidden p-0" align="end" alignOffset={-8} sideOffset={10}>
            {calendarNode}
          </PopoverContent>
        </Popover>
      </div>
    )
  }

  return (
    <div className={cn("relative", className)}>
      <input
        id={fieldId}
        value={text}
        placeholder={defaultPlaceholder}
        maxLength={MAX}
        disabled={disabled}
        onChange={handleType}
        onBlur={() => setText(formatText(date, showTime))}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true) }
        }}
        className={cn(
          "h-10 w-full rounded-[10px] border bg-white px-3 pr-10 text-[14px] font-normal text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] outline-none transition-colors placeholder:text-[#737373] focus-visible:border-[#0052D2] focus-visible:ring-2 focus-visible:ring-[#0052D2]/20 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-card dark:text-white",
          error ? "border-destructive" : "border-[#E5E5E5] dark:border-white/10",
          inputClassName
        )}
        {...props}
      />

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <button
              type="button"
              disabled={disabled}
              aria-label="Sanani tanlash"
              className="absolute right-1.5 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-[#737373] transition-colors hover:bg-[#F5F5F5] hover:text-[#0A0A0A] disabled:opacity-50 dark:hover:bg-white/5 dark:hover:text-white"
            >
              <CalendarIcon className="size-4" />
            </button>
          }
        />
        <PopoverContent className="w-auto overflow-hidden p-0" align="end" alignOffset={-8} sideOffset={10}>
          {calendarNode}
        </PopoverContent>
      </Popover>
    </div>
  )
}
