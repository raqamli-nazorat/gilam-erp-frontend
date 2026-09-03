import { useState } from 'react'
import { Download, Printer, X } from 'lucide-react'
import { SALE_STORE } from '@/features/sales/salesMockData'
import { formatDate, formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'

// "ORZU 6866 YK24 400X1200" -> { tovar: "ORZU 6866 YK24", razmer: "400X1200", quality: "ORZU" }
function splitName(name) {
  const parts = name.trim().split(/\s+/)
  const razmer = parts.length > 1 ? parts[parts.length - 1] : ''
  const tovar = parts.length > 1 ? parts.slice(0, -1).join(' ') : name
  return { tovar, razmer, quality: parts[0] }
}

export default function SalePrintModal({ open, onOpenChange, doc }) {
  const [tab, setTab] = useState('nakladnoy')
  if (!doc) return null

  const rows = doc.rows.map((r) => ({ ...r, ...splitName(r.name) }))
  const gross = rows.reduce((s, r) => s + r.sum, 0)
  const m2 = rows.reduce((s, r) => s + r.m2, 0)
  const discount = rows.reduce((s, r) => s + r.discount, 0)

  // Sifat bo'yicha guruhlash — 1 dan ko'p bo'lsa oraliq "jami" chizig'i
  const groups = []
  rows.forEach((r) => {
    const g = groups.find((x) => x.key === r.quality)
    if (g) g.rows.push(r)
    else groups.push({ key: r.quality, rows: [r] })
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-h-[90vh] overflow-y-auto p-5 sm:max-w-[820px]">
        <div className="flex items-center justify-between">
          <div className="flex gap-1 rounded-lg bg-[#F5F5F5] p-1 dark:bg-white/5">
            {[['nakladnoy', 'Nakladnoy'], ['faktura', 'Faktura']].map(([k, l]) => (
              <button
                key={k}
                type="button"
                onClick={() => setTab(k)}
                className={cn(
                  'h-8 rounded-md px-4 text-[14px] font-medium transition-colors',
                  tab === k ? 'bg-white text-[#0A0A0A] shadow-sm dark:bg-card dark:text-white' : 'text-[#737373]'
                )}
              >
                {l}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="h-9 gap-1.5 border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white">
              <Download className="h-4 w-4" /> Yuklab olish
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-9 gap-1.5 border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white">
              <X className="h-4 w-4" /> Yopish
            </Button>
            <Button type="button" onClick={() => onOpenChange(false)} className="h-9 gap-1.5 bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]">
              <Printer className="h-4 w-4" /> Chop etish
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-[#E5E5E5] bg-white p-6 text-[13px] text-[#0A0A0A] dark:border-white/10 dark:bg-card dark:text-white">
          <p className="text-[15px] font-bold">{SALE_STORE.name}</p>
          <p className="text-[12px] text-[#737373]">{SALE_STORE.address} · {SALE_STORE.phone}</p>

          <div className="mt-4 flex items-baseline justify-between">
            <p className="text-[16px] font-bold">
              {tab === 'nakladnoy' ? 'Yuk xati (nakladnoy)' : 'Faktura'} № {doc.number}
            </p>
            <p className="text-[12px] text-[#737373]">{formatDate(doc.date)}</p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-6 text-[12px]">
            <div>
              <p className="font-semibold uppercase text-[#737373]">Yetkazib beruvchi</p>
              <p className="font-medium">{SALE_STORE.name}</p>
              <p className="text-[#737373]">Agent: {doc.agent}</p>
            </div>
            <div>
              <p className="font-semibold uppercase text-[#737373]">Qabul qiluvchi</p>
              <p className="font-medium">{doc.counterparty || '—'}</p>
              <p className="text-[#737373]">Shartnoma: {doc.contract} · Transport: {doc.transport}</p>
            </div>
          </div>

          <table className="mt-4 w-full border-collapse text-[12px]">
            <thead>
              <tr className="border-y border-[#E5E5E5] bg-[#F5F5F5] text-[11px] font-semibold uppercase text-[#737373] dark:border-white/10 dark:bg-white/5">
                <th className="px-2 py-2 text-left">TOVAR</th>
                <th className="px-2 py-2 text-left">RAZMER</th>
                <th className="px-2 py-2 text-right">SONI</th>
                <th className="px-2 py-2 text-right">M²</th>
                <th className="px-2 py-2 text-right">NARXI</th>
                <th className="px-2 py-2 text-right">SUMMA</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <>
                  {g.rows.map((r) => (
                    <tr key={r.id} className="border-b border-[#F0F0F0] dark:border-white/5">
                      <td className="px-2 py-2">{r.tovar}</td>
                      <td className="px-2 py-2">{r.razmer}</td>
                      <td className="px-2 py-2 text-right">1</td>
                      <td className="px-2 py-2 text-right">{formatNumber(r.m2)}</td>
                      <td className="px-2 py-2 text-right">{formatNumber(r.priceUsd)}</td>
                      <td className="px-2 py-2 text-right">{formatNumber(r.sum)}</td>
                    </tr>
                  ))}
                  {g.rows.length > 1 && (
                    <tr key={`${g.key}-sub`} className="bg-[#F5F5F5] font-medium dark:bg-white/5">
                      <td className="px-2 py-2" colSpan={2}>{g.key} · jami</td>
                      <td className="px-2 py-2 text-right">{g.rows.length}</td>
                      <td className="px-2 py-2 text-right">{formatNumber(g.rows.reduce((s, r) => s + r.m2, 0))}</td>
                      <td className="px-2 py-2" />
                      <td className="px-2 py-2 text-right">{formatNumber(g.rows.reduce((s, r) => s + r.sum, 0))}</td>
                    </tr>
                  )}
                </>
              ))}
              <tr className="border-t-2 border-[#E5E5E5] bg-[#F5F5F5] font-semibold dark:border-white/10 dark:bg-white/5">
                <td className="px-2 py-2" colSpan={2}>JAMI</td>
                <td className="px-2 py-2 text-right">{rows.length}</td>
                <td className="px-2 py-2 text-right">{formatNumber(m2)}</td>
                <td className="px-2 py-2" />
                <td className="px-2 py-2 text-right">{formatNumber(gross)}</td>
              </tr>
            </tbody>
          </table>

          <p className="mt-3 text-[12px] text-[#737373]">
            Jami summa so‘zda: {numToWords(Math.round(gross))} AQSH dollari · chegirma {formatNumber(discount)} USD hisobga olingan.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-8 text-[12px]">
            <div>
              <p className="text-[#737373]">Topshirdi (F.I.Sh., imzo)</p>
              <div className="mt-6 border-b border-[#D4D4D4]" />
            </div>
            <div>
              <p className="text-[#737373]">Qabul qildi (F.I.Sh., imzo)</p>
              <div className="mt-6 border-b border-[#D4D4D4]" />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const ONES = ['', 'bir', 'ikki', 'uch', 'to‘rt', 'besh', 'olti', 'yetti', 'sakkiz', 'to‘qqiz']
const TENS = ['', 'o‘n', 'yigirma', 'o‘ttiz', 'qirq', 'ellik', 'oltmish', 'yetmish', 'sakson', 'to‘qson']
function under1000(n) {
  const h = Math.floor(n / 100)
  const t = Math.floor((n % 100) / 10)
  const o = n % 10
  return [h ? `${ONES[h]} yuz` : '', TENS[t], ONES[o]].filter(Boolean).join(' ')
}
function numToWords(n) {
  if (n === 0) return 'nol'
  const th = Math.floor(n / 1000)
  const rest = n % 1000
  return [th ? `${under1000(th)} ming` : '', under1000(rest)].filter(Boolean).join(' ').trim()
}
