import { Copy } from 'lucide-react'
import { cn } from '@/lib/utils'

export const headBg = 'bg-[#9AC2FF] dark:bg-[#0052D2]/40'
export const surface = 'bg-[#EFF1F7] dark:bg-white/[0.04]'

export function Panel({ title, children }) {
  return (
    <div className={cn('overflow-hidden', surface)}>
      <div className={cn('px-4 py-2.5 text-[13px] font-semibold text-[#0A0A0A] dark:text-white', headBg)}>{title}</div>
      <div className="divide-y divide-[#DFE4EF] dark:divide-white/5">{children}</div>
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
            <Copy className="h-3.5 w-3.5" />
          </button>
        )}
      </span>
    </div>
  )
}
