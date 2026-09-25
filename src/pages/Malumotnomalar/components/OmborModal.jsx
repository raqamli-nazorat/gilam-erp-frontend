import { branchOptions } from '@/services/optionSources'
import { Input } from '@/components/ui/input'
import { PagedSelect } from '@/components/ui/paged-select'
import ReferenceFormModal, { FormField, fieldCls, useFormDraft } from './ReferenceFormModal'

const EMPTY = { name: '', filialId: '', manzil: '' }

export default function OmborModal({ open, onOpenChange, record, onSave, onDelete }) {
  const { draft, set, isDirty } = useFormDraft(open, record, EMPTY)

  const isValid = draft.name.trim().length > 0 && !!draft.filialId

  return (
    <ReferenceFormModal
      open={open}
      onOpenChange={onOpenChange}
      title={record ? 'Omborni tahrirlash' : 'Yangi ombor'}
      record={record}
      isValid={isValid}
      isDirty={isDirty}
      onSave={() => onSave(draft)}
      onDelete={onDelete}
    >
      <FormField label="Nomi" full>
        <Input value={draft.name} onChange={(e) => set('name', e.target.value)} placeholder="Asosiy ombor" className={fieldCls} />
      </FormField>
      <FormField label="Filial" full>
        <PagedSelect
          value={draft.filialId}
          onChange={(v) => set('filialId', v)}
          fetchPage={branchOptions}
          selectedLabel={record?.filialId === draft.filialId ? record?.filial : ''}
          placeholder="Filialni tanlang"
        />
      </FormField>
      <FormField label="Manzil" full>
        <Input value={draft.manzil} onChange={(e) => set('manzil', e.target.value)} placeholder="Toshkent sh., Registon ko‘chasi 12" className={fieldCls} />
      </FormField>
    </ReferenceFormModal>
  )
}
