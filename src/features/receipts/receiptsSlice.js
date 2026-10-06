import { createAsyncThunk, createSlice, nanoid } from '@reduxjs/toolkit'
import { fetchLatestRate } from '@/services/financeReferenceService'
import { EXCHANGE_RATE, initialReceipts, nextReceiptNumber } from './mockData'

// DIQQAT: backendda kirim hujjati uchun endpoint yo'q — hujjatlar shu slice'da saqlanadi.
// Kurs (finance/currency-ledgers/), ma'lumotnomalar va partiyalar (catalog/product-parties/)
// esa haqiqiy API'dan olinadi / yaratiladi.

function recalcTotals(receipt, rate) {
  const sumUsd = Number(
    receipt.rows.reduce((sum, r) => sum + r.m2 * r.priceIn, 0).toFixed(2)
  )
  receipt.sumUsd = sumUsd
  receipt.sumUzs = Math.round(sumUsd * rate)
}

function findReceipt(state, id) {
  return state.list.find((r) => r.id === id)
}

function isEditable(receipt) {
  return receipt && receipt.status !== 'confirmed' && receipt.status !== 'cancelled'
}

// USD kursi — finance/currency-ledgers/ dagi eng so'nggi qiymat.
export const loadExchangeRate = createAsyncThunk('receipts/loadExchangeRate', async () => {
  return fetchLatestRate('USD')
})

const initialState = {
  list: initialReceipts,
  exchangeRate: EXCHANGE_RATE,
  rateSource: 'fallback', // 'api' — kurs backenddan olingan
}

const receiptsSlice = createSlice({
  name: 'receipts',
  initialState,
  reducers: {
    draftCreated: {
      reducer(state, action) {
        state.list.unshift(action.payload)
      },
      prepare({ warehouse, author }) {
        const number = nextReceiptNumber()
        const date = new Date().toISOString().slice(0, 10)
        return {
          payload: {
            id: number,
            number,
            date,
            warehouse: warehouse?.name ?? '',
            warehouseId: warehouse?.id ?? '',
            branchId: warehouse?.branchId ?? '',
            counterparty: '',
            counterpartyId: '',
            thirdParty: '',
            thirdPartyId: '',
            author: author ?? '',
            supplier: { name: '', doc: '', date },
            rows: [],
            sumUsd: 0,
            sumUzs: 0,
            status: 'new',
            cancelReason: '',
            excelMeta: null,
          },
        }
      },
    },
    receiptHeaderUpdated(state, action) {
      const { id, patch } = action.payload
      const receipt = findReceipt(state, id)
      if (isEditable(receipt)) {
        Object.assign(receipt, patch)
        if (receipt.status === 'new' && patch.counterparty) receipt.status = 'draft'
      }
    },
    rowAdded(state, action) {
      const { id, row } = action.payload
      const receipt = findReceipt(state, id)
      if (!isEditable(receipt)) return
      receipt.rows.push({ ...row, id: row.id ?? nanoid() })
      if (receipt.status === 'new') receipt.status = 'draft'
      recalcTotals(receipt, state.exchangeRate)
    },
    rowUpdated(state, action) {
      const { id, rowId, patch } = action.payload
      const receipt = findReceipt(state, id)
      if (!isEditable(receipt)) return
      const row = receipt.rows.find((r) => r.id === rowId)
      if (row) {
        Object.assign(row, patch)
        row.m2 = Number((row.widthM * row.heightM).toFixed(2))
        recalcTotals(receipt, state.exchangeRate)
      }
    },
    rowRemoved(state, action) {
      const { id, rowId } = action.payload
      const receipt = findReceipt(state, id)
      if (!isEditable(receipt)) return
      receipt.rows = receipt.rows.filter((r) => r.id !== rowId)
      recalcTotals(receipt, state.exchangeRate)
    },
    excelImported(state, action) {
      const { id, rows, meta, warehouse } = action.payload
      const receipt = findReceipt(state, id)
      if (!isEditable(receipt)) return
      receipt.rows = rows.map((r) => ({ ...r, id: r.id ?? nanoid() }))
      receipt.excelMeta = meta
      if (warehouse) {
        receipt.warehouse = warehouse.name
        receipt.warehouseId = warehouse.id
        receipt.branchId = warehouse.branchId
      }
      if (receipt.status === 'new') receipt.status = 'draft'
      recalcTotals(receipt, state.exchangeRate)
    },
    excelCleared(state, action) {
      const receipt = findReceipt(state, action.payload.id)
      if (!isEditable(receipt)) return
      receipt.rows = []
      receipt.excelMeta = null
      recalcTotals(receipt, state.exchangeRate)
    },
    // API natijasi: [{ rowId, partiya, partyId }] — faqat muvaffaqiyatli yaratilganlar.
    partiyaCreated(state, action) {
      const { id, created } = action.payload
      const receipt = findReceipt(state, id)
      if (!isEditable(receipt)) return
      for (const item of created) {
        const row = receipt.rows.find((r) => r.id === item.rowId)
        if (row) {
          row.partiya = item.partiya
          row.partyId = item.partyId
          row.ready = true
        }
      }
    },
    receiptConfirmed(state, action) {
      const receipt = findReceipt(state, action.payload)
      if (isEditable(receipt)) receipt.status = 'confirmed'
    },
    // Tasdiqlangan hujjatni qayta tahrirlash uchun qoralamaga qaytarish.
    receiptReverted(state, action) {
      const receipt = findReceipt(state, action.payload)
      if (receipt?.status === 'confirmed') receipt.status = 'draft'
    },
    receiptCancelled(state, action) {
      const { id, reason } = action.payload
      const receipt = findReceipt(state, id)
      if (receipt && receipt.status !== 'cancelled') {
        receipt.status = 'cancelled'
        receipt.cancelReason = reason
      }
    },
    receiptDeleted(state, action) {
      state.list = state.list.filter((r) => r.id !== action.payload)
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadExchangeRate.fulfilled, (state, action) => {
      if (!action.payload) return
      state.exchangeRate = action.payload
      state.rateSource = 'api'
      // Faqat tahrirlanadigan hujjatlar yangi kurs bilan qayta hisoblanadi —
      // tasdiqlangan/bekor qilinganlarning UZS summasi o'zgarmaydi.
      state.list.forEach((r) => {
        if (isEditable(r)) recalcTotals(r, action.payload)
      })
    })
  },
})

export const {
  draftCreated,
  receiptHeaderUpdated,
  rowAdded,
  rowUpdated,
  rowRemoved,
  excelImported,
  excelCleared,
  partiyaCreated,
  receiptConfirmed,
  receiptReverted,
  receiptCancelled,
  receiptDeleted,
} = receiptsSlice.actions

export default receiptsSlice.reducer
