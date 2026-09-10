import * as React from "react"
import { DayPicker, getDefaultClassNames } from "react-day-picker"
import { format } from "date-fns"
import dayjs from "dayjs"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, CheckIcon } from "lucide-react"

const CalendarContext = React.createContext({
  daterange: false,
  selected: null,
  onSelect: null,
})

// ─── Custom Dropdown ───────────────────────────────────────────────────────────
// Native <select> Chrome dark mode da oq fon bilan chiqadi. Custom dropdown ishlatamiz.
function CalendarDropdown({ value, onChange, options, className, ...props }) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef(null)

  React.useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  const selected = options?.find((o) => String(o.value) === String(value))

  return (
    <div ref={ref} className="relative" {...props}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1 rounded-md px-2 py-0.5 text-sm font-medium",
          "hover:bg-accent cursor-pointer select-none transition-colors text-foreground",
          className
        )}
      >
        <span>{selected?.label}</span>
        <ChevronDownIcon className={cn("size-3.5 opacity-60 transition-transform duration-150", open && "rotate-180")} />
      </button>

      {open && (
        <div
          className={cn(
            "absolute top-full left-0 z-50 mt-1 max-h-52 min-w-[8rem] overflow-y-auto rounded-[12px] border border-[#E5E5E5] bg-white p-1.5 shadow-[0px_8px_24px_0px_#01091C1F]",
            "text-popover-foreground dark:border-white/10 dark:bg-card"
          )}
        >
          {options?.map((opt) => {
            const active = String(opt.value) === String(value)
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange?.({ target: { value: String(opt.value) } })
                  setOpen(false)
                }}
                className={cn(
                  "flex h-9 w-full cursor-pointer items-center justify-between rounded-lg px-3 text-[14px] transition-colors",
                  "text-[#0A0A0A] hover:bg-[#F5F5F5] dark:text-white dark:hover:bg-white/5",
                  active && "font-medium text-[#0052D2] dark:text-[#60A5FA]"
                )}
              >
                {opt.label}
                {active && <CheckIcon className="size-3.5 flex-shrink-0 text-[#0052D2] dark:text-[#60A5FA]" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "dropdown",
  buttonVariant = "ghost",
  locale,
  formatters,
  components,
  daterange = false,
  selected,
  onSelect,
  ...props
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <CalendarContext.Provider value={{ daterange, selected, onSelect }}>
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn(
          "group/calendar bg-background p-3 [--cell-radius:6px] [--cell-size:36px]",
          String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
          String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
          className
        )}
        captionLayout={captionLayout}
        locale={locale}
        formatters={{
          formatMonthDropdown: (date) =>
            locale ? format(date, "LLLL", { locale }) : date.toLocaleString(undefined, { month: "long" }),
          ...formatters,
        }}
        classNames={{
          root: cn("w-fit", defaultClassNames.root),
          months: cn("relative flex flex-col gap-4 md:flex-row", defaultClassNames.months),
          month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
          nav: cn("absolute inset-x-0 top-0 flex w-full items-center justify-between", defaultClassNames.nav),
          button_previous: cn(
            buttonVariants({ variant: buttonVariant }),
            "h-7 w-7 p-0 select-none opacity-50 hover:opacity-100 aria-disabled:opacity-30",
            defaultClassNames.button_previous
          ),
          button_next: cn(
            buttonVariants({ variant: buttonVariant }),
            "h-7 w-7 p-0 select-none opacity-50 hover:opacity-100 aria-disabled:opacity-30",
            defaultClassNames.button_next
          ),
          month_caption: cn("flex h-7 w-full items-center justify-center px-8", defaultClassNames.month_caption),
          dropdowns: cn("flex h-7 w-full items-center justify-center gap-1 text-sm font-medium", defaultClassNames.dropdowns),
          dropdown_root: cn("relative", defaultClassNames.dropdown_root),
          dropdown: cn("hidden", defaultClassNames.dropdown),
          caption_label: cn(
            "flex items-center gap-1 rounded-md px-2 py-0.5 text-sm font-medium hover:bg-accent cursor-pointer select-none",
            defaultClassNames.caption_label
          ),
          table: "w-full border-collapse",
          weekdays: cn("flex", defaultClassNames.weekdays),
          weekday: cn("w-9 select-none py-1 text-center text-[0.8rem] font-normal text-muted-foreground", defaultClassNames.weekday),
          week: cn("mt-1 flex w-full", defaultClassNames.week),
          week_number_header: cn("w-9 select-none", defaultClassNames.week_number_header),
          week_number: cn("text-[0.8rem] text-muted-foreground select-none", defaultClassNames.week_number),
          day: cn("relative h-9 w-9 select-none p-0 text-center", defaultClassNames.day),
          range_start: cn("rounded-l-md bg-accent", defaultClassNames.range_start),
          range_middle: cn("rounded-none bg-accent", defaultClassNames.range_middle),
          range_end: cn("rounded-r-md bg-accent", defaultClassNames.range_end),
          today: cn("font-semibold text-foreground", defaultClassNames.today),
          outside: cn("text-muted-foreground opacity-50 aria-selected:text-muted-foreground", defaultClassNames.outside),
          disabled: cn("text-muted-foreground opacity-30", defaultClassNames.disabled),
          hidden: cn("invisible", defaultClassNames.hidden),
          ...classNames,
        }}
        components={{
          Root: ({ className, rootRef, ...props }) => (
            <div data-slot="calendar" ref={rootRef} className={cn(className)} {...props} />
          ),
          Chevron: ({ className, orientation, ...props }) => {
            if (orientation === "left") return <ChevronLeftIcon className={cn("size-4", className)} {...props} />
            if (orientation === "right") return <ChevronRightIcon className={cn("size-4", className)} {...props} />
            return <ChevronDownIcon className={cn("size-4", className)} {...props} />
          },
          Dropdown: (dropdownProps) => <CalendarDropdown {...dropdownProps} />,
          DayButton: ({ ...props }) => <CalendarDayButton locale={locale} {...props} />,
          WeekNumber: ({ children, ...props }) => (
            <td {...props}>
              <div className="flex size-9 items-center justify-center text-center">{children}</div>
            </td>
          ),
          ...components,
        }}
        selected={daterange ? undefined : selected}
        onSelect={daterange ? undefined : onSelect}
        {...props}
      />
    </CalendarContext.Provider>
  )
}

function CalendarDayButton({ className, day, modifiers, locale, ...props }) {
  const ref = React.useRef(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  const { daterange, selected, onSelect } = React.useContext(CalendarContext)

  const isRangeStart = daterange && selected?.from && dayjs(day.date).isSame(selected.from, "day")
  const isRangeEnd = daterange && selected?.to && dayjs(day.date).isSame(selected.to, "day")
  const isRangeMiddle =
    daterange &&
    selected?.from &&
    selected?.to &&
    dayjs(day.date).isAfter(selected.from, "day") &&
    dayjs(day.date).isBefore(selected.to, "day")

  const isStart = daterange ? isRangeStart : modifiers.range_start
  const isEnd = daterange ? isRangeEnd : modifiers.range_end
  const isMiddle = daterange ? isRangeMiddle : modifiers.range_middle
  // daterange: from-only holati ham "range start" (ko'k pill) sifatida ko'rsatiladi,
  // shuning uchun selected-single'ni faqat bitta-sana rejimida qo'llaymiz.
  const isSelectedSingle = daterange
    ? false
    : modifiers.selected && !modifiers.range_start && !modifiers.range_end && !modifiers.range_middle

  // Oraliq "band"ini har hafta qatori / oy chekkasida yumaloqlash (Figma: pill ko'rinishli segmentlar)
  const dow = day.date.getDay() // 0=Ya (yakshanba) ... 1=Du (dushanba)
  const isFirstOfMonth = day.date.getDate() === 1
  const isLastOfMonth = dayjs(day.date).add(1, "day").date() === 1
  const roundL =
    isMiddle &&
    (dow === 1 || isFirstOfMonth || dayjs(day.date).subtract(1, "day").isBefore(selected?.from, "day"))
  const roundR =
    isMiddle &&
    (dow === 0 || isLastOfMonth || dayjs(day.date).add(1, "day").isAfter(selected?.to, "day"))

  const handleClick = (e) => {
    if (daterange) {
      e.preventDefault()
      e.stopPropagation()
      if (onSelect) {
        const clickedDate = day.date
        let newRange
        if (!selected || !selected.from || (selected.from && selected.to)) {
          newRange = { from: clickedDate, to: undefined }
        } else {
          const fromDate = dayjs(selected.from)
          const clicked = dayjs(clickedDate)
          newRange = clicked.isBefore(fromDate)
            ? { from: clickedDate, to: selected.from }
            : { from: selected.from, to: clickedDate }
        }
        onSelect(newRange)
      }
    } else {
      props.onClick?.(e)
    }
  }

  return (
    <button
      {...props}
      ref={ref}
      data-day={day.date.toLocaleDateString(locale?.code)}
      data-selected-single={isSelectedSingle}
      data-range-start={isStart}
      data-range-end={isEnd}
      data-range-middle={isMiddle}
      data-round-l={roundL || undefined}
      data-round-r={roundR || undefined}
      data-today={modifiers.today}
      data-outside={modifiers.outside}
      data-disabled={modifiers.disabled}
      title={daterange ? "Tanlash uchun bosing" : undefined}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-normal transition-colors",
        "cursor-pointer select-none outline-none",
        "hover:bg-accent hover:text-accent-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        "data-[selected-single=true]:bg-foreground data-[selected-single=true]:text-background data-[selected-single=true]:rounded-md data-[selected-single=true]:hover:bg-foreground/90",
        // Oraliq (daterange) — Figma: to'q ko'k boshi/oxiri (#0052D2), och-ko'k band (#EAF1FE), 8px radius
        "data-[range-start=true]:bg-[#0052D2] data-[range-start=true]:text-white data-[range-start=true]:rounded-[8px] data-[range-start=true]:hover:bg-[#0047B8]",
        "data-[range-end=true]:bg-[#0052D2] data-[range-end=true]:text-white data-[range-end=true]:rounded-[8px] data-[range-end=true]:hover:bg-[#0047B8]",
        "data-[range-middle=true]:bg-[#EAF1FE] data-[range-middle=true]:text-[#0052D2] data-[range-middle=true]:rounded-none data-[range-middle=true]:hover:bg-[#DCE8FD]",
        "data-[round-l=true]:rounded-l-[8px] data-[round-r=true]:rounded-r-[8px]",
        "data-[outside=true]:text-muted-foreground data-[outside=true]:opacity-50",
        "data-[disabled=true]:text-muted-foreground data-[disabled=true]:opacity-30 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:pointer-events-none",
        className
      )}
      onClick={handleClick}
    />
  )
}

export { Calendar, CalendarDayButton }
