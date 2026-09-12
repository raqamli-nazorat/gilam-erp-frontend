import { useState } from 'react'
import { Check, X } from 'lucide-react'
import {
  ACTION_CHOICES,
  AUDIT_FOYDALANUVCHILAR,
  AUDIT_TASHKILOTLAR,
  JADVALLAR,
} from '@/features/audit/auditData'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { DatePicker, fromISODate, toISODate } from '@/components/ui/date-picker'
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
  'h-10 w-full rounded-md border-[#E5E5E5] bg-white px-3 text-[14px] font-normal text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:border-white/10 dark:bg-card dark:text-white'
const labelCls = 'mb-1.5 block text-[13px] font-normal leading-[16px] text-[#525252] dark:text-muted-foreground'

export const EMPTY_AUDIT_FILTERS = {
  action: '',
  actor: '',
  jadval: '',
  tashkilot: '',
  start_date: '',
  end_date: '',
}

export default function AuditFilterModal({ open, onOpenChange, filters, onApply }) {
  const [draft, setDraft] = useState(filters)
  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }))

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) setDraft(filters)
        onOpenChange(next)
      }}
    >
      <DialogContent className="p-5 sm:max-w-[560px] rounded-3xl!">
        <DialogHeader className="pb-1">
          <DialogTitle className="text-[15px] font-semibold leading-[20px] text-[#0A0A0A] dark:text-white">
            Filtr
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-x-3 gap-y-4 py-1">
          {/* Amal (action: 0, 1, 2, 3) */}
          <div>
            <Label className={labelCls}>Amal</Label>
            <Select
              value={draft.action === '' || draft.action === undefined ? '' : String(draft.action)}
              onValueChange={(v) => set('action', v === '' ? '' : Number(v))}
            >
              <SelectTrigger className={fieldCls}>
                <SelectValue>
                  {draft.action !== '' && draft.action !== undefined
                    ? ACTION_CHOICES.find((c) => Number(c.value) === Number(draft.action))?.label || 'Barchasi'
                    : 'Barchasi'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Barchasi</SelectItem>
                {ACTION_CHOICES.map((c) => (
                  <SelectItem key={c.value} value={String(c.value)}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actor / Foydalanuvchi */}
          <div>
            <Label className={labelCls}>Foydalanuvchi</Label>
            <Select
              value={draft.actor || ''}
              onValueChange={(v) => set('actor', v === '' ? '' : v)}
            >
              <SelectTrigger className={fieldCls}>
                <SelectValue>{draft.actor || 'Barchasi'}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Barchasi</SelectItem>
                {AUDIT_FOYDALANUVCHILAR.map((u) => (
                  <SelectItem key={u} value={u}>
                    {u}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Jadval */}
          <div>
            <Label className={labelCls}>Jadval</Label>
            <Select
              value={draft.jadval || ''}
              onValueChange={(v) => set('jadval', v === '' ? '' : v)}
            >
              <SelectTrigger className={fieldCls}>
                <SelectValue>{draft.jadval || 'Barchasi'}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Barchasi</SelectItem>
                {JADVALLAR.map((j) => (
                  <SelectItem key={j} value={j}>
                    {j}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tashkilot */}
          <div>
            <Label className={labelCls}>Tashkilot</Label>
            <Select
              value={draft.tashkilot || ''}
              onValueChange={(v) => set('tashkilot', v === '' ? '' : v)}
            >
              <SelectTrigger className={fieldCls}>
                <SelectValue>{draft.tashkilot || 'Barchasi'}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Barchasi</SelectItem>
                {AUDIT_TASHKILOTLAR.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sana oralig'i (start_date, end_date) */}
          <div className="col-span-2">
            <Label className={labelCls}>Sana</Label>
            <div className="grid grid-cols-2 gap-3">
              <DatePicker
                label="dan"
                placeholder="KK.OO.YYYY"
                value={fromISODate(draft.start_date)}
                onChange={(d) => set('start_date', toISODate(d))}
              />
              <DatePicker
                label="gacha"
                placeholder="KK.OO.YYYY"
                value={fromISODate(draft.end_date)}
                onChange={(d) => set('end_date', toISODate(d))}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="mx-0 mb-0 mt-3 gap-2 border-0 bg-transparent p-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => setDraft(EMPTY_AUDIT_FILTERS)}
            className="h-9 gap-1.5 rounded-lg border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white cursor-pointer"
          >
            <X className="h-4 w-4" /> Tozalash
          </Button>
          <Button
            type="button"
            onClick={() => {
              onApply(draft)
              onOpenChange(false)
            }}
            className="h-9 gap-1.5 rounded-xl! bg-[#0052D2] px-4 text-[14px] font-medium text-white hover:bg-[#0047B8] cursor-pointer"
          >
            <Check className="h-4 w-4" /> Qo‘llash
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
