import { axiosAPI } from './axiosAPI'
import { fetchAllPages, fetchPage, unwrapData } from './apiHelpers'

// Sifat, O'lchov birligi, Rang, Lavozim, Kontragent turi kabi "nomi (+ tavsif)" shaklidagi
// oddiy ma'lumotnomalar uchun umumiy CRUD chaqiruvlari — barchasi bir xil REST shaklga ega.
export function createReferenceApi(basePath) {
  return {
    async list() {
      return fetchAllPages(basePath)
    },
    // Ro'yxat jadvali uchun — bitta sahifani so'raydi (scroll pagination). `params`: { page, search }.
    async page(params) {
      return fetchPage(basePath, params)
    },
    async create(payload) {
      const response = await axiosAPI.post(basePath, payload)
      return unwrapData(response)
    },
    async update(id, payload) {
      const response = await axiosAPI.patch(`${basePath}${id}/`, payload)
      return unwrapData(response)
    },
    async remove(id) {
      await axiosAPI.delete(`${basePath}${id}/`)
    },
  }
}
