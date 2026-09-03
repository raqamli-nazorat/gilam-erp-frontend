import { createSlice } from '@reduxjs/toolkit'
import {
  DEFECT_LOCATION,
  initialQk,
  makeQkRow,
  nextQkNumber,
  QK_DRAFT_TEMPLATE,
  QK_EXCHANGE_RATE,
} from './qkMockData'

const initialState = {
  list: initialQk,
  exchangeRate: QK_EXCHANGE_RATE,
}

const find = (state, id) => state.list.find((d) => d.id === id)

const qkSlice = createSlice({
  name: 'qaytarishKirimi',
  initialState,
  reducers: {
    qkDraftCreated: {
      reducer(state, action) {
        state.list.unshift(action.payload)
      },
      prepare() {
        const number = nextQkNumber()
        const t = QK_DRAFT_TEMPLATE
        return {
          payload: {
            id: number,
            number,
            date: t.date,
            basis: t.basis,
            basisDate: t.basisDate,
            counterparty: t.counterparty,
            warehouse: t.warehouse,
            receiver: t.receiver,
            status: 'pending',
            rows: t.rows.map((r) => makeQkRow({ ...r, basis: t.basis })),
          },
        }
      },
    },
    qkHeaderUpdated(state, action) {
      const { id, patch } = action.payload
      const d = find(state, id)
      if (d) Object.assign(d, patch)
    },
    qkRowPlacementSet(state, action) {
      const { id, rowId, patch } = action.payload
      const d = find(state, id)
      const row = d?.rows.find((r) => r.id === rowId)
      if (row) Object.assign(row, patch)
    },
    // Bir modaldan barcha qatorlarga joylashuv qo'llaydi.
    // Nuqsonli rulonlar doim "Nuqson zonasi"ga tushadi.
    qkPlacementApplied(state, action) {
      const { id, warehouse, location, partiyaMode } = action.payload
      const d = find(state, id)
      if (!d) return
      d.rows.forEach((row) => {
        if (row.quality === 'Nuqsonli') {
          row.warehouse = warehouse
          row.location = DEFECT_LOCATION
          row.partiyaMode = 'new'
        } else {
          row.warehouse = warehouse
          row.location = location
          row.partiyaMode = partiyaMode
        }
      })
    },
    qkEntered(state, action) {
      const d = find(state, action.payload)
      if (d) d.status = 'entered'
    },
    qkReverted(state, action) {
      const d = find(state, action.payload)
      if (d) d.status = 'pending'
    },
  },
})

export const {
  qkDraftCreated,
  qkHeaderUpdated,
  qkRowPlacementSet,
  qkPlacementApplied,
  qkEntered,
  qkReverted,
} = qkSlice.actions

export default qkSlice.reducer
