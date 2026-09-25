import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { formatDateTime } from '@/lib/format'
import { extractErrorMessage } from '@/services/apiHelpers'
import { workScheduleApi } from '@/services/workScheduleService'

// Backend "WorkSchedule" (hr/work-schedules/) — Swagger (/api/schema/) shakli:
// name, description, from_hour/to_hour, work_days ([0..6] — 0=Dushanba ... 6=Yakshanba), branch_info.
// Backend ish kunlari maydonini "days" dan "work_days" ga o'zgartirgan — shu sababli jadvalda
// "Ish kunlari" doim "—" chiqardi va saqlashda kunlar yuborilmasdi. Eski nom zaxira sifatida o'qiladi.
export function mapWorkSchedule(raw) {
  const branchObj = raw.branch_info ?? (raw.branch && typeof raw.branch === 'object' ? raw.branch : null)
  return {
    id: raw.id,
    name: raw.name ?? '',
    tavsif: raw.description ?? '',
    filialId: branchObj?.id ?? (typeof raw.branch === 'string' ? raw.branch : ''),
    filial: branchObj?.name ?? '',
    fromHour: (raw.from_hour ?? '').slice(0, 5),
    toHour: (raw.to_hour ?? '').slice(0, 5),
    days: (Array.isArray(raw.work_days) ? raw.work_days : Array.isArray(raw.days) ? raw.days : [])
      .map(Number)
      .sort((a, b) => a - b),
    status: raw.status ?? '',
    yaratilgan: raw.created_at ? formatDateTime(new Date(raw.created_at)) : '',
    ozgartirilgan: raw.updated_at ? formatDateTime(new Date(raw.updated_at)) : '',
  }
}

export function buildWorkSchedulePayload(draft) {
  return {
    branch: draft.filialId || undefined,
    name: (draft.name ?? '').trim(),
    description: draft.tavsif ?? '',
    from_hour: draft.fromHour ? `${draft.fromHour}:00` : undefined,
    to_hour: draft.toHour ? `${draft.toHour}:00` : undefined,
    work_days: [...(draft.days ?? [])].sort((a, b) => a - b),
  }
}

export const fetchWorkSchedules = createAsyncThunk(
  'ishGrafigi/fetchWorkSchedules',
  async (_, { rejectWithValue }) => {
    try {
      const results = await workScheduleApi.list()
      return results.map(mapWorkSchedule)
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Ro‘yxatni yuklab bo‘lmadi'))
    }
  }
)

export const createWorkSchedule = createAsyncThunk(
  'ishGrafigi/createWorkSchedule',
  async (draft, { rejectWithValue }) => {
    try {
      const raw = await workScheduleApi.create(buildWorkSchedulePayload(draft))
      return mapWorkSchedule(raw)
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Saqlashda xatolik yuz berdi'))
    }
  }
)

export const updateWorkSchedule = createAsyncThunk(
  'ishGrafigi/updateWorkSchedule',
  async ({ id, draft }, { rejectWithValue }) => {
    try {
      const raw = await workScheduleApi.update(id, buildWorkSchedulePayload(draft))
      return mapWorkSchedule(raw)
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Yangilashda xatolik yuz berdi'))
    }
  }
)

export const deleteWorkSchedule = createAsyncThunk(
  'ishGrafigi/deleteWorkSchedule',
  async (id, { rejectWithValue }) => {
    try {
      await workScheduleApi.remove(id)
      return id
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'O‘chirishda xatolik yuz berdi'))
    }
  }
)

const initialState = {
  list: [],
  listStatus: 'idle', // idle | loading | succeeded | failed
  listError: '',
  saveStatus: 'idle',
  saveError: '',
}

const ishGrafigiSlice = createSlice({
  name: 'ishGrafigi',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkSchedules.pending, (state) => {
        state.listStatus = 'loading'
        state.listError = ''
      })
      .addCase(fetchWorkSchedules.fulfilled, (state, action) => {
        state.listStatus = 'succeeded'
        state.list = action.payload
      })
      .addCase(fetchWorkSchedules.rejected, (state, action) => {
        state.listStatus = 'failed'
        state.listError = action.payload || 'Xatolik'
      })

      .addCase(createWorkSchedule.pending, (state) => {
        state.saveStatus = 'loading'
        state.saveError = ''
      })
      .addCase(createWorkSchedule.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded'
        state.list.unshift(action.payload)
      })
      .addCase(createWorkSchedule.rejected, (state, action) => {
        state.saveStatus = 'failed'
        state.saveError = action.payload || 'Xatolik'
      })

      .addCase(updateWorkSchedule.pending, (state) => {
        state.saveStatus = 'loading'
        state.saveError = ''
      })
      .addCase(updateWorkSchedule.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded'
        const idx = state.list.findIndex((x) => x.id === action.payload.id)
        if (idx !== -1) state.list[idx] = action.payload
      })
      .addCase(updateWorkSchedule.rejected, (state, action) => {
        state.saveStatus = 'failed'
        state.saveError = action.payload || 'Xatolik'
      })

      .addCase(deleteWorkSchedule.fulfilled, (state, action) => {
        state.list = state.list.filter((x) => x.id !== action.payload)
      })
  },
})

export default ishGrafigiSlice.reducer
