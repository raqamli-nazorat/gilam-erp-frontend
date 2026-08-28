import { Button } from '@/components/ui/button'
import { Download01Icon } from '@/components/ui/icons'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const OPTIONS = ['Excel (.xlsx)', 'PDF hujjat', 'CSV fayl', 'Bron cheki (PDF)']

export default function BookingExportMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            className="h-9 gap-2 rounded-md border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
          >
            <Download01Icon className="h-4 w-4 text-[#0A0A0A] dark:text-white" /> Yuklash
          </Button>
        }
      />
      <DropdownMenuContent
        align="end"
        className="w-[228px] rounded-xl border-[#E5E5E5] bg-white p-1.5 shadow-[0_8px_24px_rgba(1,9,28,0.12)] dark:border-white/10 dark:bg-card"
      >
        {OPTIONS.map((label) => (
          <DropdownMenuItem
            key={label}
            className="h-9 cursor-pointer gap-2.5 rounded-lg px-3 text-[14px] font-normal leading-[20px] text-[#0A0A0A] transition-colors hover:bg-[#F5F5F5] focus:bg-[#F5F5F5] dark:text-white dark:hover:bg-white/5 dark:focus:bg-white/5"
          >
            <Download01Icon className="h-4 w-4 text-[#0A0A0A] dark:text-white" />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
