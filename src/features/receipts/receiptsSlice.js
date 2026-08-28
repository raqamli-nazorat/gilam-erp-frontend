import { createSlice, nanoid } from '@reduxjs/toolkit'
import { EXCHANGE_RATE, initialReceipts, nextReceiptNumber } from './mockData'

function recalcTotals(receipt) {
  const sumUsd = Number(
    receipt.rows.reduce((sum, r) => sum + r.m2 * r.priceIn, 0).toFixed(2)
  )
  receipt.sumUsd = sumUsd
  receipt.sumUzs = Math.round(sumUsd * EXCHANGE_RATE)
}

function findReceipt(state, id) {
  return state.list.find((r) => r.id === id)
}

const initialState = {
  list: initialReceipts,
  exchangeRate: EXCHANGE_RATE,
}

const receiptsSlice = createSlice({
  name: 'receipts',
  initialState,
  reducers: {
    draftCreated: {
      reducer(state, action) {
        state.list.unshift(action.payload)
      },
      prepare({ warehouse }) {
        const number = nextReceiptNumber()
        return {
          payload: {
            id: number,
            number,
            date: new Date().toISOString().slice(0, 10),
            warehouse,
            counterparty: '',
            thirdParty: '',
            author: '',
            supplier: { name: '', doc: '', date: new Date().toISOString().slice(0, 10) },
            rows: [],
            sumUsd: 0,
            sumUzs: 0,
            status: 'new',
            excelMeta: null,
          },
        }
      },
    },
    receiptAdded(state, action) {
      state.list.unshift(action.payload)
    },
    receiptHeaderUpdated(state, action) {
      const { id, patch } = action.payload
      const receipt = findReceipt(state, id)
      if (receipt) {
        Object.assign(receipt, patch)
        if (receipt.status === 'new' && patch.counterparty) receipt.status = 'draft'
      }
    },
    supplierUpdated(state, action) {
      const { id, supplier } = action.payload
      const receipt = findReceipt(state, id)
      if (receipt) {
        receipt.supplier = { ...receipt.supplier, ...supplier }
        receipt.counterparty = receipt.supplier.name
        receipt.status = 'draft'
      }
    },
    rowAdded(state, action) {
      const { id, row } = action.payload
      const receipt = findReceipt(state, id)
      if (receipt) {
        receipt.rows.push({ ...row, id: row.id ?? nanoid() })
        if (receipt.status === 'new') receipt.status = 'draft'
        recalcTotals(receipt)
      }
    },
    rowUpdated(state, action) {
      const { id, rowId, patch } = action.payload
      const receipt = findReceipt(state, id)
      if (!receipt) return
      const row = receipt.rows.find((r) => r.id === rowId)
      if (row) {
        Object.assign(row, patch)
        row.m2 = Number((row.widthM * row.heightM).toFixed(2))
        recalcTotals(receipt)
      }
    },
    rowRemoved(state, action) {
      const { id, rowId } = action.payload
      const receipt = findReceipt(state, id)
      if (!receipt) return
      receipt.rows = receipt.rows.filter((r) => r.id !== rowId)
      recalcTotals(receipt)
    },
    excelImported(state, action) {
      const { id, rows, meta } = action.payload
      const receipt = findReceipt(state, id)
      if (!receipt) return
      receipt.rows = rows
      receipt.excelMeta = meta
      if (receipt.status === 'new') receipt.status = 'draft'
      recalcTotals(receipt)
    },
    excelCleared(state, action) {
      const { id } = action.payload
      const receipt = findReceipt(state, id)
      if (!receipt) return
      receipt.rows = []
      receipt.excelMeta = null
      recalcTotals(receipt)
    },
    partiyaCreated(state, action) {
      const { id, rowIds } = action.payload
      const receipt = findReceipt(state, id)
      if (!receipt) return
      receipt.rows.forEach((row) => {
        if (rowIds.includes(row.id) && !row.partiya) {
          row.partiya = String(Math.floor(1000000 + Math.random() * 8999999))
          row.ready = true
        }
      })
    },
    receiptConfirmed(state, action) {
      const receipt = findReceipt(state, action.payload)
      if (receipt) receipt.status = 'confirmed'
    },
    receiptDeleted(state, action) {
      state.list = state.list.filter((r) => r.id !== action.payload)
    },
  },
})

export const {
  draftCreated,
  receiptAdded,
  receiptHeaderUpdated,
  supplierUpdated,
  rowAdded,
  rowUpdated,
  rowRemoved,
  excelImported,
  excelCleared,
  partiyaCreated,
  receiptConfirmed,
  receiptDeleted,
} = receiptsSlice.actions

export default receiptsSlice.reducer
