import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { maskDateTime } from '@/lib/format'
import { SearchSelect } from '@/components/ui/search-select'
import { BRANCHES, ORGANIZATIONS, fmtDateTime, monthOptions, parseDateTime } from '@/features/tabel/tabelData'
import TabelModal, { ModalButton } from './TabelModal'

const INPUT =
  'h-11 w-full rounded-[8px] border border-[#E5E5E5] bg-white px-4 text-[15px] text-[#0A0A0A] shadow-[0px_1px_2px_0px_#0000001A] outline-none transition-colors focus:border-[#0052D2] dark:border-white/10 dark:bg-card dark:text-white'
const SELECT = 'h-11 px-4 text-[15px]'

function initialForm() {
  const now = new Date()
  const orgId = ORGANIZATIONS[0].id
  return {
    date: fmtDateTime(now),
    orgId,
    branchId: BRANCHES.find((b) => b.orgId === orgId)?.id ?? '',
    period: `${now.getFullYear()}-${now.getMonth()}`,
  }
}

// onSave({ date, orgId, branchId, year, month }) -> xato matni (string) yoki hech narsa
export default function NewTabelModal({ open, onOpenChange, onSave }) {
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const set = (patch) => {
    setForm((f) => ({ ...f, ...patch }))
    setError('')
  }

  useEffect(() => {
    if (open) {
      setForm(initialForm())
      setError('')
    }
  }, [open])

  const dateTs = parseDateTime(form.date)
  const valid = dateTs != null && form.orgId && form.branchId && form.period

  function save() {
    const [year, month] = form.period.split('-').map(Number)
    const err = onSave({ date: dateTs, orgId: form.orgId, branchId: form.branchId, year, month })
    if (err) setError(err)
  }

  return (
    <TabelModal
      open={open}
      onOpenChange={onOpenChange}
      title="Tabel"
      width={780}
      footer={
        <>
          <ModalButton variant="outline" onClick={() => onOpenChange(false)}>
            <X className="size-4" /> Bekor qilish
          </ModalButton>
          <ModalButton onClick={save} disabled={!valid}>
            <Check className="size-4" /> Saqlash
          </ModalButton>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <Field label="Sana">
          <input
            className={cn(INPUT, form.date && dateTs == null && 'border-[#DC2626] focus:border-[#DC2626]')}
            value={form.date}
            placeholder="KK.OO.YYYY SS:MM"
            inputMode="numeric"
            onChange={(e) => set({ date: maskDateTime(e.target.value) })}
          />
        </Field>
        <Field label="Tashkilot">
          <SearchSelect
            className={SELECT}
            allowAll={false}
            placeholder="Tanlang"
            value={form.orgId}
            onChange={(v) => set({ orgId: v, branchId: BRANCHES.find((b) => b.orgId === v)?.id ?? '' })}
            options={ORGANIZATIONS.map((o) => ({ value: o.id, label: o.name }))}
          />
        </Field>
        <Field label="Filial">
          <SearchSelect
            className={SELECT}
            allowAll={false}
            placeholder="Tanlang"
            value={form.branchId}
            onChange={(v) => set({ branchId: v })}
            options={BRANCHES.filter((b) => b.orgId === form.orgId).map((b) => ({ value: b.id, label: b.name }))}
          />
        </Field>
        <Field label="Oy uchun">
          <SearchSelect
            className={SELECT}
            allowAll={false}
            placeholder="Tanlang"
            value={form.period}
            onChange={(v) => set({ period: v })}
            options={monthOptions()}
          />
        </Field>
        {error && (
          <p className="col-span-2 rounded-lg bg-[#FEECEC] px-3 py-2 text-[13px] font-medium text-[#DC2626] dark:bg-[#DC2626]/15 dark:text-[#F87171]">
            {error}
          </p>
        )}
      </div>
    </TabelModal>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-2 block text-[14px] font-medium leading-5 text-[#0A0A0A] dark:text-white">{label}</label>
      {children}
    </div>
  )
}
