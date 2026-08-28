import { Plus, Tag, X } from 'lucide-react'
import { WAREHOUSES } from '@/features/receipts/mockData'
import { formatNumber } from '@/lib/format'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function BatchCreateModal({ open, onOpenChange, rows, warehouse, onConfirm }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-5 sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-[17px] font-semibold leading-[24px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            Partiya yaratish
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-start gap-2.5 rounded-lg bg-[#F5F5F5] px-3.5 py-3 text-[13px] font-normal leading-[18px] text-[#525252] dark:bg-white/5 dark:text-muted-foreground">
          <Tag className="mt-0.5 h-4 w-4 shrink-0 text-[#737373]" />
          <span>
            Partiya — bu aniq rulon. Har bir belgilangan qator uchun alohida partiya raqami va shtrix
            kod yaratiladi.
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="mb-1.5 text-[12px] font-normal leading-[16px] text-[#737373]">Ombor</p>
            <Select defaultValue={warehouse}>
              <SelectTrigger className="h-9 w-full rounded-md border-[#E5E5E5] bg-white px-3 text-[14px] font-normal text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-card dark:text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WAREHOUSES.map((w) => (
                  <SelectItem key={w} value={w}>
                    {w}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="mb-1.5 text-[12px] font-normal leading-[16px] text-[#737373]">Raqamlash</p>
            <Select defaultValue="auto">
              <SelectTrigger className="h-9 w-full rounded-md border-[#E5E5E5] bg-white px-3 text-[14px] font-normal text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-card dark:text-white">
                <SelectValue>{() => 'Avtomatik'}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Avtomatik</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.4px] text-[#737373]">
            Yaratiladigan partiyalar · {rows.length} ta
          </p>
          <div className="max-h-56 space-y-1.5 overflow-y-auto rounded-lg border border-[#E5E5E5] p-1.5 dark:border-white/10">
            {rows.map((row) => (
              <div
                key={row.id}
                className="flex items-center justify-between rounded-md px-2.5 py-2 text-[13px]"
              >
                <span className="font-medium text-[#0A0A0A] dark:text-white">
                  {row.quality} {row.design} {formatNumber(row.m2, 0)} {row.shape}
                </span>
                <span className="flex items-center gap-3">
                  <span className="text-[#737373]">{row.partiya || '—'}</span>
                  <span className="text-[#0A0A0A] dark:text-white">{formatNumber(row.m2)} m²</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[12px] font-normal text-[#737373]">
          Yaratilgandan keyin har bir partiyaga shtrix va QR kodli yorliq chop etiladi.
        </p>

        <DialogFooter className="mt-2 gap-2 border-t border-[#E5E5E5] pt-4 dark:border-white/10">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9 gap-1.5 border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
          >
            <X className="h-4 w-4" /> Bekor qilish
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className="h-9 gap-1.5 bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
          >
            <Plus className="h-4 w-4" /> Yaratish ({rows.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
