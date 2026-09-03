import { AlertTriangle, FileSpreadsheet, PenLine, ScanBarcode, Tag } from 'lucide-react'
import { COUNTERPARTIES } from '@/features/receipts/mockData'
import { formatDate, formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const METHODS = [
  {
    key: 'scan',
    icon: ScanBarcode,
    title: 'Skanerlash',
    badge: 'TEZ USUL',
    description: "Rulon shtrix-kodini o'qiting — rulon ro'yxatga o'zi tushadi.",
  },
  {
    key: 'excel',
    icon: FileSpreadsheet,
    title: 'Exceldan yuklash',
    description: "Yetkazib beruvchining fayli. 84 qatorgacha o'qiydi.",
  },
  {
    key: 'manual',
    icon: PenLine,
    title: "Qo'lda qo'shish",
    description: "Fayl ham, shtrix-kod ham bo'lmaganda — bittalab.",
  },
]

const RECENT_SUPPLIERS = COUNTERPARTIES.slice(0, 3)

export default function SupplierMethodStep({
  doc,
  supplier,
  onSupplierChange,
  method,
  onSelectMethod,
  onCancel,
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{doc.number}</span>
          <span>·</span>
          <span>{formatDate(doc.date)}</span>
          <span>·</span>
          <span>{doc.warehouse} ombori</span>
          <span>·</span>
          <span>Qabul qiluvchi: {doc.agentName}</span>
        </div>

        <section className="rounded-xl border p-5">
          <p className="mb-0.5 flex items-center gap-2 font-semibold">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">1</span>
            Kim yetkazdi?
          </p>
          <p className="mb-4 pl-7 text-sm text-muted-foreground">
            Yetkazib beruvchi va uning hujjati — qarz shu yerdan hisoblanadi.
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <Label className="mb-1.5">Yetkazib beruvchi</Label>
              <Input
                placeholder="Nomi yoki INN bo'yicha qidiring"
                value={supplier.name}
                onChange={(e) => onSupplierChange({ ...supplier, name: e.target.value })}
              />
            </div>
            <div>
              <Label className="mb-1.5">Yetkazib beruvchi hujjati</Label>
              <Input
                placeholder="№"
                value={supplier.doc}
                onChange={(e) => onSupplierChange({ ...supplier, doc: e.target.value })}
              />
            </div>
            <div>
              <Label className="mb-1.5">Yetkazilgan sana</Label>
              <Input
                type="date"
                value={supplier.date}
                onChange={(e) => onSupplierChange({ ...supplier, date: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Oxirgi marta:</span>
            {RECENT_SUPPLIERS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSupplierChange({ ...supplier, name: s })}
                className="rounded-full border px-3 py-1 text-xs font-medium hover:bg-muted"
              >
                {s}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-xl border p-5">
          <p className="mb-0.5 flex items-center gap-2 font-semibold">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">2</span>
            Nima keldi?
          </p>
          <p className="mb-4 pl-7 text-sm text-muted-foreground">
            Har bir rulon — alohida partiya va alohida yorliq. Usulni tanlang.
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {METHODS.map(({ key, icon: Icon, title, badge, description }) => (
              <button
                key={key}
                type="button"
                onClick={() => onSelectMethod(key)}
                className={cn(
                  'flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-colors',
                  method === key ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', method === key ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground')}>
                    <Icon className="h-[18px] w-[18px]" />
                  </div>
                  {badge && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      {badge}
                    </span>
                  )}
                </div>
                <p className="font-semibold">{title}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </button>
            ))}
          </div>

          <div className="mt-4 flex gap-2.5 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Narx va ustama har bir rulonda alohida turadi, sotuv narxi avtomatik hisoblanadi.
            Valyuta kursi qabul tasdiqlanganda hujjatga muhrlanadi.
          </div>
        </section>

        <div className="flex items-center justify-between rounded-xl border bg-muted/30 px-4 py-3">
          <p className="text-xs text-muted-foreground">
            Qoralama avtomatik saqlanadi — hech narsa yo'qolmaydi.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>Bekor qilish</Button>
            <Button disabled>Qabulni tasdiqlash</Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="rounded-xl border p-4">
          <p className="mb-3 font-semibold">Qabul xulosasi</p>
          <p className="mb-4 text-xs text-muted-foreground">
            Rulon qo'shilgan sari yangilanadi
          </p>
          <div className="space-y-3 text-sm">
            <SummaryRow label="Rulonlar" value="0 ta" />
            <SummaryRow label="Jami maydon" value="— m²" />
            <SummaryRow label="Kirim summasi" value="— USD" />
            <SummaryRow label="Yetkazib beruvchiga qarz" value="— USD" />
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Kurs {formatNumber(doc.exchangeRate)} UZS/USD — hujjat tasdiqlanganda muhrlanadi.
          </p>
        </div>

        <div className="rounded-xl border p-4">
          <p className="mb-3 flex items-center gap-2 font-semibold">
            <Tag className="h-4 w-4" /> Yorliqlar
          </p>
          <p className="mb-4 text-xs text-muted-foreground">Har bir rulonga yopishtiriladi</p>
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Tag className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">Hali rulon yo'q</p>
            <p className="text-xs text-muted-foreground">
              Rulon qo'shilishi bilan uning yorlig'i shu yerda tayyorlanadi va chop etishga chiqadi.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
