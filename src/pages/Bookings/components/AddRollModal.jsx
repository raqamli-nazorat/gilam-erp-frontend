import { useEffect, useMemo, useState } from 'react'
import { Plus, Search, X } from 'lucide-react'
import { AVAILABLE_ROLLS, QUALITIES } from '@/features/bookings/bookingsMockData'
import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
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

export default function AddRollModal({ open, onOpenChange, roomCount = 0, neededM2 = 0, onAdd }) {
  const [search, setSearch] = useState('')
  const [width, setWidth] = useState('4')
  const [quality, setQuality] = useState('__all')
  const [picked, setPicked] = useState([])

  useEffect(() => {
    if (open) setPicked([])
  }, [open])

  const rows = useMemo(() => {
    return AVAILABLE_ROLLS.filter((r) => {
      if (width !== '__all' && String(r.widthM) !== width) return false
      if (quality !== '__all' && r.quality !== quality) return false
      if (search) {
        const q = search.toLowerCase()
        const hay = `${r.quality} ${r.design} ${r.partiya}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [search, width, quality])

  const pickedRolls = AVAILABLE_ROLLS.filter((r) => picked.includes(r.id))
  const pickedM2 = pickedRolls.reduce((s, r) => s + r.stockM2, 0)
  const leftover = Math.max(0, Number((pickedM2 - neededM2).toFixed(2)))

  function toggle(id) {
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="p-5 sm:max-w-[860px]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-[17px] font-semibold leading-[24px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            Rulon qo'shish
          </DialogTitle>
          <button type="button" onClick={() => onOpenChange(false)} className="text-[#737373] transition-colors hover:text-[#0A0A0A] dark:hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </DialogHeader>

        <div className="flex items-center justify-between rounded-lg bg-[#EAF1FE] px-3.5 py-2.5 text-[13px] font-medium leading-[18px] text-[#0052D2] dark:bg-[#0052D2]/20 dark:text-[#60A5FA]">
          <span>{roomCount} ta xona o‘lchandi · kerakli maydon {formatNumber(neededM2)} m²</span>
          <span className="font-medium text-[#0052D2] dark:text-[#60A5FA]">Faqat mos eni bo‘yicha filtrlangan</span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
            <Input
              placeholder="Tovar nomi, partiya yoki shtrix kod"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-md border-[#E5E5E5] bg-white pl-9 pr-3 text-[14px] dark:border-white/10 dark:bg-card dark:text-white"
            />
          </div>
          <Select value={width} onValueChange={setWidth}>
            <SelectTrigger className="h-9 w-[140px] rounded-md border-[#E5E5E5] bg-white text-[14px] dark:border-white/10 dark:bg-card dark:text-white">
              <SelectValue>{(v) => (v === '__all' ? 'Eni: barchasi' : `Eni: ${formatNumber(Number(v))} m`)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">Eni: barchasi</SelectItem>
              <SelectItem value="3">Eni: 3,00 m</SelectItem>
              <SelectItem value="4">Eni: 4,00 m</SelectItem>
            </SelectContent>
          </Select>
          <Select value={quality} onValueChange={setQuality}>
            <SelectTrigger className="h-9 w-[150px] rounded-md border-[#E5E5E5] bg-white text-[14px] dark:border-white/10 dark:bg-card dark:text-white">
              <SelectValue>{(v) => (v === '__all' ? 'Sifat: barchasi' : `Sifat: ${v}`)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">Sifat: barchasi</SelectItem>
              {QUALITIES.map((q) => <SelectItem key={q} value={q}>{q}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-hidden rounded-lg border border-[#E5E5E5] dark:border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-[#F5F5F5] dark:bg-white/5">
              <tr className="h-10 border-b border-[#E5E5E5] text-[11px] font-semibold uppercase text-[#737373] dark:border-white/10">
                <th className="w-10 px-3" />
                <th className="px-3 text-left">TOVAR</th>
                <th className="px-3 text-left">PARTIYA</th>
                <th className="px-3 text-left">OMBOR</th>
                <th className="px-3 text-right">QOLDIQ, M²</th>
                <th className="px-3 text-right">ENI</th>
                <th className="px-3 text-right">NARX, USD</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const on = picked.includes(r.id)
                return (
                  <tr
                    key={r.id}
                    className={cn(
                      'h-11 cursor-pointer border-b border-[#E5E5E5] last:border-0 dark:border-white/5',
                      on ? 'bg-[#EFF5FF] dark:bg-[#0052D2]/10' : 'hover:bg-[#F9FAFB] dark:hover:bg-white/5'
                    )}
                    onClick={() => toggle(r.id)}
                  >
                    <td className="px-3" onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={on} onCheckedChange={() => toggle(r.id)} />
                    </td>
                    <td className="px-3 text-[13px] font-medium text-[#0A0A0A] dark:text-white">{r.quality} {r.design}</td>
                    <td className="px-3 text-[13px] font-medium text-[#0052D2] dark:text-[#60A5FA]">{r.partiya}</td>
                    <td className="px-3 text-[13px] text-[#737373] dark:text-muted-foreground">{r.warehouse}</td>
                    <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{formatNumber(r.stockM2)}</td>
                    <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{formatNumber(r.widthM)}</td>
                    <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{formatNumber(r.priceUsd)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="rounded-lg bg-[#E6FAF1] px-3.5 py-2.5 text-[13px] font-medium text-[#047A47] dark:bg-[#047A47]/15 dark:text-[#34D399]">
          Tanlangan {formatNumber(pickedM2)} m² · kerakli {formatNumber(neededM2)} m² · qoldiq {formatNumber(leftover)} m² rulonlarda qoladi
        </div>

        <DialogFooter className="mx-0 mb-0 mt-2 items-center gap-2 border-0 bg-transparent p-0 sm:justify-between">
          <span className="text-[13px] text-[#737373]">{picked.length} ta rulon tanlandi</span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-9 gap-1.5 border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
            >
              <X className="h-4 w-4" /> Bekor qilish
            </Button>
            <Button
              type="button"
              disabled={picked.length === 0}
              onClick={() => {
                onAdd(pickedRolls)
                onOpenChange(false)
              }}
              className="h-9 gap-1.5 bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8] disabled:opacity-50"
            >
              <Plus className="h-4 w-4" /> Qo'shish ({picked.length})
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
