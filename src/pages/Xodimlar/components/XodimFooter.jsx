import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Check, FileBarChart2, UserPlus, X } from 'lucide-react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Edit02Icon } from '@hugeicons/core-free-icons/index'
import { rehireXodim, terminateXodim, updateXodim } from '@/features/xodimlar/xodimlarSlice'
import { Button } from '@/components/ui/button'
import Toast from '@/components/Toast'
import HireEmployeeModal from './HireEmployeeModal'
import TerminateEmployeeModal from './TerminateEmployeeModal'
import RehireEmployeeModal from './RehireEmployeeModal'

export default function XodimFooter({ employee }) {
  const dispatch = useDispatch()
  const [editOpen, setEditOpen] = useState(false)
  const [terminateOpen, setTerminateOpen] = useState(false)
  const [rehireOpen, setRehireOpen] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(''), 3000)
    return () => clearTimeout(t)
  }, [toast])

  const { holat } = employee

  return (
    <>
      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-[#E5E5E5] bg-[#F5F5F5] px-3 py-3 dark:border-white/10 dark:bg-white/5">
        <Button
          onClick={() => setToast('Hisobot tayyorlanmoqda…')}
          className="h-9 gap-2 rounded-lg bg-[#0052D2] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
        >
          <FileBarChart2 className="h-4 w-4" /> Xisobot
        </Button>
        <div className="flex items-center gap-2.5">
          {holat === 'yangi' ? (
            <Button
              onClick={() => setEditOpen(true)}
              className="h-9 gap-2 rounded-lg bg-[#0052D2] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
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
              className="h-9 gap-2 rounded-lg bg-[#DC2626] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#B91C1C]"
            >
              <X className="h-4 w-4" /> Ishdan chiqarish
            </Button>
          )}
          {holat === 'boshagan' && (
            <Button
              onClick={() => setRehireOpen(true)}
              className="h-9 gap-2 rounded-lg bg-[#0052D2] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
            >
              <Check className="h-4 w-4" /> Qayta ishga olish
            </Button>
          )}
        </div>
      </div>

      <HireEmployeeModal
        open={editOpen}
        onOpenChange={setEditOpen}
        employee={employee}
        onSave={({ recruitmentId, ...draft }) => {
          dispatch(updateXodim({ id: employee.id, recruitmentId, draft }))
            .unwrap()
            .then(() => setToast(holat === 'yangi' ? 'Xodim ishga olindi' : 'O‘zgarishlar saqlandi'))
            .catch((err) => setToast(err || 'Saqlashda xatolik yuz berdi'))
        }}
      />
      <TerminateEmployeeModal
        open={terminateOpen}
        onOpenChange={setTerminateOpen}
        employee={employee}
        onConfirm={(reason) => {
          dispatch(terminateXodim({ id: employee.id, reason, employee }))
            .unwrap()
            .then(() => setToast('Xodim ishdan chiqarildi'))
            .catch((err) => setToast(err || 'Ishdan chiqarishda xatolik yuz berdi'))
        }}
      />
      <RehireEmployeeModal
        open={rehireOpen}
        onOpenChange={setRehireOpen}
        employee={employee}
        onConfirm={() => {
          dispatch(
            rehireXodim({
              id: employee.id,
              draft: {
                filial: employee.filialId,
                lavozim: employee.lavozimId,
                kartaRaqami: employee.kartaRaqami,
                ishHaqiTuri: employee.ishHaqiTuri,
                ishHaqiSummasi: employee.ishHaqiSummasi,
                ishHaqiFoizi: employee.ishHaqiFoizi,
                qoshimchaSumma: employee.qoshimchaSumma,
                qoshimchaFoizi: employee.qoshimchaFoizi,
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
