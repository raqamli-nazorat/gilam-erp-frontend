import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Check, X } from 'lucide-react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Search01Icon } from '@hugeicons/core-free-icons/index'
import { cn } from '@/lib/utils'
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

// "Tashkilot tanlang" — RecruitmentFieldsGrid'ning "Tashkilot" maydoni bosilganda ochiladigan
// izlab-tanlash oynasi. Figma dev-mode spec "Xodim tanlang" bilan bir xil komponent: 560×604,
// radius16, header60, qidiruv (520×36), ro'yxat 560×428 (doim shu balandlikda — kam
// ma'lumot bo'lsa ham o'zgarmaydi), qator 536×56 bg #FAFAFA radius10, footer 560×68 bg #FAFAFA
// (Tozalash/Qo'shish). Tashkilot har doim BITTA bo'lgani uchun checkbox vizual jihatdan bor,
// lekin funksional jihatdan radio kabi ishlaydi — yangi qatorga bosilsa avvalgisi avtomatik o'chadi.
export default function TashkilotPickerModal({ open, onOpenChange, organizations, onConfirm, onBack }) {
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    if (open) {
      setQ('')
      setSelected(null)
    }
  }, [open])

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return organizations
    return organizations.filter((o) => o.name?.toLowerCase().includes(s) || (o.inn || '').includes(s))
  }, [organizations, q])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Standart balandlik — 560×592, radius 12px (shu bo'limdagi barcha modallar bilan bir xil,
          ular bir-birining ustiga "ichma-ich" ochilgani uchun). */}
      <DialogContent showCloseButton={false} className="flex h-[592px] flex-col gap-0 overflow-hidden rounded-[12px] p-0 shadow-[0px_1px_2px_0px_#0000001A] sm:max-w-[560px]">
        <div className="flex h-[60px] shrink-0 items-center gap-2 pb-4 pl-5 pr-5 pt-5">
          <button
            type="button"
            onClick={() => (onBack ? onBack() : onOpenChange(false))}
            className="flex size-6 items-center justify-center text-[#0A0A0A] transition-colors hover:text-[#525252] dark:text-white"
            aria-label="Orqaga"
          >
            <ArrowLeft className="size-5" />
          </button>
          <DialogTitle className="text-[17px] font-semibold leading-6 tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            Tashkilot tanlang
          </DialogTitle>
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
              placeholder="Nomi bo‘yicha"
              className="h-9 w-full rounded-[8px] border border-[#E5E5E5] bg-white pl-9 pr-3 text-[14px] text-[#0A0A0A] shadow-[0px_1px_2px_0px_#0000001A] outline-none placeholder:text-[#737373] focus-visible:border-[#0052D2] dark:border-white/10 dark:bg-card dark:text-white"
            />
          </div>
        </div>

        {/* Ro'yxat qolgan bo'sh joyni to'ldiradi (flex-1) — elementlar soni kam bo'lsa ham torayib qolmaydi. */}
        <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3 pb-3">
          {shown.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-14 text-center">
              <p className="text-sm text-[#737373]">Tashkilot topilmadi</p>
            </div>
          ) : (
            shown.map((o) => {
              const isChecked = selected === o.id
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setSelected(o.id)}
                  className="flex h-14 w-full shrink-0 items-center gap-3 rounded-[10px] bg-[#FAFAFA] py-2.5 pl-3 pr-4 text-left transition-colors hover:bg-[#F0F0F0] dark:bg-white/5 dark:hover:bg-white/10"
                >
                  <span
                    role="checkbox"
                    aria-checked={isChecked}
                    className={cn(
                      'flex size-5 shrink-0 items-center justify-center rounded-[5px] border transition-colors',
                      isChecked ? 'border-[#2B52C4] bg-[#2B52C4] text-white' : 'border-[#D4D4D4] bg-white dark:border-white/20 dark:bg-transparent'
                    )}
                  >
                    {isChecked && <Check className="size-3.5" strokeWidth={3} />}
                  </span>
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#2B52C4] text-[12px] font-semibold text-white">
                    {initials(o.name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium leading-[18px] text-[#0A0A0A] dark:text-white">{o.name || ''}</span>
                    <span className="block truncate text-[12px] leading-4 text-[#737373]">{o.manzil || ''}</span>
                  </span>
                  <span className="shrink-0 text-[12px] leading-4 text-[#737373]">{o.inn || ''}</span>
                </button>
              )
            })
          )}
        </div>

        <div className="flex h-[68px] shrink-0 items-center justify-between gap-3 bg-[#FAFAFA] pb-4 pl-5 pr-5 pt-4 dark:bg-white/5">
          <span className="text-[12px] leading-4 text-[#737373] dark:text-muted-foreground">{selected ? '1 ta tanlangan' : '0 ta tanlangan'}</span>
          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelected(null)}
              className="h-9 w-[114px] gap-1.5 rounded-[8px] border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#DC2626] shadow-[0px_1px_2px_0px_#0000001A] hover:bg-[#FEF2F2] dark:border-white/10 dark:bg-card"
            >
              <X className="size-4" /> Tozalash
            </Button>
            <Button
              type="button"
              disabled={!selected}
              onClick={() => {
                onConfirm(selected)
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
