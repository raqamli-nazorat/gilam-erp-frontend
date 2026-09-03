import { cn } from '@/lib/utils'

export default function RadioRow({ checked, onClick, title, sub }) {
  return (
    <button type="button" onClick={onClick} className="flex items-start gap-2.5 text-left">
      <span
        className={cn(
          'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors',
          checked ? 'border-[#0052D2]' : 'border-[#D4D4D4] dark:border-white/25'
        )}
      >
        {checked && <span className="h-2 w-2 rounded-full bg-[#0052D2]" />}
      </span>
      <span className="min-w-0">
        <span className="block text-[14px] font-medium leading-[18px] text-[#0A0A0A] dark:text-white">{title}</span>
        {sub && <span className="block text-[12px] leading-[16px] text-[#737373] dark:text-muted-foreground">{sub}</span>}
      </span>
    </button>
  )
}
