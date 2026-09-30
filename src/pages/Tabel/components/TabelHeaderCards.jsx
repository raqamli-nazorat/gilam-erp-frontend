import { useEffect, useState } from 'react'
import { Check, ChevronDown, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar03Icon } from '@/components/ui/icons'
import { fetchAllPages } from '@/services/apiHelpers'
import { getAllOrganizations } from '@/services/organizationService'
import { TABEL_STATUS, fmtDateTime, fmtHours, periodOption, periodOptions } from '@/features/tabel/tabelData'

// Figma: 5 ta rangli karta — Sana · Tashkilot · Filial · Oy uchun · Holati.
// Tashkilot / filial / oy faqat qoralama holatida o'zgartiriladi.
const CARD = 'flex min-h-[80px] flex-col justify-between rounded-sm px-4 py-3 text-left text-[#0A0A0A]'
const LABEL = 'text-[12px] font-semibold uppercase tracking-[0.4px]'
const VALUE = 'truncate text-[20px] font-semibold leading-8'

async function loadOrgBranches(orgId) {
  const list = await fetchAllPages('organization/branches/', { organization: orgId })
  return list
    .filter((b) => !b.is_closed && (b.organization_info?.id ?? orgId) === orgId)
    .map((b) => ({ value: b.id, label: b.name ?? '' }))
}

// tabel: { orgId, orgName, branchId, branchName, forMonth, status, createdAt }
// summary: { employees, plan, fakt } — tasdiqlangan tabel uchun 4 kartali ko'rinish
// onChange({ branch } | { year, for_month }) — backendga yuboriladigan o'zgarish; onError(matn)
export default function TabelHeaderCards({ tabel, summary, onChange, onError, busy }) {
  const { orgId, branchId, forMonth, status } = tabel
  const editable = status === 'draft' && !busy

  const [orgs, setOrgs] = useState(null)
  const [branches, setBranches] = useState(null)

  // Variantlar faqat tahrirlanadigan holatda va ro'yxat ochilganda yuklanadi
  function ensureOrgs() {
    if (orgs) return
    getAllOrganizations()
      .then((list) => setOrgs(list.map((o) => ({ value: o.id, label: o.name ?? '' }))))
      .catch(() => setOrgs([]))
  }
  function ensureBranches() {
    if (branches || !orgId) return
    loadOrgBranches(orgId)
      .then(setBranches)
      .catch(() => setBranches([]))
  }
  useEffect(() => setBranches(null), [orgId])

  // Tabel oyi ro'yxatda bo'lmasa ham ko'rinsin
  const periods = periodOptions()
  if (!periods.some((p) => p.value === `${tabel.year}-${forMonth}`)) periods.push(periodOption(tabel.year, forMonth))

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

  return (
    <div className="grid shrink-0 grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
      <div className={CARD} style={{ backgroundColor: '#CDE7FE' }}>
        <span className={LABEL}>Sana</span>
        <span className={cn(VALUE, 'flex items-center gap-2')}>
          {fmtDateTime(tabel.createdAt)}
          <Calendar03Icon size={16} className="shrink-0 text-[#0052D2]" />
        </span>
      </div>

      <PickerCard
        label="Tashkilot"
        bg="#F8C3B3"
        disabled={!editable}
        value={orgId}
        currentLabel={tabel.orgName}
        options={orgs}
        onOpen={ensureOrgs}
        onChange={async (v) => {
          // Tashkilot tabelning o'z maydoni emas — shu tashkilotning birinchi filiali tanlanadi
          const list = await loadOrgBranches(v).catch(() => [])
          if (list[0]) onChange({ branch: list[0].value })
          else onError?.('Tanlangan tashkilotda ochiq filial yo‘q')
        }}
      />
      <PickerCard
        label="Filial"
        bg="#B3F8C5"
        disabled={!editable}
        value={branchId}
        currentLabel={tabel.branchName}
        options={branches}
        onOpen={ensureBranches}
        onChange={(v) => onChange({ branch: v })}
      />
      <PickerCard
        label="Oy uchun"
        bg="#EEF8B3"
        uppercase
        disabled={!editable}
        value={`${tabel.year}-${forMonth}`}
        options={periods}
        onChange={(v) => {
          const [year, month] = v.split('-').map(Number)
          onChange({ year, for_month: month })
        }}
      />

      <div className={CARD} style={{ backgroundColor: '#D7D5FD' }}>
        <span className={LABEL}>Holati</span>
        <span className={VALUE}>{TABEL_STATUS[status]}</span>
      </div>
    </div>
  )
}

// options: [{ value, label }] | null (hali yuklanmagan); currentLabel — ro'yxat yuklanmaganda ko'rsatiladigan nom
function PickerCard({ label, bg, value, currentLabel, options, onOpen, onChange, uppercase, disabled }) {
  const [open, setOpen] = useState(false)
  const current = options?.find((o) => o.value === value)?.label ?? currentLabel
  const body = (
    <>
      <span className={LABEL}>{label}</span>
      <span className="flex w-full items-center justify-between gap-2">
        <span className={cn(VALUE, uppercase && 'uppercase')}>{current || ''}</span>
        {!disabled && <ChevronDown className={cn('size-4 shrink-0 text-[#0052D2] transition-transform', open && 'rotate-180')} />}
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
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (o) onOpen?.()
      }}
    >
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
        {!options ? (
          <div className="flex justify-center py-3">
            <Loader2 className="size-4 animate-spin text-[#0052D2]" />
          </div>
        ) : options.length === 0 ? (
          <p className="px-2.5 py-2 text-[14px] text-[#737373]">Ma’lumot yo‘q</p>
        ) : (
          options.map((o) => (
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
          ))
        )}
      </PopoverContent>
    </Popover>
  )
}
