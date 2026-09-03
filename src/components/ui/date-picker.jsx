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
  const d = v instanceof Date ? v : new Date(v)
  return Number.isNaN(d.getTime()) ? null : d
}

// Forma state'i uchun: Date -> "YYYY-MM-DD" (mahalliy vaqt) va aksincha
export const toISODate = (d) => (d ? dayjs(d).format("YYYY-MM-DD") : "")
export const fromISODate = (s) => (s ? dayjs(s, "YYYY-MM-DD").toDate() : null)

const FORMAT = "DD.MM.YYYY"
const MAX = 10

export function DatePicker({
  value,
  onChange,
  placeholder = "KK.OO.YYYY",
  className = "",
  inputClassName = "",
  disabled = false,
  error = false,
  id,
  ...props
}) {
  const autoId = useId()
  const fieldId = id || `date-${autoId}`

  const [open, setOpen] = useState(false)
  const [date, setDate] = useState(() => toDateObj(value))
  const [month, setMonth] = useState(() => toDateObj(value) || new Date())
  const [text, setText] = useState(() => (toDateObj(value) ? dayjs(toDateObj(value)).format(FORMAT) : ""))

  // Tashqi value o'zgarsa — ichki holatni sinxronlaymiz
  useEffect(() => {
    if (value === undefined) return
    const next = toDateObj(value)
    setDate(next)
    setText(next ? dayjs(next).format(FORMAT) : "")
    if (next) setMonth(next)
  }, [value])

  const emit = (d) => {
    setDate(d)
    onChange?.(d)
  }

  const handleType = (e) => {
    const isDeleting = e.target.value.length < text.length
    let v = e.target.value.replace(/\D/g, "")
    if (!isDeleting) {
      if (v.length > 2 && v.length <= 4) v = `${v.slice(0, 2)}.${v.slice(2)}`
      else if (v.length > 4) v = `${v.slice(0, 2)}.${v.slice(2, 4)}.${v.slice(4, 8)}`
    } else if (v.length > 2 && v.length <= 4) v = `${v.slice(0, 2)}.${v.slice(2)}`
    else if (v.length > 4) v = `${v.slice(0, 2)}.${v.slice(2, 4)}.${v.slice(4)}`

    setText(v)
    if (v === "") {
      emit(null)
      return
    }
    if (v.length === MAX) {
      const parsed = dayjs(v, FORMAT, true)
      if (parsed.isValid()) {
        emit(parsed.toDate())
        setMonth(parsed.toDate())
      }
    }
  }

  return (
    <div className={cn("relative", className)}>
      <input
        id={fieldId}
        value={text}
        placeholder={placeholder}
        maxLength={MAX}
        disabled={disabled}
        onChange={handleType}
        onBlur={() => setText(date ? dayjs(date).format(FORMAT) : "")}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault()
            setOpen(true)
          }
        }}
        className={cn(
          "h-9 w-full rounded-md border bg-white px-3 pr-10 text-[14px] font-normal text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.08)] outline-none transition-colors placeholder:text-[#737373] focus-visible:border-[#0052D2] focus-visible:ring-2 focus-visible:ring-[#0052D2]/20 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-card dark:text-white",
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
          <Calendar
            mode="single"
            captionLayout="dropdown"
            startMonth={new Date(new Date().getFullYear() - 5, 0)}
            endMonth={new Date(new Date().getFullYear() + 5, 11)}
            selected={date}
            month={month}
            onMonthChange={setMonth}
            locale={uz}
            onSelect={(d) => {
              if (!d) return
              emit(d)
              setText(dayjs(d).format(FORMAT))
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
