import { axiosAPI } from './axiosAPI'
import { fetchAllPages, unwrapData } from './apiHelpers'

// Barcha xodimlarni (shaxs profillari) qaytaradi.
export async function getAllEmployees() {
  return fetchAllPages('hr/employees/')
}

export async function getEmployee(id) {
  const response = await axiosAPI.get(`hr/employees/${id}/`)
  return unwrapData(response)
}

export async function createEmployee(payload) {
  const response = await axiosAPI.post('hr/employees/', payload)
  return unwrapData(response)
}

export async function updateEmployee(id, payload) {
  const response = await axiosAPI.patch(`hr/employees/${id}/`, payload)
  return unwrapData(response)
}

export async function deleteEmployee(id) {
  await axiosAPI.delete(`hr/employees/${id}/`)
}
