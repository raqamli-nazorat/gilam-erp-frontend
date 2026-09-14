import { axiosAPI } from './axiosAPI'
import { fetchAllPages, fetchPage, unwrapData } from './apiHelpers'

// Barcha filiallarni (barcha sahifalarni yig'ib) qaytaradi — Boshqaruv paneli va tashkilot
// tanlagichlarga bog'liq boshqa joylar uchun to'liq ro'yxat kerak, shuning uchun saqlanadi.
export async function getAllBranches() {
  return fetchAllPages('organization/branches/')
}

// "Filiallar" ro'yxat jadvali uchun — bitta sahifani so'raydi (scroll pagination).
// `params`: { page, search, is_closed }.
export async function getBranchesPage(params) {
  return fetchPage('organization/branches/', params)
}

export async function getBranch(id) {
  const response = await axiosAPI.get(`organization/branches/${id}/`)
  return unwrapData(response)
}

export async function createBranch(payload) {
  const response = await axiosAPI.post('organization/branches/', payload)
  return unwrapData(response)
}

export async function updateBranch(id, payload) {
  const response = await axiosAPI.patch(`organization/branches/${id}/`, payload)
  return unwrapData(response)
}

export async function closeBranch(id, reason) {
  const response = await axiosAPI.patch(`organization/branches/${id}/close/`, {
    reason,
    closing_reason: reason,
  })
  return unwrapData(response)
}

export async function openBranch(id) {
  const response = await axiosAPI.patch(`organization/branches/${id}/open/`, {})
  return unwrapData(response)
}
