import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Figma: modal 560px, radius 12, shadow 0px 12px 24px -6px #01091C24, ring yo'q.
// Header 60px (pl 24 / pr 16), body px 24 / pt 8 / pb 24 / gap 16, footer 72px #F5F5F5.
// Maydonlar: 36px (h-9), "control" radius (8px), 1px #E5E5E5, shadow 0px 1px 2px #0000001A.
const FIELD_CLS =
  'h-9 w-full rounded-[8px] border border-[#E5E5E5] bg-white px-3 text-[14px] font-normal text-[#0A0A0A] shadow-[0px_1px_2px_0px_#0000001A] dark:border-white/10 dark:bg-card dark:text-white'

export function FilterModal({ open, onOpenChange, onReset, onApply, children }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-full gap-0 overflow-hidden rounded-[12px] p-0 shadow-[0px_12px_24px_-6px_#01091C24] ring-0 sm:max-w-[560px] dark:bg-card"
      >
        <div className="flex h-[60px] shrink-0 items-center justify-between gap-2 pl-6 pr-4">
          <DialogTitle className="text-[18px] font-semibold leading-6 text-[#0A0A0A] dark:text-white">Filtr</DialogTitle>
          <DialogClose
            render={
              <button
                type="button"
                aria-label="Yopish"
                className="flex size-8 items-center justify-center rounded-md text-[#525252] transition-colors hover:bg-[#F5F5F5] hover:text-[#0A0A0A] dark:text-white/70 dark:hover:bg-white/10"
              >
                <X className="size-5" />
              </button>
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-4 px-6 pb-6 pt-2">{children}</div>

        <div className="flex h-[72px] shrink-0 items-center justify-end gap-2 bg-[#F5F5F5] px-6 dark:bg-white/5">
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            className="h-9 gap-2 rounded-[8px] border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#0A0A0A] shadow-[0px_1px_2px_0px_#0000001A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
          >
            <X className="size-4" /> Tozalash
          </Button>
          <Button
            type="button"
            onClick={onApply}
            className="h-9 gap-2 rounded-[8px] bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0px_1px_2px_0px_#0000001A] hover:bg-[#0047B8]"
          >
            <Check className="size-4" /> Qo‘llash
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function FilterField({ label, className, children }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-[12px] font-medium leading-4 text-[#525252] dark:text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  )
}

export function FilterSelect({ value, onChange, placeholder = 'Barchasi', options, disabled }) {
  return (
    <Select
      value={value || '__all'}
      onValueChange={(v) => onChange(v === '__all' ? '' : v)}
      disabled={disabled}
    >
      <SelectTrigger className={cn(FIELD_CLS, disabled && 'opacity-60')}>
        <SelectValue>{(v) => (v === '__all' ? <span className="text-[#737373]">{placeholder}</span> : v)}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__all">{placeholder}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// Figma: "dan"/"gacha" — 44px. Bo'sh va fokussiz: yorliq matn placeholder sifatida markazda.
// Fokusda yoki qiymat bo'lsa: "dan" mayda yorliq (11px/500, #525252, 0.4px) tepaga suzadi,
// pastda qiymat qatori (14px/400).
export function FilterRangeInput({ label, value, onChange, placeholder = '0', inputMode = 'text' }) {
  const [focused, setFocused] = useState(false)
  const floating = focused || Boolean(value)

  return (
    <label className="flex h-11 cursor-text flex-col justify-center rounded-[8px] border border-[#E5E5E5] bg-white px-3 shadow-[0px_1px_2px_0px_#0000001A] transition-colors focus-within:border-[#0052D2] dark:border-white/10 dark:bg-card">
      {floating && (
        <span className="text-[11px] font-medium leading-[14px] tracking-[0.4px] text-[#525252] dark:text-muted-foreground">
          {label}
        </span>
      )}
      <input
        value={value}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => onChange(e.target.value)}
        placeholder={floating ? placeholder : label}
        inputMode={inputMode}
        className="w-full bg-transparent text-[14px] font-normal leading-5 text-[#0A0A0A] outline-none placeholder:text-[#737373] dark:text-white"
      />
    </label>
  )
}

// Sanani klaviaturadan yozib kiritish uchun avtomatik "DD.MM.YYYY" niqob
export function maskDate(raw) {
  const d = String(raw).replace(/\D/g, '').slice(0, 8)
  if (d.length <= 2) return d
  if (d.length <= 4) return `${d.slice(0, 2)}.${d.slice(2)}`
  return `${d.slice(0, 2)}.${d.slice(2, 4)}.${d.slice(4)}`
}

export function FilterRangeRow({
  label,
  from,
  to,
  onFromChange,
  onToChange,
  transform,
  placeholder = '0',
  inputMode = 'text',
  className,
}) {
  const apply = (fn) => (v) => fn(transform ? transform(v) : v)
  return (
    <div className={cn('col-span-2', className)}>
      <label className="mb-1.5 block text-[12px] font-medium leading-4 text-[#525252] dark:text-muted-foreground">
        {label}
      </label>
      <div className="grid grid-cols-2 gap-4">
        <FilterRangeInput label="dan" value={from} onChange={apply(onFromChange)} placeholder={placeholder} inputMode={inputMode} />
        <FilterRangeInput label="gacha" value={to} onChange={apply(onToChange)} placeholder={placeholder} inputMode={inputMode} />
      </div>
    </div>
  )
}

export function FilterDateRange({ label = 'Yaratilgan sana', from, to, onFromChange, onToChange, className }) {
  return (
    <FilterRangeRow
      label={label}
      className={className}
      from={from}
      to={to}
      onFromChange={onFromChange}
      onToChange={onToChange}
      transform={maskDate}
      inputMode="numeric"
    />
  )
}
