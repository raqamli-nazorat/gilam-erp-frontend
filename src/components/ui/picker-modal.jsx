import { useEffect, useMemo, useState } from 'react'
import { Check, ChevronDown, ChevronLeft, Loader2, X } from 'lucide-react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Search01Icon } from '@hugeicons/core-free-icons/index'
import { cn } from '@/lib/utils'
import { useServerPagedList } from '@/hooks/useServerPagedList'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

function initials(name) {
  return (
    (name || '')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('') || ''
  )
}

// "… tanlang" — izlab-tanlash oynasi (Figma: Xodim / Tashkilot / Qo'shimcha va ushlanmalar tanlang).
// Ro'yxat backenddan SAHIFALAB yuklanadi (scroll pagination), qidiruv serverga `search` sifatida
// yuboriladi. Bitta element tanlanadi (radio), "Tanlash" bosilganda `onConfirm(item)` chaqiriladi.
//
// Props:
//   fetchPage(params) — { results: [{ id, name, ... }], next } (optionSources'dagi manbalar)
//   params            — qo'shimcha so'rov parametrlari (masalan { branch })
//   value             — joriy tanlangan id (oyna ochilganda belgilangan holda ko'rsatiladi)
//   describe(item)    — { subtitle, right } — qatorning ikkinchi satri va o'ng tomondagi matn
//   avatar            — true: qatorda bosh harflar doirasi va ikki satrli ko'rinish
export function PickerModal({
  open,
  onOpenChange,
  title,
  searchPlaceholder = 'Qidirish',
  emptyText = 'Ma’lumot topilmadi',
  fetchPage,
  params,
  value,
  describe,
  avatar = false,
  onConfirm,
}) {
  const [q, setQ] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    if (!open) return
    setQ('')
    setSearch('')
    setSelected(value ? { id: value } : null)
  }, [open, value])

  useEffect(() => {
    const t = setTimeout(() => setSearch(q.trim()), 250)
    return () => clearTimeout(t)
  }, [q])

  const queryParams = useMemo(() => ({ ...(params || {}), search }), [params, search])
  const { items, isLoading, isLoadingMore, containerRef, sentinelRef, handleScroll } = useServerPagedList(
    fetchPage,
    queryParams,
    { enabled: open }
  )

  const confirm = () => {
    const item = items.find((it) => it.id === selected?.id) || selected
    if (!item) return
    onConfirm(item)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[calc(100vh-32px)] flex-col gap-0 overflow-hidden rounded-[16px] p-0 shadow-[0px_12px_24px_-6px_#01091C24] ring-0 sm:max-w-[560px] dark:bg-card"
      >
        <div className="flex h-[60px] shrink-0 items-center gap-2 px-5 pt-1">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Orqaga"
            className="flex size-7 items-center justify-center rounded-md text-[#0A0A0A] transition-colors hover:bg-[#F5F5F5] dark:text-white dark:hover:bg-white/10"
          >
            <ChevronLeft className="size-5" />
          </button>
          <DialogTitle className="text-[17px] font-semibold leading-6 tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            {title}
          </DialogTitle>
        </div>

        <div className="shrink-0 px-5 pb-3">
          <div className="relative">
            <HugeiconsIcon
              icon={Search01Icon}
              size={18}
              strokeWidth={2}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]"
            />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-9 w-full rounded-[8px] border border-[#E5E5E5] bg-white pl-9 pr-3 text-[14px] text-[#0A0A0A] shadow-[0px_1px_2px_0px_#0000001A] outline-none placeholder:text-[#737373] focus-visible:border-[#0052D2] dark:border-white/10 dark:bg-card dark:text-white"
            />
          </div>
        </div>

        <div
          ref={containerRef}
          onScroll={handleScroll}
          className={cn(
            'flex min-h-0 flex-col gap-1 overflow-y-auto px-3 pb-3',
            avatar ? 'h-[428px]' : 'h-[344px]'
          )}
        >
          {isLoading && items.length === 0 ? (
            <div className="flex justify-center py-14">
              <Loader2 className="size-5 animate-spin text-[#0052D2]" />
            </div>
          ) : items.length === 0 ? (
            <p className="py-14 text-center text-sm text-[#737373]">{emptyText}</p>
          ) : (
            items.map((it) => {
              const isChecked = selected?.id === it.id
              const { subtitle, right } = describe?.(it) ?? {}
              return (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => setSelected(it)}
                  onDoubleClick={() => {
                    onConfirm(it)
                    onOpenChange(false)
                  }}
                  className={cn(
                    'flex w-full shrink-0 items-center gap-3 rounded-[10px] bg-[#FAFAFA] pl-3 pr-4 text-left transition-colors hover:bg-[#F0F0F0] dark:bg-white/5 dark:hover:bg-white/10',
                    avatar ? 'h-14' : 'h-[38px]'
                  )}
                >
                  <span
                    role="radio"
                    aria-checked={isChecked}
                    className={cn(
                      'flex size-[18px] shrink-0 items-center justify-center rounded-full border transition-colors',
                      isChecked
                        ? 'border-[#0B6FD0] bg-[#0B6FD0]'
                        : 'border-[#D4D4D4] bg-white dark:border-white/20 dark:bg-transparent'
                    )}
                  >
                    {isChecked && <span className="size-[7px] rounded-full bg-white" />}
                  </span>
                  {avatar && (
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#2B52C4] text-[12px] font-semibold text-white">
                      {initials(it.name)}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium leading-[18px] text-[#0A0A0A] dark:text-white">
                      {it.name}
                    </span>
                    {avatar && (
                      <span className="block truncate text-[12px] leading-4 text-[#737373]">{subtitle || ''}</span>
                    )}
                  </span>
                  {right ? <span className="shrink-0 text-[12px] leading-4 text-[#737373] tabular-nums">{right}</span> : null}
                </button>
              )
            })
          )}
          {isLoadingMore && (
            <div className="flex justify-center py-2">
              <Loader2 className="size-4 animate-spin text-[#0052D2]" />
            </div>
          )}
          <div ref={sentinelRef} className="h-px shrink-0" />
        </div>

        <div className="flex h-[68px] shrink-0 items-center justify-end gap-3 bg-[#FAFAFA] px-5 dark:bg-white/5">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9 gap-1.5 rounded-[8px] border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#B91C1C] shadow-[0px_1px_2px_0px_#0000001A] hover:bg-[#FEF2F2] dark:border-white/10 dark:bg-card dark:text-[#F87171]"
          >
            <X className="size-4 text-[#0A0A0A] dark:text-white" /> Bekor qilish
          </Button>
          <Button
            type="button"
            disabled={!selected}
            onClick={confirm}
            className="h-9 gap-1.5 rounded-[8px] bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0px_1px_2px_0px_#0000001A] hover:bg-[#0047B8] disabled:bg-[#E5E5E5] disabled:text-[#A3A3A3] disabled:opacity-100"
          >
            <Check className="size-4" /> Tanlash
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Forma maydoni ko'rinishidagi trigger + PickerModal. `selectedLabel` — tanlangan qiymat nomi.
export function PickerField({ value, selectedLabel, placeholder = 'Tanlang', disabled, className, onChange, ...modalProps }) {
  const [open, setOpen] = useState(false)
  const shown = value && selectedLabel

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className={cn(
          'flex h-10 w-full items-center justify-between gap-2 rounded-md border border-[#E5E5E5] bg-white px-3 text-left text-[14px] text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] outline-none focus-visible:ring-2 focus-visible:ring-[#0052D2]/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-card dark:text-white',
          className
        )}
      >
        <span className={cn('truncate', !shown && 'text-[#737373]')}>{shown ? selectedLabel : placeholder}</span>
        <ChevronDown className="size-4 shrink-0 text-[#737373]" />
      </button>
      <PickerModal
        {...modalProps}
        open={open}
        onOpenChange={setOpen}
        value={value}
        onConfirm={(item) => onChange(item.id, item)}
      />
    </>
  )
}
