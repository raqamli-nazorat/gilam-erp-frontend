import { Button } from '@/components/ui/button'
import { Download01Icon } from '@/components/ui/icons'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const OPTIONS = [
  { label: 'Excel (.xlsx)', icon: Download01Icon },
  { label: 'PDF hujjat', icon: Download01Icon },
  { label: 'CSV fayl', icon: Download01Icon },
  { label: 'Yorliqlar (PDF)', icon: Download01Icon },
]

export default function ExportMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            className="h-9 gap-2 rounded-md border-[#D4D4D4] bg-[#F5F5F5] px-4 text-[14px] font-medium text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#EAEAEA] dark:border-white/10 dark:bg-card dark:text-white"
          >
            <Download01Icon className="h-4 w-4 text-[#0A0A0A] dark:text-white" /> Yuklash
          </Button>
        }
      />
      <DropdownMenuContent
        align="end"
        className="w-[228px] rounded-xl border-[#E5E5E5] bg-white p-1.5 shadow-[0_8px_24px_rgba(1,9,28,0.12)] dark:border-white/10 dark:bg-card"
      >
        {OPTIONS.map(({ label, icon: Icon }) => (
          <DropdownMenuItem
            key={label}
            className="h-9 cursor-pointer gap-2.5 rounded-lg px-3 text-[14px] font-normal leading-[20px] text-[#0A0A0A] transition-colors hover:bg-[#F5F5F5] focus:bg-[#F5F5F5] dark:text-white dark:hover:bg-white/5 dark:focus:bg-white/5"
          >
            <Icon className="h-4 w-4 text-[#0A0A0A] dark:text-white" />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
