import { useEffect, useState } from 'react'
import { MATERIALS, SHAPES } from '@/features/receipts/mockData'
import { PagedSelect } from '@/components/ui/paged-select'
import { colorOptions, currencyOptions, designOptions, qualityOptions } from '@/services/optionSources'
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

// Sifat, dizayn, rang va valyuta — backend ma'lumotnomalaridan; id + nom birga saqlanadi
// (nom jadval/yorliqda ko'rsatish uchun, id — partiya yaratishda API'ga yuborish uchun).
// Material va shakl uchun backendda ma'lumotnoma yo'q — ular mahalliy ro'yxatdan.
const EMPTY_ROW = {
  quality: '',
  qualityId: '',
  design: '',
  designId: '',
  color: '',
  colorId: '',
  material: MATERIALS[0],
  shape: SHAPES[0].value,
  partiya: '',
  widthM: 4,
  heightM: 30,
  priceIn: 0,
  markupPct: 20,
  priceSale: 0,
  currency: 'USD',
  currencyId: '',
}

// Mock/Excel qatorlarida nom bor, id yo'q bo'lishi mumkin — nomni ko'rsatib turish uchun.
function pickedValue(id, name) {
  return id || (name ? '__legacy' : '')
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
  const missing = !form.qualityId ? 'Sifat' : !form.colorId ? 'Rang' : !(m2 > 0) ? "O'lcham" : null

  function handleSave() {
    if (missing) return
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

  const title = row ? `Qator tahriri · ${row.quality} ${row.design}`.trim() : 'Yangi rulon qo‘shish'

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
                <PagedSelect
                  value={pickedValue(form.qualityId, form.quality)}
                  selectedLabel={form.quality}
                  fetchPage={qualityOptions}
                  placeholder="Sifat tanlang"
                  className="h-9"
                  onChange={(id, item) =>
                    setForm((f) => ({
                      ...f,
                      qualityId: id,
                      quality: item?.name ?? '',
                      // Dizayn sifatga bog'liq — sifat o'zgarsa dizayn tozalanadi
                      ...(id !== f.qualityId ? { designId: '', design: '' } : {}),
                    }))
                  }
                />
              </div>
              <div>
                <Label className="mb-1.5">Dizayn</Label>
                <PagedSelect
                  value={pickedValue(form.designId, form.design)}
                  selectedLabel={form.design}
                  fetchPage={designOptions}
                  params={form.qualityId ? { quality: form.qualityId } : undefined}
                  placeholder="Dizayn tanlang"
                  allowAll
                  allLabel="Tanlanmagan"
                  className="h-9"
                  onChange={(id, item) =>
                    setForm((f) => ({
                      ...f,
                      designId: id,
                      design: id ? item?.name ?? '' : '',
                      // Dizayn sifatga bog'liq — sifat tanlanmagan bo'lsa dizaynnikidan olinadi
                      ...(!f.qualityId && item?.sifatId ? { qualityId: item.sifatId, quality: item.sifat } : {}),
                    }))
                  }
                />
              </div>
              <div>
                <Label className="mb-1.5">Rang</Label>
                <PagedSelect
                  value={pickedValue(form.colorId, form.color)}
                  selectedLabel={form.color}
                  fetchPage={colorOptions}
                  placeholder="Rang tanlang"
                  className="h-9"
                  onChange={(id, item) => setForm((f) => ({ ...f, colorId: id, color: item?.name ?? '' }))}
                />
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
                <PagedSelect
                  value={pickedValue(form.currencyId, form.currency)}
                  selectedLabel={form.currency}
                  fetchPage={currencyOptions}
                  placeholder="Valyuta"
                  className="h-9"
                  onChange={(id, item) => setForm((f) => ({ ...f, currencyId: id, currency: item?.name ?? '' }))}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-2 gap-2 border-t border-[#E5E5E5] pt-4 dark:border-white/10">
          {missing && (
            <p className="mr-auto self-center text-[12px] text-[#B45309]">{missing} kiritilishi shart</p>
          )}
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9 gap-1.5 border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
          >
            <X className="h-4 w-4" /> Bekor qilish
          </Button>
          <Button
            onClick={handleSave}
            disabled={!!missing}
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
