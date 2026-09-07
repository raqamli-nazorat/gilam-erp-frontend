import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { VILOYATLAR } from '@/features/tashkilotlar/tashkilotlarData'
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
  'h-10 w-full rounded-md border-[#E5E5E5] bg-white px-3 text-[14px] font-normal text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:border-white/10 dark:bg-card dark:text-white'
const labelCls = 'mb-1.5 block text-[13px] font-normal leading-[16px] text-[#525252] dark:text-muted-foreground'

export const FILIALLAR_SONI_BUCKETS = ['1 ta', '2–5 ta', '6–10 ta', '10+ ta']
export const FOYDALANUVCHILAR_SONI_BUCKETS = ['1–10 ta', '11–50 ta', '51–100 ta', '100+ ta']
export const YARATILGAN_SANA_PRESETS = ['Bugun', 'Shu hafta', 'Shu oy', 'Shu yil']

export const EMPTY_ORG_FILTERS = { hudud: '', holat: '', filiallarSoni: '', foydalanuvchilar: '', sana: '' }

function F({ label, value, onChange, allLabel, options }) {
  return (
    <div>
      <Label className={labelCls}>{label}</Label>
      <Select value={value || '__all'} onValueChange={(v) => onChange(v === '__all' ? '' : v)}>
        <SelectTrigger className={fieldCls}>
          <SelectValue>{(v) => (v === '__all' ? allLabel : v)}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all">{allLabel}</SelectItem>
          {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  )
}

export default function OrgFilterModal({ open, onOpenChange, filters, onApply }) {
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
      <DialogContent className="p-5 sm:max-w-[560px]">
        <DialogHeader className="pb-1">
          <DialogTitle className="text-[15px] font-semibold leading-[20px] text-[#0A0A0A] dark:text-white">Filtr</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-x-3 gap-y-4 py-1">
          <F label="Hudud" value={draft.hudud} onChange={(v) => set('hudud', v)} allLabel="Barchasi" options={VILOYATLAR} />
          <F label="Holat" value={draft.holat} onChange={(v) => set('holat', v)} allLabel="Barchasi" options={['Faol', 'To‘xtatilgan']} />
          <F
            label="Filiallar soni"
            value={draft.filiallarSoni}
            onChange={(v) => set('filiallarSoni', v)}
            allLabel="Barchasi"
            options={FILIALLAR_SONI_BUCKETS}
          />
          <F
            label="Foydalanuvchilar"
            value={draft.foydalanuvchilar}
            onChange={(v) => set('foydalanuvchilar', v)}
            allLabel="Barchasi"
            options={FOYDALANUVCHILAR_SONI_BUCKETS}
          />
          <div className="col-span-2">
            <F
              label="Yaratilgan sana"
              value={draft.sana}
              onChange={(v) => set('sana', v)}
              allLabel="Barchasi"
              options={YARATILGAN_SANA_PRESETS}
            />
          </div>
        </div>

        <DialogFooter className="mx-0 mb-0 mt-2 gap-2 border-0 bg-transparent p-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => setDraft(EMPTY_ORG_FILTERS)}
            className="h-9 gap-1.5 border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
          >
            <X className="h-4 w-4" /> Tozalash
          </Button>
          <Button
            type="button"
            onClick={() => { onApply(draft); onOpenChange(false) }}
            className="h-9 gap-1.5 bg-[#0052D2] px-4 text-[14px] font-medium text-white hover:bg-[#0047B8]"
          >
            <Check className="h-4 w-4" /> Qo‘llash
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
