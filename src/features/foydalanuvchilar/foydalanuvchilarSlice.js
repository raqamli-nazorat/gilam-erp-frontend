import { createSlice, nanoid } from '@reduxjs/toolkit'
import { formatDateTime } from '@/lib/format'
import { initialUsers, ROLE_DEFS } from './foydalanuvchilarData'

const ROLE_META = {
  Sotuvchi: { yaratilgan: '12.01.2024 09:14', ozgartirilgan: '03.09.2026 11:20', description: 'Savdo zalida sotish va mijozlarga xizmat' },
  Menejer: { yaratilgan: '12.01.2024 09:15', ozgartirilgan: '28.08.2026 16:41', description: 'Savdo jarayoni va mijozlar bazasini boshqarish' },
  Kassir: { yaratilgan: '12.01.2024 09:16', ozgartirilgan: '21.08.2026 10:05', description: 'Kassa operatsiyalari va to‘lovlarni qabul qilish' },
  Omborchi: { yaratilgan: '12.01.2024 09:17', ozgartirilgan: '14.08.2026 08:52', description: 'Ombor qoldig‘i, qabul va jo‘natish' },
  Direktor: { yaratilgan: '12.01.2024 09:18', ozgartirilgan: '02.09.2026 14:07', description: 'Filial boshqaruvi, to‘liq huquqlar' },
  Administrator: { yaratilgan: '12.01.2024 09:19', ozgartirilgan: '01.09.2026 09:33', description: 'Tizim sozlamalari va foydalanuvchilarni boshqarish' },
}

const initialRoles = ROLE_DEFS.map((r) => ({
  id: r.name.toLowerCase(),
  name: r.name,
  tashkilot: 'Barcha tashkilotlar',
  holat: 'active',
  description: ROLE_META[r.name]?.description ?? '',
  yaratilgan: ROLE_META[r.name]?.yaratilgan ?? '12.01.2024 09:14',
  ozgartirilgan: ROLE_META[r.name]?.ozgartirilgan ?? '12.01.2024 09:14',
}))

const initialState = { list: initialUsers, roles: initialRoles }
const find = (state, id) => state.list.find((u) => u.id === id)

const emptyDetail = {
  stats: { savdolar: 0, savdoSummasi: 0, qaytarishlar: 0, oxirgiKirish: '–' },
  audit: [],
  lastSales: [],
}

const foydalanuvchilarSlice = createSlice({
  name: 'foydalanuvchilar',
  initialState,
  reducers: {
    userAdded: {
      reducer(state, action) {
        state.list.unshift(action.payload)
      },
      prepare(values) {
        const now = formatDateTime()
        return {
          payload: {
            id: nanoid(8),
            name: '',
            tashkilot: '',
            filial: '',
            rol: '',
            phone: '',
            ...values,
            holat: values?.holat ?? 'active',
            yaratilgan: now,
            oxirgiKirish: '–',
            block: null,
            activation: null,
            detail: emptyDetail,
          },
        }
      },
    },
    userUpdated(state, action) {
      const { id, patch } = action.payload
      const u = find(state, id)
      if (u) Object.assign(u, patch)
    },
    userBlocked(state, action) {
      const { id, reason, by } = action.payload
      const u = find(state, id)
      if (u) {
        u.holat = 'blocked'
        u.block = { at: formatDateTime(), reason, by }
      }
    },
    userActivated(state, action) {
      const { id, by } = action.payload
      const u = find(state, id)
      if (u) {
        u.holat = 'active'
        u.activation = { at: formatDateTime(), by, prevReason: u.block?.reason ?? '', prevAt: u.block?.at ?? '' }
        u.block = null
      }
    },
    roleAdded: {
      reducer(state, action) {
        state.roles.unshift(action.payload)
      },
      prepare(values) {
        const now = formatDateTime()
        return {
          payload: {
            id: nanoid(8),
            name: '',
            tashkilot: 'Barcha tashkilotlar',
            holat: 'active',
            description: '',
            yaratilgan: now,
            ozgartirilgan: now,
            ...values,
          },
        }
      },
    },
    roleUpdated(state, action) {
      const { id, patch } = action.payload
      const r = state.roles.find((x) => x.id === id)
      if (r) Object.assign(r, patch, { ozgartirilgan: formatDateTime() })
    },
  },
})

export const { userAdded, userUpdated, userBlocked, userActivated, roleAdded, roleUpdated } =
  foydalanuvchilarSlice.actions
export default foydalanuvchilarSlice.reducer
