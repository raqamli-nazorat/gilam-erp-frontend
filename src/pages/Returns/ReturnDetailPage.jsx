import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { AlertTriangle, Barcode, CheckCircle2, Printer, RotateCcw, X } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { cn } from '@/lib/utils'
import { formatNumber } from '@/lib/format'
import { findReturnableGroup } from '@/features/returns/returnsMockData'
import {
  returnAccepted,
  returnDraftCreated,
  returnHeaderUpdated,
  returnReasonTypeSet,
  returnRejected,
  returnReverted,
  returnRowsAdded,
} from '@/features/returns/returnsSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Toast from '@/components/Toast'
import ReturnHeaderForm from './components/ReturnHeaderForm'
import ManualPickModal from './components/ManualPickModal'
import ReasonTypeModal from './components/ReasonTypeModal'
import ReturnConfirmModal from './components/ReturnConfirmModal'
import ReturnRejectModal from './components/ReturnRejectModal'

export default function ReturnDetailPage({ isNew }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const created = useRef(false)

  useEffect(() => {
    if (isNew && !created.current) {
      created.current = true
      const action = dispatch(returnDraftCreated())
      navigate(`/tovarlar-qaytarishi/${action.payload.id}`, { replace: true })
    }
  }, [isNew, dispatch, navigate])

  if (isNew) return null
  return <ReturnWorkspace />
}

function ReturnWorkspace() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const rate = useSelector((s) => s.returns.exchangeRate)
  const doc = useSelector((s) => s.returns.list.find((d) => d.id === id))

  const [code, setCode] = useState('')
  const [scanMsg, setScanMsg] = useState(null) // { type: 'ok' | 'error', text }
  const [pickOpen, setPickOpen] = useState(false)
  const [reasonOpen, setReasonOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [toast, setToast] = useState('')

  const isAccepted = doc?.status === 'accepted'
  const isRejected = doc?.status === 'rejected'
  const isFinal = isAccepted || isRejected

  usePageHeader(
    'Tovarlar qaytarishi',
    doc
      ? isAccepted
        ? { label: 'Qabul qilindi', variant: 'confirmed' }
        : isRejected
          ? { label: 'Rad etildi', variant: 'rejected' }
          : doc.rows.length || doc.counterparty
            ? { label: doc.number, variant: 'new' }
            : { label: 'Yangi', variant: 'new' }
      : null
  )

  useEffect(() => {
    if (!doc) navigate('/tovarlar-qaytarishi', { replace: true })
  }, [doc, navigate])
  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(''), 3500)
    return () => clearTimeout(t)
  }, [toast])

  if (!doc) return null

  const m2 = doc.rows.reduce((s, r) => s + r.m2, 0)
  const sumUsd = doc.rows.reduce((s, r) => s + r.sum, 0)
  const sumUzs = Math.round(sumUsd * rate)
  const hasRows = doc.rows.length > 0

  function addRows(items) {
    dispatch(returnRowsAdded({ id: doc.id, rows: items }))
    if (!doc.counterparty && items[0]?.counterparty) {
      dispatch(returnHeaderUpdated({ id: doc.id, patch: { counterparty: items[0].counterparty } }))
    }
  }

  function handleScan() {
    const value = code.trim()
    if (!value) return
    const found = findReturnableGroup(value)
    const existing = new Set(doc.rows.map((r) => r.partiya))
    const fresh = found.filter((r) => !existing.has(r.partiya))
    if (found.length === 0) {
      setScanMsg({ type: 'error', text: `"${value}" bo'yicha qaytariladigan rulon topilmadi` })
    } else if (fresh.length === 0) {
      setScanMsg({ type: 'error', text: 'Bu rulon(lar) allaqachon qo’shilgan' })
    } else {
      addRows(fresh)
      setScanMsg({ type: 'ok', text: `${fresh.length} ta rulon topildi va qo'shildi` })
    }
    setCode('')
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {isFinal && (
          <div
            className={cn(
              'flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-[13px] font-medium',
              isAccepted
                ? 'border-[#0052D2]/25 bg-[#EAF1FE] text-[#0052D2] dark:bg-[#0052D2]/20 dark:text-[#60A5FA]'
                : 'border-red-200 bg-red-50 text-[#DC2626] dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400'
            )}
          >
            <div className="flex items-center gap-2">
              {isAccepted ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              {isAccepted
                ? "Qaytarish qabul qilindi va omborga kiritildi · faqat ko'rish"
                : `Qaytarish rad etildi${doc.rejectReason ? ` · ${doc.rejectReason}` : ''}`}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch(returnReverted(doc.id))}
              className={cn(
                'h-8 gap-1.5 border bg-white text-[13px] font-medium hover:bg-white/70 dark:bg-transparent',
                isAccepted ? 'border-[#0052D2]/30 text-[#0052D2]' : 'border-red-300 text-[#DC2626]'
              )}
            >
              <RotateCcw className="h-3.5 w-3.5" /> Qoralamaga qaytarish
            </Button>
          </div>
        )}

        <ReturnHeaderForm
          doc={doc}
          exchangeRate={rate}
          readOnly={isFinal}
          onChange={(patch) => dispatch(returnHeaderUpdated({ id: doc.id, patch }))}
        />

        <div className="overflow-hidden rounded-xl border border-[#E5E5E5] bg-white dark:border-white/10 dark:bg-card">
          {!isFinal && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E5E5] p-4 dark:border-white/10">
              <div className="flex flex-1 flex-wrap items-center gap-3">
                <div className="relative w-full max-w-[320px]">
                  <Barcode className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                    placeholder="Shtrix kod yoki partiya raqami"
                    className="h-9 w-full rounded-md border-[#E5E5E5] bg-white pl-9 pr-3 text-[14px] dark:border-white/10 dark:bg-card dark:text-white"
                  />
                </div>
                {scanMsg && (
                  <span
                    className={cn(
                      'text-[13px] font-medium',
                      scanMsg.type === 'ok' ? 'text-[#047A47] dark:text-[#34D399]' : 'text-[#DC2626]'
                    )}
                  >
                    {scanMsg.type === 'ok' ? '✓ ' : ''}
                    {scanMsg.text}
                  </span>
                )}
              </div>
              {hasRows && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setReasonOpen(true)}
                  className="h-9 gap-1.5 border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
                >
                  + Sabab va turi
                </Button>
              )}
            </div>
          )}

          {!hasRows ? (
            <div className="mx-4 my-4 flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[#0052D2]/30 bg-[#EAF1FE]/40 px-6 py-12 text-center dark:border-[#0052D2]/40 dark:bg-[#0052D2]/10">
              <Barcode className="h-8 w-8 text-[#0052D2] dark:text-[#60A5FA]" />
              <p className="text-[15px] font-semibold text-[#0052D2] dark:text-[#60A5FA]">SHTRIX KODNI SKANERLANG</p>
              <p className="max-w-md text-[13px] text-[#525252] dark:text-muted-foreground">
                Qaytarish partiyadan boshlanadi — skaner rulonni, uning kirim hujjatini va narxini o'zi topadi
              </p>
              <p className="text-[13px] text-[#737373] dark:text-muted-foreground">
                Skaner yo'qmi?{' '}
                <button
                  type="button"
                  onClick={() => setPickOpen(true)}
                  className="font-medium text-[#0052D2] hover:underline dark:text-[#60A5FA]"
                >
                  + Qo'lda tanlash
                </button>
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F5F5F5] dark:bg-white/5">
                  <tr className="h-10 border-b border-[#E5E5E5] text-[11px] font-semibold uppercase text-[#737373] dark:border-white/10">
                    <th className="w-8 px-3 text-left">#</th>
                    <th className="px-3 text-left">TOVAR</th>
                    <th className="px-3 text-left">PARTIYA</th>
                    <th className="px-3 text-left">ASOS HUJJAT</th>
                    <th className="px-3 text-right">ENI</th>
                    <th className="px-3 text-right">BO'YI</th>
                    <th className="px-3 text-right">M²</th>
                    <th className="px-3 text-right">NARXI</th>
                    <th className="px-3 text-right">SUMMA</th>
                    <th className="px-3 text-left">SABAB</th>
                  </tr>
                </thead>
                <tbody>
                  {doc.rows.map((r, i) => (
                    <tr key={r.id} className="h-12 border-b border-[#E5E5E5] last:border-0 dark:border-white/5">
                      <td className="px-3 text-[13px] text-[#737373]">{i + 1}</td>
                      <td className="px-3 text-[13px] font-medium text-[#0A0A0A] dark:text-white">{r.name}</td>
                      <td className="px-3 text-[13px] font-medium text-[#0052D2] dark:text-[#60A5FA]">{r.partiya}</td>
                      <td className="px-3 text-[13px] font-medium text-[#0052D2] dark:text-[#60A5FA]">{r.basis || <span className="text-[#737373]">—</span>}</td>
                      <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{formatNumber(r.widthM)}</td>
                      <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{formatNumber(r.lengthM)}</td>
                      <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{formatNumber(r.m2)}</td>
                      <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{formatNumber(r.priceUsd)}</td>
                      <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{formatNumber(r.sum)}</td>
                      <td className="px-3 text-[13px] text-[#525252] dark:text-muted-foreground">{r.reason || '—'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-[#F5F5F5] dark:bg-white/5">
                  <tr className="h-11">
                    <td className="px-3" />
                    <td className="px-3 text-[13px] font-semibold text-[#0A0A0A] dark:text-white" colSpan={5}>JAMI</td>
                    <td className="px-3 text-right text-[13px] font-semibold text-[#0A0A0A] dark:text-white">{formatNumber(m2)}</td>
                    <td className="px-3" />
                    <td className="px-3 text-right text-[13px] font-semibold text-[#0A0A0A] dark:text-white">{formatNumber(sumUsd)}</td>
                    <td className="px-3" />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Pastki panel */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E5E5E5] bg-white px-5 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.06)] dark:border-white/10 dark:bg-card">
          <div className="flex items-center gap-6 text-[13px]">
            <Stat label="Qaytariladigan maydon" value={<span className="text-[16px] font-bold text-[#0A0A0A] dark:text-white">{formatNumber(m2)} m²</span>} />
            <Stat label="Summa" value={<span className="font-medium text-[#0A0A0A] dark:text-white">{formatNumber(sumUsd)} USD · {formatNumber(sumUzs, 0)} UZS</span>} />
            <Stat label="Qatorlar" value={<span className="font-medium text-[#0A0A0A] dark:text-white">{doc.rows.length} ta</span>} />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" disabled={!hasRows} className={btnCls}>
              <Printer className="h-4 w-4" /> Chop etish
            </Button>
            {!isFinal && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  disabled={!hasRows}
                  onClick={() => setRejectOpen(true)}
                  className="h-9 gap-1.5 border-[#FCA5A5] bg-white px-4 text-[14px] font-medium text-[#DC2626] hover:bg-[#FEF2F2] disabled:opacity-50 dark:border-red-900/40 dark:bg-card"
                >
                  <X className="h-4 w-4" /> Rad etish
                </Button>
                <Button
                  type="button"
                  disabled={!hasRows}
                  onClick={() => setConfirmOpen(true)}
                  className="h-9 gap-1.5 bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8] disabled:bg-[#E5E5E5] disabled:text-[#A3A3A3] disabled:opacity-100 dark:disabled:bg-white/10"
                >
                  ✓ Tasdiqlash
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <ManualPickModal
        open={pickOpen}
        onOpenChange={setPickOpen}
        existingPartiyas={doc.rows.map((r) => r.partiya)}
        onAdd={(items) => {
          addRows(items)
          setScanMsg({ type: 'ok', text: `${items.length} ta rulon qo'shildi` })
        }}
      />

      <ReasonTypeModal
        open={reasonOpen}
        onOpenChange={setReasonOpen}
        doc={doc}
        onApply={(patch) => dispatch(returnReasonTypeSet({ id: doc.id, patch }))}
      />

      <ReturnConfirmModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        doc={doc}
        exchangeRate={rate}
        onConfirm={() => {
          dispatch(returnAccepted(doc.id))
          setToast(`Qaytarish tasdiqlandi · ${doc.number}`)
        }}
      />

      <ReturnRejectModal
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        doc={doc}
        onReject={({ rejectReason, rejectComment }) => {
          dispatch(returnRejected({ id: doc.id, rejectReason, rejectComment }))
          setToast(`Qaytarish rad etildi · ${doc.number}`)
        }}
      />

      <Toast message={toast} />
    </>
  )
}

const btnCls =
  'h-9 gap-1.5 border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] disabled:opacity-50 dark:border-white/10 dark:bg-card dark:text-white'

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-[12px] font-normal text-[#737373] dark:text-muted-foreground">{label}</p>
      <p className="mt-0.5">{value}</p>
    </div>
  )
}
