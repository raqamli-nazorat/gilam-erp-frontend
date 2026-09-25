import { createReferenceApi } from './referenceService'

// Valyutalar — backend "finance/currencies/" ({ name, short_name }).
export const currencyApi = createReferenceApi('finance/currencies/')

// Hisoblash va ushlab qolish turlari — backend "finance/accrual-retentions/"
// ({ name, type: percent | fix_summa, currency, value }).
export const accrualRetentionApi = createReferenceApi('finance/accrual-retentions/')

// Kontragentlar — backend "finance/counterparties/" ({ name, phone_number, type }).
export const counterpartyApi = createReferenceApi('finance/counterparties/')
