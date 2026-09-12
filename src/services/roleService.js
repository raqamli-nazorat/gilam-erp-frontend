import { axiosAPI } from './axiosAPI'
import { fetchAllPages, unwrapData } from './apiHelpers'

export async function getAllRoles() {
  return fetchAllPages('accounts/roles/')
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

// Permission ro'yxati sahifalanmagan — bitta so'rovda to'liq massiv qaytadi.
export async function getAllPermissions() {
  const response = await axiosAPI.get('accounts/permissions/')
  const payload = unwrapData(response)
  return Array.isArray(payload) ? payload : payload?.results ?? []
}
