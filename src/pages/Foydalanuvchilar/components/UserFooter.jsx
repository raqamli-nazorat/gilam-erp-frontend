import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CheckCircle2, Pencil, X } from 'lucide-react'
import { userActivated, userBlocked, userUpdated } from '@/features/foydalanuvchilar/foydalanuvchilarSlice'
import { Button } from '@/components/ui/button'
import Toast from '@/components/Toast'
import UserModal from './UserModal'
import BlockUserModal from './BlockUserModal'
import ActivateUserModal from './ActivateUserModal'

export default function UserFooter({ user }) {
  const dispatch = useDispatch()
  const currentUser = useSelector((s) => s.auth.user)
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
      <div className="-mx-6 -mb-6 flex shrink-0 items-center justify-end gap-2.5 border-t border-[#E5E5E5] bg-[#F5F5F5] px-6 py-3 dark:border-white/10 dark:bg-white/5">
        <Button
          variant="outline"
          disabled={blocked}
          onClick={() => setEditOpen(true)}
          className="h-9 gap-2 border-[#E5E5E5] bg-white px-4 text-sm font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] disabled:opacity-50 dark:border-white/10 dark:bg-card dark:text-white"
        >
          <Pencil className="h-4 w-4" /> Tahrirlash
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
          dispatch(userUpdated({ id: user.id, patch }))
          setToast('O‘zgarishlar saqlandi')
        }}
      />
      <BlockUserModal
        open={blockOpen}
        onOpenChange={setBlockOpen}
        user={user}
        onConfirm={(reason) => {
          dispatch(userBlocked({ id: user.id, reason, by: currentUser?.fullName ?? 'Administrator' }))
          setToast('Foydalanuvchi bloklandi')
        }}
      />
      <ActivateUserModal
        open={activateOpen}
        onOpenChange={setActivateOpen}
        user={user}
        onConfirm={() => {
          dispatch(userActivated({ id: user.id, by: currentUser?.fullName ?? 'Administrator' }))
          setToast('Foydalanuvchi faollashtirildi')
        }}
      />
      <Toast message={toast} />
    </>
  )
}
