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
      .join('') || ''
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

// Figma dev-mode spec — "Xodimlar tanlash" (o'ng tomondagi ko'k belgi, header'da, ko'p tanlash
// rejimida). Bitta-odam ikonkasi (PickModeIcon) bilan bir xil uslub/rang, faqat guruh shakli.
function PickModeGroupIcon() {
  return (
    <svg width="20" height="15" viewBox="0 0 20 15" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M1.93353 8.37793C3.16471 7.5532 4.63368 7.31032 6.00481 7.64844C6.32739 7.72798 6.48922 7.76761 6.50384 7.88086C6.51812 7.99442 6.36009 8.07908 6.04485 8.24805C5.80561 8.37628 5.57068 8.51064 5.39837 8.61719C4.98618 8.85817 4.21018 9.31275 3.64935 9.88281C3.28746 10.2507 2.81121 10.862 2.72259 11.7031C2.69524 11.9629 2.70811 12.212 2.75286 12.4482C2.79765 12.6847 2.81953 12.8032 2.7597 12.8652C2.69985 12.9269 2.60023 12.9121 2.4013 12.8818C1.54812 12.752 0.971136 12.2864 0.497978 11.7793C0.144399 11.4003 -0.0383951 10.9643 0.00676722 10.498C0.04931 10.0602 0.283419 9.70705 0.517509 9.44922C0.887077 9.04226 1.43249 8.69775 1.75872 8.49121C1.82836 8.44712 1.88764 8.40867 1.93353 8.37793ZM4.79192 1.66699C4.92995 1.66699 5.0657 1.67734 5.19817 1.69727C5.35606 1.72101 5.43488 1.73333 5.47552 1.79883C5.51611 1.86447 5.48813 1.95172 5.43157 2.12598C5.28687 2.57184 5.20895 3.04791 5.20892 3.54199C5.20892 4.57526 5.55003 5.52932 6.12688 6.2959C6.23677 6.44192 6.29203 6.51473 6.27532 6.58984C6.25836 6.66508 6.18732 6.70229 6.04583 6.77637C5.67088 6.97262 5.24446 7.08398 4.79192 7.08398C3.29626 7.08398 2.08409 5.8716 2.08392 4.37598C2.08392 2.88021 3.29615 1.66699 4.79192 1.66699Z"
        fill="#0052D2"
      />
      <path
        d="M13.58 7.64844C14.951 7.31035 16.4192 7.55333 17.6503 8.37793C17.6962 8.40868 17.7564 8.44708 17.8261 8.49121C18.1523 8.69777 18.6969 9.0424 19.0663 9.44922C19.3005 9.70706 19.5345 10.0601 19.5771 10.498C19.6222 10.9644 19.4396 11.4002 19.0859 11.7793C18.6128 12.2863 18.0365 12.7519 17.1835 12.8818C16.9842 12.9122 16.884 12.9272 16.8241 12.8652C16.7643 12.8032 16.7872 12.6847 16.8319 12.4482C16.8767 12.212 16.8886 11.9629 16.8612 11.7031C16.7726 10.8622 16.2973 10.2507 15.9355 9.88281C15.3746 9.31272 14.5976 8.85817 14.1855 8.61719C14.0132 8.51068 13.779 8.37619 13.54 8.24805C13.2245 8.07896 13.0667 7.99447 13.081 7.88086C13.0956 7.76761 13.2572 7.72804 13.58 7.64844ZM14.7919 1.66699C16.2877 1.66699 17.5009 2.88021 17.5009 4.37598C17.5007 5.8716 16.2876 7.08398 14.7919 7.08398C14.3394 7.08391 13.9129 6.97265 13.538 6.77637C13.3965 6.70231 13.3255 6.66507 13.3085 6.58984C13.2919 6.51478 13.3472 6.44178 13.4569 6.2959C14.0338 5.52931 14.3759 4.57529 14.3759 3.54199C14.3759 3.04791 14.297 2.57184 14.1523 2.12598C14.0957 1.95179 14.0677 1.86445 14.1083 1.79883C14.1489 1.73316 14.2286 1.72104 14.3866 1.69727C14.5188 1.67741 14.6542 1.66701 14.7919 1.66699Z"
        fill="#0052D2"
      />
      <path
        d="M6.20154 9.35339C8.39969 7.99418 11.1878 7.99418 13.3859 9.35339C13.4507 9.39346 13.5328 9.44149 13.6271 9.49668L13.6271 9.49669C14.054 9.74648 14.7317 10.143 15.1941 10.613C15.4846 10.9083 15.7742 11.3107 15.827 11.8125C15.8835 12.3493 15.6557 12.8461 15.2211 13.2761C14.503 13.9865 13.6136 14.584 12.4474 14.584H7.1401C5.97388 14.584 5.08444 13.9865 4.36642 13.2761C3.93178 12.8461 3.70395 12.3493 3.76045 11.8125C3.81326 11.3107 4.10293 10.9083 4.39337 10.613C4.85579 10.143 5.53344 9.74648 5.96034 9.49669C6.05466 9.4415 6.13673 9.39347 6.20154 9.35339Z"
        fill="#0052D2"
      />
      <path
        d="M6.25195 3.54167C6.25195 1.58566 7.83761 0 9.79362 0C11.7496 0 13.3353 1.58566 13.3353 3.54167C13.3353 5.49768 11.7496 7.08333 9.79362 7.08333C7.83761 7.08333 6.25195 5.49768 6.25195 3.54167Z"
        fill="#0052D2"
      />
    </svg>
  )
}

// "Xodim tanlang" — mavjud xodim(lar)ni Employee ro'yxatidan izlab tanlash oynasi. Ikkala
// rejimda ham checkbox + "N ta tanlangan" + Tozalash/Qo'shish footer bor (Figma); farq faqat
// header'dagi ikonka/matnda ("Xodim tanlash" bitta-odam ikonkasi / "Xodimlar tanlash" ko'p-odam
// ikonkasi) va tanlash mantig'ida: multiple=false — checkbox "radio" kabi ishlaydi (yangi qatorga
// bosilsa avvalgisi o'chadi, ko'pi bilan 1 ta), multiple=true — erkin ko'p tanlash.
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

  // Bitta tanlash rejimida ham checkbox ko'rinadi (Figma), lekin "radio" kabi ishlaydi —
  // yangi qatorga bosilsa avvalgi tanlov avtomatik o'chadi. Ikkala rejimda ham yopish/tasdiqlash
  // faqat pastdagi "Qo'shish" tugmasi bilan amalga oshadi.
  function pick(emp) {
    if (multiple) {
      toggle(emp.id)
    } else {
      setChecked(new Set([emp.id]))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Standart balandlik — 560×592, radius 12px (shu bo'limdagi barcha modallar bilan bir xil,
          ular bir-birining ustiga "ichma-ich" ochilgani uchun). */}
      <DialogContent showCloseButton={false} className="flex h-[592px] flex-col gap-0 overflow-hidden rounded-[12px] p-0 shadow-[0px_1px_2px_0px_#0000001A] sm:max-w-[560px]">
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
            {multiple ? 'Xodimlar tanlash' : 'Xodim tanlash'}
            {multiple ? <PickModeGroupIcon /> : <PickModeIcon />}
          </span>
        </div>

        <div className="flex h-12 shrink-0 items-center px-5">
          <div className="relative w-full">
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

        {/* Ro'yxat qolgan bo'sh joyni to'ldiradi (flex-1) — dialog balandligi qat'iy 592px bo'lgani
            uchun bu qism ham elementlar soni kam bo'lsa ham torayib qolmaydi. */}
        <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3 pb-3">
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
                  <span
                    role="checkbox"
                    aria-checked={isChecked}
                    onClick={(ev) => {
                      ev.stopPropagation()
                      pick(e)
                    }}
                    className={cn(
                      'flex size-5 shrink-0 items-center justify-center rounded-[5px] border transition-colors',
                      isChecked ? 'border-[#2B52C4] bg-[#2B52C4] text-white' : 'border-[#D4D4D4] bg-white dark:border-white/20 dark:bg-transparent'
                    )}
                  >
                    {isChecked && <Check className="size-3.5" strokeWidth={3} />}
                  </span>
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#2B52C4] text-[12px] font-semibold text-white">
                    {initials(e.name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium leading-[18px] text-[#0A0A0A] dark:text-white">
                      {e.name || ''}
                    </span>
                    <span className="block truncate text-[12px] leading-4 text-[#737373]">
                      {[e.viloyat, e.tuman].filter(Boolean).join(', ') || ''}
                    </span>
                  </span>
                  <span className="shrink-0 text-[12px] leading-4 text-[#737373]">{e.phone ? formatUzPhone(e.phone) : ''}</span>
                </button>
              )
            })
          )}
        </div>

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
      </DialogContent>
    </Dialog>
  )
}
