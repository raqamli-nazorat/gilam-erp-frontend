import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AlertTriangle, Check, Filter, Plus, X } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { cn } from '@/lib/utils'
import { formatNumber } from '@/lib/format'
import { PERMISSIONS, ROLE_DEFS, ROLE_PERMISSIONS } from '@/features/foydalanuvchilar/foydalanuvchilarData'
import { roleAdded } from '@/features/foydalanuvchilar/foydalanuvchilarSlice'
import { Button } from '@/components/ui/button'
import RoleModal from './components/RoleModal'
import RoleFilterModal, { EMPTY_ROLE_FILTERS } from './components/RoleFilterModal'

const TH =
  'sticky top-0 z-10 h-10 bg-[#F5F5F5] px-4 text-[13px] font-semibold uppercase leading-[18px] text-[#737373] dark:bg-white/5 dark:text-muted-foreground'

// Ketma-ket ko'k gradatsiya — dataviz skill (references/palette.md), kamayish bo'yicha
const PALETTE = [
  { swatch: 'bg-[#0d366b]', stroke: 'stroke-[#0d366b]' },
  { swatch: 'bg-[#17508f]', stroke: 'stroke-[#17508f]' },
  { swatch: 'bg-[#2a78d6]', stroke: 'stroke-[#2a78d6]' },
  { swatch: 'bg-[#5b9ae8]', stroke: 'stroke-[#5b9ae8]' },
  { swatch: 'bg-[#8fbdf0]', stroke: 'stroke-[#8fbdf0]' },
  { swatch: 'bg-[#bcd9f8]', stroke: 'stroke-[#bcd9f8]' },
]

function RoleDonut({ data, total }) {
  const segments = data.reduce((acc, d) => {
    const pct = total ? (d.count / total) * 100 : 0
    const offset = acc.length ? acc[acc.length - 1].offset + acc[acc.length - 1].pct : 0
    acc.push({ name: d.name, pct, offset })
    return acc
  }, [])

  return (
    <svg viewBox="0 0 200 200" className="h-[168px] w-[168px] shrink-0">
      <circle cx="100" cy="100" r="70" pathLength={100} strokeWidth="32" fill="none" className="stroke-[#F5F5F5] dark:stroke-white/10" />
      {segments.map((s, i) => (
        <circle
          key={s.name}
          cx="100"
          cy="100"
          r="70"
          pathLength={100}
          strokeWidth="32"
          fill="none"
          strokeDasharray={`${s.pct} ${100 - s.pct}`}
          strokeDashoffset={-s.offset}
          transform="rotate(-90 100 100)"
          className={PALETTE[i % PALETTE.length].stroke}
        />
      ))}
      <text x="100" y="94" textAnchor="middle" className="fill-[#0A0A0A] text-[26px] font-bold dark:fill-white">
        {formatNumber(total, 0)}
      </text>
      <text x="100" y="116" textAnchor="middle" className="fill-[#737373] text-[11px] font-semibold uppercase tracking-[0.4px]">
        JAMI
      </text>
    </svg>
  )
}

export default function RollarPage() {
  const dispatch = useDispatch()
  const roles = useSelector((s) => s.foydalanuvchilar.roles)
  const users = useSelector((s) => s.foydalanuvchilar.list)

  const [selected, setSelected] = useState(null)
  const [filters, setFilters] = useState(EMPTY_ROLE_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  usePageHeader('Foydalanuvchilar › Rollar')

  const countOf = (name) => users.filter((u) => u.rol === name).length
  const total = users.length
  const hasFilter = Object.values(filters).some(Boolean)

  const shownRoles = useMemo(() => {
    let out = roles
    if (filters.tashkilot) out = out.filter((r) => r.tashkilot === filters.tashkilot)
    if (filters.holat) out = out.filter((r) => (filters.holat === 'Faol' ? r.holat === 'active' : r.holat !== 'active'))
    const dan = Number(filters.foydalanuvchiDan) || 0
    const gacha = Number(filters.foydalanuvchiGacha) || 0
    if (dan) out = out.filter((r) => countOf(r.name) >= dan)
    if (gacha) out = out.filter((r) => countOf(r.name) <= gacha)
    return out
  }, [roles, filters]) // eslint-disable-line react-hooks/exhaustive-deps

  const activeRole = shownRoles.find((r) => r.id === selected) ?? shownRoles[0] ?? null
  const permissions = activeRole ? ROLE_PERMISSIONS[activeRole.name] ?? {} : {}

  const donutData = ROLE_DEFS.map((r) => ({ name: r.name, count: countOf(r.name) }))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="relative flex items-center gap-1.5 pb-2.5 pt-1 text-sm font-medium text-[#0A0A0A] dark:text-white">
          Rollar
          <span className="inline-flex h-[18px] min-w-[22px] items-center justify-center rounded-full bg-[#EAF1FE] px-1.5 text-[12px] font-medium text-[#0052D2] dark:bg-[#0052D2]/20 dark:text-[#60A5FA]">
            {shownRoles.length}
          </span>
          <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#0052D2]" />
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={() => setFilterOpen(true)}
            className={cn(
              'h-9 gap-2 border-[#E5E5E5] bg-white px-4 text-sm font-medium text-[#0A0A0A] shadow-[0px_1px_2px_0px_#0000001A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-foreground',
              hasFilter && 'border-[#0052D2] text-[#0052D2]'
            )}
          >
            <Filter className="h-4 w-4" /> Filtr
          </Button>
          <Button
            onClick={() => setModalOpen(true)}
            className="h-9 gap-2 rounded-md bg-[#0052D2] px-4 text-sm font-medium text-white hover:bg-[#0047B8]"
          >
            <Plus className="h-4 w-4" /> Yangi rol
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <p className="text-[12px] font-semibold uppercase tracking-[0.4px] text-[#737373] dark:text-muted-foreground">
            Rollar, {shownRoles.length} ta
          </p>
          <div className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-card">
            <table className="w-full border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  <th className={cn(TH, 'w-12 text-left')}>#</th>
                  <th className={cn(TH, 'text-left')}>NOMI</th>
                  <th className={cn(TH, 'text-right')}>FOYDALANUVCHILAR</th>
                  <th className={cn(TH, 'text-left')}>HOLAT</th>
                </tr>
              </thead>
              <tbody>
                {shownRoles.map((r, i) => (
                  <tr
                    key={r.id}
                    onClick={() => setSelected(r.id)}
                    className={cn(
                      'h-[60px] cursor-pointer hover:bg-[#F9FAFB] dark:hover:bg-white/5',
                      activeRole?.id === r.id && 'bg-[#EAF1FE] dark:bg-[#0052D2]/15'
                    )}
                  >
                    <td className="px-4 text-[13px] text-[#737373] dark:text-muted-foreground">{i + 1}</td>
                    <td className="px-4 text-[14px] font-medium text-[#0052D2] dark:text-[#60A5FA]">{r.name}</td>
                    <td className="px-4 text-right text-[13px] text-[#0A0A0A] dark:text-white">{countOf(r.name)}</td>
                    <td className="px-4">
                      <span
                        className={cn(
                          'inline-flex h-[22px] items-center rounded-full px-2.5 text-[11px] font-medium tracking-[0.3px]',
                          r.holat === 'active'
                            ? 'bg-[#E6FAF1] text-[#047A47] dark:bg-[#047A47]/20 dark:text-[#34D399]'
                            : 'bg-[#F5F5F5] text-[#737373] dark:bg-white/10 dark:text-muted-foreground'
                        )}
                      >
                        {r.holat === 'active' ? 'Faol' : 'Nofaol'}
                      </span>
                    </td>
                  </tr>
                ))}
                <tr className="h-[52px] bg-[#F5F5F5] dark:bg-white/5">
                  <td className="px-4 text-[13px] font-semibold text-[#737373] dark:text-muted-foreground">{shownRoles.length + 1}</td>
                  <td className="px-4 text-[13px] font-semibold text-[#0A0A0A] dark:text-white">JAMI</td>
                  <td className="px-4 text-right text-[13px] font-semibold text-[#0A0A0A] dark:text-white">{total}</td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-card">
            <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.4px] text-[#737373] dark:text-muted-foreground">
              Rol bo‘yicha foydalanuvchilar, jami {formatNumber(total, 0)} ta
            </p>
            <div className="flex flex-wrap items-center gap-8">
              <RoleDonut data={donutData} total={total} />
              <div className="flex min-w-[220px] flex-1 flex-col gap-2.5">
                {donutData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between gap-3 text-[13px]">
                    <span className="flex items-center gap-2 text-[#525252] dark:text-muted-foreground">
                      <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', PALETTE[i % PALETTE.length].swatch)} />
                      {d.name}
                    </span>
                    <span className="flex items-center gap-3 tabular-nums">
                      <span className="font-medium text-[#0A0A0A] dark:text-white">{d.count} ta</span>
                      <span className="w-14 text-right text-[#737373] dark:text-muted-foreground">
                        {total ? formatNumber((d.count / total) * 100, 1) : '0,0'} %
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full shrink-0 space-y-3 overflow-auto lg:w-[360px]">
          <p className="text-[12px] font-semibold uppercase tracking-[0.4px] text-[#737373] dark:text-muted-foreground">
            Ruxsatlar, {activeRole?.name ?? '—'}
          </p>
          <div className="flex items-start gap-2.5 rounded-lg bg-[#FFF6E5] px-4 py-3 text-[12px] leading-[17px] text-[#92600A] dark:bg-[#92600A]/15 dark:text-[#F5B94D]">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Sxemada ruxsatlar yo‘q: «Role» jadvalida faqat nom saqlanadi. Quyidagi ro‘yxat — taklif, backend bilan
              kelishilishi kerak.
            </span>
          </div>
          <div className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-card">
            <div className="divide-y divide-[#E5E5E5] dark:divide-white/10">
              {PERMISSIONS.map((p) => (
                <div key={p} className="flex items-center justify-between gap-3 px-4 py-2.5 text-[13px]">
                  <span className={permissions[p] ? 'text-[#0A0A0A] dark:text-white' : 'text-[#A3A3A3] dark:text-muted-foreground'}>{p}</span>
                  {permissions[p] ? (
                    <Check className="h-4 w-4 shrink-0 text-[#047A47] dark:text-[#34D399]" />
                  ) : (
                    <X className="h-4 w-4 shrink-0 text-[#A3A3A3]" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <RoleModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={(values) => dispatch(roleAdded(values))}
      />
      <RoleFilterModal open={filterOpen} onOpenChange={setFilterOpen} filters={filters} onApply={setFilters} />
    </div>
  )
}
