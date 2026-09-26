import { axiosAPI } from './axiosAPI'
import { fetchAllPages, fetchPage, unwrapData } from './apiHelpers'

// To'liq ro'yxat — Foydalanuvchi shakli/filtridagi rol tanlagichlari uchun.
export async function getAllRoles() {
  return fetchAllPages('accounts/roles/')
}

// "Rollar" ro'yxat jadvali uchun — bitta sahifani so'raydi (scroll pagination).
// `params`: { page, search }.
export async function getRolesPage(params) {
  return fetchPage('accounts/roles/', params)
}

export async function createRole(payload) {
  const response = await axiosAPI.post('accounts/roles/', payload)
  return unwrapData(response)
}

export async function updateRole(id, payload) {
  const response = await axiosAPI.patch(`accounts/roles/${id}/`, payload)
  return unwrapData(response)
}

export async function deleteRole(id) {
  await axiosAPI.delete(`accounts/roles/${id}/`)
}

export async function getRole(id) {
  const response = await axiosAPI.get(`accounts/roles/${id}/`)
  return unwrapData(response)
}

// Permission ro'yxati — guruhlangan lug'at yoki massiv ko'rinishida qaytadi.
export async function getAllPermissions() {
  const response = await axiosAPI.get('accounts/permissions/')
  return unwrapData(response)
}

