import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { TASHKILOT_NOMLARI } from '@/features/foydalanuvchilar/foydalanuvchilarData'
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

export const EMPTY_ROLE_FILTERS = { tashkilot: '', holat: '', foydalanuvchiDan: '', foydalanuvchiGacha: '', sana: '' }

const COUNT_OPTIONS = ['0', '10', '25', '50', '100', '150', '200']
const SANA_PRESETS = ['Bugun', 'Shu hafta', 'Shu oy', 'Shu yil']

function F({ label, value, onChange, allLabel, options }) {
  return (
    <div>
      <Label className={labelCls}>{label}</Label>
      <Select value={value || '__all'} onValueChange={(v) => onChange(v === '__all' ? '' : v)}>
        <SelectTrigger className={fieldCls}>
          <SelectValue>{(v) => (v === '__all' ? <span className="text-[#737373]">{allLabel}</span> : v)}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all">{allLabel}</SelectItem>
          {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  )
}

export default function RoleFilterModal({ open, onOpenChange, filters, onApply }) {
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
          <DialogTitle className="text-[17px] font-semibold leading-[24px] text-[#0A0A0A] dark:text-white">Filtr</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-x-3 gap-y-4 py-1">
          <F label="Tashkilot" value={draft.tashkilot} onChange={(v) => set('tashkilot', v)} allLabel="Barchasi" options={['Barcha tashkilotlar', ...TASHKILOT_NOMLARI]} />
          <F label="Holat" value={draft.holat} onChange={(v) => set('holat', v)} allLabel="Barchasi" options={['Faol', 'Nofaol']} />
          <F label="Foydalanuvchi, dan" value={draft.foydalanuvchiDan} onChange={(v) => set('foydalanuvchiDan', v)} allLabel="0" options={COUNT_OPTIONS} />
          <F label="Foydalanuvchi, gacha" value={draft.foydalanuvchiGacha} onChange={(v) => set('foydalanuvchiGacha', v)} allLabel="0" options={COUNT_OPTIONS} />
          <div className="col-span-2">
            <F label="Yaratilgan sana" value={draft.sana} onChange={(v) => set('sana', v)} allLabel="Barchasi" options={SANA_PRESETS} />
          </div>
        </div>

        <DialogFooter className="mx-0 mb-0 mt-2 gap-2 border-0 bg-transparent p-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => setDraft(EMPTY_ROLE_FILTERS)}
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
