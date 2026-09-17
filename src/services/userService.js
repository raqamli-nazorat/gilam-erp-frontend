import { axiosAPI } from './axiosAPI'
import { fetchAllPages, fetchPage, unwrapData } from './apiHelpers'

// To'liq ro'yxat — Boshqaruv paneli va boshqa joylardagi foydalanuvchi tanlagichlari uchun.
export async function getAllUsers() {
  return fetchAllPages('accounts/users/')
}

// "Foydalanuvchilar" ro'yxat jadvali uchun — bitta sahifani so'raydi (scroll pagination).
// `params`: { page, search }.
export async function getUsersPage(params) {
  return fetchPage('accounts/users/', params)
}

export async function getUser(id) {
  const response = await axiosAPI.get(`accounts/users/${id}/`)
  return unwrapData(response)
}

export async function createUser(payload) {
  const response = await axiosAPI.post('accounts/users/', payload)
  return unwrapData(response)
}

export async function updateUser(id, payload) {
  const response = await axiosAPI.patch(`accounts/users/${id}/`, payload)
  return unwrapData(response)
}

// Backend "reason" maydon nomini hujjatlashtirmagan (auto-generated schema bo'sh PatchedUserRequest
// ko'rsatadi) — shuning uchun eng ehtimolli nomlarni birga yuboramiz (organizationService.js'dagi
// suspendOrganization bilan bir xil yondashuv).
export async function blockUser(id, reason) {
  const response = await axiosAPI.patch(`accounts/users/${id}/block/`, {
    reason,
    blocked_reason: reason,
  })
  return unwrapData(response)
}

export async function unblockUser(id) {
  const response = await axiosAPI.patch(`accounts/users/${id}/unblock/`, {})
  return unwrapData(response)
}
