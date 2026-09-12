import { axiosAPI } from './axiosAPI'
import { fetchAllPages, unwrapData } from './apiHelpers'

export async function getAllUsers() {
  return fetchAllPages('accounts/users/')
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
