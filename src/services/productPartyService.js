import { createReferenceApi } from './referenceService'

// Mahsulot partiyalari — backend "catalog/product-parties/" (list/create/patch/delete).
// `page(params)`: { page, search, name, start_date, end_date } — scroll pagination uchun.
export const productPartyApi = createReferenceApi('catalog/product-parties/')
