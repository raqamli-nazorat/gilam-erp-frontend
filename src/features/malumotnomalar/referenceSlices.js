import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { formatDateTime } from '@/lib/format'
import { extractErrorMessage } from '@/services/apiHelpers'
import { createReferenceApi } from '@/services/referenceService'

// Backend'dagi "nomi (+ tavsif, + rang kodi)" shaklidagi oddiy modellarni
// (Quality/Unit/ProductColor/Position/CounterpartyType) jadval qatoriga o'giradi.
function mapRecord(raw) {
  return {
    id: raw.id,
    name: raw.name ?? '',
    tavsif: raw.description ?? '',
    hex: raw.color_hex ?? undefined,
    // Country kabi ba'zi modellarda "status" maydoni umuman yo'q — bunday holda doim faol hisoblanadi.
    active: raw.status == null ? true : !!raw.status,
    yaratilgan: raw.created_at ? formatDateTime(new Date(raw.created_at)) : '',
    ozgartirilgan: raw.updated_at ? formatDateTime(new Date(raw.updated_at)) : '',
  }
}

// Har bir oddiy ma'lumotnoma (sifat, birlik, rang, lavozim, kontragent turi) uchun
// bir xil shakldagi slice yaratadi — faqat backend endpointi (basePath) farq qiladi.
export function createReferenceSlice(name, basePath) {
  const api = createReferenceApi(basePath)

  const fetchItems = createAsyncThunk(`${name}/fetchItems`, async (_, { rejectWithValue }) => {
    try {
      const results = await api.list()
      return results.map(mapRecord)
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Ma’lumotlarni yuklab bo‘lmadi'))
    }
  })

  const createItem = createAsyncThunk(`${name}/createItem`, async (payload, { rejectWithValue }) => {
    try {
      const raw = await api.create(payload)
      return mapRecord(raw)
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Saqlashda xatolik yuz berdi'))
    }
  })

  const updateItem = createAsyncThunk(`${name}/updateItem`, async ({ id, payload }, { rejectWithValue }) => {
    try {
      const raw = await api.update(id, payload)
      return mapRecord(raw)
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Yangilashda xatolik yuz berdi'))
    }
  })

  const deleteItem = createAsyncThunk(`${name}/deleteItem`, async (id, { rejectWithValue }) => {
    try {
      await api.remove(id)
      return id
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'O‘chirishda xatolik yuz berdi'))
    }
  })

  const slice = createSlice({
    name,
    initialState: {
      list: [],
      listStatus: 'idle', // idle | loading | succeeded | failed
      listError: '',
      saveStatus: 'idle',
      saveError: '',
    },
    reducers: {},
    extraReducers: (builder) => {
      builder
        .addCase(fetchItems.pending, (state) => {
          state.listStatus = 'loading'
          state.listError = ''
        })
        .addCase(fetchItems.fulfilled, (state, action) => {
          state.listStatus = 'succeeded'
          state.list = action.payload
        })
        .addCase(fetchItems.rejected, (state, action) => {
          state.listStatus = 'failed'
          state.listError = action.payload || 'Xatolik'
        })

        .addCase(createItem.pending, (state) => {
          state.saveStatus = 'loading'
          state.saveError = ''
        })
        .addCase(createItem.fulfilled, (state, action) => {
          state.saveStatus = 'succeeded'
          state.list.unshift(action.payload)
        })
        .addCase(createItem.rejected, (state, action) => {
          state.saveStatus = 'failed'
          state.saveError = action.payload || 'Xatolik'
        })

        .addCase(updateItem.pending, (state) => {
          state.saveStatus = 'loading'
          state.saveError = ''
        })
        .addCase(updateItem.fulfilled, (state, action) => {
          state.saveStatus = 'succeeded'
          const idx = state.list.findIndex((x) => x.id === action.payload.id)
          if (idx !== -1) state.list[idx] = action.payload
        })
        .addCase(updateItem.rejected, (state, action) => {
          state.saveStatus = 'failed'
          state.saveError = action.payload || 'Xatolik'
        })

        .addCase(deleteItem.fulfilled, (state, action) => {
          state.list = state.list.filter((x) => x.id !== action.payload)
        })
    },
  })

  return { reducer: slice.reducer, fetchItems, createItem, updateItem, deleteItem }
}
