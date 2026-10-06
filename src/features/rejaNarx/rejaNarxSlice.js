import { createSlice } from '@reduxjs/toolkit'
import { initialDocs, nextNumber, STATUS } from './rejaNarxData'

// DIQQAT: backendda narx hujjatlari endpointi yo'q — hujjatlar shu slice'da saqlanadi.

function find(state, id) {
  return state.list.find((d) => d.id === id)
}

const rejaNarxSlice = createSlice({
  name: 'rejaNarx',
  initialState: { list: initialDocs },
  reducers: {
    // Yangi hujjat birinchi saqlanganda yaratiladi (raqam shu paytda beriladi)
    docCreated: {
      reducer(state, action) {
        state.list.unshift(action.payload)
      },
      prepare({ effectiveDate, rate, scopeId, scope, rows, author, createdAt }) {
        const number = nextNumber()
        return {
          payload: {
            id: number,
            number,
            createdAt,
            effectiveDate,
            rate,
            scopeId,
            scope,
            rows,
            author,
            status: STATUS.DRAFT,
            confirmedAt: '',
            confirmedBy: '',
            cancelReason: '',
            cancelFile: '',
          },
        }
      },
    },
    docSaved(state, action) {
      const { id, patch } = action.payload
      const doc = find(state, id)
      if (doc?.status === STATUS.DRAFT) Object.assign(doc, patch)
    },
    docConfirmed(state, action) {
      const { id, at, by } = action.payload
      const doc = find(state, id)
      if (doc?.status !== STATUS.DRAFT) return
      doc.status = STATUS.CONFIRMED
      doc.confirmedAt = at
      doc.confirmedBy = by
    },
    docCancelled(state, action) {
      const { id, reason, fileName } = action.payload
      const doc = find(state, id)
      if (doc?.status !== STATUS.CONFIRMED) return
      doc.status = STATUS.CANCELLED
      doc.cancelReason = reason
      doc.cancelFile = fileName ?? ''
    },
  },
})

export const { docCreated, docSaved, docConfirmed, docCancelled } = rejaNarxSlice.actions
export default rejaNarxSlice.reducer
