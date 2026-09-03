import { useEffect, useState } from 'react'
import { AlertTriangle, Truck, X } from 'lucide-react'
import { formatNumber } from '@/lib/format'
import { COLLECTORS, KASSAS } from '@/features/kassa/kassaMockData'
import { Button } from '@/components/ui/button'
import { NumberInput } from '@/components/ui/number-input'
import { Input } from '@/components/ui/input'
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

const fieldCls =
  'h-9 w-full rounded-md border-[#E5E5E5] bg-white px-3 text-[14px] font-normal text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:border-white/10 dark:bg-card dark:text-white'
const labelCls = 'mb-1.5 block text-[12px] font-normal leading-[16px] text-[#737373] dark:text-muted-foreground'

export default function CollectionModal({ open, onOpenChange, balance, exchangeRate, onConfirm }) {
  const [kassa, setKassa] = useState(KASSAS[0])
  const [collector, setCollector] = useState(COLLECTORS[0])
  const [uzs, setUzs] = useState('12000000')
  const [packet, setPacket] = useState('INK-2026-0841')

  useEffect(() => {
    if (!open) return
    setKassa(KASSAS[0])
    setCollector(COLLECTORS[0])
    setUzs('12000000')
    setPacket('INK-2026-0841')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const uzsNum = Number(uzs) || 0
  const usdEq = Number((uzsNum / exchangeRate).toFixed(2))
  const after = balance.uzs - uzsNum

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-5 sm:max-w-[560px]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-[17px] font-semibold leading-[24px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            Inkassaga topshirish
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-1">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <Label className={labelCls}>Kassa</Label>
              <Select value={kassa} onValueChange={setKassa}>
                <SelectTrigger className={fieldCls}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {KASSAS.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className={labelCls}>Inkassator</Label>
              <Select value={collector} onValueChange={setCollector}>
                <SelectTrigger className={fieldCls}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COLLECTORS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2 rounded-lg bg-[#F5F5F5] p-4 text-sm dark:bg-white/5">
            <Row label="Kassadagi naqd qoldiq" value={`${formatNumber(balance.uzs, 0)} UZS`} />
            <Row label="Topshirilayotgan summa" value={`${formatNumber(uzsNum, 0)} UZS`} />
            <Row label="Topshirgandan keyin qoladi" value={`${formatNumber(after, 0)} UZS`} valueClassName="text-[#047A47] dark:text-[#34D399]" />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <Label className={labelCls}>Topshiriladigan summa, UZS</Label>
              <NumberInput decimals={false} value={uzs} onChange={(e) => setUzs(e.target.value)} className={fieldCls} />
            </div>
            <div>
              <Label className={labelCls}>Ekvivalenti, USD</Label>
              <Input value={usdEq ? formatNumber(usdEq) : ''} disabled className={`${fieldCls} bg-[#F5F5F5] text-[#737373] disabled:opacity-100 dark:bg-white/5`} />
            </div>
          </div>

          <div>
            <Label className={labelCls}>Muhrlangan paket raqami</Label>
            <Input value={packet} onChange={(e) => setPacket(e.target.value)} className={fieldCls} />
          </div>

          <div className="flex gap-2.5 rounded-lg bg-[#FFF7ED] p-3 text-[13px] text-[#B45309] dark:bg-[#B45309]/15 dark:text-[#FBBF24]">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>Faqat naqd pul topshiriladi. Karta orqali tushgan summalar ekvayring hisobiga o'tadi va inkassaga kirmaydi.</p>
          </div>
        </div>

        <DialogFooter className="mx-0 mb-0 mt-1 gap-2 border-0 bg-transparent p-0">
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
            disabled={uzsNum <= 0}
            onClick={() => {
              onConfirm({ uzs: uzsNum, packet, collector })
              onOpenChange(false)
            }}
            className="h-9 gap-1.5 bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8] disabled:bg-[#E5E5E5] disabled:text-[#A3A3A3] disabled:opacity-100 dark:disabled:bg-white/10"
          >
            <Truck className="h-4 w-4" /> Topshirish
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
