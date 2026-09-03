import { useState } from 'react'
import { AlertTriangle, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DEFECT_LOCATION, QK_LOCATIONS, QK_WAREHOUSES } from '@/features/qaytarishKirimi/qkMockData'
import { Button } from '@/components/ui/button'
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

const LOC_OPTIONS = QK_LOCATIONS.filter((l) => l !== DEFECT_LOCATION)

export default function QkPlacementModal({ open, onOpenChange, doc, onApply }) {
  const yaroqli = doc?.rows.find((r) => r.quality === 'Yaroqli')
  const hasDefect = !!doc?.rows.some((r) => r.quality === 'Nuqsonli')
  const originalPartiya = yaroqli?.partiya ?? '—'

  const initial = () => ({
    partiyaMode: yaroqli?.partiyaMode ?? 'original',
    warehouse: doc?.warehouse ?? QK_WAREHOUSES[1],
    location:
      yaroqli?.location && yaroqli.location !== DEFECT_LOCATION ? yaroqli.location : LOC_OPTIONS[0],
  })

  const [draft, setDraft] = useState(initial)
  const { partiyaMode, warehouse, location } = draft
  const setPartiyaMode = (v) => setDraft((d) => ({ ...d, partiyaMode: v }))
  const setWarehouse = (v) => setDraft((d) => ({ ...d, warehouse: v }))
  const setLocation = (v) => setDraft((d) => ({ ...d, location: v }))

  if (!doc) return null

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) setDraft(initial())
        onOpenChange(next)
      }}
    >
      <DialogContent className="p-5 sm:max-w-[520px]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-[17px] font-semibold leading-[24px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            Omborga joylashtirish
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-[#525252] dark:text-muted-foreground">
          Rulon omborga qaytganda yangi partiya raqami olishi yoki asl partiyaga
          qo'shilishi mumkin.
        </p>

        <div>
          <Label className={labelCls}>Partiya bilan nima qilinsin</Label>
          <div className="flex flex-col gap-2">
            <RadioRow
              checked={partiyaMode === 'original'}
              onClick={() => setPartiyaMode('original')}
              title="Asl partiyaga qaytarilsin"
              sub={`Qoldiq ${originalPartiya} partiyasiga qo'shiladi`}
            />
            <RadioRow
              checked={partiyaMode === 'new'}
              onClick={() => setPartiyaMode('new')}
              title="Yangi partiya yaratilsin"
              sub="Nuqsonli yoki kesilgan rulonlar uchun"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <Label className={labelCls}>Ombor</Label>
            <Select value={warehouse} onValueChange={setWarehouse}>
              <SelectTrigger className={fieldCls}><SelectValue /></SelectTrigger>
              <SelectContent>
                {QK_WAREHOUSES.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className={labelCls}>Joylashuv</Label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className={fieldCls}><SelectValue /></SelectTrigger>
              <SelectContent>
                {LOC_OPTIONS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {hasDefect && (
          <div className="flex gap-2.5 rounded-lg bg-[#FFF7ED] p-3 text-[13px] text-[#B45309] dark:bg-[#B45309]/15 dark:text-[#FBBF24]">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Nuqsonli rulon sotuvga chiqmaydi — u alohida «{DEFECT_LOCATION}»
              joylashuviga tushadi.
            </p>
          </div>
        )}

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
            onClick={() => {
              onApply({ warehouse, location, partiyaMode })
              onOpenChange(false)
            }}
            className="h-9 gap-1.5 bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
          >
            <Check className="h-4 w-4" /> Qo'llash
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function RadioRow({ checked, onClick, title, sub }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-start gap-2.5 text-left"
    >
      <span
        className={cn(
          'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors',
          checked ? 'border-[#0052D2]' : 'border-[#D4D4D4] dark:border-white/25'
        )}
      >
        {checked && <span className="h-2 w-2 rounded-full bg-[#0052D2]" />}
      </span>
      <span className="min-w-0">
        <span className="block text-[14px] font-medium leading-[18px] text-[#0A0A0A] dark:text-white">{title}</span>
        <span className="block text-[12px] leading-[16px] text-[#737373] dark:text-muted-foreground">{sub}</span>
      </span>
    </button>
  )
}
