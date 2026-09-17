import { useEffect, useRef, useState } from 'react'
import { FileText, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const ACCEPT = '.pdf,.xls,.xlsx'

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

// Fayl faqat UI darajasida ushlab qolinadi — RecruitmentDismissal endpoint'ida hujjat
// biriktirish maydoni yo'q (backendda bu hali qo'llanmagan), shuning uchun onConfirm'ga
// uzatiladi-yu, hech qayerga yuborilmaydi.
export default function TerminateEmployeeModal({ open, onOpenChange, employee, onConfirm }) {
  const [reason, setReason] = useState('')
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setReason('')
      setFile(null)
      setDragOver(false)
    }
  }, [open])

  if (!employee) return null

  function pickFile(list) {
    const f = list?.[0]
    if (f) setFile(f)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-5 sm:max-w-[520px]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-[17px] font-semibold leading-6 tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            Xodimni ishdan chiqarish?
          </DialogTitle>
        </DialogHeader>

        <div className="rounded-lg bg-[#F5F5F5] px-4 py-3 text-[13px] dark:bg-white/5">
          {[
            ['Xodim', employee.name],
            ['Lavozimi', employee.lavozim],
            ['Tashkiloti', employee.tashkilot],
            ['Filiali', employee.filial],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between py-1">
              <span className="text-[#737373] dark:text-muted-foreground">{k}</span>
              <span className="font-medium text-[#0A0A0A] dark:text-white">{v}</span>
            </div>
          ))}
        </div>

        <div>
          <Label className="mb-1.5 block text-[13px] font-normal text-[#525252] dark:text-muted-foreground">
            Ishdan chiqarish sababi
          </Label>
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Masalan: xodim ishdan bo‘shadi"
            className="h-10 w-full rounded-md border-[#E5E5E5] bg-white px-3 text-[14px] text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] placeholder:text-[#737373] dark:border-white/10 dark:bg-card dark:text-white"
          />
          <p className="mt-1.5 text-[12px] text-[#737373] dark:text-muted-foreground">Majburiy. Sabab audit jurnaliga yoziladi.</p>
        </div>

        <div>
          <Label className="mb-1.5 block text-[13px] font-normal text-[#525252] dark:text-muted-foreground">
            Asos hujjat
          </Label>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={(e) => {
              pickFile(e.target.files)
              e.target.value = ''
            }}
          />
          {file ? (
            <div className="flex items-center gap-3 rounded-md border border-[#E5E5E5] bg-white px-3.5 py-2.5 dark:border-white/10 dark:bg-card">
              <FileText className="h-5 w-5 shrink-0 text-[#DC2626]" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-[#0A0A0A] dark:text-white">{file.name}</p>
                <p className="text-[12px] text-[#737373] dark:text-muted-foreground">
                  {(file.name.split('.').pop() || '').toUpperCase()}, {formatFileSize(file.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                aria-label="Faylni olib tashlash"
                className="shrink-0 text-[#737373] transition-colors hover:text-[#DC2626]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
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
                pickFile(e.dataTransfer.files)
              }}
              className={`flex w-full items-center gap-3 rounded-md border border-dashed px-3.5 py-3 text-left transition-colors dark:bg-card ${
                dragOver ? 'border-[#0052D2] bg-[#EAF1FE] dark:bg-[#0052D2]/10' : 'border-[#D4D4D4] bg-[#F7F7F8] dark:border-white/20'
              }`}
            >
              <Upload className="h-5 w-5 shrink-0 text-[#737373]" />
              <div>
                <p className="text-[13px] font-medium text-[#525252] dark:text-muted-foreground">Faylni tanlang yoki shu yerga tashlang</p>
                <p className="text-[12px] text-[#737373] dark:text-muted-foreground">PDF yoki Excel (XLS, XLSX), 10 MB gacha</p>
              </div>
            </button>
          )}
        </div>

        <DialogFooter className="mx-0 mb-0 mt-1 gap-2 border-0 bg-transparent p-0">
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
            disabled={!reason.trim()}
            onClick={() => {
              onConfirm(reason.trim(), file)
              onOpenChange(false)
            }}
            className="h-9 gap-1.5 bg-[#DC2626] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#B91C1C] disabled:bg-[#F5F5F5] disabled:text-[#A3A3A3] disabled:opacity-100 dark:disabled:bg-white/10"
          >
            <X className="h-4 w-4" /> Ishdan chiqarish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
