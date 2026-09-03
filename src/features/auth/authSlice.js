import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

// Backend hali tayyor emas — shu bilan sinab ko'ring: login "admin", parol "1"
const MOCK_USER = {
  login: 'admin',
  password: '1',
  fullName: "Mirzajonov G'afforjon",
  role: 'Menejer',
  initials: 'MG',
}

const MAX_ATTEMPTS = 5
const BLOCK_DURATION_MS = 5 * 60 * 1000

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

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

const storedBlockedUntil = readStored('gilam-auth-blockedUntil', null)
const isStillBlocked = storedBlockedUntil && storedBlockedUntil > Date.now()

const initialState = {
  user: readStored('gilam-auth-user', null),
  token: (() => {
    try {
      return localStorage.getItem('gilam-auth-token')
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
  async ({ login, password }, { getState, rejectWithValue }) => {
    await sleep(600)
    const state = getState().auth
    if (state.blockedUntil && Date.now() < state.blockedUntil) {
      return rejectWithValue({ type: 'blocked' })
    }
    if (login.trim() === MOCK_USER.login && password === MOCK_USER.password) {
      return {
        user: {
          login: MOCK_USER.login,
          fullName: MOCK_USER.fullName,
          role: MOCK_USER.role,
          initials: MOCK_USER.initials,
        },
        token: 'mock-token-' + Date.now(),
      }
    }
    return rejectWithValue({ type: 'invalid' })
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
      try {
        localStorage.removeItem('gilam-auth-token')
        localStorage.removeItem('gilam-auth-user')
      } catch {
        /* ignore */
      }
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
        state.token = action.payload.token
        state.attemptsLeft = MAX_ATTEMPTS
        state.blockedUntil = null
        state.errorMessage = ''
        writeStored('gilam-auth-attemptsLeft', MAX_ATTEMPTS)
        writeStored('gilam-auth-blockedUntil', null)
        writeStored('gilam-auth-user', action.payload.user)
        try {
          localStorage.setItem('gilam-auth-token', action.payload.token)
        } catch {
          /* ignore */
        }
      })
      .addCase(login.rejected, (state, action) => {
        const type = action.payload?.type
        if (type === 'blocked') {
          state.status = 'blocked'
          return
        }
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
        state.errorMessage = "Login yoki parol noto'g'ri"
      })
  },
})

export const { unblock, logout } = authSlice.actions
export default authSlice.reducer
