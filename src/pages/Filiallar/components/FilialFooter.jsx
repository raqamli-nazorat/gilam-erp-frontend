import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CheckCircle2, FileBarChart2, Pencil, X } from 'lucide-react'
import { branchClosed, branchOpened, branchUpdated } from '@/features/filiallar/filiallarSlice'
import { Button } from '@/components/ui/button'
import Toast from '@/components/Toast'
import BranchModal from './BranchModal'
import CloseBranchModal from './CloseBranchModal'

export default function FilialFooter({ branch }) {
  const dispatch = useDispatch()
  const currentUser = useSelector((s) => s.auth.user)
  const [editOpen, setEditOpen] = useState(false)
  const [closeOpen, setCloseOpen] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(''), 3000)
    return () => clearTimeout(t)
  }, [toast])

  const closed = branch.status === 'closed'

  return (
    <>
      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-[#E5E5E5] bg-[#F5F5F5] px-3 py-3 dark:border-white/10 dark:bg-white/5">
        <Button
          onClick={() => setToast('Hisobot tayyorlanmoqda…')}
          className="h-9 gap-2 bg-[#0052D2] px-4 text-sm font-medium rounded-xl text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
        >
          <FileBarChart2 className="h-4 w-4" /> Xisobot
        </Button>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            disabled={closed}
            onClick={() => setEditOpen(true)}
            className="h-9 gap-2 border-[#E5E5E5] rounded-xl bg-white px-4 text-sm font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] disabled:opacity-50 dark:border-white/10 dark:bg-card dark:text-white"
          >
            <Pencil className="h-4 w-4" /> Tahrirlash
          </Button>
          {closed ? (
            <Button
              onClick={() => {
                dispatch(branchOpened(branch.id))
                setToast('Filial qayta ochildi')
              }}
              className="h-9 gap-2 bg-[#0052D2] px-4 text-sm rounded-xl font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
            >
              <CheckCircle2 className="h-4 w-4" /> Qayta ochish
            </Button>
          ) : (
            <Button
              onClick={() => setCloseOpen(true)}
              className="h-9 gap-2 bg-[#DC2626] px-4 text-sm rounded-xl font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#B91C1C]"
            >
              <X className="h-4 w-4" /> Yopish
            </Button>
          )}
        </div>
      </div>

      <BranchModal
        open={editOpen}
        onOpenChange={setEditOpen}
        branch={branch}
        onSave={(values) => {
          dispatch(branchUpdated({ id: branch.id, patch: values }))
          setToast('O‘zgarishlar saqlandi')
        }}
      />
      <CloseBranchModal
        open={closeOpen}
        onOpenChange={setCloseOpen}
        branch={branch}
        onConfirm={(reason) => {
          dispatch(branchClosed({ id: branch.id, reason, by: currentUser?.fullName ?? 'Administrator' }))
          setToast('Filial yopildi')
        }}
      />
      <Toast message={toast} />
    </>
  )
}
