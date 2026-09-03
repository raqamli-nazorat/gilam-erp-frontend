import { useEffect, useState } from 'react'
import { Wallet, X } from 'lucide-react'
import { formatNumber } from '@/lib/format'
import { CHIQIM_RECIPIENTS, CHIQIM_TYPES, KASSAS } from '@/features/kassa/kassaMockData'
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

const fieldCls =
  'h-9 w-full rounded-md border-[#E5E5E5] bg-white px-3 text-[14px] font-normal text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:border-white/10 dark:bg-card dark:text-white'
const labelCls = 'mb-1.5 block text-[12px] font-normal leading-[16px] text-[#737373] dark:text-muted-foreground'

export default function CashOutModal({ open, onOpenChange, defaultType = 'Xarajat', balance, exchangeRate, onConfirm }) {
  const [type, setType] = useState(defaultType)
  const [recipient, setRecipient] = useState(CHIQIM_RECIPIENTS[0])
  const [kassa, setKassa] = useState(KASSAS[0])
  const [usd, setUsd] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    if (!open) return
    setType(defaultType)
    setRecipient(CHIQIM_RECIPIENTS[0])
    setKassa(KASSAS[0])
    setUsd('')
    setNote('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultType])

  const usdNum = Number(usd) || 0
  const uzsNum = Math.round(usdNum * exchangeRate)
  const after = balance.usd - usdNum

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-5 sm:max-w-[560px]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-[17px] font-semibold leading-[24px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            Kassa chiqimi
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-1">
          <div>
            <Label className={labelCls}>Chiqim turi</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className={fieldCls}><SelectValue /></SelectTrigger>
              <SelectContent>
                {CHIQIM_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <Label className={labelCls}>Kimga</Label>
              <Select value={recipient} onValueChange={setRecipient}>
                <SelectTrigger className={fieldCls}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CHIQIM_RECIPIENTS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className={labelCls}>Kassa</Label>
              <Select value={kassa} onValueChange={setKassa}>
                <SelectTrigger className={fieldCls}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {KASSAS.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <Label className={labelCls}>Summa, USD</Label>
                <NumberInput pad={2} placeholder="0,00" value={usd} onChange={(e) => setUsd(e.target.value)} className={fieldCls} />
              </div>
              <div>
                <Label className={labelCls}>Summa, UZS</Label>
                <NumberInput
                  decimals={false}
                  placeholder="0"
                  value={String(uzsNum || '')}
                  onChange={(e) => setUsd(String((Number(e.target.value) || 0) / exchangeRate))}
                  className={fieldCls}
                />
              </div>
            </div>
            <p className="mt-1.5 text-[12px] leading-[16px] text-[#737373] dark:text-muted-foreground">
              Kurs {formatNumber(exchangeRate)} · bittasini kiriting, ikkinchisi avtomatik hisoblanadi
            </p>
          </div>

          <div>
            <Label className={labelCls}>Izoh</Label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Izoh — masalan: Toshkent yo'nalishi, yuk yetkazish"
              className="w-full resize-none rounded-md border border-[#E5E5E5] bg-white px-3 py-2 text-[14px] font-normal text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] outline-none transition-colors placeholder:text-[#737373] focus:border-[#0052D2] focus:ring-2 focus:ring-[#0052D2]/20 dark:border-white/10 dark:bg-card dark:text-white"
            />
          </div>

          <div className="rounded-lg bg-[#EAF1FE] px-3.5 py-3 text-[13px] text-[#0052D2] dark:bg-[#0052D2]/15 dark:text-[#60A5FA]">
            Chiqimdan keyin {kassa} qoldig'i {formatNumber(balance.usd)} USD dan {formatNumber(after)} USD ga tushadi.
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
            disabled={usdNum <= 0}
            onClick={() => {
              onConfirm({ type, note: note.trim() || `${type} · ${recipient}`, kassa, usd: usdNum })
              onOpenChange(false)
            }}
            className="h-9 gap-1.5 bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8] disabled:bg-[#E5E5E5] disabled:text-[#A3A3A3] disabled:opacity-100 dark:disabled:bg-white/10"
          >
            <Wallet className="h-4 w-4" /> Chiqim qilish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
