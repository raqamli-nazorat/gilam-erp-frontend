import { qualityOptions } from '@/services/optionSources'
import { Input } from '@/components/ui/input'
import { PagedSelect } from '@/components/ui/paged-select'
import ReferenceFormModal, { FormField, fieldCls, useFormDraft } from './ReferenceFormModal'

const EMPTY = { name: '', sifatId: '' }

export default function DizaynModal({ open, onOpenChange, record, onSave, onDelete }) {
  const { draft, set, isDirty } = useFormDraft(open, record, EMPTY)

  const isValid = draft.name.trim().length > 0 && !!draft.sifatId

  return (
    <ReferenceFormModal
      open={open}
      onOpenChange={onOpenChange}
      title={record ? 'Dizaynni tahrirlash' : 'Yangi dizayn'}
      record={record}
      isValid={isValid}
      isDirty={isDirty}
      onSave={() => onSave(draft)}
      onDelete={onDelete}
    >
      <FormField label="Nomi" full>
        <Input value={draft.name} onChange={(e) => set('name', e.target.value)} placeholder="Gulli naqsh" className={fieldCls} />
      </FormField>
      <FormField label="Sifat" full>
        <PagedSelect
          value={draft.sifatId}
          onChange={(v) => set('sifatId', v)}
          fetchPage={qualityOptions}
          selectedLabel={record?.sifatId === draft.sifatId ? record?.sifat : ''}
        />
      </FormField>
    </ReferenceFormModal>
  )
}
