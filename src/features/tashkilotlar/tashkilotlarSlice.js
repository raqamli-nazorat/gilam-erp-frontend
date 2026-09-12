import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { formatDateTime } from '@/lib/format'
import { extractErrorMessage } from '@/services/apiHelpers'
import * as organizationService from '@/services/organizationService'

// Backend "Organization" serializeri: id, name, inn, phone, director, address, prefix,
// branches_count, is_suspended(bool), suspension_reason, created_at, updated_at,
// region_info{id,name}, district_info{id,name}. Foydalanuvchilar/mijozlar/savdo statistikasi
// va rollar bo'yicha taqsimot uchun hali backendda alohida endpoint yo'q — shu maydonlar
// `null` (formatNumber ularni "—" qilib ko'rsatadi).
function mapOrg(o) {
  const suspended = !!o.is_suspended
  return {
    id: o.id,
    name: o.name ?? '',
    titul: o.prefix ?? '',
    inn: o.inn ?? '',
    director: o.director ?? '',
    phone: o.phone ?? '',
    viloyat: o.region_info?.name ?? '',
    viloyatId: o.region_info?.id ?? '',
    tuman: o.district_info?.name ?? '',
    tumanId: o.district_info?.id ?? '',
    manzil: o.address ?? '',
    registeredAt: o.created_at ? formatDateTime(new Date(o.created_at)) : '',
    status: suspended ? 'suspended' : 'active',
    branchCount: Number(o.branches_count) || 0,
    stats: {
      filiallar: Number(o.branches_count) || 0,
      foydalanuvchilar: null,
      mijozlar: null,
      savdo: null,
    },
    branches: [],
    users: [],
    suspend: suspended ? { reason: o.suspension_reason ?? '' } : null,
    activation: null,
  }
}

// Backend "Branch" serializeri: id, name, address, warehouses_count, status, region_info, district_info.
// Xodimlar soni uchun hali endpoint yo'q — `xodim: null`.
function mapBranch(b) {
  return {
    id: b.id,
    name: b.name ?? '',
    viloyat: b.region_info?.name ?? '',
    tuman: b.district_info?.name ?? '',
    manzil: b.address ?? '',
    xodim: null,
    ombor: Number(b.warehouses_count) || 0,
  }
}

// OrgModal'dan kelgan draft'ni (viloyat/tuman — id) backend kutgan so'rov shakliga o'giradi.
function buildOrgPayload(draft) {
  return {
    name: (draft.name ?? '').trim(),
    inn: draft.inn ?? '',
    phone: draft.phone ? draft.phone.replace(/[\s-]/g, '') : '',
    director: (draft.director ?? '').trim(),
    region: draft.viloyat || undefined,
    district: draft.tuman || undefined,
    address: draft.manzil ?? '',
    prefix: draft.titul ?? '',
  }
}

const initialState = {
  list: [],
  listStatus: 'idle', // idle | loading | succeeded | failed
  listError: '',

  current: null,
  detailStatus: 'idle',
  detailError: '',
  branchesStatus: 'idle',

  saveStatus: 'idle',
  saveError: '',
}

export const fetchOrganizations = createAsyncThunk(
  'tashkilotlar/fetchOrganizations',
  async (_, { rejectWithValue }) => {
    try {
      const results = await organizationService.getAllOrganizations()
      return results.map(mapOrg)
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Tashkilotlarni yuklab bo‘lmadi'))
    }
  }
)

export const fetchOrganizationDetail = createAsyncThunk(
  'tashkilotlar/fetchOrganizationDetail',
  async (id, { rejectWithValue }) => {
    try {
      const raw = await organizationService.getOrganization(id)
      return mapOrg(raw)
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Tashkilot topilmadi'))
    }
  }
)

export const fetchOrgBranches = createAsyncThunk(
  'tashkilotlar/fetchOrgBranches',
  async (orgId, { rejectWithValue }) => {
    try {
      const results = await organizationService.getBranchesByOrganization(orgId)
      return { orgId, branches: results.map(mapBranch) }
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Filiallarni yuklab bo‘lmadi'))
    }
  }
)

export const createOrganization = createAsyncThunk(
  'tashkilotlar/createOrganization',
  async (draft, { rejectWithValue }) => {
    try {
      const raw = await organizationService.createOrganization(buildOrgPayload(draft))
      return mapOrg(raw)
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Saqlashda xatolik yuz berdi'))
    }
  }
)

export const updateOrganization = createAsyncThunk(
  'tashkilotlar/updateOrganization',
  async ({ id, draft }, { rejectWithValue }) => {
    try {
      const raw = await organizationService.updateOrganization(id, buildOrgPayload(draft))
      return mapOrg(raw)
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Yangilashda xatolik yuz berdi'))
    }
  }
)

export const suspendOrganization = createAsyncThunk(
  'tashkilotlar/suspendOrganization',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const raw = await organizationService.suspendOrganization(id, reason)
      return mapOrg(raw)
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'To‘xtatishda xatolik yuz berdi'))
    }
  }
)

export const activateOrganization = createAsyncThunk(
  'tashkilotlar/activateOrganization',
  async (id, { rejectWithValue }) => {
    try {
      const raw = await organizationService.activateOrganization(id)
      return mapOrg(raw)
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Faollashtirishda xatolik yuz berdi'))
    }
  }
)

const tashkilotlarSlice = createSlice({
  name: 'tashkilotlar',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrganizations.pending, (state) => {
        state.listStatus = 'loading'
        state.listError = ''
      })
      .addCase(fetchOrganizations.fulfilled, (state, action) => {
        state.listStatus = 'succeeded'
        state.list = action.payload
      })
      .addCase(fetchOrganizations.rejected, (state, action) => {
        state.listStatus = 'failed'
        state.listError = action.payload || 'Xatolik'
      })

      .addCase(fetchOrganizationDetail.pending, (state) => {
        state.detailStatus = 'loading'
        state.detailError = ''
      })
      .addCase(fetchOrganizationDetail.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded'
        const prevBranches = state.current?.id === action.payload.id ? state.current.branches : []
        state.current = { ...action.payload, branches: prevBranches }
      })
      .addCase(fetchOrganizationDetail.rejected, (state, action) => {
        state.detailStatus = 'failed'
        state.detailError = action.payload || 'Xatolik'
        state.current = null
      })

      .addCase(fetchOrgBranches.pending, (state) => {
        state.branchesStatus = 'loading'
      })
      .addCase(fetchOrgBranches.fulfilled, (state, action) => {
        state.branchesStatus = 'succeeded'
        if (state.current?.id === action.payload.orgId) state.current.branches = action.payload.branches
      })
      .addCase(fetchOrgBranches.rejected, (state) => {
        state.branchesStatus = 'failed'
      })

      .addCase(createOrganization.pending, (state) => {
        state.saveStatus = 'loading'
        state.saveError = ''
      })
      .addCase(createOrganization.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded'
        state.list.unshift(action.payload)
      })
      .addCase(createOrganization.rejected, (state, action) => {
        state.saveStatus = 'failed'
        state.saveError = action.payload || 'Xatolik'
      })

      .addCase(updateOrganization.pending, (state) => {
        state.saveStatus = 'loading'
        state.saveError = ''
      })
      .addCase(updateOrganization.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded'
        const idx = state.list.findIndex((o) => o.id === action.payload.id)
        if (idx !== -1) state.list[idx] = { ...state.list[idx], ...action.payload }
        if (state.current?.id === action.payload.id) {
          state.current = { ...state.current, ...action.payload }
        }
      })
      .addCase(updateOrganization.rejected, (state, action) => {
        state.saveStatus = 'failed'
        state.saveError = action.payload || 'Xatolik'
      })

      .addCase(suspendOrganization.pending, (state) => {
        state.saveStatus = 'loading'
        state.saveError = ''
      })
      .addCase(suspendOrganization.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded'
        const idx = state.list.findIndex((o) => o.id === action.payload.id)
        if (idx !== -1) state.list[idx] = action.payload
        if (state.current?.id === action.payload.id) state.current = { ...state.current, ...action.payload }
      })
      .addCase(suspendOrganization.rejected, (state, action) => {
        state.saveStatus = 'failed'
        state.saveError = action.payload || 'Xatolik'
      })

      .addCase(activateOrganization.pending, (state) => {
        state.saveStatus = 'loading'
        state.saveError = ''
      })
      .addCase(activateOrganization.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded'
        const idx = state.list.findIndex((o) => o.id === action.payload.id)
        if (idx !== -1) state.list[idx] = action.payload
        if (state.current?.id === action.payload.id) state.current = { ...state.current, ...action.payload }
      })
      .addCase(activateOrganization.rejected, (state, action) => {
        state.saveStatus = 'failed'
        state.saveError = action.payload || 'Xatolik'
      })
  },
})

export default tashkilotlarSlice.reducer
