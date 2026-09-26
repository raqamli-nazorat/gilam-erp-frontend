import { axiosAPI } from './axiosAPI'

// Backend ba'zi endpointlarda javobni {data, error, success} ko'rinishida o'raydi,
// ba'zilarida esa DRF javobini to'g'ridan-to'g'ri qaytaradi — ikkalasini ham qo'llab-quvvatlaymiz.
export function unwrapData(response) {
  const payload = response?.data
  return payload?.data ?? payload
}

// DRF sahifalangan ro'yxatni (page/next/previous/results) to'liq yig'ib, bitta massiv qilib qaytaradi.
export async function fetchAllPages(url, params = {}) {
  let page = 1
  let all = []
  // Cheksiz aylanishning oldini olish uchun sahifalar soniga chegara
  for (let i = 0; i < 200; i += 1) {
    const response = await axiosAPI.get(url, { params: { ...params, page } })
    const payload = unwrapData(response)
    const results = Array.isArray(payload) ? payload : payload?.results ?? []
    all = all.concat(results)
    const hasNext = !Array.isArray(payload) && !!payload?.next
    if (!hasNext) break
    page += 1
  }
  return all
}

// Bitta sahifani so'raydi va DRF pagination meta'sini {results, count, next, previous}
// qaytaradi — "scroll pagination" uchun (fetchAllPages'dan farqli, HAR SAHIFANI emas,
// faqat kerakli bittasini so'raydi). Bo'sh/undefined parametrlarni so'rovga qo'shmaydi.
// Ba'zi endpointlar qo'shimcha `counts` (masalan holatlar bo'yicha sonlar) qaytaradi — u ham uzatiladi.
export async function fetchPage(url, params = {}) {
  const cleanParams = {}
  for (const [k, v] of Object.entries(params)) {
    if (v !== '' && v !== null && v !== undefined) cleanParams[k] = v
  }
  const response = await axiosAPI.get(url, { params: cleanParams })
  const payload = unwrapData(response)
  // `counts` o'ralgan (data ichida) yoki tashqi javobda (data yonida) kelishi mumkin.
  const counts = (!Array.isArray(payload) && payload?.counts) || response?.data?.counts || null
  if (Array.isArray(payload)) return { results: payload, count: payload.length, next: null, previous: null, counts }
  return {
    results: payload?.results ?? [],
    count: payload?.count ?? payload?.results?.length ?? 0,
    next: payload?.next ?? null,
    previous: payload?.previous ?? null,
    counts,
  }
}

export function extractErrorMessage(error, fallback) {
  const data = error?.response?.data
  const base = data?.error?.errorMsg || data?.detail || data?.message || error?.message || fallback
  // 400'da backend har bir maydon nomi bo'yicha aniq sabab qaytaradi (error.details), lekin
  // faqat umumiy errorMsg ko'rsatilsa bu ma'lumot yo'qolib ketardi — konsolni ochmasdan ham
  // aniq nima noto'g'ri ekanini ko'rsatish uchun toast xabariga qo'shib qo'yamiz.
  const details = data?.error?.details
  if (details && typeof details === 'object') {
    const parts = Object.entries(details).map(
      ([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`
    )
    if (parts.length) return `${base} (${parts.join('; ')})`
  }
  return base
}
