import { useEffect, useMemo, useState } from 'react'
import { formatDate } from '@/lib/format'
import { maskDate } from '@/components/ui/filter-modal'
import { Input } from '@/components/ui/input'
import ReferenceFormModal, { FormField, OptionSelect, fieldCls } from './ReferenceFormModal'

function formatRateInput(val) {
  let s = String(val ?? '').replace(/[^\d.,]/g, '')
  s = s.replace(',', '.')
  const dotIndex = s.indexOf('.')
  if (dotIndex !== -1) {
    s = s.slice(0, dotIndex + 1) + s.slice(dotIndex + 1).replace(/[.,]/g, '').slice(0, 4)
  }
  const [intRaw, fracPart] = s.split('.')
  const intPart = intRaw.replace(/^0+(?=\d)/, '')
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return fracPart === undefined ? grouped : `${grouped},${fracPart}`
}

export default function KursModal({ open, onOpenChange, record, onSave, onDelete, currencies = [] }) {
  const currencyOptions = useMemo(
    () =>
      currencies.map((c) => ({
        id: c.id,
        name: c.shortName || c.short_name ? `${c.name} (${c.shortName || c.short_name})` : c.name,
      })),
    [currencies]
  )

  const todayStr = useMemo(() => formatDate(new Date().toISOString().slice(0, 10)), [])

  const [draft, setDraft] = useState({
    currencyId: '',
    day: todayStr,
    value: '',
  })
  const [initial, setInitial] = useState({
    currencyId: '',
    day: todayStr,
    value: '',
  })

  useEffect(() => {
    if (open) {
      if (record) {
        const init = {
          currencyId: record.currencyId ?? '',
          day: record.day ?? todayStr,
          value: record.value != null ? formatRateInput(record.value) : '',
        }
        setDraft(init)
        setInitial(init)
      } else {
        const firstCurId = currencies.length > 0 ? currencies[0].id : ''
        const init = {
          currencyId: firstCurId,
          day: todayStr,
          value: '',
        }
        setDraft(init)
        setInitial(init)
      }
    }
  }, [open, record, currencies, todayStr])

  const set = (k, v) => setDraft((prev) => ({ ...prev, [k]: v }))

  const isDirty =
    draft.currencyId !== initial.currencyId ||
    draft.day !== initial.day ||
    draft.value !== initial.value

  const isValid =
    Boolean(draft.currencyId) &&
    Boolean(draft.day?.trim()) &&
    Boolean(draft.value?.trim())

  return (
    <ReferenceFormModal
      open={open}
      onOpenChange={onOpenChange}
      title={record ? 'Kursni tahrirlash' : 'Yangi kurs'}
      record={record}
      isValid={isValid}
      isDirty={isDirty}
      onSave={() => onSave(draft)}
      onDelete={onDelete}
    >
      <FormField label="Valyuta" full>
        <OptionSelect
          value={draft.currencyId}
          onChange={(v) => set('currencyId', v)}
          options={currencyOptions}
          placeholder="Valyutani tanlang"
        />
      </FormField>

      <FormField label="Kun" full>
        <Input
          value={draft.day}
          onChange={(e) => set('day', maskDate(e.target.value))}
          placeholder="26.09.2026"
          className={fieldCls}
        />
      </FormField>

      <FormField label="Kurs, UZS" full>
        <Input
          value={draft.value}
          onChange={(e) => set('value', formatRateInput(e.target.value))}
          placeholder="12 230,00"
          className={fieldCls}
        />
        <p className="mt-1 text-[12px] font-normal leading-4 text-[#737373] dark:text-muted-foreground">
          Kurs 1 birlik valyuta uchun o‘zbek so‘mida saqlanadi.
        </p>
      </FormField>
    </ReferenceFormModal>
  )
}
