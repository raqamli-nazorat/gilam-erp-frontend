import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/features/auth/authSlice'
import uiReducer from '@/features/ui/uiSlice'
import receiptsReducer from '@/features/receipts/receiptsSlice'
import bookingsReducer from '@/features/bookings/bookingsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    receipts: receiptsReducer,
    bookings: bookingsReducer,
  },
})
