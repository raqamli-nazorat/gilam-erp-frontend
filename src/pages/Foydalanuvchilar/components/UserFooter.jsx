import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Check, UserPlus, X } from 'lucide-react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Edit02Icon } from '@hugeicons/core-free-icons/index'
import { updateUser } from '@/features/foydalanuvchilar/foydalanuvchilarSlice'
import { rehireXodim, terminateXodim, updateXodim } from '@/features/xodimlar/xodimlarSlice'
import { Button } from '@/components/ui/button'
import Toast from '@/components/Toast'
import HireEmployeeModal from '@/pages/Xodimlar/components/HireEmployeeModal'
import RehireEmployeeModal from '@/pages/Xodimlar/components/RehireEmployeeModal'
import TerminateEmployeeModal from '@/pages/Xodimlar/components/TerminateEmployeeModal'
import UserModal from './UserModal'
import BlockUserModal from './BlockUserModal'
import ActivateUserModal from './ActivateUserModal'

// xodim (bog'langan Employee) mavjud bo'lsa — Tahrirlash/Ishdan chiqarish/Qayta ishga olish
// Xodimlar moduli bilan bir xil hujjat (RecruitmentDismissal) orqali ishlaydi. Bog'lanmagan
// bo'lsa (employee_info yo'q) — eski, faqat foydalanuvchi profilini tahrirlash oqimi qoladi.
export default function UserFooter({ user, xodim }) {
  const dispatch = useDispatch()
  const [editOpen, setEditOpen] = useState(false)
  const [terminateOpen, setTerminateOpen] = useState(false)
  const [rehireOpen, setRehireOpen] = useState(false)
  const [blockOpen, setBlockOpen] = useState(false)
  const [activateOpen, setActivateOpen] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(''), 3000)
    return () => clearTimeout(t)
  }, [toast])

  const blocked = user.holat === 'blocked'

  if (xodim) {
    const { holat } = xodim
    return (
      <>
        <div className="flex shrink-0 items-center justify-end gap-2.5 bg-[#F5F5F5] px-3 py-3 dark:bg-white/5">
          {holat === 'yangi' ? (
            <Button
              onClick={() => setEditOpen(true)}
              className="h-9 gap-2 bg-[#0052D2] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
            >
              <UserPlus className="h-4 w-4" /> Ishga olish
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => setEditOpen(true)}
              className="h-9 gap-2 rounded-lg border border-[#E5E5E5] bg-[#EFF1F7] px-4 text-sm font-medium text-[#0A0A0A] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] hover:bg-[#E3E7F0] dark:border-white/10 dark:bg-card dark:text-white dark:hover:bg-white/10"
            >
              <HugeiconsIcon icon={Edit02Icon} size={16} strokeWidth={2} /> Tahrirlash
            </Button>
          )}
          {holat === 'faol' && (
            <Button
              onClick={() => setTerminateOpen(true)}
              className="h-9 gap-2 bg-[#DC2626] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#B91C1C]"
            >
              <X className="h-4 w-4" /> Ishdan chiqarish
            </Button>
          )}
          {holat === 'boshagan' && (
            <Button
              onClick={() => setRehireOpen(true)}
              className="h-9 gap-2 bg-[#0052D2] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
            >
              <Check className="h-4 w-4" /> Qayta ishga olish
            </Button>
          )}
        </div>

        <HireEmployeeModal
          open={editOpen}
          onOpenChange={setEditOpen}
          employee={xodim}
          onSave={({ recruitmentId, ...draft }) => {
            dispatch(updateXodim({ id: xodim.id, recruitmentId, draft }))
              .unwrap()
              .then(() => setToast(holat === 'yangi' ? 'Xodim ishga olindi' : 'O‘zgarishlar saqlandi'))
              .catch((err) => setToast(err || 'Saqlashda xatolik yuz berdi'))
          }}
        />
        <TerminateEmployeeModal
          open={terminateOpen}
          onOpenChange={setTerminateOpen}
          employee={xodim}
          onConfirm={(reason) => {
            dispatch(terminateXodim({ id: xodim.id, reason, employee: xodim }))
              .unwrap()
              .then(() => setToast('Xodim ishdan chiqarildi'))
              .catch((err) => setToast(err || 'Ishdan chiqarishda xatolik yuz berdi'))
          }}
        />
        <RehireEmployeeModal
          open={rehireOpen}
          onOpenChange={setRehireOpen}
          employee={xodim}
          onConfirm={() => {
            dispatch(
              rehireXodim({
                id: xodim.id,
                draft: {
                  filial: xodim.filialId,
                  lavozim: xodim.lavozimId,
                  kartaRaqami: xodim.kartaRaqami,
                  ishHaqiTuri: xodim.ishHaqiTuri,
                  ishHaqiSummasi: xodim.ishHaqiSummasi,
                  ishHaqiFoizi: xodim.ishHaqiFoizi,
                  qoshimchaSumma: xodim.qoshimchaSumma,
                  qoshimchaFoizi: xodim.qoshimchaFoizi,
                  ishgaOlinganSana: new Date().toISOString().slice(0, 10),
                },
              })
            )
              .unwrap()
              .then(() => setToast('Xodim qayta ishga olindi'))
              .catch((err) => setToast(err || 'Qayta ishga olishda xatolik yuz berdi'))
          }}
        />
        <Toast message={toast} />
      </>
    )
  }

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
            <Check className="h-4 w-4" /> Faollashtirish
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
