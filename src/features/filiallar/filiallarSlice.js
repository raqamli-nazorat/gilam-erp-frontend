import { createSlice, nanoid } from '@reduxjs/toolkit'
import { formatDateTime } from '@/lib/format'
import { initialBranches } from './filiallarData'

const initialState = { list: initialBranches }
const find = (state, id) => state.list.find((b) => b.id === id)

const emptyDetail = {
  lastSales: [],
  xodimlar: [],
  xodimlarStats: { xodimlar: 0, sotuvchi: 0, kassir: 0, ishHaqiFondi: 0 },
  omborlar: [],
  omborStats: { omborlar: 0, rulon: 0, qoldiq: 0, qiymat: 0 },
  mijozlar: [],
  mijozStats: { mijozlar: 0, qarziBor: 0, jamiQarz: 0, ortachaChek: 0 },
  savdo: {
    stats: { savdo12: 0, buyurtma: 0, ortachaChek: 0, qaytarish: 0 },
    oylar: ['Okt', 'Noy', 'Dek', 'Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen'],
    dinamika: Array(12).fill(0),
    tolov: [],
    tolovJami: 0,
    topTovarlar: [],
    sotuvchilar: [],
  },
}

const filiallarSlice = createSlice({
  name: 'filiallar',
  initialState,
  reducers: {
    branchAdded: {
      reducer(state, action) {
        state.list.unshift(action.payload)
      },
      prepare(values) {
        return {
          payload: {
            id: nanoid(8),
            name: '',
            tashkilot: '',
            turi: '',
            viloyat: '',
            tuman: '',
            manzil: '',
            phone: '',
            director: '',
            ...values,
            openedAt: formatDateTime(),
            status: 'active',
            ombor: 0,
            stats: { xodimlar: 0, omborlar: 0, mijozlar: 0, savdo: 0 },
            close: null,
            detail: emptyDetail,
          },
        }
      },
    },
    branchUpdated(state, action) {
      const { id, patch } = action.payload
      const b = find(state, id)
      if (b) Object.assign(b, patch)
    },
    branchClosed(state, action) {
      const { id, reason, by } = action.payload
      const b = find(state, id)
      if (b) {
        b.status = 'closed'
        b.close = { at: formatDateTime(), reason, by }
      }
    },
    branchOpened(state, action) {
      const b = find(state, action.payload)
      if (b) {
        b.status = 'active'
        b.close = null
      }
    },
  },
})

export const { branchAdded, branchUpdated, branchClosed, branchOpened } = filiallarSlice.actions
export default filiallarSlice.reducer
