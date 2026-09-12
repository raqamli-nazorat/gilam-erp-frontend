import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { axiosAPI } from '@/services/axiosAPI'

const MAX_ATTEMPTS = 5
const BLOCK_DURATION_MS = 5 * 60 * 1000

function readStored(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeStored(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* ignore */
  }
}

function formatUser(rawUser) {
  if (!rawUser) return null
  const fullName = rawUser.full_name || rawUser.fullName || ''

  // Initials: e.g. "Sardorbek Anvarov" -> "SA", "admin" -> "AD"
  const parts = fullName.trim().split(/\s+/)
  let initials = '?'
  if (parts.length >= 2 && parts[0] && parts[1]) {
    initials = (parts[0][0] + parts[1][0]).toUpperCase()
  } else if (fullName.trim().length > 0) {
    initials = fullName.trim().slice(0, 2).toUpperCase()
  }

  const roleName =
    rawUser.role_info?.name ||
    rawUser.role ||
    (rawUser.is_staff ? 'Platforma admini' : 'Hodim')

  const branchName = rawUser.branch_info?.name || rawUser.filial || '—'
  const orgName =
    rawUser.branch_info?.organization_name ||
    rawUser.branch_info?.organization ||
    rawUser.tashkilot ||
    '—'

  return {
    ...rawUser,
    fullName: fullName || 'Foydalanuvchi',
    initials: rawUser.initials || initials,
    role: roleName,
    phone: rawUser.phone_number || rawUser.phone || '—',
    tashkilot: orgName,
    filial: branchName,
  }
}

const storedBlockedUntil = readStored('gilam-auth-blockedUntil', null)
const isStillBlocked = storedBlockedUntil && storedBlockedUntil > Date.now()

const initialState = {
  user: readStored('gilam-auth-user', null),
  token: (() => {
    try {
      return localStorage.getItem('access_token') || localStorage.getItem('gilam-auth-token')
    } catch {
      return null
    }
  })(),
  status: isStillBlocked ? 'blocked' : 'idle', // idle | loading | error | warning | blocked
  attemptsLeft: isStillBlocked ? 0 : readStored('gilam-auth-attemptsLeft', MAX_ATTEMPTS),
  blockedUntil: isStillBlocked ? storedBlockedUntil : null,
  errorMessage: '',
}

export const login = createAsyncThunk(
  'auth/login',
  async ({ login: loginValue, phone_number, password }, { getState, rejectWithValue }) => {
    const state = getState().auth
    if (state.blockedUntil && Date.now() < state.blockedUntil) {
      return rejectWithValue({ type: 'blocked', message: 'Hisob vaqtincha bloklangan' })
    }

    const rawPhone = (phone_number || loginValue || '').trim()
    // Agar raqam formatlangan bo'lsa (masalan: +998 90 123-45-67), bo'sh joylar va defislarni tozalash
    const phoneNumber = /^[+\d\s-]+$/.test(rawPhone)
      ? rawPhone.replace(/[\s-]/g, '')
      : rawPhone

    try {
      const response = await axiosAPI.post('auth/login/', {
        phone_number: phoneNumber,
        password,
      })

      const payload = response.data?.data || response.data
      const access = payload?.access
      const refresh = payload?.refresh
      const rawUser = payload?.user

      if (!access) {
        return rejectWithValue({
          type: 'other',
          message: 'Kirishda xatolik: Token olinmadi',
        })
      }

      const user = formatUser(rawUser)

      return {
        access,
        refresh,
        token: access,
        user,
      }
    } catch (error) {
      const status = error?.response?.status
      const errorData = error?.response?.data

      if (status === 401) {
        return rejectWithValue({
          type: '401',
          status: 401,
          message: errorData?.detail || errorData?.message || "Login yoki parol noto'g'ri",
        })
      }

      if (status === 429) {
        return rejectWithValue({
          type: 'blocked',
          status: 429,
          message:
            errorData?.detail ||
            errorData?.message ||
            "Ko'p marta xato kiritildi. Iltimos, keyinroq urinib ko'ring.",
        })
      }

      return rejectWithValue({
        type: 'other',
        status: status || 500,
        message:
          errorData?.detail ||
          errorData?.message ||
          error.message ||
          'Tizimga ulanishda xatolik yuz berdi',
      })
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    unblock(state) {
      state.status = 'idle'
      state.attemptsLeft = MAX_ATTEMPTS
      state.blockedUntil = null
      state.errorMessage = ''
      writeStored('gilam-auth-attemptsLeft', MAX_ATTEMPTS)
      writeStored('gilam-auth-blockedUntil', null)
    },
    logout(state) {
      state.user = null
      state.token = null
      state.status = 'idle'
      state.errorMessage = ''
      try {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('gilam-auth-token')
        localStorage.removeItem('gilam-auth-user')
      } catch {
        /* ignore */
      }
    },
    passwordChanged(state, action) {
      if (!state.user) return
      state.user.passwordChangedAt = action.payload
      writeStored('gilam-auth-user', state.user)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.errorMessage = ''
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'idle'
        state.user = action.payload.user
        state.token = action.payload.access || action.payload.token
        state.attemptsLeft = MAX_ATTEMPTS
        state.blockedUntil = null
        state.errorMessage = ''

        writeStored('gilam-auth-attemptsLeft', MAX_ATTEMPTS)
        writeStored('gilam-auth-blockedUntil', null)
        writeStored('gilam-auth-user', action.payload.user)

        try {
          if (action.payload.access) {
            localStorage.setItem('access_token', action.payload.access)
          }
          if (action.payload.refresh) {
            localStorage.setItem('refresh_token', action.payload.refresh)
          }
          localStorage.setItem('gilam-auth-token', action.payload.access || action.payload.token)
        } catch {
          /* ignore */
        }
      })
      .addCase(login.rejected, (state, action) => {
        const payload = action.payload || {}
        if (payload.type === 'blocked') {
          state.status = 'blocked'
          state.blockedUntil = Date.now() + BLOCK_DURATION_MS
          state.attemptsLeft = 0
          writeStored('gilam-auth-blockedUntil', state.blockedUntil)
          writeStored('gilam-auth-attemptsLeft', 0)
          state.errorMessage = payload.message || 'Hisob vaqtincha bloklandi'
          return
        }

        if (payload.status === 401 || payload.type === '401') {
          const nextAttempts = Math.max(0, state.attemptsLeft - 1)
          state.attemptsLeft = nextAttempts
          if (nextAttempts <= 0) {
            state.status = 'blocked'
            state.blockedUntil = Date.now() + BLOCK_DURATION_MS
            writeStored('gilam-auth-blockedUntil', state.blockedUntil)
          } else if (nextAttempts === 1) {
            state.status = 'warning'
          } else {
            state.status = 'error'
          }
          writeStored('gilam-auth-attemptsLeft', nextAttempts)
          state.errorMessage = payload.message || "Login yoki parol noto'g'ri"
          return
        }

        state.status = 'error'
        state.errorMessage = payload.message || 'Tizimga ulanishda xatolik yuz berdi'
      })
  },
})

export const { unblock, logout, passwordChanged } = authSlice.actions
export default authSlice.reducer
