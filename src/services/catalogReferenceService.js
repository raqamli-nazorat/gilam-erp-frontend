import { createReferenceApi } from './referenceService'

// Dizaynlar — backend "catalog/designs/" ({ name, quality, description }).
export const designApi = createReferenceApi('catalog/designs/')

// Omborlar — backend "warehouse/warehouses/" ({ name, branch, address }).
export const warehouseApi = createReferenceApi('warehouse/warehouses/')
