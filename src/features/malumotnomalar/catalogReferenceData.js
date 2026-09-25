import { formatDateTime } from '@/lib/format'

function mapMeta(raw) {
  return {
    yaratilgan: raw.created_at ? formatDateTime(new Date(raw.created_at)) : '',
    ozgartirilgan: raw.updated_at ? formatDateTime(new Date(raw.updated_at)) : '',
  }
}

// ── Dizaynlar ──
export function mapDesign(raw) {
  return {
    id: raw.id,
    name: raw.name ?? '',
    sifatId: raw.quality_info?.id ?? '',
    sifat: raw.quality_info?.name ?? '',
    ...mapMeta(raw),
  }
}

export function buildDesignPayload(draft) {
  return { name: draft.name.trim(), quality: draft.sifatId }
}

// ── Omborlar ──
export function mapWarehouse(raw) {
  return {
    id: raw.id,
    name: raw.name ?? '',
    filialId: raw.branch_info?.id ?? '',
    filial: raw.branch_info?.name ?? '',
    manzil: raw.address ?? '',
    ...mapMeta(raw),
  }
}

export function buildWarehousePayload(draft) {
  return { name: draft.name.trim(), branch: draft.filialId, address: draft.manzil.trim() }
}
