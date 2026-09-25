import { useState } from 'react'
import { branchOptions, colorOptions, designOptions, qualityOptions, unitOptions } from '@/services/optionSources'
import { Input } from '@/components/ui/input'
import { NumberInput } from '@/components/ui/number-input'
import { PagedSelect } from '@/components/ui/paged-select'
import { Switch } from '@/components/ui/switch'
import ReferenceFormModal, { FormField, fieldCls, useFormDraft } from './ReferenceFormModal'

const EMPTY = {
  name: '',
  filialId: '',
  birlikId: '',
  sifatId: '',
  rangId: '',
  dizaynId: '',
  tannarx: '',
  narx: '',
  barcode: '',
  isRunner: false,
  tavsif: '',
}

// Tanlash ro'yxatlari (Filial/Birlik/Sifat/Rang/Dizayn) — PagedSelect: oyna ochilganda hech
// narsa yuklanmaydi, har bir ro'yxat faqat dropdown ochilganda va scroll qilinganda sahifalab so'raladi.
export default function PartiyaModal({ open, onOpenChange, record, onSave, onDelete }) {
  const { draft, setDraft, set, isDirty } = useFormDraft(open, record, EMPTY)
  // Dizayn tanlanganda Sifat avtomatik qo'yiladi — uning nomini ko'rsatish uchun.
  const [autoSifat, setAutoSifat] = useState(null)

  const setSifat = (v) => {
    setAutoSifat(null)
    // Dizayn sifatga bog'liq (Design.quality) — sifat o'zgarsa tanlangan dizayn bekor qilinadi.
    setDraft((d) => ({ ...d, sifatId: v, dizaynId: v === d.sifatId ? d.dizaynId : '' }))
  }

  const setDizayn = (v, item) =>
    setDraft((d) => {
      if (!d.sifatId && item?.sifatId) setAutoSifat({ id: item.sifatId, name: item.sifat })
      return { ...d, dizaynId: v, sifatId: d.sifatId || item?.sifatId || '' }
    })

  const sifatLabel = autoSifat?.id === draft.sifatId ? autoSifat.name : record?.sifatId === draft.sifatId ? record?.sifat : ''
  const pick = (id, name) => (record && record[id] === draft[id] ? record[name] : '')

  const isValid =
    draft.name.trim().length > 0 &&
    !!draft.filialId &&
    !!draft.birlikId &&
    !!draft.sifatId &&
    !!draft.rangId &&
    !!draft.dizaynId &&
    draft.tannarx !== '' &&
    draft.narx !== ''

  return (
    <ReferenceFormModal
      open={open}
      onOpenChange={onOpenChange}
      title={record ? 'Partiyani tahrirlash' : 'Yangi partiya'}
      record={record}
      isValid={isValid}
      isDirty={isDirty}
      onSave={() => onSave(draft)}
      onDelete={onDelete}
    >
      <FormField label="Nomi" full>
        <Input value={draft.name} onChange={(e) => set('name', e.target.value)} placeholder="Partiya nomi" className={fieldCls} />
      </FormField>

      <FormField label="Filial">
        <PagedSelect
          value={draft.filialId}
          onChange={(v) => set('filialId', v)}
          fetchPage={branchOptions}
          selectedLabel={pick('filialId', 'filial')}
          placeholder="Filialni tanlang"
        />
      </FormField>
      <FormField label="Birlik">
        <PagedSelect
          value={draft.birlikId}
          onChange={(v) => set('birlikId', v)}
          fetchPage={unitOptions}
          selectedLabel={pick('birlikId', 'birlik')}
        />
      </FormField>

      <FormField label="Sifat">
        <PagedSelect value={draft.sifatId} onChange={setSifat} fetchPage={qualityOptions} selectedLabel={sifatLabel} />
      </FormField>
      <FormField label="Rang">
        <PagedSelect
          value={draft.rangId}
          onChange={(v) => set('rangId', v)}
          fetchPage={colorOptions}
          selectedLabel={pick('rangId', 'rang')}
        />
      </FormField>

      {/* Figma'da yo'q, lekin backend "design" maydonini majburiy talab qiladi. Sifat tanlangan
          bo'lsa, faqat o'sha sifatning dizaynlari so'raladi (backend `quality` filtri). */}
      <FormField label="Dizayn" full>
        <PagedSelect
          value={draft.dizaynId}
          onChange={setDizayn}
          fetchPage={designOptions}
          params={draft.sifatId ? { quality: draft.sifatId } : undefined}
          selectedLabel={pick('dizaynId', 'dizayn')}
        />
      </FormField>

      <FormField label="1 kv.m tannarxi, so‘m">
        <NumberInput value={draft.tannarx} onChange={(e) => set('tannarx', e.target.value)} placeholder="0" className={fieldCls} />
      </FormField>
      <FormField label="1 kv.m sotuv narxi, so‘m">
        <NumberInput value={draft.narx} onChange={(e) => set('narx', e.target.value)} placeholder="0" className={fieldCls} />
      </FormField>

      <FormField label="Shtrix-kod" full>
        <Input
          value={draft.barcode}
          onChange={(e) => set('barcode', e.target.value)}
          placeholder="Skanerdan o‘qiting yoki kiriting"
          className={fieldCls}
        />
      </FormField>

      <label className="col-span-2 flex w-fit cursor-pointer items-center gap-3">
        <Switch
          checked={draft.isRunner}
          onCheckedChange={(v) => set('isRunner', !!v)}
          className="data-checked:bg-[#0052D2] data-unchecked:bg-[#E5E5E5] dark:data-unchecked:bg-white/15"
        />
        <span className="text-[13px] text-[#525252] dark:text-muted-foreground">Yo‘lak (Runner)</span>
      </label>

      <FormField label="Tavsif" full>
        <Input value={draft.tavsif} onChange={(e) => set('tavsif', e.target.value)} placeholder="Ixtiyoriy izoh" className={fieldCls} />
      </FormField>
    </ReferenceFormModal>
  )
}
