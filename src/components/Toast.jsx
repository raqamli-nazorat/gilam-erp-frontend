import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

// Bildirishnoma — ekranning yuqori o'ng burchagida chiqadi.
// `message` — matn (success) yoki { variant, message } obyekti:
//   success — yashil fon, yashil ✓ (default)
//   error   — qizil fon + qizil chegara, qizil ✕
//   warning — to'q sariq fon, to'q sariq ✕
//   info    — oq fon, ko'k ✓
const VARIANTS = {
  success: {
    box: 'border-[#E5E5E5] bg-[#E6FAF1] dark:border-white/10 dark:bg-[#0B2A1E]',
    icon: 'text-[#047A47] dark:text-[#34D399]',
    Icon: Check,
  },
  error: {
    box: 'border-[#DC2626] bg-[#FEECEC] dark:bg-[#2A1111]',
    icon: 'text-[#DC2626] dark:text-[#F87171]',
    Icon: X,
  },
  warning: {
    box: 'border-[#E5E5E5] bg-[#FFF4E5] dark:border-white/10 dark:bg-[#2A1E0B]',
    icon: 'text-[#B45309] dark:text-[#FBBF24]',
    Icon: X,
  },
  info: {
    box: 'border-[#E5E5E5] bg-white dark:border-white/10 dark:bg-card',
    icon: 'text-[#0052D2] dark:text-[#60A5FA]',
    Icon: Check,
  },
}

export default function Toast({ message, variant }) {
  if (!message) return null
  const text = typeof message === 'object' ? message.message : message
  const kind = (typeof message === 'object' && message.variant) || variant || 'success'
  if (!text) return null
  const v = VARIANTS[kind] ?? VARIANTS.success
  const Icon = v.Icon

  return (
    <div
      role={kind === 'error' ? 'alert' : 'status'}
      className={cn(
        'fixed right-6 top-6 z-[100000] flex w-[340px] max-w-[calc(100vw-2rem)] items-center gap-3 rounded-xl border px-4 py-3 text-[14px] leading-5 text-[#0A0A0A] shadow-[0px_4px_8px_-2px_#01091C1A,0px_2px_4px_-2px_#01091C0F] animate-in fade-in-0 slide-in-from-top-2 dark:text-white',
        v.box
      )}
    >
      <Icon className={cn('size-5 shrink-0', v.icon)} strokeWidth={2.25} />
      <span className="min-w-0 break-words">{text}</span>
    </div>
  )
}
