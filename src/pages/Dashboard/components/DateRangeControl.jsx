import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { Check, ChevronDown, X } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar03Icon } from '@/components/ui/icons'
import { cn } from '@/lib/utils'

// Backend hali ulanmagan — sana oralig'i faqat vizual (Figma bilan bir xil), ma'lumotni filtrlamaydi.
const REF_NOW = new Date(2026, 7, 13, 11, 43) // Figma'dagi "hozir"
const DEFAULT_DRAFT = { from: new Date(2026, 6, 20, 11, 1), to: REF_NOW }

const MONTHS = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr']
const WEEKDAYS = ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh'] // getDay() bo'yicha

const fmt = (d) => dayjs(d).format('DD.MM.YYYY')
const fmtDT = (d) => dayjs(d).format('DD.MM.YYYY HH:mm')

function buildPresets() {
  const now = dayjs(REF_NOW)
  const quarterStart = now.startOf('month').month(Math.floor(now.month() / 3) * 3)
  return [
    { key: 'bugun', label: 'Bugun', from: now.startOf('day'), to: now, hint: fmtDT(REF_NOW) },
    { key: 'oy', label: 'Joriy oy', from: now.startOf('month'), to: now },
    { key: 'chorak', label: 'Joriy chorak', from: quarterStart, to: now },
    { key: 'yil', label: 'Joriy yil', from: now.startOf('year'), to: now },
    {
      key: 'butun',
      label: 'Butun davr',
      from: dayjs(new Date(2022, 7, 1, 11, 15)),
      to: now,
      hint: `01.08.2022 11:15 – ${fmt(REF_NOW)}`,
    },
  ].map((p) => ({
    key: p.key,
    label: p.label,
    from: p.from.toDate(),
    to: p.to.toDate(),
    hint: p.hint ?? `${p.from.format('DD.MM')} – ${fmt(p.to)}`,
  }))
}

export default function DateRangeControl() {
  const presets = useMemo(() => buildPresets(), [])
  const [open, setOpen] = useState(false)
  const [applied, setApplied] = useState(null)
  const [draft, setDraft] = useState(DEFAULT_DRAFT)
  const [month, setMonth] = useState(new Date(2026, 6, 1))

  function handleOpenChange(v) {
    if (v) {
      const start = applied ?? DEFAULT_DRAFT
      setDraft(start)
      setMonth(dayjs(start.from).toDate())
    }
    setOpen(v)
  }

  function pickPreset(p) {
    setDraft({ from: p.from, to: p.to })
    setMonth(dayjs(p.from).toDate())
  }

  const activeKey = useMemo(() => {
    if (!draft?.from || !draft?.to) return null
    const hit = presets.find(
      (p) => dayjs(p.from).isSame(draft.from, 'day') && dayjs(p.to).isSame(draft.to, 'day')
    )
    return hit ? hit.key : 'boshqa'
  }, [draft, presets])

  const days =
    draft?.from && draft?.to
      ? dayjs(draft.to).startOf('day').diff(dayjs(draft.from).startOf('day'), 'day') + 1
      : 0

  const rows = [
    ...presets,
    {
      key: 'boshqa',
      label: 'Boshqa davr...',
      hint: draft?.from && draft?.to ? `${dayjs(draft.from).format('DD.MM')} – ${fmt(draft.to)}` : '—',
    },
  ]

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={
          applied ? (
            <div className="flex h-9 items-center gap-2 rounded-md border border-[#E5E5E5] bg-white pl-3 pr-1 text-[14px] font-medium text-[#0A0A0A] dark:border-white/10 dark:bg-card dark:text-white">
              <Calendar03Icon className="h-4 w-4 text-[#525252] dark:text-white/70" />
              <span className="tabular-nums">
                {fmt(applied.from)}-{fmt(applied.to)}
              </span>
              <button
                type="button"
                aria-label="Sana oralig‘ini tozalash"
                onClick={(e) => {
                  e.stopPropagation()
                  setApplied(null)
                }}
                className="flex size-6 items-center justify-center rounded text-[#DC2626] transition-colors hover:bg-[#FEECEC] dark:hover:bg-[#DC2626]/15"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="flex h-9 items-center gap-2 rounded-md border border-[#E5E5E5] bg-white px-3 text-[14px] font-medium text-[#0A0A0A] transition-colors hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white dark:hover:bg-white/5"
            >
              <Calendar03Icon className="h-4 w-4 text-[#525252] dark:text-white/70" />
              Sana oralig‘i
              <ChevronDown className="h-4 w-4 text-[#525252] dark:text-white/70" />
            </button>
          )
        }
      />
      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-auto max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-[#E5E5E5] bg-white p-0 shadow-[0px_12px_32px_0px_#01091C24] ring-0 dark:border-white/10 dark:bg-card"
      >
        <div className="flex flex-col sm:flex-row">
          <ul className="w-full shrink-0 border-b border-[#EEEEEE] py-1.5 sm:w-[224px] sm:border-b-0 sm:border-r dark:border-white/10">
            {rows.map((p) => {
              const active = activeKey === p.key
              return (
                <li key={p.key}>
                  <button
                    type="button"
                    onClick={() => p.key !== 'boshqa' && pickPreset(p)}
                    className={cn(
                      'flex w-full flex-col gap-0.5 px-4 py-2 text-left transition-colors',
                      active ? 'bg-[#EAF2FF] dark:bg-[#1E3A8A]/25' : 'hover:bg-[#F5F5F5] dark:hover:bg-white/5'
                    )}
                  >
                    <span
                      className={cn(
                        'text-[13px] font-medium',
                        active ? 'text-[#1552E0] dark:text-[#93B4FF]' : 'text-[#0A0A0A] dark:text-white'
                      )}
                    >
                      {p.label}
                    </span>
                    <span className="text-[12px] text-[#737373] dark:text-muted-foreground">{p.hint}</span>
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="flex min-w-0 flex-col p-3">
            <Calendar
              daterange
              numberOfMonths={2}
              captionLayout="label"
              weekStartsOn={1}
              showOutsideDays={false}
              disabled={{ after: REF_NOW }}
              selected={draft}
              onSelect={setDraft}
              month={month}
              onMonthChange={setMonth}
              formatters={{
                formatWeekdayName: (d) => WEEKDAYS[d.getDay()],
                formatCaption: (d) => `${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
                formatMonthCaption: (d) => `${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
              }}
              classNames={{
                months: 'relative flex flex-col gap-4 md:flex-row md:gap-7',
                month: 'flex w-full flex-col gap-3',
                caption_label:
                  'flex items-center justify-center px-2 text-[16px] font-semibold text-[#0A0A0A] dark:text-white',
                button_previous:
                  'inline-flex h-7 w-7 items-center justify-center rounded-md text-[#0A0A0A] opacity-100 transition-colors hover:bg-[#F5F5F5] dark:text-white dark:hover:bg-white/10',
                button_next:
                  'inline-flex h-7 w-7 items-center justify-center rounded-md text-[#0A0A0A] opacity-100 transition-colors hover:bg-[#F5F5F5] dark:text-white dark:hover:bg-white/10',
                weekday: 'w-9 select-none py-1.5 text-center text-[13px] font-normal text-[#737373] dark:text-white/50',
                day: 'relative h-8 w-9 select-none p-0 text-center',
                day_button: 'h-8 w-9 rounded-[8px]',
              }}
            />

            <div className="mt-1 flex flex-wrap items-center justify-between gap-3 border-t border-[#EEEEEE] px-1 pt-3 dark:border-white/10">
              <span className="text-[12px] tabular-nums text-[#737373] dark:text-muted-foreground">
                {draft?.from && draft?.to ? `${fmtDT(draft.from)} – ${fmt(draft.to)}, ${days} kun` : 'Sanani tanlang'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-9 items-center gap-1.5 rounded-md border border-[#E5E5E5] bg-white px-3 text-[13px] font-medium text-[#0A0A0A] transition-colors hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white dark:hover:bg-white/5"
                >
                  <X className="h-4 w-4" /> Bekor qilish
                </button>
                <button
                  type="button"
                  disabled={!draft?.from || !draft?.to}
                  onClick={() => {
                    if (draft?.from && draft?.to) {
                      setApplied(draft)
                      setOpen(false)
                    }
                  }}
                  className="flex h-9 items-center gap-1.5 rounded-md bg-[#0052D2] px-3 text-[13px] font-medium text-white transition-colors hover:bg-[#0047B8] disabled:opacity-50"
                >
                  <Check className="h-4 w-4" /> Qo‘llash
                </button>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
