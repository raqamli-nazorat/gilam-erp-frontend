import { HugeiconsIcon } from '@hugeicons/react'
import { Copy01Icon } from '@hugeicons/core-free-icons/index'
import { cn } from '@/lib/utils'

export const headBg = 'bg-[#9AC2FF] dark:bg-[#0052D2]/40'
export const surface = 'bg-[#EFF1F7] dark:bg-white/[0.04]'

// `className`ga `flex-1 min-h-0` berilsa (masalan bo'sh holatda pastki chetini yonidagi
// jadval bilan bir xil qilish uchun), panel qolgan bo'sh joyni to'ldirib o'sadi.
export function Panel({ title, children, className }) {
  return (
    <div className={cn('flex flex-col rounded-xl', surface, className)}>
      <div
        className={cn(
          'sticky top-0 z-10 flex h-10 shrink-0 items-center rounded-t-xl px-4 text-[13px] font-semibold text-[#0A0A0A] dark:text-white',
          headBg
        )}
      >
        {title}
      </div>
      <div className="flex-1 divide-y divide-[#DFE4EF] overflow-auto [&>*:last-child]:rounded-b-xl dark:divide-white/5">
        {children}
      </div>
    </div>
  )
}

export function InfoRow({ label, value, onCopy }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5 text-[13px]">
      <span className="shrink-0 text-[#737373] dark:text-muted-foreground">{label}</span>
      <span className="flex min-w-0 items-center justify-end gap-1.5 text-right font-medium text-[#0A0A0A] dark:text-white">
        <span className="truncate">{value || '—'}</span>
        {onCopy && value && (
          <button
            type="button"
            onClick={onCopy}
            className="shrink-0 text-[#737373] transition-colors hover:text-[#0052D2] dark:hover:text-[#60A5FA]"
            aria-label="Nusxa olish"
          >
            <HugeiconsIcon icon={Copy01Icon} size={16} strokeWidth={2} />
          </button>
        )}
      </span>
    </div>
  )
}
