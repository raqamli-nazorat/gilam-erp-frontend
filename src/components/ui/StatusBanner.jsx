import { cn } from '@/lib/utils'

export default function StatusBanner({
  variant = 'warning',
  className,
  children,
  text,
  speed = 28,
  animate = true,
  repeat = 4,
  ...props
}) {
  const content = children || text
  if (!content) return null

  const variantCls = {
    warning:
      'bg-[#FFF8E6] text-[#B45309] border-[#FDE68A] dark:bg-[#78350F]/20 dark:border-[#B45309]/30 dark:text-[#FDE68A]',
    draft:
      'bg-[#FFF8E6] text-[#B45309] border-[#FDE68A] dark:bg-[#78350F]/20 dark:border-[#B45309]/30 dark:text-[#FDE68A]',
    success:
      'bg-[#E6FAF1] text-[#047A47] border-[#A7F3D0] dark:bg-[#064E3B]/20 dark:border-[#047A47]/30 dark:text-[#A7F3D0]',
    approved:
      'bg-[#E6FAF1] text-[#047A47] border-[#A7F3D0] dark:bg-[#064E3B]/20 dark:border-[#047A47]/30 dark:text-[#A7F3D0]',
    confirmed:
      'bg-[#E6FAF1] text-[#047A47] border-[#A7F3D0] dark:bg-[#064E3B]/20 dark:border-[#047A47]/30 dark:text-[#A7F3D0]',
    danger:
      'bg-[#FEECEC] text-[#DC2626] border-[#FECACA] dark:bg-[#7F1D1D]/20 dark:border-[#DC2626]/30 dark:text-[#FECACA]',
    cancelled:
      'bg-[#FEECEC] text-[#DC2626] border-[#FECACA] dark:bg-[#7F1D1D]/20 dark:border-[#DC2626]/30 dark:text-[#FECACA]',
    error:
      'bg-[#FEECEC] text-[#DC2626] border-[#FECACA] dark:bg-[#7F1D1D]/20 dark:border-[#DC2626]/30 dark:text-[#FECACA]',
    info:
      'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD] dark:bg-[#0369A1]/20 dark:border-[#0369A1]/30 dark:text-[#BAE6FD]',
  }[variant] || 'bg-[#FFF8E6] text-[#B45309] border-[#FDE68A] dark:bg-[#78350F]/20 dark:border-[#B45309]/30 dark:text-[#FDE68A]'

  const items = Array.from({ length: repeat })

  return (
    <div
      role="status"
      className={cn(
        'relative flex min-h-[20px] shrink-0 items-center overflow-hidden rounded-sm px-4 py-1 text-[11px] font-medium select-none',
        variantCls,
        className
      )}
      {...props}
    >
      {animate ? (
        <div className="w-full overflow-hidden">
          <div
            className="flex w-max items-center whitespace-nowrap animate-marquee-ltr hover:[animation-play-state:paused]"
            style={{ animationDuration: `${speed}s` }}
          >
            {/* 1-to'plam */}
            <div className="flex shrink-0 items-center">
              {items.map((_, i) => (
                <div key={`a-${i}`} className="flex shrink-0 items-center">
                  {i > 0 && <span className="mx-4 opacity-40 select-none">•</span>}
                  <span>{content}</span>
                </div>
              ))}
            </div>

            {/* 2-to'plam (uzluksiz sikl uchun) */}
            <div className="flex shrink-0 items-center">
              {items.map((_, i) => (
                <div key={`b-${i}`} className="flex shrink-0 items-center">
                  <span className="mx-4 opacity-40 select-none">•</span>
                  <span>{content}</span>
                </div>
              ))}
            </div>



          </div>
        </div>
      ) : (
        <div className="w-full truncate">{content}</div>
      )}
    </div>
  )
}

