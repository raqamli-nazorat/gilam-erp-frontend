import { HugeiconsIcon } from '@hugeicons/react'
import { Copy01Icon } from '@hugeicons/core-free-icons/index'
import { cn } from '@/lib/utils'

export const headBg = 'bg-[#9AC2FF] dark:bg-[#0052D2]/40'
export const surface = 'bg-[#EFF1F7] dark:bg-white/[0.04]'

export function Panel({ title, children }) {
  return (
    <div className={cn('rounded-xl', surface)}>
      <div
        className={cn(
          'sticky top-0 z-10 rounded-t-xl px-4 py-2.5 text-[13px] font-semibold text-[#0A0A0A] dark:text-white',
          headBg
        )}
      >
        {title}
      </div>
      <div className="divide-y divide-[#DFE4EF] [&>*:last-child]:rounded-b-xl dark:divide-white/5">{children}</div>
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
