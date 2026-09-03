import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2, Package, Printer, RotateCcw } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { cn } from '@/lib/utils'
import { formatNumber } from '@/lib/format'
import { qkArea, qkDefectArea, qkValue } from '@/features/qaytarishKirimi/qkMockData'
import {
  qkDraftCreated,
  qkEntered,
  qkHeaderUpdated,
  qkPlacementApplied,
  qkReverted,
} from '@/features/qaytarishKirimi/qkSlice'
import { Button } from '@/components/ui/button'
import Toast from '@/components/Toast'
import QkHeaderForm from './components/QkHeaderForm'
import QkPlacementModal from './components/QkPlacementModal'
import QkConfirmModal from './components/QkConfirmModal'

export default function QaytarishKirimiDetailPage({ isNew }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const created = useRef(false)

  useEffect(() => {
    if (isNew && !created.current) {
      created.current = true
      const action = dispatch(qkDraftCreated())
      navigate(`/qaytarish-kirimi/${action.payload.id}`, { replace: true })
    }
  }, [isNew, dispatch, navigate])

  if (isNew) return null
  return <QkWorkspace />
}

function QkWorkspace() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const rate = useSelector((s) => s.qaytarishKirimi.exchangeRate)
  const doc = useSelector((s) => s.qaytarishKirimi.list.find((d) => d.id === id))

  const [placeOpen, setPlaceOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [toast, setToast] = useState('')

  const isEntered = doc?.status === 'entered'

  usePageHeader(
    'Qaytarish kirimi',
    doc
      ? isEntered
        ? { label: 'Omborga kirdi', variant: 'confirmed' }
        : { label: doc.number, variant: 'new' }
      : null
  )

  useEffect(() => {
    if (!doc) navigate('/qaytarish-kirimi', { replace: true })
  }, [doc, navigate])
  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(''), 3500)
    return () => clearTimeout(t)
  }, [toast])

  if (!doc) return null

  const area = qkArea(doc)
  const valueUsd = qkValue(doc)
  const defect = qkDefectArea(doc)
  const needsPlacement = doc.rows.some((r) => !r.location)

  return (
    <>
      <div className="flex flex-col gap-4">
        {isEntered && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-[#0052D2]/25 bg-[#EAF1FE] px-4 py-3 text-[13px] font-medium text-[#0052D2] dark:border-[#0052D2]/40 dark:bg-[#0052D2]/20 dark:text-[#60A5FA]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Rulonlar omborga kiritildi va sotuvga ochildi · faqat ko'rish
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch(qkReverted(doc.id))}
              className="h-8 gap-1.5 border-[#0052D2]/30 bg-white text-[13px] font-medium text-[#0052D2] hover:bg-white/70 dark:bg-transparent"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Kutilmoqdaga qaytarish
            </Button>
          </div>
        )}

        <QkHeaderForm
          doc={doc}
          exchangeRate={rate}
          readOnly={isEntered}
          onChange={(patch) => dispatch(qkHeaderUpdated({ id: doc.id, patch }))}
        />

        <div className="flex items-start gap-2.5 rounded-xl border border-[#0052D2]/20 bg-[#EAF1FE]/60 px-4 py-3 text-[13px] text-[#0052D2] dark:border-[#0052D2]/30 dark:bg-[#0052D2]/10 dark:text-[#60A5FA]">
          <Package className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Qatorlar {doc.basis} qaytarish hujjatidan olindi. Har bir rulon uchun
            ombor va joylashuvni tanlang — qoldiq shundan keyin oshadi.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-[#E5E5E5] bg-white dark:border-white/10 dark:bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F5F5F5] dark:bg-white/5">
                <tr className="h-10 border-b border-[#E5E5E5] text-[11px] font-semibold uppercase text-[#737373] dark:border-white/10">
                  <th className="w-8 px-3 text-left">#</th>
                  <th className="px-3 text-left">TOVAR</th>
                  <th className="px-3 text-left">PARTIYA</th>
                  <th className="px-3 text-left">ASOS HUJJAT</th>
                  <th className="px-3 text-right">M²</th>
                  <th className="px-3 text-left">SIFAT HOLATI</th>
                  <th className="px-3 text-left">OMBOR</th>
                  <th className="px-3 text-left">JOYLASHUV</th>
                  <th className="px-3 text-right">QIYMAT, USD</th>
                </tr>
              </thead>
              <tbody>
                {doc.rows.map((r, i) => {
                  const defective = r.quality === 'Nuqsonli'
                  return (
                    <tr key={r.id} className="h-12 border-b border-[#E5E5E5] last:border-0 dark:border-white/5">
                      <td className="px-3 text-[13px] text-[#737373]">{i + 1}</td>
                      <td className="px-3 text-[13px] font-medium text-[#0A0A0A] dark:text-white">{r.name}</td>
                      <td className="px-3 text-[13px] font-medium text-[#0052D2] dark:text-[#60A5FA]">{r.partiya}</td>
                      <td className="px-3 text-[13px] font-medium text-[#0052D2] dark:text-[#60A5FA]">{r.basis || <span className="text-[#737373]">—</span>}</td>
                      <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{formatNumber(r.m2)}</td>
                      <td className={cn('px-3 text-[13px]', defective ? 'font-medium text-[#B45309] dark:text-[#FBBF24]' : 'text-[#0A0A0A] dark:text-white')}>
                        {r.quality}
                      </td>
                      <td className="px-3 text-[13px] text-[#525252] dark:text-muted-foreground">{r.warehouse || '—'}</td>
                      <td className="px-3 text-[13px] text-[#525252] dark:text-muted-foreground">{r.location || <span className="text-[#B45309] dark:text-[#FBBF24]">Tanlanmagan</span>}</td>
                      <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{formatNumber(r.sum)}</td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot className="bg-[#F5F5F5] dark:bg-white/5">
                <tr className="h-11">
                  <td className="px-3" />
                  <td className="px-3 text-[13px] font-semibold text-[#0A0A0A] dark:text-white" colSpan={3}>JAMI</td>
                  <td className="px-3 text-right text-[13px] font-semibold text-[#0A0A0A] dark:text-white">{formatNumber(area)}</td>
                  <td className="px-3" colSpan={3} />
                  <td className="px-3 text-right text-[13px] font-semibold text-[#0A0A0A] dark:text-white">{formatNumber(valueUsd)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Pastki panel */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E5E5E5] bg-white px-5 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.06)] dark:border-white/10 dark:bg-card">
          <div className="flex items-center gap-6 text-[13px]">
            <Stat label="Kirim maydoni" value={<span className="text-[16px] font-bold text-[#0A0A0A] dark:text-white">{formatNumber(area)} m²</span>} />
            <Stat label="Qiymat" value={<span className="font-medium text-[#0A0A0A] dark:text-white">{formatNumber(valueUsd)} USD</span>} />
            <Stat label="Nuqsonli" value={<span className="font-medium text-[#B45309] dark:text-[#FBBF24]">{formatNumber(defect)} m²</span>} />
          </div>

          <div className="flex gap-2">
            {!isEntered && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setPlaceOpen(true)}
                className={btnCls}
              >
                <Package className="h-4 w-4" /> Joylashuvni tanlash
              </Button>
            )}
            <Button type="button" variant="outline" className={btnCls}>
              <Printer className="h-4 w-4" /> Chop etish
            </Button>
            {!isEntered && (
              <Button
                type="button"
                disabled={needsPlacement}
                onClick={() => setConfirmOpen(true)}
                className="h-9 gap-1.5 bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8] disabled:bg-[#E5E5E5] disabled:text-[#A3A3A3] disabled:opacity-100 dark:disabled:bg-white/10"
              >
                ✓ Omborga kiritish
              </Button>
            )}
          </div>
        </div>
      </div>

      <QkPlacementModal
        open={placeOpen}
        onOpenChange={setPlaceOpen}
        doc={doc}
        onApply={(patch) => {
          dispatch(qkPlacementApplied({ id: doc.id, ...patch }))
          setToast('Joylashuv qo\'llandi')
        }}
      />

      <QkConfirmModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        doc={doc}
        onConfirm={() => {
          dispatch(qkEntered(doc.id))
          setToast(`Omborga kiritildi · ${doc.number}`)
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
