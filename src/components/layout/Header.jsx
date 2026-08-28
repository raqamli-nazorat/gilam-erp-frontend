import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Moon, Sun } from 'lucide-react'
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

const pillTrigger =
  'h-9 border-0 bg-[#4468BC] text-[13px] font-medium text-white hover:bg-[#3B5DAE] data-[state=open]:bg-[#3B5DAE] cursor-pointer rounded-md [&_svg]:text-white'

const BADGE_STYLES = {
  new: 'border-white/25 bg-white/10 text-white',
  draft: 'border-amber-400/40 bg-amber-400/15 text-amber-200',
  confirmed: 'border-emerald-400/40 bg-emerald-400/15 text-emerald-200',
  count: 'border-white/25 bg-white/10 text-white',
}

const BOOKING_WAREHOUSE = 'Bron ombori'

export default function Header({ title, badge }) {
  const dispatch = useDispatch()
  const theme = useSelector((state) => state.ui.theme)
  const { pathname } = useLocation()
  const isBooking = pathname.startsWith('/bron-tovarlar')
  const [warehouse, setWarehouse] = useState(WAREHOUSES[0])
  const [language, setLanguage] = useState('UZ')
  const warehouseOptions = isBooking ? [BOOKING_WAREHOUSE, ...WAREHOUSES] : WAREHOUSES

  useEffect(() => {
    setWarehouse(isBooking ? BOOKING_WAREHOUSE : WAREHOUSES[0])
  }, [isBooking])

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 bg-[#1B3E75] px-6">
      <div className="flex min-w-0 items-center gap-2.5">
        <h1 className="truncate text-lg font-semibold text-white">{title}</h1>
        {badge && (
          <Badge variant="outline" className={cn('rounded-full px-2.5', BADGE_STYLES[badge.variant] ?? BADGE_STYLES.count)}>
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

        <div className={cn('flex h-9 items-center gap-1.5 px-3', pillTrigger)}>
          <span>USD</span>
          <span className="text-white/40">|</span>
          <span>{formatNumber(EXCHANGE_RATE)}</span>
        </div>

        {/* Divider line */}
        <div className="h-[22px] w-px bg-[#B9C6E4]" />

        {/* Language Select */}
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className={cn(pillTrigger, 'h-9 w-[55px] pl-2.5 pr-2 text-[13px] font-medium')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="UZ">UZ</SelectItem>
            <SelectItem value="RU">RU</SelectItem>
          </SelectContent>
        </Select>

        {/* Theme Switcher Pill */}
        <div className="flex h-9 w-[72px] items-center gap-[2px] rounded-md bg-[#4468BC] p-[3px]">
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
