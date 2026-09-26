import { fetchPage } from './apiHelpers'

// PagedSelect (scroll pagination'li tanlash ro'yxati) uchun variant manbalari — har biri
// bitta sahifani so'raydi va { results: [{ id, name, ... }], next } qaytaradi.
function source(url, toOption = (r) => ({ id: r.id, name: r.name ?? '' })) {
  return (params) => fetchPage(url, params).then((res) => ({ ...res, results: res.results.map(toOption) }))
}

export const organizationOptions = source('organization/organizations/')

export const branchOptions = async (params = {}) => {
  const cleanParams = {}
  for (const [k, v] of Object.entries(params || {})) {
    if (v !== '' && v !== null && v !== undefined) cleanParams[k] = v
  }
  const orgFilter = cleanParams.organization || cleanParams.organization_id || cleanParams.orgId

  // Backendga organization parametri bilan so'rov yuboriladi
  const res = await fetchPage('organization/branches/', cleanParams)
  let list = res.results || []

  // Agar tashkilot filtri berilgan bo'lsa, faqat shu tashkilotga tegishli filiallar olinadi
  if (orgFilter) {
    const orgStr = String(orgFilter)
    list = list.filter((r) => {
      const bOrg = r.organization ?? r.organization_info?.id ?? r.organization_id ?? r.orgId
      return bOrg ? String(bOrg) === orgStr : true
    })
  }

  return {
    ...res,
    results: list.map((r) => ({
      id: r.id,
      name: r.name ?? '',
      orgId: r.organization ?? r.organization_info?.id ?? '',
    })),
  }
}

export const employeeOptions = async (params = {}) => {
  const cleanParams = {}
  for (const [k, v] of Object.entries(params || {})) {
    if (v !== '' && v !== null && v !== undefined) cleanParams[k] = v
  }
  const branchFilter = cleanParams.branch || cleanParams.branch_id

  const res = await fetchPage('hr/employees/', cleanParams)
  let list = res.results || []

  if (branchFilter) {
    const bStr = String(branchFilter)
    list = list.filter((r) => {
      const empBranch = r.branch ?? r.branch_info?.id ?? r.branch_id
      return empBranch ? String(empBranch) === bStr : true
    })
  }

  return {
    ...res,
    results: list.map((r) => ({
      id: r.id,
      name: r.full_name || r.name || `${r.first_name || ''} ${r.last_name || ''}`.trim() || '',
    })),
  }
}
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

// Hisoblash va ushlab qolish turlari — PagedSelect uchun
export const accrualRetentionOptions = source('finance/accrual-retentions/', (r) => ({
  id: r.id,
  name: r.name ?? '',
  type: r.type,
  is_retention: r.is_retention,
  value: r.value,
  currency: r.currency,
  currency_info: r.currency_info,
}))


// Oylar (1-12) — PagedSelect uchun
export async function monthOptions(params = {}) {
  const months = [
    { id: '1', name: 'Yanvar' },
    { id: '2', name: 'Fevral' },
    { id: '3', name: 'Mart' },
    { id: '4', name: 'Aprel' },
    { id: '5', name: 'May' },
    { id: '6', name: 'Iyun' },
    { id: '7', name: 'Iyul' },
    { id: '8', name: 'Avgust' },
    { id: '9', name: 'Sentabr' },
    { id: '10', name: 'Oktabr' },
    { id: '11', name: 'Noyabr' },
    { id: '12', name: 'Dekabr' },
  ]
  const q = (params?.search || '').trim().toLowerCase()
  const results = q ? months.filter((m) => m.name.toLowerCase().includes(q)) : months
  return { results, count: results.length, next: null }
}

