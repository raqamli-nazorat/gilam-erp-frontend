import { useEffect, useRef, useState } from 'react'
import dayjs from 'dayjs'
import { AlertTriangle, Check, Paperclip, X } from 'lucide-react'
import { formatNumber } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { changePct } from '@/features/rejaNarx/rejaNarxData'

const outlineBtn =
  'h-9 gap-1.5 border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white'

function Summary({ items }) {
  return (
    <dl className="grid grid-cols-[150px_1fr] gap-x-4 gap-y-2.5 rounded-lg bg-[#F5F5F5] px-4 py-3.5 text-[14px] dark:bg-white/5">
      {items.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="text-[#737373]">{label}</dt>
          <dd className="text-[#0A0A0A] dark:text-white">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

const pct = (r) => {
  const v = changePct(r)
  return `${v > 0 ? '+' : ''}${formatNumber(v, 1)} %`
}

export function ConfirmPricesModal({ open, onOpenChange, doc, stats, onConfirm }) {
  if (!doc) return null
  const changedText = stats.changedRows.length
    ? stats.changedRows.map((r) => `${r.quality} ${pct(r)}`).join(', ')
    : 'Yo‘q'
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-5 sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="text-[17px] font-semibold text-[#0A0A0A] dark:text-white">Narxlar tasdiqlansinmi?</DialogTitle>
        </DialogHeader>
        <p className="text-[14px] text-[#525252] dark:text-muted-foreground">
          Yangi narxlar {dayjs(doc.effectiveDate).format('DD.MM.YYYY')} dan Sifat narxi ma’lumotnomasiga yoziladi va savdoda
          qo‘llanadi.
        </p>
        <Summary
          items={[
            ['Hujjat', `${doc.number}, ${dayjs(doc.createdAt).format('DD.MM.YYYY HH:mm')}`],
            ['Kurs, UZS', formatNumber(doc.rate)],
            ['Sifatlar', `${stats.qualities} ta, ${stats.changed} tasida o‘zgarish`],
            ['O‘zgargan narxlar', changedText],
          ]}
        />
        <DialogFooter className="mt-2 gap-2 border-t border-[#E5E5E5] pt-4 dark:border-white/10">
          <Button variant="outline" onClick={() => onOpenChange(false)} className={outlineBtn}>
            Yopish
          </Button>
          <Button onClick={onConfirm} className="h-9 gap-1.5 bg-[#16A34A] px-4 text-[14px] font-medium text-white hover:bg-[#15803D]">
            <Check className="h-4 w-4" /> Tasdiqlash
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const MAX_FILE = 10 * 1024 * 1024

export function CancelPricesModal({ open, onOpenChange, doc, stats, previous, onConfirm }) {
  const [reason, setReason] = useState('')
  const [file, setFile] = useState(null)
  const [fileError, setFileError] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (!open) return
    setReason('')
    setFile(null)
    setFileError('')
  }, [open])

  if (!doc) return null
  const trimmed = reason.trim()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-5 sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="text-[17px] font-semibold text-[#0A0A0A] dark:text-white">Narx hujjati bekor qilinsinmi?</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2.5 rounded-lg bg-red-50 p-3 text-[14px] text-red-700 dark:bg-red-950/40 dark:text-red-400">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            {previous
              ? `Sifat narxi ma’lumotnomasidagi narxlar oldingi hujjat (${previous.number}) qiymatlariga qaytadi.`
              : 'Bu hujjatdan oldin tasdiqlangan narx hujjati yo‘q — sifatlarning amaldagi narxi bekor qilinadi.'}
          </p>
        </div>

        <Summary
          items={[
            ['Hujjat', `${doc.number}, ${dayjs(doc.createdAt).format('DD.MM.YYYY HH:mm')}`],
            ['Sifatlar', `${stats.qualities} ta, ${stats.changed} tasida o‘zgarish`],
            ['Amal qilish sanasi', dayjs(doc.effectiveDate).format('DD.MM.YYYY')],
          ]}
        />

        <div>
          <label htmlFor="rn-cancel-reason" className="mb-1.5 block text-[14px] font-medium text-[#0A0A0A] dark:text-white">
            Sabab <span className="text-red-600">*</span>
          </label>
          <Input
            id="rn-cancel-reason"
            autoFocus
            value={reason}
            maxLength={500}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Sababni yozing…"
          />
          <p className="mt-1.5 text-[12px] text-[#737373]">Sabab jurnalda va hujjat tarixida saqlanadi.</p>
        </div>

        <div className="flex items-center justify-between gap-3 px-1 text-[14px]">
          <span className="text-[#737373]">Asos hujjat</span>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            className="hidden"
            onChange={(e) => {
              const picked = e.target.files?.[0]
              e.target.value = ''
              if (!picked) return
              if (picked.size > MAX_FILE) {
                setFileError('Fayl hajmi 10 MB dan oshmasligi kerak')
                return
              }
              setFileError('')
              setFile(picked)
            }}
          />
          {file ? (
            <span className="flex min-w-0 items-center gap-2 text-[#0A0A0A] dark:text-white">
              <span className="truncate">{file.name}</span>
              <button type="button" aria-label="Faylni olib tashlash" onClick={() => setFile(null)} className="text-[#737373] hover:text-[#0A0A0A]">
                <X className="h-4 w-4" />
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 font-medium text-[#0052D2] hover:underline dark:text-[#60A5FA]"
            >
              <Paperclip className="h-4 w-4" /> Fayl biriktirish
            </button>
          )}
        </div>
        {fileError && <p className="-mt-2 text-[12px] text-red-600">{fileError}</p>}

        <DialogFooter className="mt-2 gap-2 border-t border-[#E5E5E5] pt-4 dark:border-white/10">
          <Button variant="outline" onClick={() => onOpenChange(false)} className={outlineBtn}>
            <X className="h-4 w-4" /> Yopish
          </Button>
          <Button
            disabled={!trimmed}
            onClick={() => onConfirm({ reason: trimmed, fileName: file?.name ?? '' })}
            className="h-9 gap-1.5 bg-[#DC2626] px-4 text-[14px] font-medium text-white hover:bg-[#B91C1C] disabled:bg-[#F5F5F5] disabled:text-[#A3A3A3] disabled:opacity-100"
          >
            <X className="h-4 w-4" /> Bekor qilish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
