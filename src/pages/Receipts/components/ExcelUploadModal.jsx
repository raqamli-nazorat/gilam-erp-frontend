import { useState } from 'react'
import { Check, Download, X } from 'lucide-react'
import { Add01Icon } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
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
import { WAREHOUSES } from '@/features/receipts/mockData'

export default function ExcelUploadModal({ open, onOpenChange, warehouse, onUploaded }) {
  const [picked, setPicked] = useState(false)
  const [usePricesFromExcel, setUsePricesFromExcel] = useState(true)

  function handlePick() {
    setPicked(true)
  }

  function handleUpload() {
    onUploaded({ fileName: 'Tovarlar kirimi shabloni.xlsx', rowCount: 84, totalM2: 3320 })
    setPicked(false)
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { onOpenChange(next); if (!next) setPicked(false) }}>
      <DialogContent className="p-5 sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-[17px] font-semibold leading-[24px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            Exceldan yuklash
          </DialogTitle>
        </DialogHeader>

        <button
          type="button"
          onClick={handlePick}
          className="flex h-[228px] w-full flex-col items-center justify-center gap-3 rounded-[10px] border border-dashed border-[#D4D4D4] bg-[#F7F7F8] transition-colors hover:border-[#0052D2] dark:border-white/20 dark:bg-card"
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

        {picked && (
          <div className="flex items-center gap-2 rounded-lg bg-[#EAF1FE] px-3.5 py-2.5 text-[13px] font-medium leading-[18px] text-[#0052D2] dark:bg-[#0052D2]/20 dark:text-[#60A5FA]">
            <Check className="h-4 w-4 shrink-0 text-[#0052D2] dark:text-[#60A5FA]" />
            Tovarlar kirimi shabloni.xlsx · 84 qator · 3 320,00 m² tanildi
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="mb-1.5 text-[12px] font-normal leading-[16px] text-[#737373]">Ombor</p>
            <Select defaultValue={warehouse}>
              <SelectTrigger className="h-9 w-full rounded-md border-[#E5E5E5] bg-white px-3 text-[14px] font-normal text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-card dark:text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WAREHOUSES.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
              </SelectContent>
            </Select>
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
            onClick={() => onOpenChange(false)}
            className="h-9 gap-1.5 border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
          >
            <X className="h-4 w-4" /> Bekor qilish
          </Button>
          <Button
            type="button"
            disabled={!picked}
            onClick={handleUpload}
            className="h-9 gap-1.5 bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8] disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> Yuklash
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
