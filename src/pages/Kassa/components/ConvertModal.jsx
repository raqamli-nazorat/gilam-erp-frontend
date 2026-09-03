import { useEffect, useState } from 'react'
import { AlertTriangle, RefreshCw, X } from 'lucide-react'
import { formatNumber } from '@/lib/format'
import { KASSAS } from '@/features/kassa/kassaMockData'
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
import RadioRow from './RadioRow'

const fieldCls =
  'h-9 w-full rounded-md border-[#E5E5E5] bg-white px-3 text-[14px] font-normal text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:border-white/10 dark:bg-card dark:text-white'
const labelCls = 'mb-1.5 block text-[12px] font-normal leading-[16px] text-[#737373] dark:text-muted-foreground'

export default function ConvertModal({ open, onOpenChange, balance, exchangeRate, onConfirm }) {
  const [direction, setDirection] = useState('usd2uzs')
  const [kassa, setKassa] = useState(KASSAS[0])
  const [rate, setRate] = useState(String(exchangeRate))
  const [give, setGive] = useState('1000')

  useEffect(() => {
    if (!open) return
    setDirection('usd2uzs')
    setKassa(KASSAS[0])
    setRate(String(exchangeRate))
    setGive('1000')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, exchangeRate])

  const rateNum = Number(rate) || exchangeRate
  const giveNum = Number(give) || 0
  const usd2uzs = direction === 'usd2uzs'
  const receiveNum = usd2uzs ? Math.round(giveNum * rateNum) : Number((giveNum / rateNum).toFixed(2))

  const afterUsd = usd2uzs ? balance.usd - giveNum : balance.usd + receiveNum
  const afterUzs = usd2uzs ? balance.uzs + receiveNum : balance.uzs - giveNum

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-5 sm:max-w-[560px]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-[17px] font-semibold leading-[24px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            Valyuta konvertatsiyasi
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-1">
          <div>
            <Label className={labelCls}>Yo'nalish</Label>
            <div className="flex flex-col gap-2.5">
              <RadioRow checked={usd2uzs} onClick={() => setDirection('usd2uzs')} title="USD → UZS" sub="USD kamayadi, UZS oshadi" />
              <RadioRow checked={!usd2uzs} onClick={() => setDirection('uzs2usd')} title="UZS → USD" sub="UZS kamayadi, USD oshadi" />
            </div>
          </div>

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
              <Label className={labelCls}>Kurs</Label>
              <NumberInput pad={2} value={rate} onChange={(e) => setRate(e.target.value)} className={fieldCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <Label className={labelCls}>Beriladigan summa, {usd2uzs ? 'USD' : 'UZS'}</Label>
              <NumberInput decimals={usd2uzs} pad={usd2uzs ? 2 : undefined} value={give} onChange={(e) => setGive(e.target.value)} className={fieldCls} />
            </div>
            <div>
              <Label className={labelCls}>Olinadigan summa, {usd2uzs ? 'UZS' : 'USD'}</Label>
              <Input
                value={receiveNum ? formatNumber(receiveNum, usd2uzs ? 0 : 2) : ''}
                disabled
                className={`${fieldCls} bg-[#F5F5F5] text-[#737373] disabled:opacity-100 dark:bg-white/5`}
              />
            </div>
          </div>

          <div className="flex gap-2.5 rounded-lg bg-[#FFF7ED] p-3 text-[13px] text-[#B45309] dark:bg-[#B45309]/15 dark:text-[#FBBF24]">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>Kurs topbardagi kunlik kursdan olinadi, lekin bu amal uchun qo'lda o'zgartirilishi mumkin — farq hisobotda ko'rinadi.</p>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-[#EAF1FE] px-3.5 py-3 text-[#0052D2] dark:bg-[#0052D2]/15 dark:text-[#60A5FA]">
            <div>
              <p className="text-[12px]">Konvertatsiyadan keyin</p>
              <p className="text-[16px] font-bold">{formatNumber(afterUsd)} USD</p>
            </div>
            <div className="text-right">
              <p className="text-[12px]">UZS qoldig'i</p>
              <p className="text-[16px] font-bold">{formatNumber(afterUzs, 0)}</p>
            </div>
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
            disabled={giveNum <= 0}
            onClick={() => {
              onConfirm({
                direction,
                usd: usd2uzs ? giveNum : receiveNum,
                uzs: usd2uzs ? receiveNum : giveNum,
              })
              onOpenChange(false)
            }}
            className="h-9 gap-1.5 bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8] disabled:bg-[#E5E5E5] disabled:text-[#A3A3A3] disabled:opacity-100 dark:disabled:bg-white/10"
          >
            <RefreshCw className="h-4 w-4" /> Konvertatsiya qilish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
