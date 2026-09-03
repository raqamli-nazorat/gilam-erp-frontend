import { createSlice } from '@reduxjs/toolkit'
import {
  CASHIER_NAME,
  initialOperations,
  KASSA_BALANCE,
  KASSA_EXCHANGE_RATE,
  QUEUE_DOCS,
} from './kassaMockData'

let seq = 500
const nextId = (p) => `${p}-${seq++}`

const initialState = {
  exchangeRate: KASSA_EXCHANGE_RATE,
  balance: { ...KASSA_BALANCE },
  operations: initialOperations,
  queueDocs: QUEUE_DOCS,
}

const kassaSlice = createSlice({
  name: 'kassa',
  initialState,
  reducers: {
    paymentAccepted: {
      reducer(state, action) {
        const { docId, usd, kassa } = action.payload
        const doc = state.queueDocs.find((d) => d.id === docId)
        if (doc) {
          doc.paid = true
          doc.paidPct = 100
        }
        state.balance.usd += usd
        state.balance.uzs += Math.round(usd * state.exchangeRate)
        state.operations.unshift({
          id: nextId('op'),
          date: new Date().toISOString().slice(0, 10),
          time: nowHM(),
          type: "Savdo to'lovi",
          note: `${doc?.contract ?? ''} · ${doc?.counterparty ?? ''}`,
          kassa,
          cashIn: usd,
          cashOut: null,
          cashier: CASHIER_NAME,
          flow: 'kirim',
        })
      },
      prepare(input) {
        return { payload: input }
      },
    },
    cashOutMade(state, action) {
      const { type, note, kassa, usd } = action.payload
      state.balance.usd -= usd
      state.balance.uzs -= Math.round(usd * state.exchangeRate)
      state.operations.unshift({
        id: nextId('op'),
        date: new Date().toISOString().slice(0, 10),
        time: nowHM(),
        type,
        note,
        kassa,
        cashIn: null,
        cashOut: usd,
        cashier: CASHIER_NAME,
        flow: 'chiqim',
      })
    },
    converted(state, action) {
      const { direction, usd, uzs } = action.payload
      if (direction === 'usd2uzs') {
        state.balance.usd -= usd
        state.balance.uzs += uzs
      } else {
        state.balance.uzs -= uzs
        state.balance.usd += usd
      }
    },
    collected(state, action) {
      const { uzs } = action.payload
      state.balance.uzs -= uzs
      const usd = Number((uzs / state.exchangeRate).toFixed(2))
      state.operations.unshift({
        id: nextId('op'),
        date: new Date().toISOString().slice(0, 10),
        time: nowHM(),
        type: 'Inkassaga topshirish',
        note: `Inkassa · ${uzs.toLocaleString('ru-RU').replace(/,/g, ' ')} UZS`,
        kassa: 'KICHIK KASSA',
        cashIn: null,
        cashOut: usd,
        cashier: CASHIER_NAME,
        flow: 'chiqim',
      })
    },
  },
})

function nowHM() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export const { paymentAccepted, cashOutMade, converted, collected } = kassaSlice.actions
export default kassaSlice.reducer
