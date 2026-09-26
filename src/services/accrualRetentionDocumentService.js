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
export async function cancelAccrualRetentionDocument(id, payload = {}) {
  const response = await axiosAPI.post(`finance/accrual-retention-documents/${id}/cancel/`, payload)
  return unwrapData(response)
}

// Bir nechta xodimga ommaviy yaratish
// payload: { branch, accrual_retention, date, employees: [uuid] }
export async function bulkCreateAccrualRetentionDocuments(payload) {
  const response = await axiosAPI.post('finance/accrual-retention-documents/bulk-create/', payload)
  return unwrapData(response)
}

// Tab hisoblagichlari (barchasi, tasdiqlangan, qoralama, bekor qilingan)
export async function getAccrualRetentionDocumentCounts() {
  try {
    const [allRes, approvedRes, draftRes, cancelledRes] = await Promise.all([
      getAccrualRetentionDocumentsPage({ page_size: 1 }),
      getAccrualRetentionDocumentsPage({ status: 'approved', page_size: 1 }),
      getAccrualRetentionDocumentsPage({ status: 'draft', page_size: 1 }),
      getAccrualRetentionDocumentsPage({ status: 'cancelled', page_size: 1 }),
    ])
    return {
      all: allRes?.count ?? 0,
      approved: approvedRes?.count ?? 0,
      draft: draftRes?.count ?? 0,
      cancelled: cancelledRes?.count ?? 0,
    }
  } catch {
    return { all: 0, approved: 0, draft: 0, cancelled: 0 }
  }
}

