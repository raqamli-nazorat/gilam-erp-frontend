import { useEffect, useState } from 'react'
import {
  COLORS,
  DESIGNS,
  MATERIALS,
  QUALITIES,
  SHAPES,
} from '@/features/receipts/mockData'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NumberInput } from '@/components/ui/number-input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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

const EMPTY_ROW = {
  quality: QUALITIES[0],
  design: DESIGNS[0],
  color: COLORS[0],
  material: MATERIALS[0],
  shape: SHAPES[0].value,
  partiya: '',
  widthM: 4,
  heightM: 30,
  priceIn: 0,
  markupPct: 20,
  priceSale: 0,
  currency: 'USD',
}

export default function RowEditModal({ open, onOpenChange, row, onSave }) {
  const [form, setForm] = useState(EMPTY_ROW)
  const [unitCount, setUnitCount] = useState(false)

  useEffect(() => {
    if (open) setForm(row ? { ...EMPTY_ROW, ...row } : EMPTY_ROW)
  }, [open, row])

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function setMarkup(value) {
    const m = Number(value) || 0
    const p = Number(form.priceIn) || 0
    setForm((f) => ({ ...f, markupPct: value, priceSale: (p * (1 + m / 100)).toFixed(2) }))
  }

  function setPriceSale(value) {
    const s = Number(value) || 0
    const p = Number(form.priceIn) || 0
    setForm((f) => ({ ...f, priceSale: value, markupPct: p > 0 ? ((s / p - 1) * 100).toFixed(1) : '0' }))
  }

  const m2 = Number((Number(form.widthM || 0) * Number(form.heightM || 0)).toFixed(2))

  function handleSave() {
    onSave({
      ...form,
      widthM: Number(form.widthM),
      heightM: Number(form.heightM),
      priceIn: Number(form.priceIn),
      markupPct: Number(form.markupPct),
      priceSale: Number(form.priceSale),
      m2,
      ready: true,
    })
    onOpenChange(false)
  }

  const title = row ? `Qator tahriri · ${row.quality} ${row.design}` : 'Yangi rulon qo‘shish'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-5 sm:max-w-[620px]">
        <DialogHeader>
          <DialogTitle className="text-[17px] font-semibold leading-[24px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-5">
          <div>
            <p className="mb-2.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Tovar tavsifi
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1.5">Sifat</Label>
                <Select value={form.quality} onValueChange={(v) => set('quality', v)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {QUALITIES.map((q) => <SelectItem key={q} value={q}>{q}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5">Dizayn</Label>
                <Select value={form.design} onValueChange={(v) => set('design', v)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DESIGNS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5">Rang</Label>
                <Select value={form.color} onValueChange={(v) => set('color', v)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COLORS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5">Material</Label>
                <Select value={form.material} onValueChange={(v) => set('material', v)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MATERIALS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5">Shakli</Label>
                <Select value={form.shape} onValueChange={(v) => set('shape', v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue>{(v) => SHAPES.find((s) => s.value === v)?.label ?? v}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {SHAPES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5">Partiya</Label>
                <Input value={form.partiya} onChange={(e) => set('partiya', e.target.value)} placeholder="Avtomatik beriladi" />
              </div>
            </div>
          </div>

          <div>
            <p className="mb-2.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              O'lcham
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1.5">Eni, m</Label>
                <NumberInput pad={2} value={form.widthM} onChange={(e) => set('widthM', e.target.value)} />
              </div>
              <div>
                <Label className="mb-1.5">Bo'yi, m</Label>
                <NumberInput pad={2} value={form.heightM} onChange={(e) => set('heightM', e.target.value)} />
              </div>
              <div>
                <Label className="mb-1.5">m² (hisoblanadi)</Label>
                <Input value={formatM2(m2)} disabled />
              </div>
              <div>
                <Label className="mb-1.5">Hisob turi</Label>
                <div className="flex h-9 items-center justify-between rounded-md border border-input px-3">
                  <span className="text-sm">Donali hisob</span>
                  <Switch checked={unitCount} onCheckedChange={setUnitCount} />
                </div>
              </div>
            </div>
            <p className="mt-2.5 rounded-lg bg-primary/5 px-3 py-2 text-sm text-primary">
              m² = Eni × Bo'yi · {formatM2(form.widthM)} × {formatM2(form.heightM)} = {formatM2(m2)} m²
            </p>
          </div>

          <div>
            <p className="mb-2.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Narx
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1.5">Kirim narxi, USD</Label>
                <NumberInput
                  pad={2}
                  value={form.priceIn}
                  onChange={(e) => {
                    const priceIn = e.target.value
                    const p = Number(priceIn) || 0
                    const m = Number(form.markupPct) || 0
                    setForm((f) => ({ ...f, priceIn, priceSale: (p * (1 + m / 100)).toFixed(2) }))
                  }}
                />
              </div>
              <div>
                <Label className="mb-1.5">Ustama, %</Label>
                <NumberInput value={form.markupPct} onChange={(e) => setMarkup(e.target.value)} />
              </div>
              <div>
                <Label className="mb-1.5">Sotuv narxi, USD</Label>
                <NumberInput pad={2} value={form.priceSale} onChange={(e) => setPriceSale(e.target.value)} />
              </div>
              <div>
                <Label className="mb-1.5">Valyuta</Label>
                <Select value={form.currency} onValueChange={(v) => set('currency', v)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="UZS">UZS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-2 gap-2 border-t border-[#E5E5E5] pt-4 dark:border-white/10">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9 gap-1.5 border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
          >
            <X className="h-4 w-4" /> Bekor qilish
          </Button>
          <Button
            onClick={handleSave}
            className="h-9 gap-1.5 bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
          >
            <Check className="h-4 w-4" /> Saqlash
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function formatM2(value) {
  const num = Number(value || 0)
  return num.toLocaleString('uz-UZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
