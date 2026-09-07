import { createSlice, nanoid } from '@reduxjs/toolkit'
import { formatDateTime } from '@/lib/format'
import { initialUsers, ROLE_DEFS } from './foydalanuvchilarData'

const initialRoles = ROLE_DEFS.map((r) => ({
  id: r.name.toLowerCase(),
  name: r.name,
  tashkilot: 'Barcha tashkilotlar',
  holat: 'active',
  description: '',
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
        return {
          payload: {
            id: nanoid(8),
            name: '',
            tashkilot: 'Barcha tashkilotlar',
            holat: 'active',
            description: '',
            ...values,
          },
        }
      },
    },
  },
})

export const { userAdded, userUpdated, userBlocked, userActivated, roleAdded } = foydalanuvchilarSlice.actions
export default foydalanuvchilarSlice.reducer
