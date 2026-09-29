import { axiosAPI } from './axiosAPI'
import { fetchAllPages, fetchPage, unwrapData } from './apiHelpers'

/**
 * Xodimlar oylik hisobi (CalculatingSalary) API xizmati
 * Backend endpoint: /api/v1/hr/calculating-salaries/
 */

// Barcha sahifalarni yig'ib olish
export async function getAllCalculatingSalaries(params = {}) {
  return fetchAllPages('hr/calculating-salaries/', params)
}

// Sahifalangan ro'yxatni olish
// params: { branch, currency, employee, end_date, for_month, ordering, page, search, start_date, status }
export async function getCalculatingSalariesPage(params = {}) {
  return fetchPage('hr/calculating-salaries/', params)
}

// Bitta oylik hisobini olish
export async function getCalculatingSalary(id) {
  const response = await axiosAPI.get(`hr/calculating-salaries/${id}/`)
  return unwrapData(response)
}

// Yangi oylik hisobini yaratish (bitta qator)
export async function createCalculatingSalary(payload) {
  const response = await axiosAPI.post('hr/calculating-salaries/', payload)
  return unwrapData(response)
}

// Oylik hisobini qisman yangilash
export async function patchCalculatingSalary(id, payload) {
  const response = await axiosAPI.patch(`hr/calculating-salaries/${id}/`, payload)
  return unwrapData(response)
}

// Oylik hisobini to'liq yangilash
export async function updateCalculatingSalary(id, payload) {
  const response = await axiosAPI.put(`hr/calculating-salaries/${id}/`, payload)
  return unwrapData(response)
}

// Oylik hisobini o'chirish
export async function deleteCalculatingSalary(id) {
  const response = await axiosAPI.delete(`hr/calculating-salaries/${id}/`)
  return unwrapData(response)
}

// Qoralama oylikni tasdiqlash
export async function approveCalculatingSalary(id) {
  const response = await axiosAPI.post(`hr/calculating-salaries/${id}/approve/`, {})
  return unwrapData(response)
}

// Oylikni bekor qilish
// payload: { reason: string, attachment?: File, file?: File } yoki FormData
export async function cancelCalculatingSalary(id, payload = {}) {
  let body = payload
  if (payload instanceof FormData) {
    body = payload
  } else if (payload && typeof payload === 'object') {
    const formData = new FormData()
    if (payload.reason) formData.append('reason', payload.reason)
    const file = payload.attachment || payload.file
    if (file) formData.append('attachment', file)
    body = formData
  }
  const response = await axiosAPI.post(`hr/calculating-salaries/${id}/cancel/`, body)
  return unwrapData(response)
}

// Filial va oy bo'yicha ishlayotgan xodimlar oyligini avtomatik hisoblash
// payload: { branch: uuid, for_month: 1-12, year?: 2000-2100 }
export async function calculateSalaries(payload) {
  const response = await axiosAPI.post('hr/calculating-salaries/calculate/', payload)
  return unwrapData(response)
}

// Tab hisoblagichlari (barchasi, tasdiqlangan, qoralama, bekor qilingan)
// Backend endpoint: /api/v1/hr/calculating-salaries/count/
export async function getCalculatingSalaryCounts() {
  try {
    const response = await axiosAPI.get('hr/calculating-salaries/count/')
    const data = unwrapData(response)
    return {
      all: data?.all ?? 0,
      confirmed: data?.approved ?? data?.confirmed ?? 0,
      approved: data?.approved ?? data?.confirmed ?? 0,
      draft: data?.draft ?? 0,
      cancelled: data?.cancelled ?? 0,
    }
  } catch {
    return { all: 0, confirmed: 0, approved: 0, draft: 0, cancelled: 0 }
  }
}
