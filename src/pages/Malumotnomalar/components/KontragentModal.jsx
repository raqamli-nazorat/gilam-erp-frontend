import { counterpartyTypeOptions } from '@/services/optionSources'
import { Input } from '@/components/ui/input'
import { PagedSelect } from '@/components/ui/paged-select'
import { PhoneInput } from '@/components/ui/phone-input'
import ReferenceFormModal, { FormField, fieldCls, useFormDraft } from './ReferenceFormModal'

const EMPTY = { name: '', phone: '', turId: '' }

export default function KontragentModal({ open, onOpenChange, record, onSave, onDelete }) {
  const { draft, set, isDirty } = useFormDraft(open, record, EMPTY)

  const isValid = draft.name.trim().length > 0 && !!draft.turId

  return (
    <ReferenceFormModal
      open={open}
      onOpenChange={onOpenChange}
      title={record ? 'Kontragentni tahrirlash' : 'Yangi kontragent'}
      record={record}
      isValid={isValid}
      isDirty={isDirty}
      onSave={() => onSave(draft)}
      onDelete={onDelete}
    >
      <FormField label="Nomi" full>
        <Input value={draft.name} onChange={(e) => set('name', e.target.value)} placeholder="Eron Tekstil MChJ" className={fieldCls} />
      </FormField>
      <FormField label="Telefon">
        <PhoneInput value={draft.phone} onChange={(v) => set('phone', v)} placeholder="+998 90 123-45-67" className={fieldCls} />
      </FormField>
      <FormField label="Turi">
        <PagedSelect
          value={draft.turId}
          onChange={(v) => set('turId', v)}
          fetchPage={counterpartyTypeOptions}
          selectedLabel={record?.turId === draft.turId ? record?.tur : ''}
        />
      </FormField>
    </ReferenceFormModal>
  )
}
