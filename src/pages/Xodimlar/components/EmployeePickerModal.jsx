import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Check, X } from 'lucide-react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Search01Icon } from '@hugeicons/core-free-icons/index'
import { cn } from '@/lib/utils'
import { formatUzPhone } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

function initials(name) {
  return (
    (name || '')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('') || '—'
  )
}

// Figma dev-mode spec — "Xodim tanlash" (o'ng tomondagi ko'k belgi, header'da).
function PickModeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3.70184 12.2122C6.28145 10.6515 9.55151 10.6515 12.1311 12.2122C12.2119 12.2612 12.3128 12.319 12.4278 12.3848C12.9383 12.6774 13.7261 13.1287 14.2649 13.6646C14.6025 14.0004 14.9306 14.4499 14.9903 15.0052C15.0541 15.5976 14.7985 16.1497 14.2981 16.634C13.4508 17.4543 12.4205 18.125 11.0804 18.125H4.75252C3.41247 18.125 2.38218 17.4543 1.53483 16.634C1.03449 16.1497 0.778895 15.5976 0.842622 15.0052C0.902363 14.4499 1.23048 14.0004 1.56804 13.6646C2.10686 13.1287 2.89464 12.6774 3.40519 12.3848C3.52012 12.319 3.62101 12.2612 3.70184 12.2122Z"
        fill="#0052D2"
      />
      <path
        d="M3.95821 5.83333C3.95821 3.64721 5.73042 1.875 7.91654 1.875C10.1027 1.875 11.8749 3.64721 11.8749 5.83333C11.8749 8.01946 10.1027 9.79167 7.91654 9.79167C5.73042 9.79167 3.95821 8.01946 3.95821 5.83333Z"
        fill="#0052D2"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.333 4.16732C13.333 3.70708 13.7061 3.33398 14.1663 3.33398L18.333 3.33398C18.7932 3.33398 19.1663 3.70708 19.1663 4.16732C19.1663 4.62756 18.7932 5.00065 18.333 5.00065L14.1663 5.00065C13.7061 5.00065 13.333 4.62755 13.333 4.16732ZM13.333 6.66732C13.333 6.20708 13.7061 5.83398 14.1663 5.83398L18.333 5.83398C18.7932 5.83398 19.1663 6.20708 19.1663 6.66732C19.1663 7.12756 18.7932 7.50065 18.333 7.50065L14.1663 7.50065C13.7061 7.50065 13.333 7.12755 13.333 6.66732ZM15.833 9.16732C15.833 8.70708 16.2061 8.33398 16.6663 8.33398H18.333C18.7932 8.33398 19.1663 8.70708 19.1663 9.16732C19.1663 9.62755 18.7932 10.0007 18.333 10.0007H16.6663C16.2061 10.0007 15.833 9.62755 15.833 9.16732Z"
        fill="#0052D2"
      />
    </svg>
  )
}

// "Xodim tanlang" — mavjud xodim(lar)ni Employee ro'yxatidan izlab tanlash oynasi (Figma dev-mode
// spec: 560×604, radius 16, header 60px, qator 536×56 bg #FAFAFA radius10, footer 68px bg #FAFAFA).
// multiple=false: qatorga bosilsa darhol tanlab yopiladi. multiple=true: checkbox + "N ta
// tanlangan" + Tozalash/Qo'shish footer.
export default function EmployeePickerModal({ open, onOpenChange, employees, multiple = false, onConfirm, onBack }) {
  const [q, setQ] = useState('')
  const [checked, setChecked] = useState(() => new Set())

  useEffect(() => {
    if (open) {
      setQ('')
      setChecked(new Set())
    }
  }, [open])

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return employees
    return employees.filter(
      (e) => e.name?.toLowerCase().includes(s) || (e.phone || '').replace(/\D/g, '').includes(s.replace(/\D/g, ''))
    )
  }, [employees, q])

  function toggle(id) {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function pick(emp) {
    if (multiple) {
      toggle(emp.id)
      return
    }
    onConfirm([emp.id])
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="gap-0 overflow-hidden rounded-[16px] p-0 shadow-[0px_1px_2px_0px_#0000001A] sm:max-w-[560px]">
        <div className="flex h-[60px] shrink-0 items-center justify-between gap-2 pb-4 pl-5 pr-5 pt-5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => (onBack ? onBack() : onOpenChange(false))}
              className="flex size-6 items-center justify-center text-[#0A0A0A] transition-colors hover:text-[#525252] dark:text-white"
              aria-label="Orqaga"
            >
              <ArrowLeft className="size-5" />
            </button>
            <DialogTitle className="text-[17px] font-semibold leading-6 tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
              Xodim tanlang
            </DialogTitle>
          </div>
          <span className="flex items-center gap-1.5 text-[14px] font-medium text-[#0A0A0A] dark:text-white">
            Xodim tanlash
            <PickModeIcon />
          </span>
        </div>

        <div className="px-5 pb-3">
          <div className="relative">
            <HugeiconsIcon
              icon={Search01Icon}
              size={18}
              strokeWidth={2}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]"
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ism sharif"
              className="h-9 w-full rounded-[8px] border border-[#E5E5E5] bg-white pl-9 pr-3 text-[14px] text-[#0A0A0A] shadow-[0px_1px_2px_0px_#0000001A] outline-none placeholder:text-[#737373] focus-visible:border-[#0052D2] dark:border-white/10 dark:bg-card dark:text-white"
            />
          </div>
        </div>

        <div className="flex max-h-[380px] min-h-[160px] flex-col gap-2 overflow-auto px-5 pb-2">
          {shown.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-14 text-center">
              <p className="text-sm text-[#737373]">Xodim topilmadi</p>
            </div>
          ) : (
            shown.map((e) => {
              const isChecked = checked.has(e.id)
              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => pick(e)}
                  className="flex h-14 w-full shrink-0 items-center gap-3 rounded-[10px] bg-[#FAFAFA] py-2.5 pl-3 pr-4 text-left transition-colors hover:bg-[#F0F0F0] dark:bg-white/5 dark:hover:bg-white/10"
                >
                  {multiple && (
                    <span
                      role="checkbox"
                      aria-checked={isChecked}
                      onClick={(ev) => {
                        ev.stopPropagation()
                        toggle(e.id)
                      }}
                      className={cn(
                        'flex size-5 shrink-0 items-center justify-center rounded-[5px] border transition-colors',
                        isChecked ? 'border-[#2B52C4] bg-[#2B52C4] text-white' : 'border-[#D4D4D4] bg-white dark:border-white/20 dark:bg-transparent'
                      )}
                    >
                      {isChecked && <Check className="size-3.5" strokeWidth={3} />}
                    </span>
                  )}
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#2B52C4] text-[12px] font-semibold text-white">
                    {initials(e.name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium leading-[18px] text-[#0A0A0A] dark:text-white">
                      {e.name || '—'}
                    </span>
                    <span className="block truncate text-[12px] leading-4 text-[#737373]">
                      {[e.viloyat, e.tuman].filter(Boolean).join(', ') || '—'}
                    </span>
                  </span>
                  <span className="shrink-0 text-[12px] leading-4 text-[#737373]">{e.phone ? formatUzPhone(e.phone) : '—'}</span>
                </button>
              )
            })
          )}
        </div>

        {multiple && (
          <div className="flex h-[68px] shrink-0 items-center justify-between gap-3 bg-[#FAFAFA] pb-4 pl-5 pr-5 pt-4 dark:bg-white/5">
            <span className="text-[12px] leading-4 text-[#737373] dark:text-muted-foreground">{checked.size} ta tanlangan</span>
            <div className="flex items-center gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setChecked(new Set())}
                className="h-9 w-[114px] gap-1.5 rounded-[8px] border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#DC2626] shadow-[0px_1px_2px_0px_#0000001A] hover:bg-[#FEF2F2] dark:border-white/10 dark:bg-card"
              >
                <X className="size-4" /> Tozalash
              </Button>
              <Button
                type="button"
                disabled={checked.size === 0}
                onClick={() => {
                  onConfirm([...checked])
                  onOpenChange(false)
                }}
                className="h-9 w-[112px] gap-1.5 rounded-[8px] bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0px_1px_2px_0px_#0000001A] hover:bg-[#0047B8] disabled:bg-[#E5E5E5] disabled:text-[#A3A3A3] disabled:opacity-100"
              >
                <Check className="size-4" /> Qo‘shish
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
