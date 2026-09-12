import { axiosAPI } from './axiosAPI'
import { fetchAllPages, unwrapData } from './apiHelpers'

// Barcha viloyatlarni (barcha sahifalarni yig'ib) qaytaradi.
export async function getAllRegions() {
  return fetchAllPages('organization/regions/')
}

// Bitta viloyatga tegishli tumanlarni qaytaradi.
export async function getDistrictsByRegion(regionId) {
  if (!regionId) return []
  return fetchAllPages('organization/districts/', { region: regionId })
}

// Barcha tumanlarni (viloyatidan qat'i nazar) qaytaradi — "Tumanlar" boshqaruv jadvali uchun.
export async function getAllDistricts() {
  return fetchAllPages('organization/districts/')
}

export async function createRegion(payload) {
  const response = await axiosAPI.post('organization/regions/', payload)
  return unwrapData(response)
}

export async function updateRegion(id, payload) {
  const response = await axiosAPI.patch(`organization/regions/${id}/`, payload)
  return unwrapData(response)
}

export async function deleteRegion(id) {
  await axiosAPI.delete(`organization/regions/${id}/`)
}

export async function createDistrict(payload) {
  const response = await axiosAPI.post('organization/districts/', payload)
  return unwrapData(response)
}

export async function updateDistrict(id, payload) {
  const response = await axiosAPI.patch(`organization/districts/${id}/`, payload)
  return unwrapData(response)
}

export async function deleteDistrict(id) {
  await axiosAPI.delete(`organization/districts/${id}/`)
}
