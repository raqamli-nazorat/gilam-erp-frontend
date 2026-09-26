import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { currencyApi } from '@/services/financeReferenceService'
import ReferenceFormModal, { FormField, fieldCls, useFormDraft } from './ReferenceFormModal'

const EMPTY = { name: '', shortName: '' }

export default function ValyutaModal({ open, onOpenChange, record, onSave, onDelete }) {
  const { draft, set, isDirty } = useFormDraft(open, record, EMPTY)
  const [availableList, setAvailableList] = useState([])
  const [selectedBank, setSelectedBank] = useState('')

  useEffect(() => {
    if (open) {
      setSelectedBank('')
      if (!record) {
        currencyApi
          .getAvailable()
          .then((res) => {
            const list = Array.isArray(res) ? res : res?.results ?? []
            setAvailableList(list)
          })
          .catch(() => setAvailableList([]))
      }
    }
  }, [open, record])

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
      {!record && availableList.length > 0 && (
        <FormField label="Bankdagi valyutani tanlash" full>
          <Select
            value={selectedBank}
            onValueChange={(val) => {
              setSelectedBank(val)
              const item = availableList.find((c) => c.short_name === val)
              if (item) {
                set('name', item.name)
                set('shortName', item.short_name)
              }
            }}
          >
            <SelectTrigger className={fieldCls}>
              <SelectValue placeholder="Bankdagi valyutani tanlang" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {availableList.map((c) => (
                <SelectItem key={c.short_name} value={c.short_name}>
                  <div className="flex items-center justify-between gap-4 w-full">
                    <span>
                      {c.name} ({c.short_name})
                    </span>
                    {c.exists && <span className="text-[11px] text-[#737373] ml-2">(Mavjud)</span>}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      )}

      <FormField label="Nomi">
        <Input
          value={draft.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="Amerika dollari"
          className={fieldCls}
        />
      </FormField>
      <FormField label="Qisqa nomi">
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
