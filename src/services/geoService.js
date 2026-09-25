import { axiosAPI } from './axiosAPI'
import { fetchAllPages, fetchPage, unwrapData } from './apiHelpers'

// Barcha viloyatlarni (barcha sahifalarni yig'ib) qaytaradi.
export async function getAllRegions() {
  return fetchAllPages('organization/regions/')
}

// Bitta viloyatga tegishli tumanlarni qaytaradi.
export async function getDistrictsByRegion(regionId) {
  if (!regionId) return []
  return fetchAllPages('organization/districts/', { region: regionId })
}

// Barcha tumanlarni (viloyatidan qat'i nazar) qaytaradi — Davlat/Viloyat sahifalaridagi
// "N ta tuman" hisoblagichi uchun to'liq ro'yxat kerak, shuning uchun bu funksiya saqlanadi.
export async function getAllDistricts() {
  return fetchAllPages('organization/districts/')
}

// "Tumanlar" boshqaruv jadvali uchun — bitta sahifani so'raydi (scroll pagination).
// `params`: { page, search }.
export async function getDistrictsPage(params) {
  return fetchPage('organization/districts/', params)
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

// "Viloyatlar" boshqaruv jadvali uchun — bitta sahifani so'raydi (scroll pagination).
// `params`: { page, search, country }.
export async function getRegionsPage(params) {
  return fetchPage('organization/regions/', params)
}
