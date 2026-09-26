import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Check, ChevronLeft, Filter, RefreshCw, Search, X } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Toast from '@/components/Toast'
import { findDuplicate, overridesSaved, statusChanged, tabelHeaderChanged, tabelSynced, useTabel } from '@/features/tabel/tabelSlice'
import { BRANCHES, MONTHS, SCHEDULES, WEEKDAY_SHORT, branchName, buildSheet, cellKind, fmtDateTime, fmtHours } from '@/features/tabel/tabelData'
import TabelHeaderCards from './components/TabelHeaderCards'
import TabelFilterModal, { EMPTY_TABEL_FILTERS } from './components/TabelFilterModal'
import DayDetailModal from './components/DayDetailModal'
import TabelConfirmModal from './components/TabelConfirmModal'
import TabelCancelModal from './components/TabelCancelModal'
import { CELL_STYLE, farqColor } from './components/tabelStyles'

// Ustun o'lchamlari — chap/o'ng yopishqoq ustunlar ofsetlari shularga bog'liq
const W_NUM = 48
const W_NAME = 200
const W_SCHED = 130
const W_SUM = 80

const TH = 'h-14 bg-[#F5F5F5] text-[14px] font-medium text-[#0A0A0A] whitespace-nowrap dark:bg-[#1f1f23] dark:text-white'
const TD = 'h-[56px] border-b border-[#F0F0F0] bg-white text-[15px] text-[#0A0A0A] dark:border-white/5 dark:bg-card dark:text-white'
const TF = 'h-11 bg-[#F5F5F5] text-[15px] font-medium text-[#0A0A0A] dark:bg-[#1f1f23] dark:text-white'
const STICKY_L = 'sticky z-[2]'
const STICKY_R = 'sticky z-[2]'
const EDGE_L = 'shadow-[inset_-1px_0_0_#E5E5E5] dark:shadow-[inset_-1px_0_0_rgba(255,255,255,0.1)]'
const EDGE_R = 'shadow-[inset_1px_0_0_#E5E5E5,-6px_0_8px_-6px_rgba(0,0,0,0.12)] dark:shadow-[inset_1px_0_0_rgba(255,255,255,0.1)]'

const LEGEND = [
  ['Norma', 'border border-[#E5E5E5] bg-white dark:border-white/20 dark:bg-card'],
  ['Kam soat', 'bg-[#FEF3E2] dark:bg-[#B45309]/30'],
  ['Kelmagan', 'bg-[#FEECEC] dark:bg-[#DC2626]/30'],
  ['Dam olish', 'bg-[#E5E5E5] dark:bg-white/10'],
]

const fold = (s) => s.toLocaleLowerCase('uz').replace(/[ʻʼ‘’`']/g, "'")

export default function TabelDetailPage() {
  const { id } = useParams()
  const { tabel, sheet } = useTabel(id)
  if (!tabel) return <Navigate to="/tabel" replace />
  return <TabelDetail tabel={tabel} sheet={sheet} />
}

// Holatga qarab ogohlantirish qatori rangi: qoralama — to'q sariq, tasdiqlangan — yashil, bekor — qizil
const NOTICE_CLS = {
  draft: 'bg-[#FFF4E5] text-[#B45309] dark:bg-[#2A1E0B] dark:text-[#FBBF24]',
  confirmed: 'bg-[#E6FAF1] text-[#047A47] dark:bg-[#0B2A1E] dark:text-[#34D399]',
  cancelled: 'bg-[#FEECEC] text-[#DC2626] dark:bg-[#2A1111] dark:text-[#F87171]',
}

const BTN = 'h-10 gap-2 rounded-lg px-5 text-[15px] font-medium shadow-[0px_1px_2px_0px_#0000001A]'
const BTN_OUTLINE = cn(
  BTN,
  'border-[#E5E5E5] bg-white text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white'
)

function TabelDetail({ tabel, sheet: savedSheet }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { id, status, year, month } = tabel
  const filial = branchName(tabel.branchId)
  const editable = status === 'draft'
  const allTabels = useSelector((s) => s.tabel.items)

  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(EMPTY_TABEL_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)
  const [dayTarget, setDayTarget] = useState(null)
  const [confirm, setConfirm] = useState(null) // 'approve' | 'cancel' | 'cancelConfirmed'
  const [syncOpen, setSyncOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [toast, setToast] = useState('')
  // Saqlanmagan kunlik o'zgarishlar: { [empId]: { [day]: entry } } — "Saqlash" bilan yoziladi
  const [pending, setPending] = useState({})
  const dirty = Object.keys(pending).length > 0

  const sheet = useMemo(() => {
    if (!dirty) return savedSheet
    const merged = { ...tabel.overrides }
    Object.entries(pending).forEach(([empId, byDay]) => {
      merged[empId] = { ...merged[empId], ...byDay }
    })
    return buildSheet({ ...tabel, overrides: merged })
  }, [dirty, savedSheet, tabel, pending])
  const { days, rows } = sheet

  usePageHeader([{ label: 'Tabel', to: '/tabel' }, `${filial}, ${MONTHS[month]}`])

  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(''), 3000)
    return () => clearTimeout(t)
  }, [toast])

  const hasFilter = Boolean(filters.schedule || filters.deviation)

  const visible = useMemo(() => {
    const q = fold(search.trim())
    return rows.filter((r) => {
      if (q && !fold(r.name).includes(q)) return false
      if (filters.schedule && r.schedule !== filters.schedule) return false
      if (filters.deviation) {
        const kinds = r.entries.map(cellKind)
        if (filters.deviation === 'norma') return !kinds.includes('kam') && !kinds.includes('kelmagan')
        return kinds.includes(filters.deviation)
      }
      return true
    })
  }, [rows, search, filters])

  const totals = useMemo(() => {
    const perDay = days.map((_, i) => visible.reduce((s, r) => s + r.entries[i].fakt, 0))
    const plan = visible.reduce((s, r) => s + r.plan, 0)
    const fakt = visible.reduce((s, r) => s + r.fakt, 0)
    return { perDay, plan, fakt, farq: fakt - plan }
  }, [days, visible])

  const allPlan = sheet.plan
  const allFakt = sheet.fakt
  const summaryRows = [
    ['Filial', filial],
    ['Oy', MONTHS[month]],
    ['Xodimlar', rows.length],
    ['Fakt soat', `${fmtHours(allFakt, true)} / ${fmtHours(allPlan, true)}`],
  ]

  function savePending() {
    if (dirty) dispatch(overridesSaved({ id, overrides: pending }))
    setPending({})
  }

  // davomat platformasidan qayta olish (hozircha backend yo'q — mahalliy simulyatsiya)
  function sync() {
    setSyncOpen(false)
    setRefreshing(true)
    setTimeout(() => {
      dispatch(tabelSynced(id))
      setPending({})
      setRefreshing(false)
      setToast('Ma’lumotlar yangilandi')
    }, 700)
  }


  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className={cn('shrink-0 rounded-lg px-5 py-2 text-[13px] font-medium', NOTICE_CLS[status])}>
        Tasdiqlangandan so‘ng kunlik ma’lumotlarni o‘zgartirib bo‘lmaydi.
      </div>

      <TabelHeaderCards
        tabel={tabel}
        summary={{ employees: rows.length, plan: sheet.plan, fakt: sheet.fakt }}
        onChange={(patch) => {
          const next = { ...tabel, ...patch }
          if (patch.orgId) next.branchId = BRANCHES.find((b) => b.orgId === patch.orgId)?.id ?? ''
          if (next.branchId && findDuplicate(allTabels, next, id)) {
            setToast({ variant: 'error', message: `${branchName(next.branchId)} uchun ${MONTHS[next.month]} oyi tabeli allaqachon mavjud` })
            return
          }
          setPending({}) // xodimlar/oy o'zgaradi — kunlik o'zgarishlar yaroqsiz
          dispatch(tabelHeaderChanged({ id, patch }))
        }}
      />

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="relative w-[280px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Qidirish"
              className="h-9 w-[280px] rounded-lg border-[#E5E5E5] bg-white pl-9 pr-3 text-sm text-[#0A0A0A] placeholder:text-[#737373] focus-visible:ring-[#0052D2] dark:border-white/10 dark:bg-card dark:text-white"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setFilterOpen(true)}
            className={cn(
              'h-9 gap-2 rounded-lg border-[#E5E5E5] bg-white px-4 text-sm font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-foreground',
              hasFilter && 'border-[#0052D2] text-[#0052D2]'
            )}
          >
            <Filter className="h-4 w-4" /> Filtr
          </Button>
          {editable && (
            <Button
              variant="outline"
              onClick={() => setSyncOpen(true)}
              disabled={refreshing}
              className="h-9 gap-2 rounded-lg border-[#E5E5E5] bg-white px-4 text-sm font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] disabled:opacity-100 dark:border-white/10 dark:bg-card dark:text-foreground"
            >
              <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} /> Yangilash
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-5 text-[14px] text-[#525252] dark:text-muted-foreground">
          {LEGEND.map(([label, cls]) => (
            <span key={label} className="inline-flex items-center gap-2">
              <span className={cn('size-4 rounded', cls)} />
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto rounded-xl bg-white dark:bg-card">
        <table className="w-max min-w-full border-separate border-spacing-0">
          <thead className="sticky top-0 z-[3]">
            <tr>
              <th className={cn(TH, STICKY_L, 'px-4 text-left')} style={{ left: 0, width: W_NUM, minWidth: W_NUM }}>#</th>
              <th className={cn(TH, STICKY_L, 'px-2 text-left')} style={{ left: W_NUM, width: W_NAME, minWidth: W_NAME }}>Xodim</th>
              <th className={cn(TH, STICKY_L, EDGE_L, 'px-2 text-left')} style={{ left: W_NUM + W_NAME, width: W_SCHED, minWidth: W_SCHED }}>
                Ish grafigi
              </th>
              {days.map((d) => (
                <th key={d.day} className={cn(TH, 'min-w-[61px] px-1 text-center font-normal')}>
                  <span className={cn('block text-[12px] leading-4', d.weekend ? 'text-[#DC2626]' : 'text-[#737373]')}>{WEEKDAY_SHORT[d.wd]}</span>
                  <span className="block text-[16px] font-medium leading-5">{d.day}</span>
                </th>
              ))}
              <th className={cn(TH, STICKY_R, EDGE_R, 'px-3 text-right')} style={{ right: W_SUM * 2, width: W_SUM, minWidth: W_SUM }}>Plan</th>
              <th className={cn(TH, STICKY_R, 'px-3 text-right')} style={{ right: W_SUM, width: W_SUM, minWidth: W_SUM }}>Fakt</th>
              <th className={cn(TH, STICKY_R, 'px-3 text-right')} style={{ right: 0, width: W_SUM, minWidth: W_SUM }}>Farq</th>
            </tr>
          </thead>

          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={days.length + 6} className="py-16 text-center text-sm text-[#737373] dark:text-muted-foreground">
                  Xodim topilmadi
                </td>
              </tr>
            ) : (
              visible.map((r, idx) => (
                <tr key={r.id} className="group">
                  <td className={cn(TD, STICKY_L, 'px-4 text-[#525252] dark:text-muted-foreground')} style={{ left: 0 }}>{idx + 1}</td>
                  <td className={cn(TD, STICKY_L, 'px-2')} style={{ left: W_NUM }}>
                    <button
                      type="button"
                      onClick={() => navigate(`/tabel/${id}/xodim/${r.id}`)}
                      className="max-w-full truncate text-left font-medium text-[#0052D2] hover:underline dark:text-[#60A5FA]"
                    >
                      {r.name}
                    </button>
                  </td>
                  <td className={cn(TD, STICKY_L, EDGE_L, 'whitespace-nowrap px-2 text-[14px] text-[#525252] dark:text-muted-foreground')} style={{ left: W_NUM + W_NAME }}>
                    {SCHEDULES[r.schedule].name}
                  </td>
                  {r.entries.map((e, i) => (
                    <td key={days[i].day} className={cn(TD, 'px-1 text-center')}>
                      <DayCell entry={e} onClick={() => setDayTarget({ employee: r, day: days[i].day, entry: e })} />
                    </td>
                  ))}
                  <td className={cn(TD, STICKY_R, EDGE_R, 'px-3 text-right')} style={{ right: W_SUM * 2 }}>{fmtHours(r.plan)}</td>
                  <td className={cn(TD, STICKY_R, 'px-3 text-right')} style={{ right: W_SUM }}>{fmtHours(r.fakt)}</td>
                  <td className={cn(TD, STICKY_R, 'px-3 text-right', farqColor(r.farq))} style={{ right: 0 }}>{fmtHours(r.farq)}</td>
                </tr>
              ))
            )}
          </tbody>

          <tfoot className="sticky bottom-0 z-[3]">
            <tr>
              <td colSpan={3} className={cn(TF, STICKY_L, EDGE_L, 'px-4 font-semibold')} style={{ left: 0 }}>
                Jami ({visible.length} ta xodim)
              </td>
              {totals.perDay.map((v, i) => (
                <td key={days[i].day} className={cn(TF, 'px-1 text-center font-normal')}>{fmtHours(v)}</td>
              ))}
              <td className={cn(TF, STICKY_R, EDGE_R, 'px-3 text-right font-semibold')} style={{ right: W_SUM * 2 }}>{fmtHours(totals.plan)}</td>
              <td className={cn(TF, STICKY_R, 'px-3 text-right font-semibold')} style={{ right: W_SUM }}>{fmtHours(totals.fakt)}</td>
              <td className={cn(TF, STICKY_R, 'px-3 text-right font-semibold', farqColor(totals.farq))} style={{ right: 0 }}>{fmtHours(totals.farq)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="flex shrink-0 items-center justify-end gap-2.5 rounded-xl bg-[#F5F5F5] px-4 py-3 dark:bg-white/5">
        {status === 'draft' ? (
          <>
            <Button onClick={() => setConfirm('cancel')} className={cn(BTN, 'bg-[#DC2626] text-white hover:bg-[#B91C1C]')}>
              <X className="h-4 w-4" /> Bekor qilish
            </Button>
            <Button
              onClick={() => {
                savePending()
                setToast('Tabel saqlandi')
              }}
              disabled={!dirty}
              className={cn(BTN, 'bg-[#0052D2] text-white hover:bg-[#0047B8] disabled:opacity-50')}
            >
              <Check className="h-4 w-4" /> Saqlash
            </Button>
            <Button onClick={() => setConfirm('approve')} className={cn(BTN, 'bg-[#16A34A] text-white hover:bg-[#15803D]')}>
              <Check className="h-4 w-4" /> Tasdiqlash
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={() => navigate('/tabel')} className={BTN_OUTLINE}>
              <ChevronLeft className="h-4 w-4" /> Jurnalga qaytish
            </Button>
            {status === 'confirmed' && (
              <Button variant="outline" onClick={() => setConfirm('cancelConfirmed')} className={BTN_OUTLINE}>
                <X className="h-4 w-4" /> Bekor qilish
              </Button>
            )}
          </>
        )}
      </div>

      <TabelFilterModal open={filterOpen} onOpenChange={setFilterOpen} filters={filters} onApply={setFilters} />

      <DayDetailModal
        target={dayTarget}
        tabelId={id}
        year={year}
        month={month}
        readOnly={!editable}
        onClose={() => setDayTarget(null)}
        onSubmit={({ empId, day, entry }) =>
          setPending((p) => ({ ...p, [empId]: { ...p[empId], [day]: entry } }))
        }
      />

      <TabelConfirmModal
        open={confirm === 'approve'}
        onOpenChange={(o) => !o && setConfirm(null)}
        title="Tabel tasdiqlansinmi?"
        confirmLabel="Tasdiqlash"
        success
        rows={summaryRows}
        onConfirm={() => {
          // Tasdiqlashdan oldin saqlanmagan o'zgarishlar yoziladi
          savePending()
          dispatch(statusChanged({ id, status: 'confirmed' }))
          setToast('Tabel tasdiqlandi')
          setConfirm(null)
        }}
      />

      {/* Bekor qilish — qoralama va tasdiqlangan tabel uchun: sabab (majburiy) + hujjat */}
      <TabelCancelModal
        open={confirm === 'cancel' || confirm === 'cancelConfirmed'}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={confirm === 'cancelConfirmed' ? 'Tasdiqlangan tabel bekor qilinsinmi?' : 'Tabel bekor qilinsinmi?'}
        rows={
          confirm === 'cancelConfirmed' && tabel.confirmedAt
            ? [...summaryRows, ['Tasdiqlangan', fmtDateTime(tabel.confirmedAt)]]
            : summaryRows
        }
        onConfirm={({ reason, file }) => {
          setPending({})
          dispatch(statusChanged({ id, status: 'cancelled', reason, documentName: file?.name }))
          setToast('Tabel bekor qilindi')
          setConfirm(null)
        }}
      />

      <TabelConfirmModal
        open={syncOpen}
        onOpenChange={setSyncOpen}
        title="Ma’lumotlarni yangilash"
        cancelLabel="Bekor qilish"
        confirmLabel="Yangilash"
        confirmIcon={RefreshCw}
        onConfirm={sync}
      >
        <p className="text-[16px] leading-6 text-[#0A0A0A] dark:text-white">
          Ma’lumotlar{' '}
          <a
            href="https://davomat.raqamlinazorat.uz"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[#0052D2] hover:underline dark:text-[#60A5FA]"
          >
            davomat.raqamlinazorat.uz
          </a>{' '}
          platformasidan yangilanishga rozimisiz?
          {dirty && (
            <span className="mt-2 block text-[13px] text-[#B45309] dark:text-[#FBBF24]">
              Saqlanmagan o‘zgarishlar bekor qilinadi.
            </span>
          )}
        </p>
      </TabelConfirmModal>

      <Toast message={toast} />
    </div>
  )
}

function DayCell({ entry, onClick }) {
  const kind = cellKind(entry)
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'mx-auto flex h-9 w-[52px] items-center justify-center rounded-md text-[15px] transition-[filter,box-shadow] hover:ring-2 hover:ring-[#0052D2]/30',
        CELL_STYLE[kind]
      )}
    >
      {kind === 'dam' ? '' : fmtHours(entry.fakt)}
    </button>
  )
}
