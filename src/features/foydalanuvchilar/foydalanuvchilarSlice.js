import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { formatDateTime } from '@/lib/format'
import { extractErrorMessage } from '@/services/apiHelpers'
import * as userService from '@/services/userService'
import * as roleService from '@/services/roleService'

// Backend "User" serializeri (confirmed against the live /api/schema/, 2026-09-17): id, full_name,
// phone_number, organization (plain read-only display string, NOT nested organization_info — no
// UUID exposed), branch (same, plain string), is_staff, is_blocked, blocked_reason, blocked_at,
// blocked_by, created_at, updated_at, role_info{id,name}, employee_info{id,full_name}. There is
// no all_branches field. Write side (UserRequest/PatchedUserRequest) only accepts full_name,
// phone_number, password, role, employee, is_staff — organization/branch/all_branches are NOT
// accepted at all, so they can't be set directly; org/branch appear to be derived server-side from
// whichever Employee (`employee`) the user is linked to, if any.
// Eksport qilingan — FoydalanuvchilarListPage.jsx jadval qatorlarini "scroll pagination"
// bilan servisdan to'g'ridan-to'g'ri (Redux thunk'siz) olib kelib shu bilan xaritalaydi.
// Sxemada organization/branch/blocked_by "string" deb yozilgan, lekin backend ularni
// {id, name} (yoki {id, full_name}) obyekt sifatida qaytaradi — ikkala ko'rinishni ham qabul qilamiz.
// Aks holda obyekt to'g'ridan-to'g'ri JSX'ga tushib, sahifa qulardi ("Objects are not valid as a React child").
function nameOf(v) {
  if (v == null) return ''
  if (typeof v === 'object') return v.name ?? v.full_name ?? ''
  return String(v)
}

function idOf(v) {
  return v && typeof v === 'object' ? (v.id ?? '') : ''
}

export function mapUser(u) {
  // Schema is_blocked'ni string deb belgilagan (auto-generated, ehtimol SerializerMethodField
  // annotatsiyasiz) — shuning uchun bool va "true" string ko'rinishlarini ham hisobga olamiz.
  const isBlocked = u.is_blocked === true || u.is_blocked === 'true'
  return {
    id: u.id,
    name: u.full_name ?? '',
    phone: u.phone_number ?? '',
    tashkilot: nameOf(u.organization),
    tashkilotId: idOf(u.organization),
    filial: nameOf(u.branch),
    filialId: idOf(u.branch),
    rol: u.role_info?.name ?? '',
    rolId: u.role_info?.id ?? '',
    // Ushbu foydalanuvchiga bog'langan Xodim (Employee) profili — bo'lsa, "Tahrirlash"/
    // "Ishdan chiqarish"/"Qayta ishga olish" Xodimlar modulidagi hujjat orqali ishlaydi.
    employeeId: u.employee_info?.id ?? '',
    isStaff: !!u.is_staff,
    holat: isBlocked ? 'blocked' : 'active',
    yaratilgan: u.created_at ? formatDateTime(new Date(u.created_at)) : '',
    oxirgiKirish: '—',
    block: isBlocked
      ? {
          at: u.blocked_at ? formatDateTime(new Date(u.blocked_at)) : '—',
          reason: nameOf(u.blocked_reason),
          by: nameOf(u.blocked_by),
        }
      : null,
    activation: null,
    detail: {
      stats: { savdolar: null, savdoSummasi: null, qaytarishlar: null, oxirgiKirish: '—' },
      audit: [],
      lastSales: [],
    },
  }
}

// Backend "Role" serializeri: id, name, is_system(readonly), permissions_count, users_count,
// created_at, updated_at, organization_info{id,name}. "Qanday ruxsatlar tanlangan" backendda
// qaytarilmaydi (faqat soni) — shuning uchun tahrirlashda ruxsatlar ro'yxati ko'rsatilmaydi.
// Eksport qilingan — RollarPage.jsx jadval qatorlarini "scroll pagination" bilan servisdan
// to'g'ridan-to'g'ri (Redux thunk'siz) olib kelib shu bilan xaritalaydi.
export function mapRole(r) {
  return {
    id: r.id,
    name: r.name ?? '',
    tashkilot: r.organization_info?.name ?? 'Barcha tashkilotlar',
    tashkilotId: r.organization_info?.id ?? '',
    isSystem: !!r.is_system,
    usersCount: r.users_count ?? 0,
    permissionsCount: r.permissions_count ?? 0,
    holat: 'active',
    yaratilgan: r.created_at ? formatDateTime(new Date(r.created_at)) : '',
    ozgartirilgan: r.updated_at ? formatDateTime(new Date(r.updated_at)) : '',
  }
}

function mapPermission(p) {
  return { id: p.id, name: p.name, codename: p.codename, modelName: p.model_name }
}

// `organization`/`branch`/`all_branches` are deliberately NOT sent — UserRequest/PatchedUserRequest
// don't accept them at all (backend silently drops unknown fields), so the Foydalanuvchi modal's
// Tashkilot/Filial pickers currently have no way to actually persist a selection. Flagged to the
// backend team; not worked around client-side (no Figma evidence for an Employee-link picker here).
function buildUserPayload(draft, isEdit) {
  const payload = {
    full_name: (draft.name ?? '').trim(),
    phone_number: draft.phone ? draft.phone.replace(/[\s-]/g, '') : '',
    role: draft.rol || null,
    is_staff: !!draft.isStaff,
  }
  if (!isEdit || draft.password) payload.password = draft.password
  return payload
}

function buildRolePayload(draft) {
  const payload = { name: (draft.name ?? '').trim(), organization: draft.tashkilot || null }
  if (draft.permissions) payload.permissions = draft.permissions
  return payload
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

  roles: [],
  rolesStatus: 'idle',
  rolesError: '',
  roleSaveStatus: 'idle',
  roleSaveError: '',

  permissions: [],
  permissionsStatus: 'idle',
}

export const fetchUsers = createAsyncThunk('foydalanuvchilar/fetchUsers', async (_, { rejectWithValue }) => {
  try {
    const results = await userService.getAllUsers()
    return results.map(mapUser)
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error, 'Foydalanuvchilarni yuklab bo‘lmadi'))
  }
})

export const fetchUserDetail = createAsyncThunk(
  'foydalanuvchilar/fetchUserDetail',
  async (id, { rejectWithValue }) => {
    try {
      const raw = await userService.getUser(id)
      return mapUser(raw)
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Foydalanuvchi topilmadi'))
    }
  }
)

export const createUser = createAsyncThunk(
  'foydalanuvchilar/createUser',
  async (draft, { rejectWithValue }) => {
    try {
      const raw = await userService.createUser(buildUserPayload(draft, false))
      return mapUser(raw)
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Saqlashda xatolik yuz berdi'))
    }
  }
)

export const updateUser = createAsyncThunk(
  'foydalanuvchilar/updateUser',
  async ({ id, draft }, { rejectWithValue }) => {
    try {
      const raw = await userService.updateUser(id, buildUserPayload(draft, true))
      return mapUser(raw)
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Yangilashda xatolik yuz berdi'))
    }
  }
)

export const blockUser = createAsyncThunk(
  'foydalanuvchilar/blockUser',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const raw = await userService.blockUser(id, reason)
      return mapUser(raw)
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Bloklashda xatolik yuz berdi'))
    }
  }
)

export const unblockUser = createAsyncThunk(
  'foydalanuvchilar/unblockUser',
  async (id, { rejectWithValue }) => {
    try {
      const raw = await userService.unblockUser(id)
      return mapUser(raw)
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Faollashtirishda xatolik yuz berdi'))
    }
  }
)

export const fetchRoles = createAsyncThunk('foydalanuvchilar/fetchRoles', async (_, { rejectWithValue }) => {
  try {
    const results = await roleService.getAllRoles()
    return results.map(mapRole)
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error, 'Rollarni yuklab bo‘lmadi'))
  }
},
  // Allaqachon yuklanayotgan bo'lsa — ikkinchi marta barcha sahifalarni so'ramaymiz.
  { condition: (_, { getState }) => getState().foydalanuvchilar.rolesStatus !== 'loading' }
)

export const createRole = createAsyncThunk(
  'foydalanuvchilar/createRole',
  async (draft, { rejectWithValue }) => {
    try {
      const raw = await roleService.createRole(buildRolePayload(draft))
      return mapRole(raw)
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Saqlashda xatolik yuz berdi'))
    }
  }
)

export const updateRole = createAsyncThunk(
  'foydalanuvchilar/updateRole',
  async ({ id, draft }, { rejectWithValue }) => {
    try {
      const raw = await roleService.updateRole(id, buildRolePayload(draft))
      return mapRole(raw)
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Yangilashda xatolik yuz berdi'))
    }
  }
)

export const deleteRole = createAsyncThunk(
  'foydalanuvchilar/deleteRole',
  async (id, { rejectWithValue }) => {
    try {
      await roleService.deleteRole(id)
      return id
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'O‘chirishda xatolik yuz berdi'))
    }
  }
)

export const fetchPermissions = createAsyncThunk(
  'foydalanuvchilar/fetchPermissions',
  async (_, { getState, rejectWithValue }) => {
    if (getState().foydalanuvchilar.permissionsStatus === 'succeeded') return null
    try {
      const results = await roleService.getAllPermissions()
      return results.map(mapPermission)
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Ruxsatlarni yuklab bo‘lmadi'))
    }
  }
)

const foydalanuvchilarSlice = createSlice({
  name: 'foydalanuvchilar',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.listStatus = 'loading'
        state.listError = ''
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.listStatus = 'succeeded'
        state.list = action.payload
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.listStatus = 'failed'
        state.listError = action.payload || 'Xatolik'
      })

      .addCase(fetchUserDetail.pending, (state) => {
        state.detailStatus = 'loading'
        state.detailError = ''
      })
      .addCase(fetchUserDetail.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded'
        state.current = action.payload
      })
      .addCase(fetchUserDetail.rejected, (state, action) => {
        state.detailStatus = 'failed'
        state.detailError = action.payload || 'Xatolik'
        state.current = null
      })

      .addCase(createUser.pending, (state) => {
        state.saveStatus = 'loading'
        state.saveError = ''
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded'
        state.list.unshift(action.payload)
      })
      .addCase(createUser.rejected, (state, action) => {
        state.saveStatus = 'failed'
        state.saveError = action.payload || 'Xatolik'
      })

      .addCase(updateUser.pending, (state) => {
        state.saveStatus = 'loading'
        state.saveError = ''
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded'
        const idx = state.list.findIndex((u) => u.id === action.payload.id)
        if (idx !== -1) state.list[idx] = { ...state.list[idx], ...action.payload }
        if (state.current?.id === action.payload.id) state.current = { ...state.current, ...action.payload }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.saveStatus = 'failed'
        state.saveError = action.payload || 'Xatolik'
      })

      .addCase(blockUser.pending, (state) => {
        state.saveStatus = 'loading'
        state.saveError = ''
      })
      .addCase(blockUser.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded'
        const idx = state.list.findIndex((u) => u.id === action.payload.id)
        if (idx !== -1) state.list[idx] = { ...state.list[idx], ...action.payload }
        if (state.current?.id === action.payload.id) state.current = { ...state.current, ...action.payload }
      })
      .addCase(blockUser.rejected, (state, action) => {
        state.saveStatus = 'failed'
        state.saveError = action.payload || 'Xatolik'
      })

      .addCase(unblockUser.pending, (state) => {
        state.saveStatus = 'loading'
        state.saveError = ''
      })
      .addCase(unblockUser.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded'
        const idx = state.list.findIndex((u) => u.id === action.payload.id)
        if (idx !== -1) state.list[idx] = { ...state.list[idx], ...action.payload }
        if (state.current?.id === action.payload.id) state.current = { ...state.current, ...action.payload }
      })
      .addCase(unblockUser.rejected, (state, action) => {
        state.saveStatus = 'failed'
        state.saveError = action.payload || 'Xatolik'
      })

      .addCase(fetchRoles.pending, (state) => {
        state.rolesStatus = 'loading'
        state.rolesError = ''
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.rolesStatus = 'succeeded'
        state.roles = action.payload
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.rolesStatus = 'failed'
        state.rolesError = action.payload || 'Xatolik'
      })

      .addCase(createRole.pending, (state) => {
        state.roleSaveStatus = 'loading'
        state.roleSaveError = ''
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.roleSaveStatus = 'succeeded'
        state.roles.unshift(action.payload)
      })
      .addCase(createRole.rejected, (state, action) => {
        state.roleSaveStatus = 'failed'
        state.roleSaveError = action.payload || 'Xatolik'
      })

      .addCase(updateRole.pending, (state) => {
        state.roleSaveStatus = 'loading'
        state.roleSaveError = ''
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        state.roleSaveStatus = 'succeeded'
        const idx = state.roles.findIndex((r) => r.id === action.payload.id)
        if (idx !== -1) state.roles[idx] = action.payload
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.roleSaveStatus = 'failed'
        state.roleSaveError = action.payload || 'Xatolik'
      })

      .addCase(deleteRole.fulfilled, (state, action) => {
        state.roles = state.roles.filter((r) => r.id !== action.payload)
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.roleSaveStatus = 'failed'
        state.roleSaveError = action.payload || 'Xatolik'
      })

      .addCase(fetchPermissions.pending, (state) => {
        state.permissionsStatus = 'loading'
      })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.permissionsStatus = 'succeeded'
        if (action.payload) state.permissions = action.payload
      })
      .addCase(fetchPermissions.rejected, (state) => {
        state.permissionsStatus = 'failed'
      })
  },
})

export default foydalanuvchilarSlice.reducer
