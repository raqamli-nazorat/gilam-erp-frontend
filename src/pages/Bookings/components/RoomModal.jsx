import { useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { formatNumber } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NumberInput } from '@/components/ui/number-input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const fieldCls =
  'h-9 w-full rounded-md border-[#E5E5E5] bg-white px-3 text-[14px] font-normal text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-card dark:text-white'
const labelCls = 'mb-1.5 block text-[12px] font-normal leading-[16px] text-[#737373] dark:text-muted-foreground'

export default function RoomModal({ open, onOpenChange, neededM2 = 0, onAdd }) {
  const [name, setName] = useState('')
  const [widthM, setWidthM] = useState('4')
  const [lengthM, setLengthM] = useState('')

  useEffect(() => {
    if (open) {
      setName('')
      setWidthM('4')
      setLengthM('')
    }
  }, [open])

  const area = Number((Number(widthM || 0) * Number(lengthM || 0)).toFixed(2))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-5 sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-[17px] font-semibold leading-[24px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            Xona qo'shish
          </DialogTitle>
        </DialogHeader>

        <div>
          <Label className={labelCls}>Xona nomi</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Masalan: Mehmonxona" className={fieldCls} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className={labelCls}>Eni, m</Label>
            <NumberInput pad={2} value={widthM} onChange={(e) => setWidthM(e.target.value)} className={fieldCls} />
          </div>
          <div>
            <Label className={labelCls}>Bo'yi, m</Label>
            <NumberInput pad={2} value={lengthM} onChange={(e) => setLengthM(e.target.value)} className={fieldCls} />
          </div>
        </div>

        <div>
          <Label className={labelCls}>Maydon, m² (hisoblanadi)</Label>
          <Input value={formatNumber(area)} disabled className={`${fieldCls} bg-[#F5F5F5] disabled:opacity-100 dark:bg-white/5`} />
        </div>

        <div className="rounded-lg bg-[#EAF1FE] px-3.5 py-2.5 text-[13px] font-medium leading-[18px] text-[#0052D2] dark:bg-[#0052D2]/20 dark:text-[#60A5FA]">
          {formatNumber(widthM)} × {formatNumber(lengthM)} = {formatNumber(area)} m² · bron{' '}
          {formatNumber(neededM2 + area)} m² gacha oshadi
        </div>

        <DialogFooter className="mx-0 mb-0 mt-3 gap-2 border-0 border-t-0 bg-transparent p-0">
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
            disabled={!name || area <= 0}
            onClick={() => {
              onAdd({ name, widthM: Number(widthM), lengthM: Number(lengthM) })
              onOpenChange(false)
            }}
            className="h-9 gap-1.5 bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8] disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> Qo'shish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
