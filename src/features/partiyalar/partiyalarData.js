import { formatDateTime } from '@/lib/format'

// Backend ProductParty -> jadval/modal qatori. FK'lar nested obyekt sifatida keladi
// (branch_info, quality_info, design_info, color_info, unit_info: {id, name}).
export function mapProductParty(raw) {
  return {
    id: raw.id,
    name: raw.name ?? '',
    partyNumber: raw.party_number ?? '',
    filialId: raw.branch_info?.id ?? '',
    filial: raw.branch_info?.name ?? '',
    sifatId: raw.quality_info?.id ?? '',
    sifat: raw.quality_info?.name ?? '',
    dizaynId: raw.design_info?.id ?? '',
    dizayn: raw.design_info?.name ?? '',
    rangId: raw.color_info?.id ?? '',
    rang: raw.color_info?.name ?? '',
    birlikId: raw.unit_info?.id ?? '',
    birlik: raw.unit_info?.name ?? '',
    tannarx: raw.price_per_sqm_purchase != null ? String(Number(raw.price_per_sqm_purchase)) : '',
    narx: raw.price_per_sqm_sale != null ? String(Number(raw.price_per_sqm_sale)) : '',
    barcode: raw.barcode ?? '',
    isRunner: !!raw.is_runner,
    tavsif: raw.description ?? '',
    yaratilgan: raw.created_at ? formatDateTime(new Date(raw.created_at)) : '',
    ozgartirilgan: raw.updated_at ? formatDateTime(new Date(raw.updated_at)) : '',
  }
}

export function buildProductPartyPayload(draft) {
  return {
    name: (draft.name ?? '').trim(),
    branch: draft.filialId,
    quality: draft.sifatId,
    design: draft.dizaynId,
    color: draft.rangId,
    unit: draft.birlikId,
    price_per_sqm_purchase: draft.tannarx || '0',
    price_per_sqm_sale: draft.narx || '0',
    barcode: draft.barcode?.trim() || null,
    is_runner: !!draft.isRunner,
    description: draft.tavsif ?? '',
  }
}

