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
