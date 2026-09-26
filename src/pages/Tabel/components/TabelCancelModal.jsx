import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PdfFileIcon, UploadFileIcon } from '@/pages/Xodimlar/components/TerminateEmployeeModal'
import TabelModal, { ModalButton } from './TabelModal'

const ACCEPT = '.pdf,.xls,.xlsx'

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

// Figma: "Tabel bekor qilinsinmi?" — ma'lumot bloki, Sabab (majburiy) va Hujjat (ixtiyoriy, PDF/Excel).
// onConfirm({ reason, file })
export default function TabelCancelModal({ open, onOpenChange, title = 'Tabel bekor qilinsinmi?', rows, onConfirm }) {
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

  function pickFile(list) {
    const f = list?.[0]
    if (f && /\.(pdf|xlsx?)$/i.test(f.name)) setFile(f)
  }

  return (
    <TabelModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      footer={
        <>
          <ModalButton variant="outline" onClick={() => onOpenChange(false)}>
            <X className="size-4" /> Yopish
          </ModalButton>
          <ModalButton
            disabled={!reason.trim()}
            onClick={() => onConfirm({ reason: reason.trim(), file })}
            className="bg-[#DC2626] hover:bg-[#B91C1C]"
          >
            <X className="size-4" /> Bekor qilish
          </ModalButton>
        </>
      }
    >
      <div className="mt-2 flex flex-col gap-4">
        <div className="grid gap-3 rounded-lg bg-[#F5F5F5] px-5 py-4 text-[15px] dark:bg-white/5">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4">
              <span className="text-[#525252] dark:text-muted-foreground">{label}</span>
              <span className="font-medium text-[#0A0A0A] dark:text-white">{value}</span>
            </div>
          ))}
        </div>

        <div>
          <label className="mb-2 block text-[14px] font-medium leading-5 text-[#0A0A0A] dark:text-white">Sabab</label>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ma’lumotlar noto‘g‘ri kiritilgan"
            className="h-11 w-full rounded-[8px] border border-[#E5E5E5] bg-white px-4 text-[15px] text-[#0A0A0A] shadow-[0px_1px_2px_0px_#0000001A] outline-none transition-colors placeholder:text-[#737373] focus:border-[#0052D2] dark:border-white/10 dark:bg-card dark:text-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-[14px] font-medium leading-5 text-[#0A0A0A] dark:text-white">Hujjat</label>
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
            <div className="flex items-center gap-3 rounded-[8px] border border-[#E5E5E5] bg-white px-5 py-4 dark:border-white/10 dark:bg-card">
              <PdfFileIcon />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-medium text-[#0A0A0A] dark:text-white">{file.name}</p>
                <p className="text-[13px] text-[#737373] dark:text-muted-foreground">
                  {(file.name.split('.').pop() || '').toUpperCase()}, {formatFileSize(file.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                aria-label="Faylni olib tashlash"
                className="shrink-0 text-[#737373] transition-colors hover:text-[#DC2626]"
              >
                <X className="size-4" />
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
              className={cn(
                'flex w-full items-center gap-4 rounded-[8px] border border-dashed px-5 py-4 text-left transition-colors',
                dragOver
                  ? 'border-[#0052D2] bg-[#EAF1FE] dark:bg-[#0052D2]/10'
                  : 'border-[#D4D4D4] bg-[#FAFAFA] hover:bg-[#F5F5F5] dark:border-white/20 dark:bg-card'
              )}
            >
              <UploadFileIcon />
              <div>
                <p className="text-[15px] font-medium text-[#0A0A0A] dark:text-white">Faylni tanlang yoki shu yerga tashlang</p>
                <p className="text-[13px] text-[#737373] dark:text-muted-foreground">PDF yoki Excel (XLS, XLSX)</p>
              </div>
            </button>
          )}
        </div>
      </div>
    </TabelModal>
  )
}
