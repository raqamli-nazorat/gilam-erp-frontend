import { useEffect, useMemo, useState } from 'react'
import { Plus, Search, X } from 'lucide-react'
import { SALE_PRODUCTS, SALE_WAREHOUSES } from '@/features/sales/salesMockData'
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

const selCls = 'h-9 w-[150px] rounded-md border-[#E5E5E5] bg-white text-[14px] dark:border-white/10 dark:bg-card dark:text-white'

export default function AddProductModal({ open, onOpenChange, warehouse, onAdd }) {
  const [search, setSearch] = useState('')
  const [wh, setWh] = useState(warehouse || '__all')
  const [picked, setPicked] = useState([])

  useEffect(() => {
    if (open) {
      setPicked([])
      setSearch('')
      setWh(warehouse || '__all')
    }
  }, [open, warehouse])

  const rows = useMemo(
    () =>
      SALE_PRODUCTS.filter((p) => {
        if (wh !== '__all' && p.warehouse !== wh) return false
        if (search && !`${p.name} ${p.partiya}`.toLowerCase().includes(search.toLowerCase())) return false
        return true
      }),
    [search, wh]
  )

  const pickedProducts = SALE_PRODUCTS.filter((p) => picked.includes(p.id))
  const pickedM2 = pickedProducts.reduce((s, p) => s + p.stockM2, 0)
  const toggle = (id) => setPicked((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="p-5 sm:max-w-[900px]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-[17px] font-semibold leading-[24px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            Tovar qo'shish
          </DialogTitle>
          <button type="button" onClick={() => onOpenChange(false)} className="text-[#737373] transition-colors hover:text-[#0A0A0A] dark:hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </DialogHeader>

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
          <Select value="__all">
            <SelectTrigger className={selCls}><SelectValue>{() => 'Sifat: barchasi'}</SelectValue></SelectTrigger>
            <SelectContent><SelectItem value="__all">Sifat: barchasi</SelectItem></SelectContent>
          </Select>
          <Select value="__all">
            <SelectTrigger className={selCls}><SelectValue>{() => 'Rang: barchasi'}</SelectValue></SelectTrigger>
            <SelectContent><SelectItem value="__all">Rang: barchasi</SelectItem></SelectContent>
          </Select>
          <Select value={wh} onValueChange={setWh}>
            <SelectTrigger className="h-9 w-[130px] rounded-md border-[#E5E5E5] bg-white text-[14px] dark:border-white/10 dark:bg-card dark:text-white">
              <SelectValue>{(v) => (v === '__all' ? 'Barcha ombor' : v)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">Barcha ombor</SelectItem>
              {SALE_WAREHOUSES.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
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
              {rows.map((p) => {
                const on = picked.includes(p.id)
                return (
                  <tr
                    key={p.id}
                    className={cn(
                      'h-11 cursor-pointer border-b border-[#E5E5E5] last:border-0 dark:border-white/5',
                      on ? 'bg-[#EFF5FF] dark:bg-[#0052D2]/10' : 'hover:bg-[#F9FAFB] dark:hover:bg-white/5'
                    )}
                    onClick={() => toggle(p.id)}
                  >
                    <td className="px-3" onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={on} onCheckedChange={() => toggle(p.id)} />
                    </td>
                    <td className="px-3 text-[13px] font-medium text-[#0A0A0A] dark:text-white">{p.name}</td>
                    <td className="px-3 text-[13px] font-medium text-[#0052D2] dark:text-[#60A5FA]">{p.partiya}</td>
                    <td className="px-3 text-[13px] text-[#737373] dark:text-muted-foreground">{p.warehouse}</td>
                    <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{formatNumber(p.stockM2)}</td>
                    <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{formatNumber(p.widthM)}</td>
                    <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{formatNumber(p.priceUsd)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <DialogFooter className="mx-0 mb-0 mt-2 items-center gap-2 border-0 bg-transparent p-0 sm:justify-between">
          <span className="text-[13px] text-[#737373]">
            {picked.length} ta tanlandi · {formatNumber(pickedM2)} m²
          </span>
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
                onAdd(pickedProducts)
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
