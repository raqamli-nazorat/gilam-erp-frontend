import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Loader2, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

// Tanlash ro'yxati (dropdown) — variantlarni backenddan SAHIFALAB yuklaydi:
// - dropdown ochilgandagina 1-sahifa so'raladi (oyna ochilishi bilan emas);
// - ro'yxat pastga aylantirilganda keyingi sahifa so'raladi (scroll pagination);
// - yuqoridagi qidiruv serverga `search` parametri sifatida yuboriladi.
// Oldin oynalar ochilganda to'liq ro'yxat (masalan branches?page=1..6) birdaniga yuklanardi.
//
// Props:
//   value          — tanlangan id ('' — tanlanmagan)
//   onChange(id, item) — item: { id, name, ... } (fetchPage qaytargan obyekt)
//   fetchPage(params) — { results: [{ id, name }], next } qaytaruvchi funksiya (modul darajasida)
//   params         — qo'shimcha so'rov parametrlari (masalan { quality }); o'zgarsa ro'yxat yangilanadi
//   selectedLabel  — tanlangan qiymat nomi (tahrirlashda — ro'yxat hali yuklanmagan bo'lsa ko'rsatish uchun)
//   placeholder, disabled, className (trigger uchun)
export function PagedSelect({
  value,
  onChange,
  fetchPage,
  params,
  selectedLabel,
  placeholder = 'Tanlang',
  disabled,
  className,
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  const [items, setItems] = useState([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [picked, setPicked] = useState(null) // shu seansda tanlangan element (nomini ko'rsatish uchun)
  const loadedKey = useRef(null)
  const fetching = useRef(false)
  const reqId = useRef(0)

  const paramsKey = JSON.stringify(params ?? {})
  const key = `${paramsKey}|${debounced}`

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 250)
    return () => clearTimeout(t)
  }, [search])

  const load = useCallback(
    async (pageNum, append) => {
      if (fetching.current && append) return
      fetching.current = true
      const id = ++reqId.current
      setLoading(true)
      try {
        const res = await fetchPage({ ...JSON.parse(paramsKey), search: debounced, page: pageNum })
        if (id !== reqId.current) return
        setItems((prev) => (append ? [...prev, ...res.results] : res.results))
        setPage(pageNum)
        setHasMore(Boolean(res.next))
      } catch {
        if (id === reqId.current) setHasMore(false)
      } finally {
        if (id === reqId.current) {
          setLoading(false)
          fetching.current = false
        }
      }
    },
    [fetchPage, paramsKey, debounced]
  )

  // Faqat dropdown ochiq bo'lganda — va parametrlar/qidiruv o'zgarganda — 1-sahifadan yuklaymiz.
  // Yopib-ochganda (kalit o'zgarmagan bo'lsa) qayta so'ralmaydi.
  useEffect(() => {
    if (!open || loadedKey.current === key) return
    loadedKey.current = key
    setItems([])
    setHasMore(true)
    load(1, false)
  }, [open, key, load])

  function handleScroll(e) {
    const el = e.currentTarget
    if (!loading && hasMore && el.scrollHeight - el.scrollTop - el.clientHeight < 40) load(page + 1, true)
  }

  const label =
    (picked?.id === value && picked.name) || items.find((i) => i.id === value)?.name || selectedLabel || ''

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setSearch('')
      }}
    >
      <PopoverTrigger
        disabled={disabled}
        render={
          <button
            type="button"
            className={cn(
              'flex h-10 w-full items-center justify-between gap-2 rounded-md border border-[#E5E5E5] bg-white px-3 text-left text-[14px] text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] outline-none focus-visible:ring-2 focus-visible:ring-[#0052D2]/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-card dark:text-white',
              className
            )}
          >
            <span className={cn('truncate', !(value && label) && 'text-[#737373]')}>
              {value && label ? label : placeholder}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-[#737373]" />
          </button>
        }
      />
      <PopoverContent align="start" sideOffset={4} className="w-(--anchor-width) gap-0 p-0">
        <div className="relative border-b border-[#F0F0F0] p-2 dark:border-white/10">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A3A3A3]" />
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Qidirish"
            className="h-8 w-full rounded-md bg-[#F5F5F5] pl-8 pr-2 text-[13px] text-[#0A0A0A] outline-none placeholder:text-[#A3A3A3] dark:bg-white/5 dark:text-white"
          />
        </div>
        <div onScroll={handleScroll} className="max-h-60 overflow-y-auto p-1">
          {items.map((it) => (
            <button
              key={it.id}
              type="button"
              onClick={() => {
                setPicked(it)
                onChange(it.id, it)
                setOpen(false)
                setSearch('')
              }}
              className={cn(
                'flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-[13px] text-[#0A0A0A] hover:bg-[#F5F5F5] dark:text-white dark:hover:bg-white/10',
                it.id === value && 'font-medium'
              )}
            >
              <span className="truncate">{it.name}</span>
              {it.id === value && <Check className="h-4 w-4 shrink-0 text-[#0052D2]" />}
            </button>
          ))}
          {loading && (
            <div className="flex justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin text-[#0052D2]" />
            </div>
          )}
          {!loading && items.length === 0 && (
            <div className="px-2 py-1.5 text-[13px] text-[#737373]">Ma’lumot yo‘q</div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
