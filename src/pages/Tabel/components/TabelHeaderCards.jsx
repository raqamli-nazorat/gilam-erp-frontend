import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar03Icon } from '@/components/ui/icons'
import { BRANCHES, ORGANIZATIONS, TABEL_STATUS, fmtDateTime, fmtHours, monthOptions, periodOption } from '@/features/tabel/tabelData'

// Figma: 5 ta rangli karta — Sana · Tashkilot · Filial · Oy uchun · Holati.
// Tashkilot / filial / oy faqat qoralama holatida o'zgartiriladi.
const CARD = 'flex min-h-[110px] flex-col justify-between rounded-xl p-5 text-left text-[#0A0A0A]'
const LABEL = 'text-[12px] font-semibold uppercase tracking-[0.4px]'
const VALUE = 'truncate text-[24px] font-semibold leading-8'

// summary: { employees, plan, fakt } — tasdiqlangan tabel uchun 4 kartali ko'rinish
export default function TabelHeaderCards({ tabel, summary, onChange }) {
  const { orgId, branchId, year, month, status } = tabel
  const editable = status === 'draft'

  if (status === 'confirmed') {
    return (
      <div className="grid shrink-0 grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ['Holati', TABEL_STATUS[status], '#D7D5FD'],
          ['Xodimlar', summary.employees, '#CDE7FE'],
          ['Plan soat', fmtHours(summary.plan, true), '#F8C3B3'],
          ['Fakt soat', fmtHours(summary.fakt, true), '#B3F8C5'],
        ].map(([label, value, bg]) => (
          <div key={label} className={CARD} style={{ backgroundColor: bg }}>
            <span className={LABEL}>{label}</span>
            <span className={VALUE}>{value}</span>
          </div>
        ))}
      </div>
    )
  }

  // Tabel oyi 12 oylik ro'yxatda bo'lmasa ham ko'rinsin
  const months = monthOptions()
  if (!months.some((m) => m.value === `${year}-${month}`)) {
    months.push(periodOption(`${year}-${month}`))
  }

  return (
    <div className="grid shrink-0 grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
      <div className={CARD} style={{ backgroundColor: '#CDE7FE' }}>
        <span className={LABEL}>Sana</span>
        <span className={cn(VALUE, 'flex items-center gap-2')}>
          {fmtDateTime(tabel.date)}
          <Calendar03Icon size={20} className="shrink-0 text-[#0052D2]" />
        </span>
      </div>

      <PickerCard
        label="Tashkilot"
        bg="#F8C3B3"
        disabled={!editable}
        value={orgId}
        options={ORGANIZATIONS.map((o) => ({ value: o.id, label: o.name }))}
        onChange={(v) => onChange({ orgId: v })}
      />
      <PickerCard
        label="Filial"
        bg="#B3F8C5"
        disabled={!editable}
        value={branchId}
        options={BRANCHES.filter((b) => b.orgId === orgId).map((b) => ({ value: b.id, label: b.name }))}
        onChange={(v) => onChange({ branchId: v })}
      />
      <PickerCard
        label="Oy uchun"
        bg="#EEF8B3"
        uppercase
        disabled={!editable}
        value={`${year}-${month}`}
        options={months}
        onChange={(v) => {
          const [y, m] = v.split('-').map(Number)
          onChange({ year: y, month: m })
        }}
      />

      <div className={CARD} style={{ backgroundColor: '#D7D5FD' }}>
        <span className={LABEL}>Holati</span>
        <span className={VALUE}>{TABEL_STATUS[status]}</span>
      </div>
    </div>
  )
}

function PickerCard({ label, bg, value, options, onChange, uppercase, disabled }) {
  const [open, setOpen] = useState(false)
  const current = options.find((o) => o.value === value)
  const body = (
    <>
      <span className={LABEL}>{label}</span>
      <span className="flex w-full items-center justify-between gap-2">
        <span className={cn(VALUE, uppercase && 'uppercase')}>{current?.label ?? '—'}</span>
        {!disabled && <ChevronDown className={cn('size-5 shrink-0 text-[#0052D2] transition-transform', open && 'rotate-180')} />}
      </span>
    </>
  )

  if (disabled) {
    return (
      <div className={CARD} style={{ backgroundColor: bg }}>
        {body}
      </div>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button type="button" className={cn(CARD, 'cursor-pointer transition-[filter] hover:brightness-[0.97]')} style={{ backgroundColor: bg }}>
            {body}
          </button>
        }
      />
      <PopoverContent
        align="start"
        sideOffset={6}
        className="max-h-[320px] w-[260px] gap-0.5 overflow-y-auto rounded-lg border border-[#E2E6F2] bg-white p-1.5 shadow-[0px_4px_24px_0px_#0000001F] ring-0 dark:border-white/10 dark:bg-card"
      >
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => {
              if (o.value !== value) onChange(o.value)
              setOpen(false)
            }}
            className={cn(
              'flex items-center justify-between rounded-md px-2.5 py-2 text-left text-[14px] text-[#0A0A0A] transition-colors hover:bg-[#F5F5F5] dark:text-white dark:hover:bg-white/5',
              o.value === value && 'font-medium text-[#0052D2] dark:text-[#60A5FA]'
            )}
          >
            {o.label}
            {o.value === value && <Check className="size-4" />}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}
