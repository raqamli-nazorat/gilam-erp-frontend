import { useEffect, useRef, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Copy01Icon, Tick02Icon } from '@hugeicons/core-free-icons/index'
import { cn } from '@/lib/utils'

// Nusxa tugmasi — bosilgach ~1.4s davomida check ikonkasi ko'rsatiladi.
export default function CopyButton({ value, size = 16, className, stopPropagation = true }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  if (!value) return null

  return (
    <button
      type="button"
      onClick={(e) => {
        if (stopPropagation) e.stopPropagation()
        navigator.clipboard?.writeText(String(value))
        setCopied(true)
        clearTimeout(timer.current)
        timer.current = setTimeout(() => setCopied(false), 1400)
      }}
      className={cn(
        'inline-flex shrink-0 transition-colors',
        copied
          ? 'text-[#047A47] dark:text-[#34D399]'
          : 'text-[#737373] hover:text-[#0052D2] dark:hover:text-[#60A5FA]',
        className
      )}
      aria-label={copied ? 'Nusxalandi' : 'Nusxa olish'}
    >
      <HugeiconsIcon icon={copied ? Tick02Icon : Copy01Icon} size={size} strokeWidth={2} />
    </button>
  )
}
