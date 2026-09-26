import { fetchPage } from './apiHelpers'

// PagedSelect (scroll pagination'li tanlash ro'yxati) uchun variant manbalari — har biri
// bitta sahifani so'raydi va { results: [{ id, name, ... }], next } qaytaradi.
function source(url, toOption = (r) => ({ id: r.id, name: r.name ?? '' })) {
  return (params) => fetchPage(url, params).then((res) => ({ ...res, results: res.results.map(toOption) }))
}

export const branchOptions = source('organization/branches/')
export const positionOptions = source('hr/positions/')
export const qualityOptions = source('catalog/qualities/')
export const colorOptions = source('catalog/colors/')
export const unitOptions = source('catalog/units/')
export const counterpartyTypeOptions = source('finance/counterparty-types/')
// Valyuta — qisqa nomi bilan (UZS, USD ...).
export const currencyOptions = source('finance/currencies/', (r) => ({ id: r.id, name: r.short_name || r.name || '' }))
// Dizayn — sifati ham qaytadi (Partiya oynasida dizayn tanlanganda sifatni avtomatik qo'yish uchun).
export const designOptions = source('catalog/designs/', (r) => ({
  id: r.id,
  name: r.name ?? '',
  sifatId: r.quality_info?.id ?? '',
  sifat: r.quality_info?.name ?? '',
}))
