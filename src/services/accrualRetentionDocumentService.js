import { axiosAPI } from './axiosAPI'
import { fetchAllPages, fetchPage, unwrapData } from './apiHelpers'

/**
 * Qo'shimcha va ushlanma hujjatlari (AccrualRetentionDocument) API xizmati
 * Backend endpoint: /api/v1/finance/accrual-retention-documents/
 */

// Barcha sahifalarni yig'ib olish
export async function getAllAccrualRetentionDocuments(params = {}) {
  return fetchAllPages('finance/accrual-retention-documents/', params)
}

// Sahifalangan ro'yxatni olish
// params: { accrual_retention, branch, date_from, date_to, employee, is_retention, ordering, page, search, status }
export async function getAccrualRetentionDocumentsPage(params = {}) {
  return fetchPage('finance/accrual-retention-documents/', params)
}

// Bitta hujjatni ID orqali olish
export async function getAccrualRetentionDocument(id) {
  const response = await axiosAPI.get(`finance/accrual-retention-documents/${id}/`)
  return unwrapData(response)
}

// Yangi hujjat yaratish
// payload: { branch, employee, accrual_retention, date }
export async function createAccrualRetentionDocument(payload) {
  const response = await axiosAPI.post('finance/accrual-retention-documents/', payload)
  return unwrapData(response)
}

// Hujjatni qisman yangilash
export async function patchAccrualRetentionDocument(id, payload) {
  const response = await axiosAPI.patch(`finance/accrual-retention-documents/${id}/`, payload)
  return unwrapData(response)
}

// Hujjatni to'liq yangilash
export async function updateAccrualRetentionDocument(id, payload) {
  const response = await axiosAPI.put(`finance/accrual-retention-documents/${id}/`, payload)
  return unwrapData(response)
}

// Hujjatni o'chirish
export async function deleteAccrualRetentionDocument(id) {
  const response = await axiosAPI.delete(`finance/accrual-retention-documents/${id}/`)
  return unwrapData(response)
}

// Qoralama hujjatni tasdiqlash
export async function approveAccrualRetentionDocument(id) {
  const response = await axiosAPI.post(`finance/accrual-retention-documents/${id}/approve/`, {})
  return unwrapData(response)
}

// Hujjatni bekor qilish
// payload: { reason: string, attachment?: File, file?: File } yoki FormData
export async function cancelAccrualRetentionDocument(id, payload = {}) {
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
  const response = await axiosAPI.post(`finance/accrual-retention-documents/${id}/cancel/`, body)
  return unwrapData(response)
}

// Bir nechta xodimga ommaviy yaratish
// payload: { branch, accrual_retention, date, employees: [uuid] }
export async function bulkCreateAccrualRetentionDocuments(payload) {
  const response = await axiosAPI.post('finance/accrual-retention-documents/bulk-create/', payload)
  return unwrapData(response)
}

// Tab hisoblagichlari (barchasi, tasdiqlangan, qoralama, bekor qilingan)
// Backend endpoint: /api/v1/finance/accrual-retention-documents/count/
export async function getAccrualRetentionDocumentCounts() {
  try {
    const response = await axiosAPI.get('finance/accrual-retention-documents/count/')
    const data = unwrapData(response)
    return {
      all: data?.all ?? 0,
      approved: data?.approved ?? 0,
      draft: data?.draft ?? 0,
      cancelled: data?.cancelled ?? 0,
    }
  } catch {
    return { all: 0, approved: 0, draft: 0, cancelled: 0 }
  }
}

