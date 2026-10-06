import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, Check, Download, FileSpreadsheet, Loader2, X } from 'lucide-react'
import { Add01Icon } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { PagedSelect } from '@/components/ui/paged-select'
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
import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import { warehouseOptions } from '@/services/optionSources'
import { extractErrorMessage } from '@/services/apiHelpers'
import { latestPricesByQuality, loadCatalogLookup, resolveRowIds } from '@/services/receiptService'
import { downloadReceiptTemplate, MAX_FILE_SIZE, parseReceiptExcel } from '../utils/receiptExcel'

// Excel faylni brauzerda o'qiydi, sifat/rang/dizayn nomlarini backend ID'lariga moslaydi.
// Natija: onUploaded({ rows, meta, warehouse }).
export default function ExcelUploadModal({ open, onOpenChange, receipt, onUploaded }) {
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [parsed, setParsed] = useState(null)
  const [parseError, setParseError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [warehouse, setWarehouse] = useState(null)
  const [usePricesFromExcel, setUsePricesFromExcel] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const warehouseId = receipt?.warehouseId
  const warehouseName = receipt?.warehouse
  const branchId = receipt?.branchId

  useEffect(() => {
    if (!open) return
    setFile(null)
    setParsed(null)
    setParseError('')
    setSubmitError('')
    setWarehouse(warehouseId ? { id: warehouseId, name: warehouseName, branchId } : null)
  }, [open, warehouseId, warehouseName, branchId])

  async function handleFile(picked) {
    if (!picked) return
    setFile(picked)
    setParsed(null)
    setParseError('')
    if (!/\.(xlsx|xls)$/i.test(picked.name)) {
      setParseError('Faqat XLSX yoki XLS fayl qabul qilinadi')
      return
    }
    if (picked.size > MAX_FILE_SIZE) {
      setParseError('Fayl hajmi 10 MB dan oshmasligi kerak')
      return
    }
    try {
      setParsed(await parseReceiptExcel(picked))
    } catch (error) {
      setParseError(error?.message || "Faylni o'qib bo'lmadi")
    }
  }

  async function handleUpload() {
    if (!parsed) return
    setSubmitting(true)
    setSubmitError('')
    try {
      const lookup = await loadCatalogLookup()
      let rows = parsed.map((r) => resolveRowIds(r, lookup))
      if (!usePricesFromExcel) {
        const prices = await latestPricesByQuality(rows.map((r) => r.qualityId))
        rows = rows.map((r) => {
          const p = prices.get(r.qualityId)
          if (!p) return r
          const markupPct = p.priceIn > 0 ? Number(((p.priceSale / p.priceIn - 1) * 100).toFixed(1)) : 0
          return { ...r, priceIn: p.priceIn, priceSale: p.priceSale, markupPct }
        })
      }
      onUploaded({
        rows,
        warehouse,
        meta: { fileName: file.name, rows: rows.length, m2: totalM2(rows) },
      })
    } catch (error) {
      setSubmitError(extractErrorMessage(error, "Ma'lumotnomalarni yuklab bo'lmadi"))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !submitting && onOpenChange(next)}>
      <DialogContent className="p-5 sm:max-w-[520px]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-[17px] font-semibold leading-[24px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            Exceldan yuklash
          </DialogTitle>
          <button
            type="button"
            onClick={downloadReceiptTemplate}
            className="mr-6 flex items-center gap-1.5 text-[13px] font-medium text-[#0052D2] hover:underline dark:text-[#60A5FA]"
          >
            <FileSpreadsheet className="h-4 w-4" /> Shablon
          </button>
        </DialogHeader>

        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            handleFile(e.target.files?.[0])
            e.target.value = ''
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            handleFile(e.dataTransfer.files?.[0])
          }}
          className={cn(
            'flex h-[228px] w-full flex-col items-center justify-center gap-3 rounded-[10px] border border-dashed border-[#D4D4D4] bg-[#F7F7F8] transition-colors hover:border-[#0052D2] dark:border-white/20 dark:bg-card',
            dragOver && 'border-[#0052D2] bg-[#EAF1FE]'
          )}
        >
          <Download className="h-6 w-6 text-[#737373]" />
          <div className="flex flex-col items-center gap-0.5 text-center">
            <span className="text-[14px] font-medium leading-[20px] text-[#525252] dark:text-muted-foreground">
              Faylni shu yerga tashlang yoki tanlang
            </span>
            <span className="text-[12px] font-normal leading-[16px] text-[#737373] dark:text-muted-foreground">
              XLSX yoki XLS · maksimal 10 MB
            </span>
          </div>
          <span className="inline-flex h-9 shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#F9FAFB] dark:border-white/10 dark:bg-card dark:text-white">
            <Add01Icon className="h-4 w-4 shrink-0 text-[#0A0A0A] dark:text-white" /> Fayl tanlash
          </span>
        </button>

        {parsed && (
          <div className="flex items-center gap-2 rounded-lg bg-[#EAF1FE] px-3.5 py-2.5 text-[13px] font-medium leading-[18px] text-[#0052D2] dark:bg-[#0052D2]/20 dark:text-[#60A5FA]">
            <Check className="h-4 w-4 shrink-0" />
            {file.name} · {parsed.length} qator · {formatNumber(totalM2(parsed))} m² tanildi
          </div>
        )}
        {(parseError || submitError) && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700 dark:bg-red-950/40 dark:text-red-400">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="whitespace-pre-line">{parseError || submitError}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="mb-1.5 text-[12px] font-normal leading-[16px] text-[#737373]">Ombor</p>
            <PagedSelect
              value={warehouse?.id ?? ''}
              selectedLabel={warehouse?.name}
              fetchPage={warehouseOptions}
              placeholder="Ombor tanlang"
              className="h-9"
              onChange={(id, item) => setWarehouse(item)}
            />
          </div>
          <div>
            <p className="mb-1.5 text-[12px] font-normal leading-[16px] text-[#737373]">Kirim holati</p>
            <Select defaultValue="in">
              <SelectTrigger className="h-9 w-full rounded-md border-[#E5E5E5] bg-white px-3 text-[14px] font-normal text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-card dark:text-white">
                <SelectValue>{() => 'Yuk omborga kirdi'}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in">Yuk omborga kirdi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Switch checked={usePricesFromExcel} onCheckedChange={setUsePricesFromExcel} />
          <div>
            <p className="text-[14px] font-medium text-[#0A0A0A] dark:text-white">Narxlarni Exceldan olish</p>
            <p className="text-[12px] text-[#737373] dark:text-muted-foreground">
              O'chirilsa, narxlar sifat bo'yicha amaldagi narxdan olinadi
            </p>
          </div>
        </div>

        <DialogFooter className="mx-0 mb-0 mt-3 gap-2 border-0 border-t-0 bg-transparent p-0">
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={() => onOpenChange(false)}
            className="h-9 gap-1.5 border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
          >
            <X className="h-4 w-4" /> Bekor qilish
          </Button>
          <Button
            type="button"
            disabled={!parsed || submitting}
            onClick={handleUpload}
            className="h-9 gap-1.5 bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8] disabled:opacity-50"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Yuklash
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function totalM2(rows) {
  return Number(rows.reduce((sum, r) => sum + (r.m2 || 0), 0).toFixed(2))
}
