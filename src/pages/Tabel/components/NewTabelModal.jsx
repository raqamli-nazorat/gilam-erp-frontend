import { useEffect, useState } from 'react'
import { Check, Loader2, X } from 'lucide-react'
import { SearchSelect } from '@/components/ui/search-select'
import { PagedSelect } from '@/components/ui/paged-select'
import { branchOptions, organizationOptions } from '@/services/optionSources'
import { fmtDateTime, periodOptions } from '@/features/tabel/tabelData'
import TabelModal, { ModalButton } from './TabelModal'

const INPUT =
  'h-11 w-full rounded-[8px] border border-[#E5E5E5] bg-white px-4 text-[15px] text-[#0A0A0A] shadow-[0px_1px_2px_0px_#0000001A] outline-none disabled:bg-white disabled:text-[#0A0A0A] dark:border-white/10 dark:bg-card dark:text-white'
const SELECT = 'h-11 px-4 text-[15px]'

function initialForm() {
  const now = new Date()
  return { orgId: '', orgName: '', branchId: '', branchName: '', period: `${now.getFullYear()}-${now.getMonth() + 1}` }
}

// onSave({ branchId, year, forMonth }) -> Promise<xato matni (string) | null>
// Sana — backend tomonidan (created_at) qo'yiladi, shu sababli faqat ko'rsatiladi.
export default function NewTabelModal({ open, onOpenChange, onSave }) {
  const [form, setForm] = useState(initialForm)
  const [now, setNow] = useState(() => new Date())
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const set = (patch) => {
    setForm((f) => ({ ...f, ...patch }))
    setError('')
  }

  useEffect(() => {
    if (open) {
      setForm(initialForm())
      setNow(new Date())
      setError('')
      setSaving(false)
    }
  }, [open])

  const valid = form.branchId && form.period

  async function save() {
    setSaving(true)
    const [year, forMonth] = form.period.split('-').map(Number)
    const err = await onSave({ branchId: form.branchId, year, forMonth })
    setSaving(false)
    if (err) setError(err)
  }

  return (
    <TabelModal
      open={open}
      onOpenChange={onOpenChange}
      title="Tabel"
      width={560}
      footer={
        <>
          <ModalButton variant="outline" onClick={() => onOpenChange(false)}>
            <X className="size-4" /> Bekor qilish
          </ModalButton>
          <ModalButton onClick={save} disabled={!valid || saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} Saqlash
          </ModalButton>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <Field label="Sana">
          <input className={INPUT} value={fmtDateTime(now)} disabled readOnly />
        </Field>
        <Field label="Tashkilot">
          <PagedSelect
            value={form.orgId}
            onChange={(v, item) => set({ orgId: v, orgName: item?.name ?? '', branchId: '', branchName: '' })}
            fetchPage={organizationOptions}
            selectedLabel={form.orgName}
            placeholder="Tanlang"
            className={SELECT}
          />
        </Field>
        <Field label="Filial">
          <PagedSelect
            value={form.branchId}
            onChange={(v, item) => set({ branchId: v, branchName: item?.name ?? '' })}
            fetchPage={branchOptions}
            params={form.orgId ? { organization: form.orgId } : undefined}
            selectedLabel={form.branchName}
            placeholder={form.orgId ? 'Tanlang' : 'Avval tashkilotni tanlang'}
            disabled={!form.orgId}
            className={SELECT}
          />
        </Field>
        <Field label="Oy uchun">
          <SearchSelect
            className={SELECT}
            allowAll={false}
            placeholder="Tanlang"
            value={form.period}
            onChange={(v) => set({ period: v })}
            options={periodOptions()}
          />
        </Field>
        {error && (
          <p className="col-span-2 whitespace-pre-line rounded-lg bg-[#FEECEC] px-3 py-2 text-[13px] font-medium text-[#DC2626] dark:bg-[#DC2626]/15 dark:text-[#F87171]">
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
