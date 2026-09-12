import { axiosAPI } from './axiosAPI'
import { fetchAllPages, unwrapData } from './apiHelpers'

// Barcha filiallarni (barcha sahifalarni yig'ib) qaytaradi.
export async function getAllBranches() {
  return fetchAllPages('organization/branches/')
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
