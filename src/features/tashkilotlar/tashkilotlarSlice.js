import { createSlice, nanoid } from '@reduxjs/toolkit'
import { formatDateTime } from '@/lib/format'
import { initialOrgs } from './tashkilotlarData'

const initialState = {
  list: initialOrgs,
}

const findOrg = (state, id) => state.list.find((o) => o.id === id)

const tashkilotlarSlice = createSlice({
  name: 'tashkilotlar',
  initialState,
  reducers: {
    orgAdded: {
      reducer(state, action) {
        state.list.unshift(action.payload)
      },
      prepare(values) {
        return {
          payload: {
            id: nanoid(8),
            name: '',
            titul: '',
            inn: '',
            director: '',
            phone: '',
            viloyat: '',
            tuman: '',
            manzil: '',
            ...values,
            registeredAt: formatDateTime(),
            status: 'active',
            branchCount: 0,
            stats: { filiallar: 0, foydalanuvchilar: 0, mijozlar: 0, savdo: 0 },
            branches: [],
            users: [],
            suspend: null,
          },
        }
      },
    },
    orgUpdated(state, action) {
      const { id, patch } = action.payload
      const org = findOrg(state, id)
      if (org) Object.assign(org, patch)
    },
    orgSuspended(state, action) {
      const { id, reason, by } = action.payload
      const org = findOrg(state, id)
      if (org) {
        org.status = 'suspended'
        org.suspend = { at: formatDateTime(), reason, by }
      }
    },
    orgActivated(state, action) {
      const org = findOrg(state, action.payload)
      if (org) {
        org.status = 'active'
        org.suspend = null
      }
    },
  },
})

export const { orgAdded, orgUpdated, orgSuspended, orgActivated } = tashkilotlarSlice.actions
export default tashkilotlarSlice.reducer
