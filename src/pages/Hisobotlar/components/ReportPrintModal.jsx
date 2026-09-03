import { Download01Icon } from '@/components/ui/icons'
import { Printer, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { COMPANY } from '@/features/hisobotlar/hisobotlarData'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function ReportPrintModal({ open, onOpenChange, title, meta, columns, rows, total, fmt }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-full max-w-[900px] overflow-y-auto p-5">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-[15px] font-semibold text-[#0A0A0A] dark:text-white">
            Chop etish ko'rinishi · A4 al'bom
          </DialogTitle>
          <div className="flex items-center gap-2 pr-6">
            <Button variant="outline" className="h-8 gap-1.5 border-[#E5E5E5] bg-white px-3 text-[13px] font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white">
              <Download01Icon className="h-3.5 w-3.5" /> Yuklab olish
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="h-8 gap-1.5 border-[#E5E5E5] bg-white px-3 text-[13px] font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white">
              <X className="h-3.5 w-3.5" /> Yopish
            </Button>
            <Button className="h-8 gap-1.5 bg-[#0052D2] px-3 text-[13px] font-medium text-white hover:bg-[#0047B8]">
              <Printer className="h-3.5 w-3.5" /> Chop etish
            </Button>
          </div>
        </DialogHeader>

        <div className="rounded-xl border border-[#E5E5E5] bg-white p-6 text-[#0A0A0A] dark:border-white/10">
          <p className="text-[15px] font-bold">{COMPANY.name}</p>
          <p className="text-[12px] text-[#737373]">{COMPANY.address}</p>

          <div className="mt-4 flex items-start justify-between">
            <p className="text-[17px] font-semibold">{title}</p>
            <p className="text-[12px] text-[#737373]">Shakllantirildi: 13.08.2026 09:41</p>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-10 gap-y-2">
            {meta.map((m) => (
              <div key={m.label}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.3px] text-[#737373]">{m.label}</p>
                <p className="text-[13px]">{m.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="bg-[#F5F5F5]">
                <tr className="h-9 border-y border-[#E5E5E5] text-[11px] font-semibold uppercase text-[#525252]">
                  <th className="w-8 px-2 text-left">#</th>
                  {columns.map((c) => (
                    <th key={c.key} className={cn('px-2', c.align === 'right' ? 'text-right' : 'text-left')}>{c.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="h-9 border-b border-[#E5E5E5]">
                    <td className="px-2 text-[#737373]">{r.marker ? '—' : i + 1}</td>
                    {columns.map((c) => (
                      <td key={c.key} className={cn('px-2', c.align === 'right' ? 'text-right' : 'text-left')}>{fmt(r, c)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
              {total && (
                <tfoot className="bg-[#F5F5F5]">
                  <tr className="h-9 font-semibold">
                    <td className="px-2" />
                    {columns.map((c) => (
                      <td key={c.key} className={cn('px-2', c.align === 'right' ? 'text-right' : 'text-left')}>{fmt(total, c, true)}</td>
                    ))}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          <div className="mt-10 flex justify-between gap-10 text-[12px] text-[#737373]">
            <div className="flex-1">
              <p>Tuzdi (F.I.Sh., imzo)</p>
              <div className="mt-6 border-b border-[#A3A3A3]" />
            </div>
            <div className="flex-1">
              <p>Tasdiqladi (F.I.Sh., imzo)</p>
              <div className="mt-6 border-b border-[#A3A3A3]" />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
