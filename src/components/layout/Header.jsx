import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ChevronDown, Moon, Sun } from 'lucide-react'
import { toggleTheme } from '@/features/ui/uiSlice'
import { formatNumber } from '@/lib/format'
import { WAREHOUSES, EXCHANGE_RATE } from '@/features/receipts/mockData'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Figma: nav-control — balandlik 36 (h-9), "control" radius (8px), fon #4468BC (--nav-bg-hover)
const pillTrigger =
  'h-9 border-0 bg-[#4468BC] text-[13px] font-medium text-white hover:bg-[#3B5DAE] data-[state=open]:bg-[#3B5DAE] cursor-pointer rounded-[8px] [&_svg]:text-white'

const BADGE_STYLES = {
  new: 'border-white/25 bg-white/10 text-white',
  draft: 'border-amber-400/40 bg-amber-400/15 text-amber-200',
  confirmed: 'border-emerald-400/40 bg-emerald-400/15 text-emerald-200',
  rejected: 'border-red-400/40 bg-red-400/15 text-red-200',
  count: 'border-white/25 bg-white/10 text-white',
}

const BOOKING_WAREHOUSE = 'Bron ombori'

function renderHeaderTitle(title) {
  if (typeof title !== 'string' || !title.includes('›')) {
    return title
  }
  const parts = title.split('›')
  return (
    <span className="inline-flex items-center gap-1.5">
      {parts.map((part, index) => {
        const isLast = index === parts.length - 1
        return (
          <span key={index} className="inline-flex items-center gap-1.5">
            {index > 0 && <span className="text-[#B9C6E4]/50">›</span>}
            <span className={isLast ? 'text-white font-medium' : 'text-[#B9C6E4]'}>
              {part.trim()}
            </span>
          </span>
        )
      })}
    </span>
  )
}

export default function Header({ title, badge }) {
  const dispatch = useDispatch()
  const theme = useSelector((state) => state.ui.theme)
  const { pathname } = useLocation()
  // Bron hujjati sahifasida ombor "Bron ombori", ro'yxatda esa odatiy MAGAZIN
  const isBookingDoc = pathname.startsWith('/bron-tovarlar/')
  const [warehouse, setWarehouse] = useState(WAREHOUSES[0])
  const [language, setLanguage] = useState('UZ')
  const warehouseOptions = isBookingDoc ? [BOOKING_WAREHOUSE, ...WAREHOUSES] : WAREHOUSES

  useEffect(() => {
    setWarehouse(isBookingDoc ? BOOKING_WAREHOUSE : WAREHOUSES[0])
  }, [isBookingDoc])

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 bg-[#1B3E75] px-6">
      <div className="flex min-w-0 items-center gap-2.5">
        <h1 className="truncate text-[14px] font-medium text-white">{renderHeaderTitle(title)}</h1>
        {badge && (
          <Badge variant="outline" className={cn('rounded-full px-2.5 text-[13px] font-medium', BADGE_STYLES[badge.variant] ?? BADGE_STYLES.count)}>
            {badge.label}
          </Badge>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2.5">
        <Select value={warehouse} onValueChange={setWarehouse}>
          <SelectTrigger className={cn(pillTrigger, 'px-3')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {warehouseOptions.map((w) => (
              <SelectItem key={w} value={w}>
                {w}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Figma: 160×36, gap 8, padding 12/8 */}
        <div className={cn('flex h-9 w-[160px] items-center gap-2 pl-3 pr-2', pillTrigger)}>
          <span>USD</span>
          <span className="text-white/40">|</span>
          <span className="leading-[18px]">{formatNumber(EXCHANGE_RATE)}</span>
          <ChevronDown className="ml-auto h-3.5 w-3.5 shrink-0 text-white/70" />
        </div>

        {/* Divider line */}
        <div className="h-[22px] w-px bg-[#B9C6E4]" />

        {/* Language Select — Figma: 86×36, gap 6, padding 10/8, bayroq + kod */}
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className={cn(pillTrigger, 'h-9 w-[90px] gap-1.5 pl-2.5 pr-2 text-[13px] font-medium')}>
            <img src={`/${language}.svg`} alt="" className="h-4 w-6 shrink-0 rounded-[2px] object-cover" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {['UZ', 'RU'].map((code) => (
              <SelectItem key={code} value={code}>
                <span className="flex items-center gap-2">
                  <img src={`/${code}.svg`} alt="" className="h-4 w-6 shrink-0 rounded-[2px] object-cover" />
                  {code}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Theme Switcher Pill — Figma: 72×36, gap 2, padding 3, "control" radius */}
        <div className="flex h-9 w-[72px] items-center gap-[2px] rounded-[8px] bg-[#4468BC] p-[3px]">
          <button
            type="button"
            aria-label="Yorug' rejim"
            onClick={() => theme !== 'light' && dispatch(toggleTheme())}
            className={cn(
              'flex h-full flex-1 cursor-pointer items-center justify-center rounded-md transition-colors',
              theme === 'light' ? 'bg-white text-[#1B3E75] shadow-xs' : 'text-white/80 hover:text-white'
            )}
          >
            <Sun className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Qorong'i rejim"
            onClick={() => theme !== 'dark' && dispatch(toggleTheme())}
            className={cn(
              'flex h-full flex-1 cursor-pointer items-center justify-center rounded-md transition-colors',
              theme === 'dark' ? 'bg-white text-[#1B3E75] shadow-xs' : 'text-white/80 hover:text-white'
            )}
          >
            <Moon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
