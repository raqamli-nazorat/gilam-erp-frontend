import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { dayUpdated } from '@/features/tabel/tabelSlice'
import { calcFact, fmtDmy, fmtHours, maskTime, toMinutes } from '@/features/tabel/tabelData'
import TabelModal, { ModalButton } from './TabelModal'

const INPUT =
  'h-11 w-full rounded-[8px] border border-[#E5E5E5] bg-white px-4 text-[15px] text-[#0A0A0A] shadow-[0px_1px_2px_0px_#0000001A] outline-none transition-colors focus:border-[#0052D2] disabled:bg-white disabled:text-[#0A0A0A] dark:border-white/10 dark:bg-card dark:text-white'

const TIME_FIELDS = [
  ['kelgan', 'Ishga kelgan vaqti'],
  ['tushlikChiqqan', 'Tushlikka chiqqan vaqti'],
  ['tushlikQaytgan', 'Tushlikdan qaytgan vaqti'],
  ['ketgan', 'Ishdan chiqqan vaqti'],
]

// target: { employee, day, entry } | null
export default function DayDetailModal({ target, tabelId, year, month, readOnly, onClose, onSaved, onSubmit }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [form, setForm] = useState(null)

  useEffect(() => {
    if (target) {
      const { kelgan, tushlikChiqqan, tushlikQaytgan, ketgan } = target.entry
      setForm({ kelgan, tushlikChiqqan, tushlikQaytgan, ketgan })
    }
  }, [target])

  if (!target || !form) return null
  const { employee, day, entry } = target

  const invalid = TIME_FIELDS.some(([k]) => form[k] && toMinutes(form[k]) == null)
  const dirty = TIME_FIELDS.some(([k]) => form[k] !== entry[k])
  const fakt = invalid ? entry.fakt : calcFact(form)

  function save() {
    const next = { plan: entry.plan, ...form }
    // onSubmit berilsa — o'zgarish sahifada yig'iladi ("Saqlash" bilan yoziladi), aks holda darhol saqlanadi
    if (onSubmit) onSubmit({ empId: employee.id, day, entry: next })
    else dispatch(dayUpdated({ id: tabelId, empId: employee.id, day, entry: next }))
    onSaved?.()
    onClose()
  }

  return (
    <TabelModal
      open={Boolean(target)}
      onOpenChange={(o) => !o && onClose()}
      title="Kun tafsiloti"
      width={780}
      footer={
        <>
          <ModalButton variant="outline" onClick={onClose}>
            <X className="size-4" /> Bekor qilish
          </ModalButton>
          {!readOnly && (
            <ModalButton onClick={save} disabled={!dirty || invalid}>
              <Check className="size-4" /> Saqlash
            </ModalButton>
          )}
        </>
      }
    >
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <Field label="Xodim" className="col-span-2">
          <button
            type="button"
            onClick={() => {
              onClose()
              navigate(`/tabel/${tabelId}/xodim/${employee.id}`)
            }}
            className={cn(INPUT, 'flex items-center justify-between text-left hover:bg-[#F9FAFB] dark:hover:bg-white/5')}
          >
            {employee.name}
            <ChevronRight className="size-5 text-[#0052D2]" />
          </button>
        </Field>
        <Field label="Sana">
          <input className={INPUT} value={fmtDmy(year, month, day)} disabled readOnly />
        </Field>
        <Field label="Plan bo‘yicha ish soati">
          <input className={INPUT} value={fmtHours(entry.plan, true)} disabled readOnly />
        </Field>
        {TIME_FIELDS.map(([key, label]) => (
          <Field key={key} label={label}>
            <input
              className={cn(INPUT, form[key] && toMinutes(form[key]) == null && 'border-[#DC2626] focus:border-[#DC2626]')}
              value={form[key]}
              placeholder="--:--"
              inputMode="numeric"
              disabled={readOnly}
              onChange={(e) => setForm((f) => ({ ...f, [key]: maskTime(e.target.value) }))}
            />
          </Field>
        ))}
        <Field label="Fakt bo‘yicha ishlagan soat" className="col-span-2">
          <input className={INPUT} value={fmtHours(fakt, true)} disabled readOnly />
        </Field>
      </div>
    </TabelModal>
  )
}

function Field({ label, className, children }) {
  return (
    <div className={className}>
      <label className="mb-2 block text-[14px] font-medium leading-5 text-[#0A0A0A] dark:text-white">{label}</label>
      {children}
    </div>
  )
}
