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
export async function cancelCalculatingSalary(id, payload = {}) {
  const response = await axiosAPI.post(`hr/calculating-salaries/${id}/cancel/`, payload)
  return unwrapData(response)
}

// Filial va oy bo'yicha ishlayotgan xodimlar oyligini avtomatik hisoblash
// payload: { branch: uuid, for_month: 1-12, year?: 2000-2100 }
export async function calculateSalaries(payload) {
  const response = await axiosAPI.post('hr/calculating-salaries/calculate/', payload)
  return unwrapData(response)
}
