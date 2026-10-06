import { createAsyncThunk, createSlice, nanoid } from '@reduxjs/toolkit'
import { fetchLatestRate } from '@/services/financeReferenceService'
import { extractErrorMessage } from '@/services/apiHelpers'
import { removeParties } from '@/services/receiptService'
import { EXCHANGE_RATE } from './mockData'

// DIQQAT: backendda kirim HUJJATI uchun endpoint yo'q (Swagger: 94 ta yo'l, ularning birortasi
// kirim emas). Shuning uchun hujjatlar shu slice'da turadi va brauzerda (localStorage) saqlanadi —
// sahifa yangilansa ham yo'qolmaydi. Kurs (finance/currency-ledgers/), ma'lumotnomalar va
// partiyalar (catalog/product-parties/ — yaratish, tahrirlash, o'chirish) haqiqiy API orqali.
export const RECEIPTS_STORAGE_KEY = 'gilam-receipts-v1'

function loadStored() {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECEIPTS_STORAGE_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// KR-0001, KR-0002 … — mavjud hujjatlarning eng kattasidan keyingisi
function nextNumber(list) {
  const max = list.reduce((m, r) => Math.max(m, Number(String(r.number).replace(/\D/g, '')) || 0), 0)
  return `KR-${String(max + 1).padStart(4, '0')}`
}

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

// O'chirish / bekor qilish: avval hujjat partiyalari backenddan o'chiriladi. Backend rad etsa
// (masalan partiyadan sotuv bo'lgan), amal to'xtatiladi; o'chirib ulgurilganlari hujjatdan uziladi.
async function dropParties(receipt, dispatch) {
  const rows = receipt.rows.filter((r) => r.partyId)
  const { removed, failed } = await removeParties(rows.map((r) => r.partyId))
  if (removed.length) dispatch(receiptsSlice.actions.partiesDetached({ id: receipt.id, partyIds: removed }))
  if (failed) {
    throw new Error(
      `${removed.length ? `${removed.length} ta partiya o'chirildi, lekin ` : ''}partiyani o'chirib bo'lmadi: ${extractErrorMessage(failed)}`
    )
  }
}

export const deleteReceipt = createAsyncThunk('receipts/delete', async (id, { getState, dispatch, rejectWithValue }) => {
  const receipt = getState().receipts.list.find((r) => r.id === id)
  if (!receipt) return id
  try {
    await dropParties(receipt, dispatch)
  } catch (error) {
    return rejectWithValue(error.message)
  }
  return id
})

export const cancelReceipt = createAsyncThunk(
  'receipts/cancel',
  async ({ id, reason }, { getState, dispatch, rejectWithValue }) => {
    const receipt = getState().receipts.list.find((r) => r.id === id)
    if (!receipt) return { id, reason }
    try {
      await dropParties(receipt, dispatch)
    } catch (error) {
      return rejectWithValue(error.message)
    }
    return { id, reason }
  }
)

const initialState = {
  list: loadStored(),
  exchangeRate: EXCHANGE_RATE,
  rateSource: 'fallback', // 'api' — kurs backenddan olingan
}

const receiptsSlice = createSlice({
  name: 'receipts',
  initialState,
  reducers: {
    draftCreated: {
      reducer(state, action) {
        state.list.unshift({ ...action.payload, number: nextNumber(state.list) })
      },
      prepare({ warehouse, author }) {
        const date = new Date().toISOString().slice(0, 10)
        return {
          payload: {
            id: nanoid(10),
            number: '', // reducer'da beriladi (mavjud hujjatlarga qarab)
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
    // Backenddan o'chirilgan partiyalar qatordan uziladi (qator qayta "partiyasiz" bo'ladi)
    partiesDetached(state, action) {
      const { id, partyIds } = action.payload
      const receipt = findReceipt(state, id)
      if (!receipt) return
      receipt.rows.forEach((row) => {
        if (partyIds.includes(row.partyId)) {
          row.partyId = null
          row.partiya = ''
          row.ready = false
        }
      })
    },
  },
  extraReducers: (builder) => {
    builder.addCase(deleteReceipt.fulfilled, (state, action) => {
      state.list = state.list.filter((r) => r.id !== action.payload)
    })
    builder.addCase(cancelReceipt.fulfilled, (state, action) => {
      const receipt = findReceipt(state, action.payload.id)
      if (receipt && receipt.status !== 'cancelled') {
        receipt.status = 'cancelled'
        receipt.cancelReason = action.payload.reason
      }
    })
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
  partiesDetached,
} = receiptsSlice.actions

export default receiptsSlice.reducer
