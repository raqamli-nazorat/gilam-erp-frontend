import { createSlice } from '@reduxjs/toolkit'
import { initialReturns, makeReturnRow, nextReturnNumber, RETURN_EXCHANGE_RATE } from './returnsMockData'

const initialState = {
  list: initialReturns,
  exchangeRate: RETURN_EXCHANGE_RATE,
}

const find = (state, id) => state.list.find((r) => r.id === id)

const returnsSlice = createSlice({
  name: 'returns',
  initialState,
  reducers: {
    returnDraftCreated: {
      reducer(state, action) {
        state.list.unshift(action.payload)
      },
      prepare() {
        const number = nextReturnNumber()
        return {
          payload: {
            id: number,
            number,
            date: new Date().toISOString().slice(0, 10),
            counterparty: '',
            agent: "Mirzajonov G'afforjon",
            warehouse: 'MAGAZIN',
            transport: 'Tanlanmagan',
            type: 'client',
            status: 'draft',
            reason: '',
            comment: '',
            rejectReason: '',
            rejectComment: '',
            rows: [],
          },
        }
      },
    },
    returnHeaderUpdated(state, action) {
      const { id, patch } = action.payload
      const r = find(state, id)
      if (r) Object.assign(r, patch)
    },
    returnRowsAdded(state, action) {
      const { id, rows } = action.payload
      const r = find(state, id)
      if (!r) return
      const existingPartiyas = new Set(r.rows.map((row) => row.partiya))
      rows
        .filter((row) => !existingPartiyas.has(row.partiya))
        .forEach((row) => r.rows.push(makeReturnRow(row)))
    },
    returnRowRemoved(state, action) {
      const { id, rowId } = action.payload
      const r = find(state, id)
      if (r) r.rows = r.rows.filter((row) => row.id !== rowId)
    },
    returnReasonTypeSet(state, action) {
      const { id, patch } = action.payload
      const r = find(state, id)
      if (!r) return
      Object.assign(r, patch)
      if (patch.reason) r.rows.forEach((row) => (row.reason = patch.reason))
    },
    returnAccepted(state, action) {
      const r = find(state, action.payload)
      if (r) r.status = 'accepted'
    },
    returnReverted(state, action) {
      const r = find(state, action.payload)
      if (r) r.status = 'draft'
    },
    returnRejected(state, action) {
      const { id, rejectReason, rejectComment } = action.payload
      const r = find(state, id)
      if (r) {
        r.status = 'rejected'
        r.rejectReason = rejectReason
        r.rejectComment = rejectComment
      }
    },
  },
})

export const {
  returnDraftCreated,
  returnHeaderUpdated,
  returnRowsAdded,
  returnRowRemoved,
  returnReasonTypeSet,
  returnAccepted,
  returnReverted,
  returnRejected,
} = returnsSlice.actions

export default returnsSlice.reducer
