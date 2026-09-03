import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Briefcase, Coins, Package, Search, ShoppingCart, Users } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { REPORT_CATALOG } from '@/features/hisobotlar/hisobotlarData'
import { Input } from '@/components/ui/input'

const SECTION_ICONS = { warehouse: Package, cart: ShoppingCart, cash: Coins, briefcase: Briefcase, users: Users }

export default function HisobotlarIndexPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  usePageHeader('Hisobotlar')

  const q = query.trim().toLowerCase()
  const sections = useMemo(() => {
    if (!q) return REPORT_CATALOG
    return REPORT_CATALOG
      .map((s) => ({ ...s, items: s.items.filter((it) => it.name.toLowerCase().includes(q)) }))
      .filter((s) => s.items.length > 0)
  }, [q])

  const totalFound = sections.reduce((n, s) => n + s.items.length, 0)

  return (
    <div className="flex flex-col gap-5">
      <div className="relative max-w-[520px]">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Hisobot nomi bo'yicha qidirish"
          className="h-11 w-full rounded-lg border-[#E5E5E5] bg-white pl-10 pr-3 text-[15px] text-[#0A0A0A] placeholder:text-[#737373] focus-visible:ring-[#0052D2] dark:border-white/10 dark:bg-card dark:text-white"
        />
      </div>

      {q && (
        <p className="-mt-2 text-[13px] text-[#737373] dark:text-muted-foreground">
          «{query.trim()}» bo'yicha {totalFound} ta hisobot topildi
        </p>
      )}

      {sections.map((s) => {
        const Icon = SECTION_ICONS[s.icon] ?? Package
        return (
          <div key={s.section}>
            <p className="mb-2.5 text-[12px] font-semibold uppercase tracking-[0.4px] text-[#737373] dark:text-muted-foreground">
              {s.section} · {s.items.length} ta
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {s.items.map((it) => (
                <button
                  key={it.slug}
                  type="button"
                  onClick={() => navigate(`/hisobotlar/${it.slug}`)}
                  className="flex items-center gap-3 rounded-xl border border-[#E5E5E5] bg-white px-4 py-4 text-left transition-colors hover:border-[#0052D2]/40 hover:bg-[#F9FAFB] dark:border-white/10 dark:bg-card dark:hover:bg-white/5"
                >
                  <Icon className="h-5 w-5 shrink-0 text-[#0052D2] dark:text-[#60A5FA]" />
                  <span className="text-[15px] font-medium text-[#0A0A0A] dark:text-white">{it.name}</span>
                </button>
              ))}
            </div>
          </div>
        )
      })}

      {sections.length === 0 && (
        <p className="py-16 text-center text-sm text-[#737373]">Hisobot topilmadi</p>
      )}
    </div>
  )
}
