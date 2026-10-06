import { axiosAPI } from './axiosAPI'
import { fetchAllPages, unwrapData } from './apiHelpers'
import { latestPricesByQuality } from './receiptService'
import { currentPrices, priceFor, round2 } from '@/features/rejaNarx/rejaNarxData'

// «To'ldirish»: sifatlar backenddan (catalog/qualities/) olinadi. Eski (amaldagi) narx —
// so'nggi tasdiqlangan narx hujjatidan; u yo'q bo'lsa — shu sifatdagi eng so'nggi partiya
// narxidan (catalog/product-parties/?quality=). Yangi narx boshida eskisiga teng.
export async function buildPriceRows({ scopeId, docs, excludeId }) {
  const qualities = scopeId
    ? [unwrapData(await axiosAPI.get(`catalog/qualities/${scopeId}/`))]
    : await fetchAllPages('catalog/qualities/', { ordering: 'name' })

  const current = currentPrices(docs, { excludeId })
  const missing = qualities.filter((q) => !priceFor(current, { qualityId: q.id, quality: q.name }))
  const fromParties = missing.length ? await latestPricesByQuality(missing.map((q) => q.id)) : new Map()

  return qualities.map((q) => {
    const known = priceFor(current, { qualityId: q.id, quality: q.name })
    const party = fromParties.get(q.id)
    const cost = round2(known?.cost ?? party?.priceIn ?? 0)
    const sale = round2(known?.sale ?? party?.priceSale ?? 0)
    return { qualityId: q.id, quality: q.name, oldCost: cost, oldSale: sale, cost, sale }
  })
}
