import { ChevronDown } from 'lucide-react'
import { Download01Icon } from '@/components/ui/icons'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const OPTIONS = ['Excel (.xlsx)', 'PDF hujjat', 'CSV fayl']

// Figma: bo'lingan tugma — chapda "Yuklash", o'ngda ajratilgan chevron (menyu).
export default function DashboardExportButton({ onExport }) {
  return (
    <div className="flex h-9 items-stretch overflow-hidden rounded-md border border-[#E5E5E5] bg-white text-[14px] font-medium text-[#0A0A0A] dark:border-white/10 dark:bg-card dark:text-white">
      <button
        type="button"
        onClick={() => onExport?.()}
        className="flex items-center gap-2 px-4 transition-colors hover:bg-[#F5F5F5] dark:hover:bg-white/5"
      >
        <Download01Icon className="h-4 w-4" /> Yuklash
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              aria-label="Yuklash formati"
              className="flex items-center border-l border-[#E5E5E5] px-2 transition-colors hover:bg-[#F5F5F5] dark:border-white/10 dark:hover:bg-white/5"
            >
              <ChevronDown className="h-4 w-4 text-[#525252] dark:text-white/70" />
            </button>
          }
        />
        <DropdownMenuContent
          align="end"
          className="w-[220px] space-y-0.5 rounded-[12px] border border-[#E5E5E5] bg-white p-1.5 shadow-[0px_8px_24px_0px_#01091C1F] dark:border-white/10 dark:bg-card"
        >
          {OPTIONS.map((label) => (
            <DropdownMenuItem
              key={label}
              onClick={() => onExport?.(label)}
              className="h-9 cursor-pointer gap-2.5 rounded-lg px-3 text-[14px] font-normal leading-[20px] text-[#0A0A0A] transition-colors hover:bg-[#F5F5F5] focus:bg-[#F5F5F5] dark:text-white dark:hover:bg-white/5 dark:focus:bg-white/5"
            >
              <Download01Icon className="h-4 w-4 text-[#525252] dark:text-white/70" />
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
