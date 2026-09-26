import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  approveCalculatingSalary,
  calculateSalaries,
  cancelCalculatingSalary,
  deleteCalculatingSalary,
  getAllCalculatingSalaries,
  getCalculatingSalary,
  patchCalculatingSalary,
} from '@/services/calculatingSalaryService'

// Backenddan barcha oylik hisoblarini yuklash
export const fetchCalculatingSalariesThunk = createAsyncThunk(
  'oylikHisoblash/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await getAllCalculatingSalaries(params)
      return Array.isArray(data) ? data : data?.results || []
    } catch (err) {
      return rejectWithValue(err?.response?.data || err.message)
    }
  }
)

// Bitta oylik hisobini ID bo'yicha yuklash
export const fetchSingleSalaryThunk = createAsyncThunk(
  'oylikHisoblash/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const data = await getCalculatingSalary(id)
      return data
    } catch (err) {
      return rejectWithValue(err?.response?.data || err.message)
    }
  }
)

// Filial va oy bo'yicha oylikni hisoblash (POST /calculate/)
export const calculateSalariesThunk = createAsyncThunk(
  'oylikHisoblash/calculate',
  async ({ branch, for_month, year }, { rejectWithValue }) => {
    try {
      const data = await calculateSalaries({ branch, for_month, year })
      return data
    } catch (err) {
      return rejectWithValue(err?.response?.data || err.message)
    }
  }
)

// Tasdiqlash
export const approveSalaryThunk = createAsyncThunk(
  'oylikHisoblash/approve',
  async (id, { rejectWithValue }) => {
    try {
      const data = await approveCalculatingSalary(id)
      return data
    } catch (err) {
      return rejectWithValue(err?.response?.data || err.message)
    }
  }
)

// Bekor qilish
export const cancelSalaryThunk = createAsyncThunk(
  'oylikHisoblash/cancel',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const data = await cancelCalculatingSalary(id, { reason })
      return data
    } catch (err) {
      return rejectWithValue(err?.response?.data || err.message)
    }
  }
)

// Tahrirlash
export const updateSalaryThunk = createAsyncThunk(
  'oylikHisoblash/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const data = await patchCalculatingSalary(id, payload)
      return data
    } catch (err) {
      return rejectWithValue(err?.response?.data || err.message)
    }
  }
)

// O'chirish
export const deleteSalaryThunk = createAsyncThunk(
  'oylikHisoblash/delete',
  async (id, { rejectWithValue }) => {
    try {
      await deleteCalculatingSalary(id)
      return id
    } catch (err) {
      return rejectWithValue(err?.response?.data || err.message)
    }
  }
)

const initialState = {
  items: [], // Mock ma'lumot yo'q, agar API da ma'lumot bo'lmasa bo'sh bo'ladi
  loading: false,
  error: null,
  activeDetail: null,
  detailLoading: false,
}

const oylikSlice = createSlice({
  name: 'oylikHisoblash',
  initialState,
  reducers: {
    clearActiveDetail: (state) => {
      state.activeDetail = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Ro'yxatni yuklash
      .addCase(fetchCalculatingSalariesThunk.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCalculatingSalariesThunk.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload || []
      })
      .addCase(fetchCalculatingSalariesThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.items = [] // Xatolik bo'lsa yoki ma'lumot bo'lmasa bo'sh
      })

      // Bitta hisobni olish
      .addCase(fetchSingleSalaryThunk.pending, (state) => {
        state.detailLoading = true
      })
      .addCase(fetchSingleSalaryThunk.fulfilled, (state, action) => {
        state.detailLoading = false
        state.activeDetail = action.payload
      })
      .addCase(fetchSingleSalaryThunk.rejected, (state, action) => {
        state.detailLoading = false
        state.error = action.payload
      })

      // Tasdiqlash
      .addCase(approveSalaryThunk.fulfilled, (state, action) => {
        const updated = action.payload
        if (updated?.id) {
          const idx = state.items.findIndex((i) => i.id === updated.id)
          if (idx !== -1) state.items[idx] = updated
          if (state.activeDetail?.id === updated.id) state.activeDetail = updated
        }
      })

      // Bekor qilish
      .addCase(cancelSalaryThunk.fulfilled, (state, action) => {
        const updated = action.payload
        if (updated?.id) {
          const idx = state.items.findIndex((i) => i.id === updated.id)
          if (idx !== -1) state.items[idx] = updated
          if (state.activeDetail?.id === updated.id) state.activeDetail = updated
        }
      })

      // O'chirish
      .addCase(deleteSalaryThunk.fulfilled, (state, action) => {
        const id = action.payload
        state.items = state.items.filter((i) => i.id !== id)
      })
  },
})

export const { clearActiveDetail } = oylikSlice.actions
export default oylikSlice.reducer
