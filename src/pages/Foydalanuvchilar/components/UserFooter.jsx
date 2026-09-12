import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { CheckCircle2, X } from 'lucide-react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Edit02Icon } from '@hugeicons/core-free-icons/index'
import { updateUser } from '@/features/foydalanuvchilar/foydalanuvchilarSlice'
import { Button } from '@/components/ui/button'
import Toast from '@/components/Toast'
import UserModal from './UserModal'
import BlockUserModal from './BlockUserModal'
import ActivateUserModal from './ActivateUserModal'

export default function UserFooter({ user }) {
  const dispatch = useDispatch()
  const [editOpen, setEditOpen] = useState(false)
  const [blockOpen, setBlockOpen] = useState(false)
  const [activateOpen, setActivateOpen] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(''), 3000)
    return () => clearTimeout(t)
  }, [toast])

  const blocked = user.holat === 'blocked'

  return (
    <>
      <div className="flex shrink-0 items-center justify-end gap-2.5 bg-[#F5F5F5] px-3 py-3 dark:bg-white/5">
        <Button
          variant="outline"
          disabled={blocked}
          onClick={() => setEditOpen(true)}
          className="h-9 gap-2 rounded-lg border border-[#E5E5E5] bg-[#EFF1F7] px-4 text-sm font-medium text-[#0A0A0A] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] hover:bg-[#E3E7F0] disabled:opacity-50 dark:border-white/10 dark:bg-card dark:text-white dark:hover:bg-white/10"
        >
          <HugeiconsIcon icon={Edit02Icon} size={16} strokeWidth={2} /> Tahrirlash
        </Button>
        {blocked ? (
          <Button
            onClick={() => setActivateOpen(true)}
            className="h-9 gap-2 bg-[#0052D2] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
          >
            <CheckCircle2 className="h-4 w-4" /> Faollashtirish
          </Button>
        ) : (
          <Button
            onClick={() => setBlockOpen(true)}
            className="h-9 gap-2 bg-[#DC2626] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#B91C1C]"
          >
            <X className="h-4 w-4" /> Bloklash
          </Button>
        )}
      </div>

      <UserModal
        open={editOpen}
        onOpenChange={setEditOpen}
        user={user}
        onSave={(patch) => {
          dispatch(updateUser({ id: user.id, draft: patch }))
            .unwrap()
            .then(() => setToast('O‘zgarishlar saqlandi'))
            .catch((err) => setToast(err || 'Saqlashda xatolik yuz berdi'))
        }}
      />
      <BlockUserModal
        open={blockOpen}
        onOpenChange={setBlockOpen}
        user={user}
        onConfirm={() => {
          // Backend hali foydalanuvchini bloklash/faollashtirish uchun maydon taqdim etmagan.
          setToast('Bu funksiya hozircha backendda mavjud emas')
        }}
      />
      <ActivateUserModal
        open={activateOpen}
        onOpenChange={setActivateOpen}
        user={user}
        onConfirm={() => {
          setToast('Bu funksiya hozircha backendda mavjud emas')
        }}
      />
      <Toast message={toast} />
    </>
  )
}
