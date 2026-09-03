import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EXPENSE_TYPES } from '@/features/expenses/expensesMockData'

// Figma: qidiruvli "Xarajat turi" dropdowni (base-ui Select qidiruvni qo'llamaydi,
// shuning uchun yengil maxsus komponent).
export default function ExpenseTypeSelect({ value, onChange, className }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const wrapRef = useRef(null)

  const close = () => {
    setOpen(false)
    setQuery('')
  }

  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) close()
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const filtered = EXPENSE_TYPES.filter((t) => t.toLowerCase().includes(query.trim().toLowerCase()))

  return (
    <div ref={wrapRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        className={cn(
          'flex h-9 w-full items-center justify-between gap-1.5 rounded-md border bg-white px-3 text-[14px] font-normal shadow-[0_1px_2px_rgba(0,0,0,0.05)] outline-none transition-colors dark:bg-card',
          open ? 'border-[#0052D2] ring-2 ring-[#0052D2]/20' : 'border-[#E5E5E5] dark:border-white/10',
          value ? 'text-[#0A0A0A] dark:text-white' : 'text-[#737373]'
        )}
      >
        {value || 'Xarajat turini tanlang'}
        <ChevronDown className="h-4 w-4 shrink-0 text-[#737373]" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 rounded-[12px] border border-[#E5E5E5] bg-white p-1.5 shadow-[0px_8px_24px_0px_#01091C1F] dark:border-white/10 dark:bg-card">
          <div className="relative mb-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Xarajat turini qidirish"
              className="h-9 w-full rounded-lg border border-[#E5E5E5] bg-white pl-9 pr-3 text-[14px] text-[#0A0A0A] outline-none placeholder:text-[#737373] focus:border-[#0052D2] dark:border-white/10 dark:bg-card dark:text-white"
            />
          </div>
          <div className="max-h-[240px] overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-3 py-6 text-center text-[13px] text-[#737373]">Topilmadi</p>
            ) : (
              filtered.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    onChange(t)
                    close()
                  }}
                  className={cn(
                    'flex h-9 w-full items-center rounded-lg px-3 text-left text-[14px] leading-[20px] text-[#0A0A0A] transition-colors hover:bg-[#F5F5F5] dark:text-white dark:hover:bg-white/5',
                    t === value && 'bg-[#F5F5F5] font-medium dark:bg-white/5'
                  )}
                >
                  {t}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
