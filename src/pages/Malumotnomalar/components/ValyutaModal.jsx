import { Input } from '@/components/ui/input'
import ReferenceFormModal, { FormField, fieldCls, useFormDraft } from './ReferenceFormModal'

const EMPTY = { name: '', shortName: '' }

export default function ValyutaModal({ open, onOpenChange, record, onSave, onDelete }) {
  const { draft, set, isDirty } = useFormDraft(open, record, EMPTY)
  const isValid = draft.name.trim().length > 0 && draft.shortName.trim().length > 0

  return (
    <ReferenceFormModal
      open={open}
      onOpenChange={onOpenChange}
      title={record ? 'Valyutani tahrirlash' : 'Yangi valyuta'}
      record={record}
      isValid={isValid}
      isDirty={isDirty}
      onSave={() => onSave(draft)}
      onDelete={onDelete}
    >
      <FormField label="Nomi" full>
        <Input value={draft.name} onChange={(e) => set('name', e.target.value)} placeholder="Amerika dollari" className={fieldCls} />
      </FormField>
      <FormField label="Qisqa nomi" full>
        <Input
          value={draft.shortName}
          onChange={(e) => set('shortName', e.target.value.toUpperCase())}
          placeholder="USD"
          maxLength={10}
          className={fieldCls}
        />
      </FormField>
    </ReferenceFormModal>
  )
}
