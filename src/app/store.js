import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/features/auth/authSlice'
import uiReducer from '@/features/ui/uiSlice'
import geoReducer from '@/features/geo/geoSlice'
import receiptsReducer, { RECEIPTS_STORAGE_KEY } from '@/features/receipts/receiptsSlice'
import bookingsReducer from '@/features/bookings/bookingsSlice'
import saleDocsReducer from '@/features/sales/salesSlice'
import returnsReducer from '@/features/returns/returnsSlice'
import qaytarishKirimiReducer from '@/features/qaytarishKirimi/qkSlice'
import expensesReducer from '@/features/expenses/expensesSlice'
import payrollReducer from '@/features/payroll/payrollSlice'
import kassaReducer from '@/features/kassa/kassaSlice'
import tashkilotlarReducer from '@/features/tashkilotlar/tashkilotlarSlice'
import filiallarReducer from '@/features/filiallar/filiallarSlice'
import foydalanuvchilarReducer from '@/features/foydalanuvchilar/foydalanuvchilarSlice'
import xodimlarReducer from '@/features/xodimlar/xodimlarSlice'
import ishGrafigiReducer from '@/features/ishGrafigi/ishGrafigiSlice'
import oylikHisoblashReducer from '@/features/oylikHisoblash/oylikSlice'
import rejaNarxReducer from '@/features/rejaNarx/rejaNarxSlice'
import accrualRetentionReducer from '@/features/accrualRetention/accrualRetentionSlice'
import {
  qualitySlice,
  unitSlice,
  colorSlice,
  positionSlice,
  counterpartyTypeSlice,
  countrySlice,
  designSlice,
  currencySlice,
} from '@/features/malumotnomalar/referenceEntities'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    geo: geoReducer,
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
    foydalanuvchilar: foydalanuvchilarReducer,
    xodimlar: xodimlarReducer,
    ishGrafigi: ishGrafigiReducer,
    oylikHisoblash: oylikHisoblashReducer,
    accrualRetention: accrualRetentionReducer,
    rejaNarx: rejaNarxReducer,
    sifatlar: qualitySlice.reducer,
    birliklar: unitSlice.reducer,
    ranglar: colorSlice.reducer,
    lavozimlar: positionSlice.reducer,
    kontragentTurlari: counterpartyTypeSlice.reducer,
    davlatlar: countrySlice.reducer,
    dizaynlar: designSlice.reducer,
    valyutalar: currencySlice.reducer,
  },
})

// Tovarlar kirimi hujjatlari brauzerda saqlanadi (backendda kirim endpointi yo'q) —
// o'zgarishlardan keyin 300 ms kutib yoziladi; ro'yxat o'zgarmagan bo'lsa yozilmaydi.
let lastReceipts = store.getState().receipts.list
let persistTimer = null
store.subscribe(() => {
  const list = store.getState().receipts.list
  if (list === lastReceipts) return
  lastReceipts = list
  clearTimeout(persistTimer)
  persistTimer = setTimeout(() => {
    try {
      localStorage.setItem(RECEIPTS_STORAGE_KEY, JSON.stringify(list))
    } catch {
      // Xotira to'lgan yoki brauzer saqlashni bloklagan — ish davom etadi, faqat saqlanmaydi
    }
  }, 300)
})

