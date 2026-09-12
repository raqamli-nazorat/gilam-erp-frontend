import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { CheckCircle2, FileBarChart2, X } from 'lucide-react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Edit02Icon } from '@hugeicons/core-free-icons/index'
import { closeBranch, openBranch, updateBranch } from '@/features/filiallar/filiallarSlice'
import { Button } from '@/components/ui/button'
import Toast from '@/components/Toast'
import BranchModal from './BranchModal'
import CloseBranchModal from './CloseBranchModal'
import ReopenBranchModal from './ReopenBranchModal'

export default function FilialFooter({ branch }) {
  const dispatch = useDispatch()
  const [editOpen, setEditOpen] = useState(false)
  const [closeOpen, setCloseOpen] = useState(false)
  const [reopenOpen, setReopenOpen] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(''), 3000)
    return () => clearTimeout(t)
  }, [toast])

  const closed = branch.status === 'closed'

  return (
    <>
      <div className="flex shrink-0 items-center justify-between gap-3 bg-[#F5F5F5] px-3 py-3 dark:bg-white/5">
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
            className="h-9 gap-2 rounded-lg border border-[#E5E5E5] bg-[#EFF1F7] px-4 text-sm font-medium text-[#0A0A0A] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] hover:bg-[#E3E7F0] disabled:opacity-50 dark:border-white/10 dark:bg-card dark:text-white dark:hover:bg-white/10"
          >
            <HugeiconsIcon icon={Edit02Icon} size={16} strokeWidth={2} /> Tahrirlash
          </Button>
          {closed ? (
            <Button
              onClick={() => setReopenOpen(true)}
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
          dispatch(updateBranch({ id: branch.id, draft: values }))
            .unwrap()
            .then(() => setToast('O‘zgarishlar saqlandi'))
            .catch((err) => setToast(err || 'Saqlashda xatolik yuz berdi'))
        }}
      />
      <CloseBranchModal
        open={closeOpen}
        onOpenChange={setCloseOpen}
        branch={branch}
        onConfirm={(reason) => {
          dispatch(closeBranch({ id: branch.id, reason }))
            .unwrap()
            .then(() => setToast('Filial yopildi'))
            .catch((err) => setToast(err || 'Yopishda xatolik yuz berdi'))
        }}
      />
      <ReopenBranchModal
        open={reopenOpen}
        onOpenChange={setReopenOpen}
        branch={branch}
        onConfirm={() => {
          dispatch(openBranch(branch.id))
            .unwrap()
            .then(() => setToast('Filial qayta ochildi'))
            .catch((err) => setToast(err || 'Ochishda xatolik yuz berdi'))
        }}
      />
      <Toast message={toast} />
    </>
  )
}
