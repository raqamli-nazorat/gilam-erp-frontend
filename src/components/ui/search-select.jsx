import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

// Qidiruvli tanlash ro'yxati — filtr oynalari uchun (PagedSelect bilan bir xil Popover asosida,
// lekin variantlar oldindan ma'lum va qidiruv mahalliy).
//
// Props:
//   value            — tanlangan qiymat ('' — "Barchasi")
//   onChange(value)
//   options          — ['A', 'B'] yoki [{ value, label }]
//   placeholder      — "hammasi" varianti matni (default: 'Barchasi')
//   allowAll         — ro'yxat boshida "Barchasi" varianti bo'lsinmi (default: true)
//   searchPlaceholder, disabled, className (trigger uchun)

function normalize(options) {
  return (options ?? []).map((o) =>
    o != null && typeof o === 'object' ? { value: String(o.value), label: String(o.label ?? o.value) } : { value: String(o), label: String(o) }
  )
}

// O'zbek lotinidagi apostrof variantlari (ʻ ‘ ’ ') bir xil deb qaraladi — "Bo'ka" "Bo‘ka"ni topadi.
function fold(s) {
  return s.toLocaleLowerCase('uz').replace(/[ʻʼ‘’`']/g, "'").trim()
}

export function SearchSelect({
  value,
  onChange,
  options,
  placeholder = 'Barchasi',
  allowAll = true,
  searchPlaceholder = 'Qidirish',
  disabled,
  className,
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const listRef = useRef(null)

  const items = useMemo(() => {
    const list = normalize(options)
    return allowAll ? [{ value: '', label: placeholder }, ...list] : list
  }, [options, allowAll, placeholder])

  const filtered = useMemo(() => {
    const q = fold(query)
    if (!q) return items
    return items.filter((it) => it.value !== '' && fold(it.label).includes(q))
  }, [items, query])

  const current = value ?? ''
  const selected = items.find((it) => it.value === String(current))

  // Ochilganda tanlangan qatorni ko'rsatamiz; qidiruv o'zgarsa — birinchi natijani.
  useEffect(() => {
    if (!open) return
    const idx = query ? 0 : Math.max(0, filtered.findIndex((it) => it.value === String(current)))
    setActive(idx)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, query])

  useEffect(() => {
    if (!open) return
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active, open])

  function close() {
    setOpen(false)
    setQuery('')
  }

  function pick(it) {
    onChange(it.value)
    close()
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered[active]) pick(filtered[active])
    }
  }

  const showPlaceholder = !selected || selected.value === ''

  return (
    <Popover open={open} onOpenChange={(next) => (next ? setOpen(true) : close())}>
      <PopoverTrigger
        disabled={disabled}
        render={
          <button
            type="button"
            className={cn(
              'flex h-9 w-full items-center justify-between gap-2 rounded-[8px] border border-[#E5E5E5] bg-white px-3 text-left text-[14px] font-normal text-[#0A0A0A] shadow-[0px_1px_2px_0px_#0000001A] outline-none focus-visible:border-[#0052D2] disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-card dark:text-white',
              className
            )}
          >
            <span className={cn('truncate', showPlaceholder && 'text-[#737373]')}>
              {showPlaceholder ? placeholder : selected.label}
            </span>
            <ChevronDown className="size-4 shrink-0 text-[#737373]" />
          </button>
        }
      />
      <PopoverContent
        align="start"
        sideOffset={4}
        className="w-(--anchor-width) min-w-[220px] gap-0 rounded-[12px] border border-[#E5E5E5] bg-white p-1.5 shadow-[0px_8px_24px_0px_#01091C1F] ring-0 dark:border-white/10 dark:bg-card"
      >
        <div className="relative mb-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#737373]" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={searchPlaceholder}
            className="h-9 w-full rounded-[8px] bg-[#F5F5F5] pl-9 pr-3 text-[14px] text-[#0A0A0A] outline-none placeholder:text-[#737373] dark:bg-white/5 dark:text-white"
          />
        </div>
        <div ref={listRef} role="listbox" className="max-h-64 overflow-y-auto overscroll-contain">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-[13px] text-[#737373]">Hech narsa topilmadi</div>
          ) : (
            filtered.map((it, i) => {
              const isSelected = it.value === String(current)
              return (
                <button
                  key={it.value || '__all'}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  data-index={i}
                  onClick={() => pick(it)}
                  onMouseMove={() => setActive(i)}
                  className={cn(
                    'flex h-9 w-full items-center justify-between gap-2 rounded-[8px] px-3 text-left text-[14px] text-[#0A0A0A] dark:text-white',
                    isSelected
                      ? 'bg-[#E8F0FC] font-medium dark:bg-[#0052D2]/20'
                      : i === active && 'bg-[#F5F5F5] dark:bg-white/5'
                  )}
                >
                  <span className="truncate">{it.label}</span>
                  {isSelected && <Check className="size-4 shrink-0 text-[#0052D2] dark:text-[#60A5FA]" />}
                </button>
              )
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
