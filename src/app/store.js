import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/features/auth/authSlice'
import uiReducer from '@/features/ui/uiSlice'
import receiptsReducer from '@/features/receipts/receiptsSlice'
import bookingsReducer from '@/features/bookings/bookingsSlice'
import saleDocsReducer from '@/features/sales/salesSlice'
import returnsReducer from '@/features/returns/returnsSlice'
import qaytarishKirimiReducer from '@/features/qaytarishKirimi/qkSlice'
import expensesReducer from '@/features/expenses/expensesSlice'
import payrollReducer from '@/features/payroll/payrollSlice'
import kassaReducer from '@/features/kassa/kassaSlice'
import tashkilotlarReducer from '@/features/tashkilotlar/tashkilotlarSlice'
import filiallarReducer from '@/features/filiallar/filiallarSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    receipts: receiptsReducer,
    bookings: bookingsReducer,
    saleDocs: saleDocsReducer,
    returns: returnsReducer,
    qaytarishKirimi: qaytarishKirimiReducer,
    expenses: expensesReducer,
    payroll: payrollReducer,
    kassa: kassaReducer,
    tashkilotlar: tashkilotlarReducer,
    filiallar: filiallarReducer,
  },
})
