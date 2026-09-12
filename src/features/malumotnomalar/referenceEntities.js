import { createReferenceSlice } from './referenceSlices'

// Har biri backend'da to'liq CRUD endpointiga ega oddiy ma'lumotnoma.
export const qualitySlice = createReferenceSlice('sifatlar', 'catalog/qualities/')
export const unitSlice = createReferenceSlice('birliklar', 'catalog/units/')
export const colorSlice = createReferenceSlice('ranglar', 'catalog/colors/')
export const positionSlice = createReferenceSlice('lavozimlar', 'hr/positions/')
export const counterpartyTypeSlice = createReferenceSlice('kontragentTurlari', 'finance/counterparty-types/')
export const countrySlice = createReferenceSlice('davlatlar', 'organization/countries/')

// MalumotnomaDetailPage: slug -> qaysi slice bilan ishlashi va so'rov qanday qurilishi kerakligi.
// hasDescription/hasColorHex — backend so'rov shaklida shu maydonlar yuborilishi kerakmi.
export const REFERENCE_API_REGISTRY = {
  sifatlar: { stateKey: 'sifatlar', slice: qualitySlice, hasDescription: true },
  ranglar: { stateKey: 'ranglar', slice: colorSlice, hasDescription: true, hasColorHex: true },
  'olchov-birliklari': { stateKey: 'birliklar', slice: unitSlice, hasDescription: true },
  lavozimlar: { stateKey: 'lavozimlar', slice: positionSlice, hasDescription: true },
  'kontragent-turlari': { stateKey: 'kontragentTurlari', slice: counterpartyTypeSlice, hasDescription: false },
}

export function buildReferencePayload(entry, draft) {
  const payload = { name: (draft.name ?? '').trim() }
  if (entry.hasDescription) payload.description = draft.tavsif ?? ''
  if (entry.hasColorHex) payload.color_hex = draft.hex ?? ''
  return payload
}
