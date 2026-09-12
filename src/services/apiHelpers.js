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

export function extractErrorMessage(error, fallback) {
  const data = error?.response?.data
  return data?.error?.errorMsg || data?.detail || data?.message || error?.message || fallback
}
