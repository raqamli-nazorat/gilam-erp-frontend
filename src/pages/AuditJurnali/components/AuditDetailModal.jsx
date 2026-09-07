import { ChevronLeft, Search, X } from 'lucide-react'
import { buildDiff } from '@/features/audit/auditData'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const fieldCls =
  'h-11 w-full rounded-lg border-[#E5E5E5] bg-white px-3.5 text-[15px] font-normal text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.06)] dark:border-white/10 dark:bg-card dark:text-white'
const labelCls = 'mb-2 block text-[14px] font-normal leading-[18px] text-[#3F3F46] dark:text-muted-foreground'

function JsonBox({ value }) {
  return (
    <pre className="whitespace-pre-wrap break-all rounded-lg border border-dashed border-[#D4D4D4] bg-[#FAFAFA] p-4 font-mono text-[13px] leading-[20px] text-[#0A0A0A] dark:border-white/15 dark:bg-white/5 dark:text-white">
      {value == null ? '—' : JSON.stringify(value, null, 2)}
    </pre>
  )
}

export default function AuditDetailModal({ row, onClose }) {
  if (!row) return null
  const { before, after } = buildDiff(row)

  return (
    <Dialog open={!!row} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="gap-0 rounded-[20px] p-0 sm:max-w-[640px]">
        <DialogHeader className="flex flex-row items-center gap-2 px-6 pb-2 pt-6">
          <button type="button" onClick={onClose} className="text-[#0A0A0A] transition-colors hover:text-[#0052D2] dark:text-white">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <DialogTitle className="text-[18px] font-semibold leading-[26px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            Foydalanuvchi va so‘rov haqida ma’lumot
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 px-6 pb-6 pt-2">
          <div>
            <Label className={labelCls}>Foydalanuvchi</Label>
            <Input readOnly value={row.foydalanuvchi} className={fieldCls} />
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <div>
              <Label className={labelCls}>Vaqti</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A3A3A3]" />
                <Input readOnly value={row.vaqtFull} className={fieldCls.replace('px-3.5', 'pl-9 pr-3.5')} />
              </div>
            </div>
            <div>
              <Label className={labelCls}>IP manzili</Label>
              <Input readOnly value={row.ip} className={fieldCls} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-x-6 gap-y-5">
            <div>
              <Label className={labelCls}>Harakati</Label>
              <Input readOnly value={row.amal} className={fieldCls} />
            </div>
            <div>
              <Label className={labelCls}>Jadval nomi</Label>
              <Input readOnly value={row.jadval} className={fieldCls} />
            </div>
            <div>
              <Label className={labelCls}>Yozuv raqami</Label>
              <Input readOnly value={row.yozuv} className={fieldCls} />
            </div>
          </div>

          {before !== null && (
            <div>
              <Label className={labelCls}>Eski qiymat</Label>
              <JsonBox value={before} />
            </div>
          )}
          {after !== null && (
            <div>
              <Label className={labelCls}>Yangi qiymat</Label>
              <JsonBox value={after} />
            </div>
          )}

          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-9 gap-1.5 border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
            >
              <X className="h-4 w-4" /> Yopish
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
