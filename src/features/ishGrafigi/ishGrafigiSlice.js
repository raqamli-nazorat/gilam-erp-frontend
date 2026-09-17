import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { formatDateTime } from '@/lib/format'
import { extractErrorMessage } from '@/services/apiHelpers'
import { workScheduleApi } from '@/services/workScheduleService'

// Backend "WorkSchedule" (hr/work-schedules/) — Swagger (/api/schema/) tasdiqlagan haqiqiy
// shakl: filialga bog'langan sana oralig'i (from_date/to_date) + standart ish vaqti
// (from_hour/to_hour), ixtiyoriy "items" (WorkScheduleItem — muayyan kun uchun istisno:
// to'liq bayram/qisman ish kuni/to'liq ish kuni). Hech qanday "holat" (Faol/Arxiv) yoki
// hafta kunlari (Du/Se/Ch...) maydoni yo'q — avvalgi versiya buni Figma skrinshotiga qarab
// noto'g'ri taxmin qilgan edi. `items` hozircha UI'da tahrirlanmaydi (Figma yo'q) — faqat
// o'qish uchun xaritalanadi, saqlashda tegilmaydi (PATCH bo'lgani uchun serverdagi items
// o'zgarishsiz qoladi).
export function mapWorkSchedule(raw) {
  return {
    id: raw.id,
    name: raw.name ?? '',
    tavsif: raw.description ?? '',
    filialId: raw.branch_info?.id ?? '',
    filial: raw.branch_info?.name ?? '',
    fromDate: raw.from_date ?? '',
    toDate: raw.to_date ?? '',
    fromHour: (raw.from_hour ?? '').slice(0, 5),
    toHour: (raw.to_hour ?? '').slice(0, 5),
    items: raw.items ?? [],
    yaratilgan: raw.created_at ? formatDateTime(new Date(raw.created_at)) : '',
    ozgartirilgan: raw.updated_at ? formatDateTime(new Date(raw.updated_at)) : '',
  }
}

export function buildWorkSchedulePayload(draft) {
  return {
    branch: draft.filialId || undefined,
    name: (draft.name ?? '').trim(),
    description: draft.tavsif ?? '',
    from_date: draft.fromDate || undefined,
    to_date: draft.toDate || undefined,
    from_hour: draft.fromHour ? `${draft.fromHour}:00` : undefined,
    to_hour: draft.toHour ? `${draft.toHour}:00` : undefined,
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
