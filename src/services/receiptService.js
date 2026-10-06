import { fetchAllPages, fetchPage } from './apiHelpers'
import { productPartyApi } from './productPartyService'

// Tovarlar kirimi uchun backend chaqiruvlari.
// DIQQAT: backendda kirim HUJJATI uchun endpoint yo'q (faqat catalog/product-parties/) —
// shuning uchun hujjatning o'zi (jurnal, holat, tasdiqlash) Redux + localStorage'da saqlanadi,
// partiyalar esa haqiqiy API orqali yaratiladi, tahrirlanadi va o'chiriladi.

function normalize(value) {
  return String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ')
}

// Qator uchun partiya (rulon) nomi — backend `name` maydoni 100 belgigacha.
export function rollName(row) {
  const m2 = Number(row.m2 || 0)
  return [row.quality, row.design, m2 ? m2.toFixed(0) : '', row.shape].filter(Boolean).join(' ').slice(0, 100)
}

let partySeq = 0
// "Avtomatik" raqamlash — 7 xonali, bir partiya ichida ketma-ket.
function autoPartyNumber() {
  partySeq += 1
  return String(1000000 + ((Math.floor(Date.now() / 1000) + partySeq) % 9000000))
}

// Qatorni partiya yaratish uchun tekshiradi — xato matnini qaytaradi yoki null.
export function validateRowForParty(row) {
  if (!row.qualityId) return 'Sifat tanlanmagan'
  if (!row.colorId) return 'Rang tanlanmagan'
  if (!(Number(row.m2) > 0)) return "O'lcham kiritilmagan"
  return null
}

// Har bir qator uchun "catalog/product-parties/" ga alohida POST yuboradi.
// Natija: [{ rowId, ok, partiya?, partyId?, error? }] — qisman muvaffaqiyat ham qaytariladi.
export async function createPartiesForRows(rows, { branchId, unitId, warehouseName, receiptNumber }) {
  const results = []
  for (const row of rows) {
    const invalid = validateRowForParty(row)
    if (invalid) {
      results.push({ rowId: row.id, ok: false, error: invalid })
      continue
    }
    const partyNumber = row.partiya?.trim() || autoPartyNumber()
    const payload = {
      branch: branchId,
      unit: unitId,
      ...partyFields(row, { partyNumber, warehouseName, receiptNumber }),
      is_runner: false,
    }
    try {
      const created = await productPartyApi.create(payload)
      results.push({
        rowId: row.id,
        ok: true,
        partyId: created?.id ?? null,
        partiya: created?.party_number || created?.barcode || partyNumber,
      })
    } catch (error) {
      results.push({ rowId: row.id, ok: false, error })
    }
  }
  return results
}

// Qatordan partiyaning tahrirlanadigan maydonlari (yaratish va PATCH uchun umumiy)
function partyFields(row, { partyNumber, warehouseName, receiptNumber }) {
  return {
    quality: row.qualityId,
    color: row.colorId,
    design: row.designId || null,
    party_number: partyNumber,
    barcode: partyNumber,
    name: rollName(row),
    description: `${receiptNumber} · ${warehouseName} · ${row.widthM} × ${row.heightM} m = ${row.m2} m²`,
    price_per_sqm_purchase: Number(row.priceIn || 0).toFixed(2),
    price_per_sqm_sale: Number(row.priceSale || 0).toFixed(2),
  }
}

// Partiyasi yaratilgan qator tahrirlanganda — backenddagi partiya ham yangilanadi (PATCH).
export async function updatePartyFromRow(row, { warehouseName, receiptNumber }) {
  const invalid = validateRowForParty(row)
  if (invalid) throw new Error(invalid)
  return productPartyApi.update(
    row.partyId,
    partyFields(row, { partyNumber: row.partiya, warehouseName, receiptNumber })
  )
}

// Partiyalarni ketma-ket o'chiradi; birinchi rad etilganda to'xtaydi (qolganlari tegilmaydi).
// 404 — partiya allaqachon o'chirilgan, muvaffaqiyat deb hisoblanadi.
export async function removeParties(partyIds) {
  const removed = []
  for (const id of partyIds) {
    try {
      await productPartyApi.remove(id)
      removed.push(id)
    } catch (error) {
      if (error?.response?.status === 404) {
        removed.push(id)
        continue
      }
      return { removed, failed: error }
    }
  }
  return { removed, failed: null }
}

// Excel'dagi nomlarni (sifat, rang, dizayn) backend ID'lariga moslaydi.
export async function loadCatalogLookup() {
  const [qualities, colors, designs] = await Promise.all([
    fetchAllPages('catalog/qualities/'),
    fetchAllPages('catalog/colors/'),
    fetchAllPages('catalog/designs/'),
  ])
  const byName = (list) => new Map(list.map((x) => [normalize(x.name), x]))
  return {
    qualities: byName(qualities),
    colors: byName(colors),
    designs,
    findDesign(name, qualityId) {
      const key = normalize(name)
      if (!key) return null
      const same = designs.filter((d) => normalize(d.name) === key)
      return same.find((d) => d.quality_info?.id === qualityId) ?? same[0] ?? null
    },
  }
}

export function resolveRowIds(row, lookup) {
  const quality = lookup.qualities.get(normalize(row.quality))
  const color = lookup.colors.get(normalize(row.color))
  const design = lookup.findDesign(row.design, quality?.id)
  return {
    ...row,
    qualityId: quality?.id ?? '',
    colorId: color?.id ?? '',
    designId: design?.id ?? '',
  }
}

// "Narxlarni Exceldan olish" o'chirilganda — sifat bo'yicha eng so'nggi partiya narxi.
export async function latestPricesByQuality(qualityIds) {
  const unique = [...new Set(qualityIds.filter(Boolean))]
  const entries = await Promise.all(
    unique.map(async (quality) => {
      try {
        const res = await fetchPage('catalog/product-parties/', { quality, ordering: '-created_at', page: 1 })
        const last = res.results[0]
        if (!last) return [quality, null]
        return [quality, { priceIn: Number(last.price_per_sqm_purchase) || 0, priceSale: Number(last.price_per_sqm_sale) || 0 }]
      } catch {
        return [quality, null]
      }
    })
  )
  return new Map(entries)
}
