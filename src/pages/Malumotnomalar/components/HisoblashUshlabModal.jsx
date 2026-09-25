import { currencyOptions } from '@/services/optionSources'
import { ACCRUAL_TYPES } from '@/features/malumotnomalar/financeReferenceData'
import { Input } from '@/components/ui/input'
import { NumberInput } from '@/components/ui/number-input'
import { PagedSelect } from '@/components/ui/paged-select'
import ReferenceFormModal, { FormField, OptionSelect, fieldCls, useFormDraft } from './ReferenceFormModal'

const EMPTY = { name: '', type: '', valyutaId: '', value: '' }

export default function HisoblashUshlabModal({ open, onOpenChange, record, onSave, onDelete }) {
  const { draft, set, isDirty } = useFormDraft(open, record, EMPTY)

  const num = Number(draft.value)
  const isValid =
    draft.name.trim().length > 0 &&
    !!draft.type &&
    !!draft.valyutaId &&
    draft.value !== '' &&
    (draft.type !== 'percent' || num <= 100)

  return (
    <ReferenceFormModal
      open={open}
      onOpenChange={onOpenChange}
      title={record ? 'Turni tahrirlash' : 'Yangi tur'}
      record={record}
      isValid={isValid}
      isDirty={isDirty}
      onSave={() => onSave(draft)}
      onDelete={onDelete}
    >
      <FormField label="Nomi" full>
        <Input value={draft.name} onChange={(e) => set('name', e.target.value)} placeholder="Ish haqidan soliq" className={fieldCls} />
      </FormField>
      <FormField label="Tur">
        <OptionSelect value={draft.type} onChange={(v) => set('type', v)} options={ACCRUAL_TYPES} />
      </FormField>
      <FormField label="Valyuta">
        <PagedSelect
          value={draft.valyutaId}
          onChange={(v) => set('valyutaId', v)}
          fetchPage={currencyOptions}
          selectedLabel={record?.valyutaId === draft.valyutaId ? record?.valyuta : ''}
        />
      </FormField>
      <FormField label="Qiymat (% yoki summa)" full>
        <NumberInput value={draft.value} onChange={(e) => set('value', e.target.value)} placeholder="0" className={fieldCls} />
        {draft.type === 'percent' && num > 100 && (
          <p className="mt-1 text-[12px] text-[#DC2626]">Foiz 100 dan oshmasligi kerak</p>
        )}
      </FormField>
    </ReferenceFormModal>
  )
}
