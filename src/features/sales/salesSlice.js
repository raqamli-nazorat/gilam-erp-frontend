import { createSlice, nanoid } from '@reduxjs/toolkit'
import { SALE_EXCHANGE_RATE, initialSaleDocs, makeSaleRow, nextSaleNumber } from './salesMockData'

const initialState = {
  list: initialSaleDocs,
  exchangeRate: SALE_EXCHANGE_RATE,
}

const find = (state, id) => state.list.find((s) => s.id === id)

const salesSlice = createSlice({
  name: 'saleDocs',
  initialState,
  reducers: {
    saleDraftCreated: {
      reducer(state, action) {
        state.list.unshift(action.payload)
      },
      prepare() {
        const number = nextSaleNumber()
        return {
          payload: {
            id: number,
            number,
            date: new Date().toISOString().slice(0, 10),
            counterparty: '',
            agent: "Mirzajonov G'afforjon",
            warehouse: 'MAGAZIN',
            dueDate: '',
            transport: 'Tanlanmagan',
            contract: number.replace('SV', 'SH'),
            status: 'draft',
            rows: [],
            payments: [],
          },
        }
      },
    },
    saleHeaderUpdated(state, action) {
      const { id, patch } = action.payload
      const s = find(state, id)
      if (s) Object.assign(s, patch)
    },
    saleRowsAdded(state, action) {
      const { id, products } = action.payload
      const s = find(state, id)
      if (!s) return
      products.forEach((p) => {
        s.rows.push(
          makeSaleRow({
            name: p.name,
            partiya: p.partiya,
            widthM: p.widthM,
            lengthM: Number((p.stockM2 / p.widthM).toFixed(2)),
            priceUsd: p.priceUsd,
            profit: Number((p.stockM2 * p.priceUsd * 0.16).toFixed(2)),
          })
        )
      })
    },
    saleRowRemoved(state, action) {
      const { id, rowId } = action.payload
      const s = find(state, id)
      if (s) s.rows = s.rows.filter((r) => r.id !== rowId)
    },
    salePaymentAdded(state, action) {
      const { id, payment } = action.payload
      const s = find(state, id)
      if (s) s.payments.push({ ...payment, id: payment.id ?? nanoid() })
    },
    saleConfirmed(state, action) {
      const s = find(state, action.payload)
      if (s) s.status = 'confirmed'
    },
    saleReverted(state, action) {
      const s = find(state, action.payload)
      if (s) s.status = 'draft'
    },
    saleDeleted(state, action) {
      state.list = state.list.filter((s) => s.id !== action.payload)
    },
  },
})

export const {
  saleDraftCreated,
  saleHeaderUpdated,
  saleRowsAdded,
  saleRowRemoved,
  salePaymentAdded,
  saleConfirmed,
  saleReverted,
  saleDeleted,
} = salesSlice.actions

export default salesSlice.reducer
