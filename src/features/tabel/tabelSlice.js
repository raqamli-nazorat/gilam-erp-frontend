import { createSlice } from '@reduxjs/toolkit'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { BRANCHES, buildSheet, seedTabels } from './tabelData'

const initialState = { items: seedTabels() }

// Bir filial + oy uchun faqat bitta amaldagi (bekor qilinmagan) tabel bo'lishi mumkin
export function findDuplicate(items, { branchId, year, month }, exceptId) {
  return items.find(
    (t) => t.id !== exceptId && t.status !== 'cancelled' && t.branchId === branchId && t.year === year && t.month === month
  )
}

const tabelSlice = createSlice({
  name: 'tabel',
  initialState,
  reducers: {
    tabelCreated: {
      reducer(state, action) {
        state.items.unshift(action.payload)
      },
      prepare({ date, orgId, branchId, year, month }) {
        const now = Date.now()
        return {
          payload: {
            id: String(now),
            orgId,
            branchId,
            year,
            month,
            employeeCount: BRANCHES.find((b) => b.id === branchId)?.staff ?? 0,
            date,
            createdAt: now,
            updatedAt: now,
            status: 'draft',
            overrides: {},
          },
        }
      },
    },
    // Qoralama tabelning sarlavha maydonlari (tashkilot / filial / oy)
    tabelHeaderChanged(state, action) {
      const { id, patch } = action.payload
      const t = state.items.find((x) => x.id === id)
      if (!t || t.status !== 'draft') return
      Object.assign(t, patch)
      if (patch.orgId && !BRANCHES.some((b) => b.id === t.branchId && b.orgId === t.orgId)) {
        t.branchId = BRANCHES.find((b) => b.orgId === t.orgId)?.id ?? ''
      }
      if (patch.orgId || patch.branchId) {
        t.employeeCount = BRANCHES.find((b) => b.id === t.branchId)?.staff ?? 0
        t.overrides = {}
      }
      if (patch.year != null || patch.month != null) t.overrides = {}
      t.updatedAt = Date.now()
    },
    dayUpdated(state, action) {
      const { id, empId, day, entry } = action.payload
      const t = state.items.find((x) => x.id === id)
      if (!t || t.status !== 'draft') return
      t.overrides[empId] = { ...t.overrides[empId], [day]: entry }
      t.updatedAt = Date.now()
    },
    // "Saqlash" — sahifada yig'ilgan (saqlanmagan) kunlik o'zgarishlar bir yo'la yoziladi
    overridesSaved(state, action) {
      const { id, overrides } = action.payload
      const t = state.items.find((x) => x.id === id)
      if (!t || t.status !== 'draft') return
      Object.entries(overrides).forEach(([empId, byDay]) => {
        t.overrides[empId] = { ...t.overrides[empId], ...byDay }
      })
      t.updatedAt = Date.now()
    },
    // "Yangilash" — davomat platformasidan qayta olinadi: qo'lda kiritilgan o'zgarishlar tozalanadi
    tabelSynced(state, action) {
      const t = state.items.find((x) => x.id === action.payload)
      if (!t || t.status !== 'draft') return
      t.overrides = {}
      t.updatedAt = Date.now()
    },
    statusChanged(state, action) {
      const { id, status, reason, documentName } = action.payload
      const t = state.items.find((x) => x.id === id)
      if (!t) return
      t.status = status
      t.updatedAt = Date.now()
      if (status === 'confirmed') t.confirmedAt = t.updatedAt
      if (status === 'cancelled') {
        t.cancelReason = reason ?? ''
        t.cancelDocument = documentName ?? null
      }
    },
  },
})

export const { tabelCreated, tabelHeaderChanged, dayUpdated, overridesSaved, tabelSynced, statusChanged } = tabelSlice.actions
export default tabelSlice.reducer

// Bitta tabel + uning to'liq hisobi (kunlar, xodimlar, jamlar)
export function useTabel(id) {
  const tabel = useSelector((s) => s.tabel.items.find((t) => t.id === id))
  const sheet = useMemo(() => (tabel ? buildSheet(tabel) : null), [tabel])
  return { tabel, sheet }
}

// Ro'yxat uchun: har bir tabelning plan/fakt jamlari. Tabel obyekti o'zgarmasa — kesh qayta ishlatiladi.
const summaryCache = new WeakMap()
export function tabelSummary(tabel) {
  let s = summaryCache.get(tabel)
  if (!s) {
    const { plan, fakt } = buildSheet(tabel)
    s = { plan, fakt }
    summaryCache.set(tabel, s)
  }
  return s
}
