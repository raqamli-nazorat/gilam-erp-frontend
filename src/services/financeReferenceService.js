import { createReferenceApi } from './referenceService'
import { axiosAPI } from './axiosAPI'
import { unwrapData } from './apiHelpers'

// Valyutalar — backend "finance/currencies/" ({ name, short_name }).
const baseCurrencyApi = createReferenceApi('finance/currencies/')
export const currencyApi = {
  ...baseCurrencyApi,
  async getAvailable(params = {}) {
    const response = await axiosAPI.get('finance/currencies/available/', { params })
    return unwrapData(response)
  },
}

// Kurslar (CurrencyLedger) — backend "finance/currency-ledgers/" ({ currency, day, value }).
const baseCurrencyLedgerApi = createReferenceApi('finance/currency-ledgers/')
export const currencyLedgerApi = {
  ...baseCurrencyLedgerApi,
  async sync() {
    const response = await axiosAPI.post('finance/currency-ledgers/sync/', {})
    return unwrapData(response)
  },
}

// Hisoblash va ushlab qolish turlari — backend "finance/accrual-retentions/"
// ({ name, type: percent | fix_summa, currency, value }).
export const accrualRetentionApi = createReferenceApi('finance/accrual-retentions/')

// Kontragentlar — backend "finance/counterparties/" ({ name, phone_number, type }).
export const counterpartyApi = createReferenceApi('finance/counterparties/')
