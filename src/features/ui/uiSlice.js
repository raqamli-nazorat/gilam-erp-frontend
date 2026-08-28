import { createSlice } from '@reduxjs/toolkit'

function getInitialTheme() {
  // Figma dizaynidagi barcha sahifalar yorug' temada — shuning uchun standart
  // holat doim "light", faqat foydalanuvchi o'zi tanlagan bo'lsa saqlanadi.
  // Tizim (OS) sozlamasiga qarab avtomatik tanlanmaydi.
  try {
    const saved = localStorage.getItem('gilam-theme')
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    /* ignore */
  }
  return 'light'
}

const initialState = {
  theme: getInitialTheme(),
  sidebarCollapsed: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme(state, action) {
      state.theme = action.payload
      try {
        localStorage.setItem('gilam-theme', action.payload)
      } catch {
        /* ignore */
      }
    },
    toggleTheme(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem('gilam-theme', state.theme)
      } catch {
        /* ignore */
      }
    },
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    setSidebarCollapsed(state, action) {
      state.sidebarCollapsed = action.payload
    },
  },
})

export const { setTheme, toggleTheme, toggleSidebar, setSidebarCollapsed } = uiSlice.actions
export default uiSlice.reducer
