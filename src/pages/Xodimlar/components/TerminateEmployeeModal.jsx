import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
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

// Figma dev-mode SVG'lar — fon rangi (#E6EEFB/#FDECEC) SVG'ning o'z <rect>'iga pishirilgan,
// shuning uchun tashqi "chip" konteyner kerak emas, shu ikonkalarning o'zi 36×36 chiqadi.
function UploadFileIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <rect width="36" height="36" rx="8" fill="#E6EEFB" />
      <path
        d="M11.3333 17.9993L11.3333 20.1195C11.3333 22.8237 11.3333 24.1758 12.0717 25.0916C12.2209 25.2766 12.3894 25.4451 12.5744 25.5943C13.4902 26.3327 14.8423 26.3327 17.5465 26.3327C18.1345 26.3327 18.4284 26.3327 18.6976 26.2377C18.7536 26.2179 18.8085 26.1952 18.8621 26.1696C19.1196 26.0464 19.3275 25.8385 19.7432 25.4228L23.6903 21.4757C24.1721 20.9939 24.4129 20.7531 24.5398 20.4468C24.6666 20.1405 24.6666 19.7999 24.6666 19.1186V16.3327C24.6666 13.19 24.6666 11.6186 23.6903 10.6423C22.714 9.66602 21.1427 9.66602 18 9.66602M18.8333 25.916V25.4993C18.8333 23.1423 18.8333 21.9638 19.5655 21.2316C20.2978 20.4993 21.4763 20.4993 23.8333 20.4993H24.25"
        stroke="#0052D2"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.3333 12.166C15.8418 11.6603 14.5335 9.66602 13.8333 9.66602C13.1331 9.66602 11.8248 11.6603 11.3333 12.166M13.8333 10.4993L13.8333 16.3327"
        stroke="#0052D2"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PdfFileIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <rect width="36" height="36" rx="8" fill="#FDECEC" />
      <path
        d="M23.8333 17.166C23.8333 16.4848 23.8333 15.8582 23.7065 15.5519C23.5796 15.2456 23.3387 15.0048 22.857 14.523L18.9099 10.5759C18.4942 10.1602 18.2863 9.95231 18.0288 9.82914C17.9752 9.80352 17.9203 9.78078 17.8643 9.76102C17.5951 9.66602 17.3011 9.66602 16.7132 9.66602C14.009 9.66602 12.6569 9.66602 11.7411 10.4044C11.5561 10.5536 11.3876 10.7221 11.2384 10.9071C10.5 11.8229 10.5 13.175 10.5 15.8792V19.666C10.5 22.8087 10.5 24.3801 11.4763 25.3564C12.4526 26.3327 14.024 26.3327 17.1667 26.3327H23.8333M18 10.0827V10.4993C18 12.8564 18 14.0349 18.7322 14.7671C19.4645 15.4993 20.643 15.4993 23 15.4993H23.4167"
        stroke="#DC2626"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M25.5002 19.666H23.8335C23.3733 19.666 23.0002 20.0391 23.0002 20.4993V21.7493M23.0002 21.7493V23.8327M23.0002 21.7493H25.0835M13.8335 23.8327V22.166M13.8335 22.166V19.666H15.0835C15.7739 19.666 16.3335 20.2257 16.3335 20.916C16.3335 21.6064 15.7739 22.166 15.0835 22.166H13.8335ZM18.4168 19.666H19.4883C20.2772 19.666 20.9168 20.2878 20.9168 21.0549V22.4438C20.9168 23.2109 20.2772 23.8327 19.4883 23.8327H18.4168V19.666Z"
        stroke="#DC2626"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
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
              <PdfFileIcon />
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
              <UploadFileIcon />
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
