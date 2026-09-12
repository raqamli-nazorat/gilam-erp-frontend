import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { formatDateTime } from '@/lib/format'
import { extractErrorMessage } from '@/services/apiHelpers'
import * as branchService from '@/services/branchService'

// Backend "Branch" serializeri: id, name, phone, address, warehouses_count, employees_count,
// is_closed(bool), closing_reason, created_at, updated_at, organization_info{id,name},
// region_info{id,name}, district_info{id,name}. Direktor va ba'zi sub-sahifalar (mijozlar/
// savdo/omborlar tarkibi) uchun hali backendda alohida endpoint yo'q — shu qismlar bo'sh
// ("emptyDetail") qoladi; xodimlar endi "Xodimlar" bo'limi (hr/employees) orqali real.
const emptyDetail = {
  lastSales: [],
  xodimlar: [],
  xodimlarStats: { xodimlar: 0, sotuvchi: 0, kassir: 0, ishHaqiFondi: 0, ishHaqiTaqsimot: [] },
  omborlar: [],
  rulonlar: [],
  omborStats: { omborlar: 0, rulon: 0, qoldiq: 0, qiymat: 0 },
  mijozlar: [],
  mijozStats: { mijozlar: 0, qarziBor: 0, jamiQarz: 0, ortachaChek: 0 },
  savdo: {
    stats: { savdo12: 0, buyurtma: 0, ortachaChek: 0, qaytarish: 0 },
    oylar: ['Okt', 'Noy', 'Dek', 'Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen'],
    dinamika: Array(12).fill(0),
    tolov: [],
    tolovJami: 0,
    topTovarlar: [],
    sotuvchilar: [],
  },
}

function mapBranch(b) {
  const ombor = Number(b.warehouses_count) || 0
  const xodim = Number(b.employees_count) || 0
  const closed = !!b.is_closed
  return {
    id: b.id,
    name: b.name ?? '',
    tashkilot: b.organization_info?.name ?? '',
    tashkilotId: b.organization_info?.id ?? '',
    viloyat: b.region_info?.name ?? '',
    viloyatId: b.region_info?.id ?? '',
    tuman: b.district_info?.name ?? '',
    tumanId: b.district_info?.id ?? '',
    manzil: b.address ?? '',
    phone: b.phone ?? '',
    director: '', // Backend Branch modelida direktor maydoni yo'q
    openedAt: b.created_at ? formatDateTime(new Date(b.created_at)) : '',
    status: closed ? 'closed' : 'active',
    ombor,
    stats: { xodimlar: xodim, omborlar: ombor, mijozlar: null, savdo: null },
    close: closed ? { reason: b.closing_reason ?? '' } : null,
    detail: emptyDetail,
  }
}

function buildBranchPayload(draft) {
  return {
    name: (draft.name ?? '').trim(),
    phone: draft.phone ? draft.phone.replace(/[\s-]/g, '') : '',
    address: draft.manzil ?? '',
    organization: draft.tashkilot || undefined,
    region: draft.viloyat || undefined,
    district: draft.tuman || undefined,
  }
}

const initialState = {
  list: [],
  listStatus: 'idle', // idle | loading | succeeded | failed
  listError: '',

  current: null,
  detailStatus: 'idle',
  detailError: '',

  saveStatus: 'idle',
  saveError: '',
}

export const fetchBranches = createAsyncThunk('filiallar/fetchBranches', async (_, { rejectWithValue }) => {
  try {
    const results = await branchService.getAllBranches()
    return results.map(mapBranch)
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error, 'Filiallarni yuklab bo‘lmadi'))
  }
})

export const fetchBranchDetail = createAsyncThunk(
  'filiallar/fetchBranchDetail',
  async (id, { rejectWithValue }) => {
    try {
      const raw = await branchService.getBranch(id)
      return mapBranch(raw)
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Filial topilmadi'))
    }
  }
)

export const createBranch = createAsyncThunk(
  'filiallar/createBranch',
  async (draft, { rejectWithValue }) => {
    try {
      const raw = await branchService.createBranch(buildBranchPayload(draft))
      return mapBranch(raw)
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Saqlashda xatolik yuz berdi'))
    }
  }
)

export const updateBranch = createAsyncThunk(
  'filiallar/updateBranch',
  async ({ id, draft }, { rejectWithValue }) => {
    try {
      const raw = await branchService.updateBranch(id, buildBranchPayload(draft))
      return mapBranch(raw)
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Yangilashda xatolik yuz berdi'))
    }
  }
)

export const closeBranch = createAsyncThunk(
  'filiallar/closeBranch',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const raw = await branchService.closeBranch(id, reason)
      return mapBranch(raw)
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Yopishda xatolik yuz berdi'))
    }
  }
)

export const openBranch = createAsyncThunk(
  'filiallar/openBranch',
  async (id, { rejectWithValue }) => {
    try {
      const raw = await branchService.openBranch(id)
      return mapBranch(raw)
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Ochishda xatolik yuz berdi'))
    }
  }
)

const filiallarSlice = createSlice({
  name: 'filiallar',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBranches.pending, (state) => {
        state.listStatus = 'loading'
        state.listError = ''
      })
      .addCase(fetchBranches.fulfilled, (state, action) => {
        state.listStatus = 'succeeded'
        state.list = action.payload
      })
      .addCase(fetchBranches.rejected, (state, action) => {
        state.listStatus = 'failed'
        state.listError = action.payload || 'Xatolik'
      })

      .addCase(fetchBranchDetail.pending, (state) => {
        state.detailStatus = 'loading'
        state.detailError = ''
      })
      .addCase(fetchBranchDetail.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded'
        state.current = action.payload
      })
      .addCase(fetchBranchDetail.rejected, (state, action) => {
        state.detailStatus = 'failed'
        state.detailError = action.payload || 'Xatolik'
        state.current = null
      })

      .addCase(createBranch.pending, (state) => {
        state.saveStatus = 'loading'
        state.saveError = ''
      })
      .addCase(createBranch.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded'
        state.list.unshift(action.payload)
      })
      .addCase(createBranch.rejected, (state, action) => {
        state.saveStatus = 'failed'
        state.saveError = action.payload || 'Xatolik'
      })

      .addCase(updateBranch.pending, (state) => {
        state.saveStatus = 'loading'
        state.saveError = ''
      })
      .addCase(updateBranch.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded'
        const idx = state.list.findIndex((b) => b.id === action.payload.id)
        if (idx !== -1) state.list[idx] = { ...state.list[idx], ...action.payload }
        if (state.current?.id === action.payload.id) state.current = { ...state.current, ...action.payload }
      })
      .addCase(updateBranch.rejected, (state, action) => {
        state.saveStatus = 'failed'
        state.saveError = action.payload || 'Xatolik'
      })

      .addCase(closeBranch.pending, (state) => {
        state.saveStatus = 'loading'
        state.saveError = ''
      })
      .addCase(closeBranch.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded'
        const idx = state.list.findIndex((b) => b.id === action.payload.id)
        if (idx !== -1) state.list[idx] = action.payload
        if (state.current?.id === action.payload.id) state.current = { ...state.current, ...action.payload }
      })
      .addCase(closeBranch.rejected, (state, action) => {
        state.saveStatus = 'failed'
        state.saveError = action.payload || 'Xatolik'
      })

      .addCase(openBranch.pending, (state) => {
        state.saveStatus = 'loading'
        state.saveError = ''
      })
      .addCase(openBranch.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded'
        const idx = state.list.findIndex((b) => b.id === action.payload.id)
        if (idx !== -1) state.list[idx] = action.payload
        if (state.current?.id === action.payload.id) state.current = { ...state.current, ...action.payload }
      })
      .addCase(openBranch.rejected, (state, action) => {
        state.saveStatus = 'failed'
        state.saveError = action.payload || 'Xatolik'
      })
  },
})

export default filiallarSlice.reducer
