import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  approveAccrualRetentionDocument,
  cancelAccrualRetentionDocument,
  createAccrualRetentionDocument,
  deleteAccrualRetentionDocument,
  getAllAccrualRetentionDocuments,
  getAccrualRetentionDocument,
  patchAccrualRetentionDocument,
} from '@/services/accrualRetentionDocumentService'
import { MOCK_ACCRUAL_RETENTION_DOCUMENTS } from './accrualRetentionData'

// Barcha hujjatlarni olish
export const fetchAccrualDocumentsThunk = createAsyncThunk(
  'accrualRetention/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await getAllAccrualRetentionDocuments(params)
      return Array.isArray(data) ? data : data?.results || []
    } catch (err) {
      return rejectWithValue(err?.response?.data || err.message)
    }
  }
)

// Bitta hujjatni ID orqali olish
export const fetchSingleAccrualDocumentThunk = createAsyncThunk(
  'accrualRetention/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const data = await getAccrualRetentionDocument(id)
      return data
    } catch (err) {
      return rejectWithValue(err?.response?.data || err.message)
    }
  }
)

// Yangi hujjat yaratish
export const createAccrualDocumentThunk = createAsyncThunk(
  'accrualRetention/create',
  async (payload, { rejectWithValue }) => {
    try {
      const data = await createAccrualRetentionDocument(payload)
      return data
    } catch (err) {
      return rejectWithValue(err?.response?.data || err.message)
    }
  }
)

// Qisman yangilash
export const patchAccrualDocumentThunk = createAsyncThunk(
  'accrualRetention/patch',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const data = await patchAccrualRetentionDocument(id, payload)
      return data
    } catch (err) {
      return rejectWithValue(err?.response?.data || err.message)
    }
  }
)

// Tasdiqlash
export const approveAccrualDocumentThunk = createAsyncThunk(
  'accrualRetention/approve',
  async (id, { rejectWithValue }) => {
    try {
      const data = await approveAccrualRetentionDocument(id)
      return data
    } catch (err) {
      return rejectWithValue(err?.response?.data || err.message)
    }
  }
)

// Bekor qilish
export const cancelAccrualDocumentThunk = createAsyncThunk(
  'accrualRetention/cancel',
  async ({ id, reason, attachment, file }, { rejectWithValue }) => {
    try {
      const data = await cancelAccrualRetentionDocument(id, { reason, attachment: attachment || file })
      return data
    } catch (err) {
      return rejectWithValue(err?.response?.data || err.message)
    }
  }
)

// O'chirish
export const deleteAccrualDocumentThunk = createAsyncThunk(
  'accrualRetention/delete',
  async (id, { rejectWithValue }) => {
    try {
      await deleteAccrualRetentionDocument(id)
      return id
    } catch (err) {
      return rejectWithValue(err?.response?.data || err.message)
    }
  }
)

const initialState = {
  items: MOCK_ACCRUAL_RETENTION_DOCUMENTS,
  loading: false,
  error: null,
  activeDetail: null,
  detailLoading: false,
}

const accrualRetentionSlice = createSlice({
  name: 'accrualRetention',
  initialState,
  reducers: {
    clearActiveDetail: (state) => {
      state.activeDetail = null
    },
    // Mock rejimida mahalliy yangilash (agar backend ulanmagan bo'lsa)
    localUpdateDocumentStatus: (state, action) => {
      const { id, status } = action.payload
      const item = state.items.find((i) => String(i.id) === String(id))
      if (item) item.status = status
      if (state.activeDetail && String(state.activeDetail.id) === String(id)) {
        state.activeDetail.status = status
      }
    },
    localAddDocument: (state, action) => {
      state.items.unshift(action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      // Ro'yxat
      .addCase(fetchAccrualDocumentsThunk.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAccrualDocumentsThunk.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload && action.payload.length > 0) {
          state.items = action.payload
        }
      })
      .addCase(fetchAccrualDocumentsThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Bitta hujjat
      .addCase(fetchSingleAccrualDocumentThunk.pending, (state) => {
        state.detailLoading = true
      })
      .addCase(fetchSingleAccrualDocumentThunk.fulfilled, (state, action) => {
        state.detailLoading = false
        state.activeDetail = action.payload
      })
      .addCase(fetchSingleAccrualDocumentThunk.rejected, (state, action) => {
        state.detailLoading = false
        state.error = action.payload
      })

      // Tasdiqlash
      .addCase(approveAccrualDocumentThunk.fulfilled, (state, action) => {
        const updated = action.payload
        if (updated?.id) {
          const idx = state.items.findIndex((i) => i.id === updated.id)
          if (idx !== -1) state.items[idx] = updated
          if (state.activeDetail?.id === updated.id) state.activeDetail = updated
        }
      })

      // Bekor qilish
      .addCase(cancelAccrualDocumentThunk.fulfilled, (state, action) => {
        const updated = action.payload
        if (updated?.id) {
          const idx = state.items.findIndex((i) => i.id === updated.id)
          if (idx !== -1) state.items[idx] = updated
          if (state.activeDetail?.id === updated.id) state.activeDetail = updated
        }
      })

      // O'chirish
      .addCase(deleteAccrualDocumentThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((i) => i.id !== action.payload)
      })
  },
})

export const { clearActiveDetail, localUpdateDocumentStatus, localAddDocument } = accrualRetentionSlice.actions
export default accrualRetentionSlice.reducer
