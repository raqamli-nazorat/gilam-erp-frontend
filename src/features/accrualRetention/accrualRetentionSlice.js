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
      return await getAccrualRetentionDocument(id)
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
      return await createAccrualRetentionDocument(payload)
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
      return await patchAccrualRetentionDocument(id, payload)
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
      return await approveAccrualRetentionDocument(id)
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
      return await cancelAccrualRetentionDocument(id, { reason, attachment: attachment || file })
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
  items: [],
  loading: false,
  error: null,
  activeDetail: null,
  detailLoading: false,
}

const replaceItem = (state, updated) => {
  if (!updated?.id) return
  const idx = state.items.findIndex((i) => i.id === updated.id)
  if (idx !== -1) state.items[idx] = updated
  if (state.activeDetail?.id === updated.id) state.activeDetail = updated
}

const accrualRetentionSlice = createSlice({
  name: 'accrualRetention',
  initialState,
  reducers: {
    clearActiveDetail: (state) => {
      state.activeDetail = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccrualDocumentsThunk.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAccrualDocumentsThunk.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload || []
      })
      .addCase(fetchAccrualDocumentsThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
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
      .addCase(createAccrualDocumentThunk.fulfilled, (state, action) => {
        if (action.payload?.id) state.items.unshift(action.payload)
      })
      .addCase(patchAccrualDocumentThunk.fulfilled, (state, action) => replaceItem(state, action.payload))
      .addCase(approveAccrualDocumentThunk.fulfilled, (state, action) => replaceItem(state, action.payload))
      .addCase(cancelAccrualDocumentThunk.fulfilled, (state, action) => replaceItem(state, action.payload))
      .addCase(deleteAccrualDocumentThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((i) => i.id !== action.payload)
      })
  },
})

export const { clearActiveDetail } = accrualRetentionSlice.actions
export default accrualRetentionSlice.reducer
