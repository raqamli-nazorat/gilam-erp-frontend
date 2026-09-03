import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { Barcode, Camera, CheckCircle2, ChevronLeft, PackageOpen, Plus, Printer, RotateCcw, Trash2 } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { cn } from '@/lib/utils'
import { formatNumber } from '@/lib/format'
import {
  saleConfirmed,
  saleDeleted,
  saleDraftCreated,
  saleHeaderUpdated,
  salePaymentAdded,
  saleReverted,
  saleRowsAdded,
} from '@/features/sales/salesSlice'
import { Button } from '@/components/ui/button'
import Toast from '@/components/Toast'
import SaleHeaderForm from './components/SaleHeaderForm'
import AddProductModal from './components/AddProductModal'
import PaymentsModal from './components/PaymentsModal'
import SendToKassaModal from './components/SendToKassaModal'
import SalePrintModal from './components/SalePrintModal'
import DeleteSaleModal from './components/DeleteSaleModal'

export default function SaleDetailPage({ isNew }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const created = useRef(false)

  useEffect(() => {
    if (isNew && !created.current) {
      created.current = true
      const action = dispatch(saleDraftCreated())
      navigate(`/tovarlar-savdosi/${action.payload.id}`, { replace: true })
    }
  }, [isNew, dispatch, navigate])

  if (isNew) return null
  return <SaleWorkspace />
}

function SaleWorkspace() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const rate = useSelector((s) => s.saleDocs.exchangeRate)
  const doc = useSelector((s) => s.saleDocs.list.find((d) => d.id === id))

  const [addOpen, setAddOpen] = useState(false)
  const [payOpen, setPayOpen] = useState(false)
  const [kassaOpen, setKassaOpen] = useState(false)
  const [printOpen, setPrintOpen] = useState(false)
  const [delOpen, setDelOpen] = useState(false)
  const [toast, setToast] = useState('')

  const confirmed = doc?.status === 'confirmed'

  usePageHeader(
    'Tovarlar sotuvi',
    doc
      ? confirmed
        ? { label: 'Tasdiqlangan', variant: 'confirmed' }
        : doc.rows.length || doc.counterparty
          ? { label: doc.number, variant: 'new' }
          : { label: 'Yangi', variant: 'new' }
      : null
  )

  useEffect(() => {
    if (!doc) navigate('/tovarlar-savdosi', { replace: true })
  }, [doc, navigate])
  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(''), 3500)
    return () => clearTimeout(t)
  }, [toast])

  if (!doc) return null

  const gross = doc.rows.reduce((s, r) => s + r.sum, 0)
  const discount = doc.rows.reduce((s, r) => s + r.discount, 0)
  const profit = doc.rows.reduce((s, r) => s + r.profit, 0)
  const m2 = doc.rows.reduce((s, r) => s + r.m2, 0)
  const tolovUzs = Math.round((gross - discount) * rate)
  const hasRows = doc.rows.length > 0

  return (
    <>
      <div className="flex flex-col gap-4">
        {confirmed && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-[#0052D2]/25 bg-[#EAF1FE] px-4 py-3 text-[13px] font-medium text-[#0052D2] dark:bg-[#0052D2]/20 dark:text-[#60A5FA]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Hujjat tasdiqlangan va kassaga yuborilgan · faqat ko'rish
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch(saleReverted(doc.id))}
              className="h-8 gap-1.5 border-[#0052D2]/30 bg-white text-[13px] font-medium text-[#0052D2] hover:bg-white/70 dark:bg-transparent"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Qaytarish
            </Button>
          </div>
        )}

        <SaleHeaderForm
          doc={doc}
          exchangeRate={rate}
          readOnly={confirmed}
          onChange={(patch) => dispatch(saleHeaderUpdated({ id: doc.id, patch }))}
        />

        <div className="overflow-hidden rounded-xl border border-[#E5E5E5] bg-white dark:border-white/10 dark:bg-card">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E5E5] p-4 dark:border-white/10">
            <div className="flex items-center gap-2">
              <h2 className="text-[15px] font-semibold text-[#0A0A0A] dark:text-white">Sotuv qatorlari</h2>
              <span className="text-[13px] text-[#737373] dark:text-muted-foreground">· {doc.rows.length} ta</span>
            </div>
            {!confirmed && (
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" className="h-9 gap-1.5 border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white">
                  <PackageOpen className="h-4 w-4" /> Bron tanlash
                </Button>
                <Button type="button" variant="outline" onClick={() => setAddOpen(true)} className="h-9 gap-1.5 border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white">
                  <Barcode className="h-4 w-4" /> Shtrix kod
                </Button>
                <Button type="button" onClick={() => setAddOpen(true)} className="h-9 gap-1.5 bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]">
                  <Plus className="h-4 w-4" /> Tovar qo'shish
                </Button>
                {hasRows && (
                  <button
                    type="button"
                    onClick={() => setDelOpen(true)}
                    className="flex h-9 w-9 items-center justify-center rounded-md text-[#737373] transition-colors hover:bg-[#FEF2F2] hover:text-[#DC2626]"
                    aria-label="Hujjatni o'chirish"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {!hasRows ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F5F5] dark:bg-white/5">
                <PackageOpen className="h-6 w-6 text-[#737373]" />
              </div>
              <p className="text-[14px] font-medium text-[#0A0A0A] dark:text-white">Hali birorta qator qo'shilmagan</p>
              <p className="text-[12px] text-[#737373] dark:text-muted-foreground">
                Bronni tanlang, shtrix kodni skanerlang yoki tovarni qo'lda qo'shing
              </p>
              <Button type="button" onClick={() => setAddOpen(true)} className="h-9 gap-1.5 bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]">
                <Plus className="h-4 w-4" /> Tovar qo'shish
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F5F5F5] dark:bg-white/5">
                  <tr className="h-10 border-b border-[#E5E5E5] text-[11px] font-semibold uppercase text-[#737373] dark:border-white/10">
                    <th className="w-8 px-3 text-left">#</th>
                    <th className="px-3 text-left">TOVAR</th>
                    <th className="px-3 text-left">PARTIYA</th>
                    <th className="px-3 text-left">ASOS</th>
                    <th className="px-3 text-right">ENI</th>
                    <th className="px-3 text-right">BO'YI</th>
                    <th className="px-3 text-right">M²</th>
                    <th className="px-3 text-right">NARXI</th>
                    <th className="px-3 text-right">SUMMA</th>
                    <th className="px-3 text-right">CHEGIRMA</th>
                    <th className="px-3 text-right">FOYDA</th>
                  </tr>
                </thead>
                <tbody>
                  {doc.rows.map((r, i) => (
                    <tr key={r.id} className="h-12 border-b border-[#E5E5E5] dark:border-white/5">
                      <td className="px-3 text-[13px] text-[#737373]">{i + 1}</td>
                      <td className="px-3 text-[13px] font-medium text-[#0A0A0A] dark:text-white">{r.name}</td>
                      <td className="px-3 text-[13px] font-medium text-[#0052D2] dark:text-[#60A5FA]">{r.partiya}</td>
                      <td className="px-3 text-[13px] font-medium text-[#0052D2] dark:text-[#60A5FA]">{r.basis || <span className="text-[#737373]">—</span>}</td>
                      <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{formatNumber(r.widthM)}</td>
                      <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{formatNumber(r.lengthM)}</td>
                      <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{formatNumber(r.m2)}</td>
                      <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{formatNumber(r.priceUsd)}</td>
                      <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{formatNumber(r.sum)}</td>
                      <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{r.discount ? formatNumber(r.discount) : <span className="text-[#737373]">—</span>}</td>
                      <td className="px-3 text-right text-[13px] font-medium text-[#047A47] dark:text-[#34D399]">{formatNumber(r.profit)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-[#F5F5F5] dark:bg-white/5">
                  <tr className="h-11">
                    <td className="px-3" />
                    <td className="px-3 text-[13px] font-semibold text-[#0A0A0A] dark:text-white" colSpan={5}>JAMI</td>
                    <td className="px-3 text-right text-[13px] font-semibold text-[#0A0A0A] dark:text-white">{formatNumber(m2)}</td>
                    <td className="px-3" />
                    <td className="px-3 text-right text-[13px] font-semibold text-[#0A0A0A] dark:text-white">{formatNumber(gross)}</td>
                    <td className="px-3 text-right text-[13px] font-semibold text-[#0A0A0A] dark:text-white">{formatNumber(discount)}</td>
                    <td className="px-3 text-right text-[13px] font-semibold text-[#047A47] dark:text-[#34D399]">{formatNumber(profit)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Pastki panel */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E5E5E5] bg-white px-5 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.06)] dark:border-white/10 dark:bg-card">
          <div className="flex items-center gap-6 text-[13px]">
            <Stat label="Jami summa" value={<span className="text-[16px] font-bold text-[#0A0A0A] dark:text-white">{formatNumber(gross)} USD</span>} />
            <Stat label="Chegirma" value={<span className="font-medium text-[#0A0A0A] dark:text-white">{formatNumber(discount)} USD</span>} />
            <Stat label="To'lov, UZS" value={<span className="font-medium text-[#0A0A0A] dark:text-white">{formatNumber(tolovUzs, 0)}</span>} />
            <Stat label="Foyda" value={<span className="font-medium text-[#047A47] dark:text-[#34D399]">{formatNumber(profit)} USD</span>} />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" disabled={!hasRows} onClick={() => setPayOpen(true)} className={btnCls}>
              <ChevronLeft className="h-4 w-4" /> To'lovlar ro'yxati
            </Button>
            {!confirmed && (
              <Button type="button" variant="outline" disabled={!hasRows} onClick={() => setKassaOpen(true)} className={btnCls}>
                <Camera className="h-4 w-4" /> Kassaga yuborish
              </Button>
            )}
            <Button type="button" variant="outline" disabled={!hasRows} onClick={() => setPrintOpen(true)} className={btnCls}>
              <Printer className="h-4 w-4" /> Chop etish
            </Button>
            {!confirmed && (
              <Button
                type="button"
                disabled={!hasRows}
                onClick={() => setToast(`Hujjat saqlandi · ${doc.number}`)}
                className="h-9 gap-1.5 bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8] disabled:bg-[#E5E5E5] disabled:text-[#A3A3A3] disabled:opacity-100 dark:disabled:bg-white/10"
              >
                ✓ Saqlash
              </Button>
            )}
          </div>
        </div>
      </div>

      <AddProductModal
        open={addOpen}
        onOpenChange={setAddOpen}
        warehouse={doc.warehouse}
        onAdd={(products) => dispatch(saleRowsAdded({ id: doc.id, products }))}
      />
      <PaymentsModal
        open={payOpen}
        onOpenChange={setPayOpen}
        doc={doc}
        exchangeRate={rate}
        onAddPayment={(payment) => dispatch(salePaymentAdded({ id: doc.id, payment }))}
      />
      <SendToKassaModal
        open={kassaOpen}
        onOpenChange={setKassaOpen}
        doc={doc}
        exchangeRate={rate}
        onConfirm={() => {
          dispatch(saleConfirmed(doc.id))
          setToast(`Hujjat kassaga yuborildi · ${doc.number}`)
        }}
      />
      <SalePrintModal open={printOpen} onOpenChange={setPrintOpen} doc={doc} />
      <DeleteSaleModal
        open={delOpen}
        onOpenChange={setDelOpen}
        doc={doc}
        onConfirm={() => {
          dispatch(saleDeleted(doc.id))
          navigate('/tovarlar-savdosi')
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
