import { fetchAllPages, fetchPage } from '@/services/apiHelpers'

// Davlat/Viloyat jadvallaridagi "N ta viloyat / N ta tuman" hisoblagichlari. Backend Country/Region
// obyektlarida bu sonlar yo'q — oldin buning uchun BARCHA tumanlar (districts?page=1..N) yuklanardi.
// Endi har bir qator uchun faqat bitta, 1-sahifa so'rovi yuboriladi va DRF javobidagi `count`
// olinadi. Natijalar kesh'lanadi (sahifalar orasida o'tganda qayta so'ralmaydi); viloyat/tuman
// qo'shilgan/o'chirilganda clearGeoCounts() chaqiriladi.
const cache = new Map()

function cached(key, fn) {
  if (!cache.has(key)) {
    cache.set(
      key,
      fn().catch((err) => {
        cache.delete(key)
        throw err
      })
    )
  }
  return cache.get(key)
}

export function clearGeoCounts() {
  cache.clear()
}

export function countRegionsOfCountry(countryId) {
  return cached(`regions:${countryId}`, () =>
    fetchPage('organization/regions/', { country: countryId, page: 1 }).then((r) => r.count)
  )
}

export function countDistrictsOfRegion(regionId) {
  return cached(`districts:${regionId}`, () =>
    fetchPage('organization/districts/', { region: regionId, page: 1 }).then((r) => r.count)
  )
}

// Tumanlarni davlat bo'yicha filtrlash parametri backendda yo'q — davlatning viloyatlari
// (odatda 1 sahifa) olinib, har biri uchun viloyat hisoblagichi (keshdan) ketma-ket yig'iladi.
export function countDistrictsOfCountry(countryId) {
  return cached(`countryDistricts:${countryId}`, async () => {
    const regions = await fetchAllPages('organization/regions/', { country: countryId })
    let sum = 0
    for (const r of regions) sum += await countDistrictsOfRegion(r.id)
    return sum
  })
}
