import { Check, X } from 'lucide-react'
import TabelModal, { ModalButton } from './TabelModal'

// rows: [[label, value]] — kulrang ma'lumot bloki; yoki children — oddiy matn.
export default function TabelConfirmModal({
  open,
  onOpenChange,
  title,
  rows,
  children,
  cancelLabel = 'Yopish',
  confirmLabel = 'Tasdiqlash',
  confirmIcon: Icon = Check,
  danger,
  success,
  onConfirm,
}) {
  return (
    <TabelModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      footer={
        <>
          <ModalButton variant="outline" onClick={() => onOpenChange(false)}>
            <X className="size-4" /> {cancelLabel}
          </ModalButton>
          <ModalButton onClick={onConfirm} className={danger ? 'bg-[#DC2626] hover:bg-[#B91C1C]' : success ? 'bg-[#16A34A] hover:bg-[#15803D]' : undefined}>
            <Icon className="size-4" /> {confirmLabel}
          </ModalButton>
        </>
      }
    >
      {children ?? (
        <div className="mt-2 grid gap-3 rounded-lg bg-[#F5F5F5] px-5 py-4 text-[15px] dark:bg-white/5">
          {rows?.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4">
              <span className="text-[#525252] dark:text-muted-foreground">{label}</span>
              <span className="font-medium text-[#0A0A0A] dark:text-white">{value}</span>
            </div>
          ))}
        </div>
      )}
    </TabelModal>
  )
}
