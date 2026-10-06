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

// Valyutaning eng so'nggi kursi (masalan USD → UZS). Topilmasa null.
export async function fetchLatestRate(shortName = 'USD') {
  const response = await axiosAPI.get('finance/currency-ledgers/', {
    params: { short_name: shortName, ordering: '-day', page: 1 },
  })
  const payload = unwrapData(response)
  const list = Array.isArray(payload) ? payload : payload?.results ?? []
  const match = list.find((r) => r.currency_info?.short_name === shortName) ?? list[0]
  const value = Number(match?.value)
  return Number.isFinite(value) && value > 0 ? value : null
}

// Hisoblash va ushlab qolish turlari — backend "finance/accrual-retentions/"
// ({ name, type: percent | fix_summa, currency, value }).
export const accrualRetentionApi = createReferenceApi('finance/accrual-retentions/')

// Kontragentlar — backend "finance/counterparties/" ({ name, phone_number, type }).
export const counterpartyApi = createReferenceApi('finance/counterparties/')
