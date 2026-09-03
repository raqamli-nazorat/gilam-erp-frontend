import { useMemo, useState } from 'react'
import { Printer, Wallet, X } from 'lucide-react'
import { formatDate, formatNumber } from '@/lib/format'
import { KASSAS } from '@/features/kassa/kassaMockData'
import { Button } from '@/components/ui/button'
import { NumberInput } from '@/components/ui/number-input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import RadioRow from './RadioRow'

const fieldCls =
  'h-9 w-full rounded-md border-[#E5E5E5] bg-white px-3 text-[14px] font-normal text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:border-white/10 dark:bg-card dark:text-white'
const labelCls = 'mb-1.5 block text-[12px] font-normal leading-[16px] text-[#737373] dark:text-muted-foreground'

const PAY_TYPES = [
  { key: 'cash', title: 'Naqd pul', sub: 'Kassaga naqd tushadi' },
  { key: 'card', title: 'Karta · HUMO / UZCARD', sub: 'Ekvayring hisobiga tushadi' },
  { key: 'bank', title: "Bank o'tkazmasi", sub: 'PERECHISLENIYA kassasi' },
  { key: 'nasiya', title: "Nasiya · qisman to'lov", sub: "Qolgan qism qarz bo'lib qoladi" },
]

export default function AcceptPaymentModal({ open, onOpenChange, doc, managerName, exchangeRate, onAccept }) {
  const debtUsd = useMemo(() => (doc ? Number((doc.amountUsd * (1 - doc.paidPct / 100)).toFixed(2)) : 0), [doc])

  const [payType, setPayType] = useState('cash')
  const [usd, setUsd] = useState(String(debtUsd))
  const [kassa, setKassa] = useState(KASSAS[0])

  const reset = () => {
    setPayType('cash')
    setUsd(String(debtUsd))
    setKassa(KASSAS[0])
  }

  if (!doc) return null

  const usdNum = Number(usd) || 0
  const uzsNum = Math.round(usdNum * exchangeRate)

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) reset()
        onOpenChange(next)
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto p-5 sm:max-w-[540px]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-[17px] font-semibold leading-[24px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            To'lovni qabul qilish
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-2 rounded-lg bg-[#F5F5F5] p-4 text-sm dark:bg-white/5">
          <Row label="Hujjat" value={`${doc.contract} · ${formatDate(doc.date)}`} />
          <Row label="Kontragent" value={doc.counterparty} />
          <Row label="Menejer" value={managerName} />
          <Row
            label="Qarz"
            value={`${formatNumber(debtUsd)} USD · ${formatNumber(debtUsd * exchangeRate, 0)} UZS`}
            valueClassName="text-[#B45309] dark:text-[#FBBF24]"
          />
        </div>

        <div>
          <Label className={labelCls}>To'lov turi</Label>
          <div className="flex flex-col gap-2.5">
            {PAY_TYPES.map((t) => (
              <RadioRow key={t.key} checked={payType === t.key} onClick={() => setPayType(t.key)} title={t.title} sub={t.sub} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <Label className={labelCls}>Summa, USD</Label>
            <NumberInput pad={2} value={usd} onChange={(e) => setUsd(e.target.value)} className={fieldCls} />
          </div>
          <div>
            <Label className={labelCls}>Summa, UZS</Label>
            <NumberInput
              decimals={false}
              value={String(uzsNum || '')}
              onChange={(e) => setUsd(String((Number(e.target.value) || 0) / exchangeRate))}
              className={fieldCls}
            />
          </div>
        </div>
        <p className="text-[12px] leading-[16px] text-[#737373] dark:text-muted-foreground">
          Kurs {formatNumber(exchangeRate)} · summani ikkala maydondan biriga kiriting, ikkinchisi avtomatik hisoblanadi
        </p>

        <div>
          <Label className={labelCls}>Kassa</Label>
          <Select value={kassa} onValueChange={setKassa}>
            <SelectTrigger className={fieldCls}><SelectValue /></SelectTrigger>
            <SelectContent>
              {KASSAS.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg bg-[#EAF1FE] px-3.5 py-3 text-[13px] text-[#0052D2] dark:bg-[#0052D2]/15 dark:text-[#60A5FA]">
          To'liq to'lovdan keyin hujjat «To'langan» tabiga o'tadi va menejer navbatidan chiqadi.
        </div>

        <DialogFooter className="mx-0 mb-0 mt-1 flex-wrap gap-2 border-0 bg-transparent p-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9 gap-1.5 border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
          >
            <X className="h-4 w-4" /> Bekor qilish
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onAccept({ docId: doc.id, usd: usdNum, kassa, withReceipt: true })
              onOpenChange(false)
            }}
            className="h-9 gap-1.5 border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
          >
            <Printer className="h-4 w-4" /> Chek bilan qabul qilish
          </Button>
          <Button
            type="button"
            disabled={usdNum <= 0}
            onClick={() => {
              onAccept({ docId: doc.id, usd: usdNum, kassa, withReceipt: false })
              onOpenChange(false)
            }}
            className="h-9 gap-1.5 bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8] disabled:bg-[#E5E5E5] disabled:text-[#A3A3A3] disabled:opacity-100 dark:disabled:bg-white/10"
          >
            <Wallet className="h-4 w-4" /> Qabul qilish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Row({ label, value, valueClassName = '' }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium ${valueClassName}`}>{value}</span>
    </div>
  )
}
