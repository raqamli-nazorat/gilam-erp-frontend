import { axiosAPI } from './axiosAPI'
import { fetchAllPages, unwrapData } from './apiHelpers'

// Barcha tashkilotlarni (barcha sahifalarni yig'ib) qaytaradi.
export async function getAllOrganizations() {
  return fetchAllPages('organization/organizations/')
}

export async function getOrganization(id) {
  const response = await axiosAPI.get(`organization/organizations/${id}/`)
  return unwrapData(response)
}

export async function createOrganization(payload) {
  const response = await axiosAPI.post('organization/organizations/', payload)
  return unwrapData(response)
}

export async function updateOrganization(id, payload) {
  const response = await axiosAPI.patch(`organization/organizations/${id}/`, payload)
  return unwrapData(response)
}

// Backend "reason" maydon nomini hujjatlashtirmagan (auto-generated schema bo'sh PatchedOrganizationRequest
// ko'rsatadi) — shuning uchun eng ehtimolli nomlarni birga yuboramiz, backend keragini o'qiydi, qolganini e'tiborsiz qoldiradi.
export async function suspendOrganization(id, reason) {
  const response = await axiosAPI.patch(`organization/organizations/${id}/suspend/`, {
    reason,
    suspension_reason: reason,
  })
  return unwrapData(response)
}

export async function activateOrganization(id) {
  const response = await axiosAPI.patch(`organization/organizations/${id}/activate/`, {})
  return unwrapData(response)
}

// Bitta tashkilotga tegishli filiallarni (barcha sahifalarni yig'ib) qaytaradi.
export async function getBranchesByOrganization(organizationId) {
  return fetchAllPages('organization/branches/', { organization: organizationId })
}
