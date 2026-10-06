import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { Ban, Check, Loader2, Tag, X } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PagedSelect } from '@/components/ui/paged-select'
import { DatePicker, fromISODate, toISODate } from '@/components/ui/date-picker'
import Toast from '@/components/Toast'
import { qualityOptions } from '@/services/optionSources'
import { extractErrorMessage } from '@/services/apiHelpers'
import { buildPriceRows } from '@/services/rejaNarxService'
import {
  changePct,
  docStats,
  isRowChanged,
  markupPct,
  previousConfirmed,
  qualityKey,
  REJA_NARX_ROOT as ROOT,
  round2,
  STATUS,
} from '@/features/rejaNarx/rejaNarxData'
import { docCancelled, docConfirmed, docCreated, docSaved } from '@/features/rejaNarx/rejaNarxSlice'
import { CancelPricesModal, ConfirmPricesModal } from './components/RejaNarxModals'

const STATUS_LABEL = { draft: 'Qoralama', confirmed: 'Tasdiqlangan', cancelled: 'Bekor qilingan' }
const ALL_LABEL = 'Barcha sifatlar'
const TH = 'h-11 px-4 text-[12px] font-semibold uppercase tracking-[0.2px] text-[#525252] dark:text-muted-foreground'
const TD = 'h-[60px] px-4 text-[14px]'
const labelCls = 'mb-1.5 block text-[13px] font-normal text-[#525252] dark:text-muted-foreground'

function parsePrice(value) {
  const n = Number(String(value).replace(/\s/g, '').replace(',', '.'))
  return Number.isFinite(n) && n >= 0 ? round2(n) : null
}

const rowKey = (r) => r.qualityId || qualityKey(r.quality)

export default function RejaNarxDetailPage({ isNew }) {
  const { id } = useParams()
  const docs = useSelector((state) => state.rejaNarx.list)
  const stored = isNew ? null : docs.find((d) => d.id === id)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isNew && !stored) navigate(ROOT, { replace: true })
  }, [isNew, stored, navigate])

  if (!isNew && !stored) return null
  // key — boshqa hujjatga o'tilganda yoki yangi hujjat saqlanganda mahalliy holat qayta boshlanadi
  return <Workspace key={stored?.id ?? 'new'} stored={stored} docs={docs} />
}

function Workspace({ stored, docs }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth.user)
  const liveRate = useSelector((state) => state.receipts.exchangeRate)

  const [createdAt] = useState(() => stored?.createdAt ?? dayjs().format('YYYY-MM-DDTHH:mm'))
  const [rate] = useState(() => stored?.rate ?? liveRate)
  const [effectiveDate, setEffectiveDate] = useState(stored?.effectiveDate ?? dayjs().format('YYYY-MM-DD'))
  const [scope, setScope] = useState({ id: stored?.scopeId ?? '', name: stored?.scope ?? ALL_LABEL })
  const [rows, setRows] = useState(stored?.rows ?? [])
  const [editing, setEditing] = useState(null) // { key, field, value }
  const [filling, setFilling] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [toast, setToast] = useState('')

  const status = stored?.status ?? STATUS.DRAFT
  const readOnly = status !== STATUS.DRAFT
  const number = stored?.number ?? ''

  const current = { effectiveDate, scopeId: scope.id, scope: scope.name, rows }
  const dirty = stored
    ? JSON.stringify([effectiveDate, scope.id, rows]) !== JSON.stringify([stored.effectiveDate, stored.scopeId, stored.rows])
    : rows.length > 0
  const stats = useMemo(() => docStats({ rows }), [rows])
  const previous = useMemo(() => (stored ? previousConfirmed(docs, stored) : null), [docs, stored])

  usePageHeader([
    { label: 'Rejalashtirilgan narx', to: ROOT },
    stored ? `${number} ${STATUS_LABEL[status]}` : 'Yangi hujjat',
  ])

  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(''), 3500)
    return () => clearTimeout(t)
  }, [toast])

  async function handleFill() {
    setFilling(true)
    try {
      const fetched = await buildPriceRows({ scopeId: scope.id, docs, excludeId: stored?.id })
      // Avval kiritilgan yangi narxlar saqlanib qoladi — faqat eski narxlar yangilanadi
      const existing = new Map(rows.map((r) => [rowKey(r), r]))
      setRows(
        fetched.map((r) => {
          const prev = existing.get(r.qualityId) ?? existing.get(qualityKey(r.quality))
          return prev ? { ...r, cost: prev.cost, sale: prev.sale } : r
        })
      )
      setToast(`${fetched.length} ta sifat qo‘shildi`)
    } catch (error) {
      setToast({ variant: 'error', message: extractErrorMessage(error, 'Sifatlarni yuklab bo‘lmadi') })
    } finally {
      setFilling(false)
    }
  }

  function commitEdit() {
    if (!editing) return
    const value = parsePrice(editing.value)
    if (value !== null) {
      setRows((rs) => rs.map((r) => (rowKey(r) === editing.key ? { ...r, [editing.field]: value } : r)))
    }
    setEditing(null)
  }

  // Saqlaydi va hujjat id'sini qaytaradi (yangi hujjat shu paytda raqam oladi)
  function persist() {
    if (stored) {
      dispatch(docSaved({ id: stored.id, patch: current }))
      return stored.id
    }
    const action = dispatch(docCreated({ ...current, rate, createdAt, author: user?.fullName ?? '' }))
    return action.payload.id
  }

  function handleSave() {
    const savedId = persist()
    setToast('Saqlandi')
    if (!stored) navigate(`${ROOT}/${savedId}`, { replace: true })
  }

  function handleConfirm() {
    const savedId = persist()
    dispatch(docConfirmed({ id: savedId, at: dayjs().format('YYYY-MM-DDTHH:mm'), by: user?.fullName ?? '' }))
    setConfirmOpen(false)
    if (!stored) navigate(`${ROOT}/${savedId}`, { replace: true })
    else setToast(`Narxlar tasdiqlandi, ${number}`)
  }

  const editingRow = editing ? rows.find((r) => rowKey(r) === editing.key) : null
  const confirmDoc = { number: number || 'Yangi', createdAt, rate, effectiveDate }

  function editableCell(row, field) {
    const key = rowKey(row)
    const isEditing = editing?.key === key && editing.field === field
    if (isEditing) {
      return (
        <input
          autoFocus
          inputMode="decimal"
          value={editing.value}
          onChange={(e) => setEditing((ed) => ({ ...ed, value: e.target.value }))}
          onBlur={commitEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitEdit()
            if (e.key === 'Escape') setEditing(null)
          }}
          className="h-10 w-full rounded-md border border-[#0052D2] bg-white px-3 text-left text-[14px] outline-none ring-2 ring-[#0052D2]/20 dark:bg-card dark:text-white"
        />
      )
    }
    return (
      <button
        type="button"
        disabled={readOnly}
        onClick={() => setEditing({ key, field, value: formatNumber(row[field]).replace(/\s/g, '') })}
        className={cn(
          'w-full rounded-md px-2 py-1.5 text-right tabular-nums',
          !readOnly && 'cursor-text hover:bg-[#F5F5F5] dark:hover:bg-white/5'
        )}
      >
        {formatNumber(row[field])}
      </button>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      {/* Sarlavha kartasi */}
      <div className="flex shrink-0 items-start justify-between gap-4 rounded-xl bg-white px-6 py-5 dark:bg-card">
        <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-[minmax(0,280px)_minmax(0,290px)_minmax(0,250px)]">
          <div>
            <Label className={labelCls}>Hujjat</Label>
            <Input
              disabled
              value={`${number || 'Yangi'}, ${dayjs(createdAt).format('DD.MM.YYYY HH:mm')}`}
              className="h-10 text-[14px] disabled:opacity-100"
            />
          </div>
          <div>
            <Label className={labelCls}>Sifatlar</Label>
            <PagedSelect
              value={scope.id}
              selectedLabel={scope.name}
              fetchPage={qualityOptions}
              allowAll
              allLabel={ALL_LABEL}
              placeholder={ALL_LABEL}
              disabled={readOnly}
              onChange={(sid, item) => setScope({ id: sid, name: sid ? item?.name ?? '' : ALL_LABEL })}
            />
          </div>
          <div>
            <Label className={labelCls}>Amal qilish sanasi</Label>
            <DatePicker
              value={fromISODate(effectiveDate)}
              onChange={(d) => d && setEffectiveDate(toISODate(d))}
              disabled={readOnly}
            />
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[13px] text-[#737373]">Kurs, UZS</p>
          <p className="mt-1.5 text-[20px] font-semibold text-[#0A0A0A] dark:text-white">{formatNumber(rate)}</p>
        </div>
      </div>

      {/* Sifat narxlari */}
      <div className="flex min-h-[240px] flex-1 flex-col overflow-hidden rounded-xl bg-white dark:bg-card">
        <div className="flex shrink-0 items-center justify-between gap-3 px-6 py-4">
          <div className="flex items-baseline gap-2">
            <h2 className="text-[17px] font-semibold text-[#0A0A0A] dark:text-white">Sifat narxlari</h2>
            <span className="text-[14px] text-[#737373]">
              {rows.length} ta sifat
              {readOnly ? ', faqat ko‘rish' : stats.changed ? `, ${stats.changed} tasida o‘zgarish` : ''}
            </span>
          </div>
          {!readOnly && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={rows.length === 0 || filling}
                onClick={() => {
                  setRows([])
                  setEditing(null)
                }}
                className="flex items-center gap-1.5 px-2 text-[14px] text-[#0A0A0A] hover:underline disabled:cursor-default disabled:text-[#A3A3A3] disabled:no-underline dark:text-white"
              >
                <X className="h-4 w-4" /> Tozalash
              </button>
              <Button
                variant={rows.length ? 'outline' : 'default'}
                disabled={filling}
                onClick={handleFill}
                className={cn(
                  'h-10 gap-2 px-5 text-[14px] font-medium',
                  rows.length
                    ? 'border-[#E5E5E5] bg-white text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white'
                    : 'bg-[#0052D2] text-white hover:bg-[#0047B8]'
                )}
              >
                {filling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Tag className="h-4 w-4" />} To‘ldirish
              </Button>
            </div>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full border-separate border-spacing-0">
            <thead className="sticky top-0 z-10 bg-[#F5F5F5] dark:bg-[#1f2937]">
              <tr>
                <th className={cn(TH, 'w-12 text-left')}>#</th>
                <th className={cn(TH, 'text-left')}>Sifat</th>
                <th className={cn(TH, 'text-right')}>Eski tannarx, USD</th>
                <th className={cn(TH, 'text-right')}>Eski sotuv narx, USD</th>
                <th className={cn(TH, 'w-[180px] text-right')}>Tannarx, USD</th>
                <th className={cn(TH, 'w-[200px] text-right')}>Sotuv narx, USD</th>
                <th className={cn(TH, 'text-right')}>Ustama</th>
                <th className={cn(TH, 'text-right')}>O‘zgarish</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-24 text-center">
                    <p className="text-[17px] font-semibold text-[#0A0A0A] dark:text-white">Sifatlar qo‘shilmagan</p>
                    <p className="mt-2 text-[14px] text-[#525252] dark:text-muted-foreground">
                      «To‘ldirish» barcha sifatlarni joriy tannarx va sotuv narxi bilan qo‘shadi. Keyin kerakli narxlarni
                      o‘zgartiring.
                    </p>
                  </td>
                </tr>
              ) : (
                rows.map((r, i) => {
                  const changed = isRowChanged(r)
                  const change = changePct(r)
                  return (
                    <tr key={rowKey(r)} className={cn(changed && 'bg-[#EFF6FF] dark:bg-[#0052D2]/10')}>
                      <td className={cn(TD, 'text-[13px] text-[#737373]')}>{i + 1}</td>
                      <td className={cn(TD, 'text-[#0A0A0A] dark:text-white')}>{r.quality}</td>
                      <td className={cn(TD, 'text-right tabular-nums')}>{formatNumber(r.oldCost)}</td>
                      <td className={cn(TD, 'text-right tabular-nums')}>{formatNumber(r.oldSale)}</td>
                      <td className={cn(TD, 'px-2')}>{editableCell(r, 'cost')}</td>
                      <td className={cn(TD, 'px-2')}>{editableCell(r, 'sale')}</td>
                      <td className={cn(TD, 'text-right tabular-nums')}>{formatNumber(markupPct(r), 0)} %</td>
                      <td
                        className={cn(
                          TD,
                          'text-right tabular-nums',
                          change > 0.0001 ? 'text-[#16A34A]' : change < -0.0001 ? 'text-[#DC2626]' : 'text-[#0A0A0A] dark:text-white'
                        )}
                      >
                        {Math.abs(change) > 0.0001 ? `${change > 0 ? '+' : ''}${formatNumber(change, 1)} %` : '—'}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pastki panel */}
      <div className="flex shrink-0 items-center justify-between gap-4 pb-1">
        <p className="text-[14px] text-[#525252] dark:text-muted-foreground">
          {status === STATUS.CANCELLED ? (
            <span className="flex items-center gap-2 text-[#B91C1C] dark:text-red-400">
              <Ban className="h-4 w-4 shrink-0" />
              Bekor qilingan. Sabab: {stored.cancelReason}
              {stored.cancelFile && `, asos: ${stored.cancelFile}`}
            </span>
          ) : status === STATUS.CONFIRMED ? (
            `Tasdiqlangan ${dayjs(stored.confirmedAt).format('DD.MM.YYYY HH:mm')}, ${stored.confirmedBy}. Narxlar Sifat narxi ma’lumotnomasiga yozildi.`
          ) : editingRow ? (
            `Enter saqlaydi, Esc bekor qiladi. Eski narx: ${formatNumber(editing.field === 'cost' ? editingRow.oldCost : editingRow.oldSale)} USD.`
          ) : (
            `Tasdiqlangandan so‘ng narxlar ${dayjs(effectiveDate).format('DD.MM.YYYY')} dan amal qiladi va savdoda qo‘llanadi.`
          )}
        </p>
        <div className="flex shrink-0 gap-2">
          {status === STATUS.DRAFT && (
            <>
              <Button onClick={() => navigate(ROOT)} className="h-10 gap-2 bg-[#DC2626] px-5 text-white hover:bg-[#B91C1C]">
                <X className="h-4 w-4" /> Bekor qilish
              </Button>
              <Button
                disabled={!dirty || rows.length === 0}
                onClick={handleSave}
                className="h-10 gap-2 bg-[#0052D2] px-5 text-white hover:bg-[#0047B8] disabled:bg-[#E5E5E5] disabled:text-[#737373] disabled:opacity-100"
              >
                <Check className="h-4 w-4" /> Saqlash
              </Button>
              <Button
                disabled={rows.length === 0}
                onClick={() => setConfirmOpen(true)}
                className="h-10 gap-2 bg-[#16A34A] px-5 text-white hover:bg-[#15803D] disabled:bg-transparent disabled:text-[#737373] disabled:opacity-100"
              >
                <Check className="h-4 w-4" /> Tasdiqlash
              </Button>
            </>
          )}
          {status === STATUS.CONFIRMED && (
            <Button onClick={() => setCancelOpen(true)} className="h-10 gap-2 bg-[#DC2626] px-5 text-white hover:bg-[#B91C1C]">
              <X className="h-4 w-4" /> Bekor qilish
            </Button>
          )}
        </div>
      </div>

      <ConfirmPricesModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        doc={confirmDoc}
        stats={stats}
        onConfirm={handleConfirm}
      />
      <CancelPricesModal
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        doc={stored}
        stats={stats}
        previous={previous}
        onConfirm={({ reason, fileName }) => {
          dispatch(docCancelled({ id: stored.id, reason, fileName }))
          setCancelOpen(false)
          setToast(`Hujjat bekor qilindi, ${number}`)
        }}
      />
      <Toast message={toast} />
    </div>
  )
}
