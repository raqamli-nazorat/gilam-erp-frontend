import { createSlice } from '@reduxjs/toolkit'
import {
  initialAdvances,
  initialCalcPeriods,
  initialTimesheet,
  makeAdvance,
  nextCalcId,
  PAYROLL_EXCHANGE_RATE,
} from './payrollMockData'

const initialState = {
  periods: initialCalcPeriods,
  advances: initialAdvances,
  timesheet: initialTimesheet,
  exchangeRate: PAYROLL_EXCHANGE_RATE,
}

const payrollSlice = createSlice({
  name: 'payroll',
  initialState,
  reducers: {
    calcCreated: {
      reducer(state, action) {
        state.periods.unshift(action.payload)
      },
      prepare({ from, to, scheme, percent, totalSales, totalAmount, employeeAmount }) {
        return {
          payload: {
            id: nextCalcId(),
            from,
            to,
            scheme,
            totalSales,
            percent,
            totalAmount,
            employeeAmount,
            author: "Mirzajonov G'afforjon",
            status: 'hisoblandi',
          },
        }
      },
    },
    calcPaid(state, action) {
      const p = state.periods.find((x) => x.id === action.payload)
      if (p) p.status = 'berildi'
    },
    advanceAdded: {
      reducer(state, action) {
        state.advances.unshift(action.payload)
      },
      prepare(input) {
        return { payload: makeAdvance(input) }
      },
    },
    advanceDeleted(state, action) {
      state.advances = state.advances.filter((a) => a.id !== action.payload)
    },
    timesheetScanned(state, action) {
      const { empId, time } = action.payload
      const row = state.timesheet.find((t) => t.empId === empId)
      if (!row) return
      if (!row.arrived) {
        row.arrived = time
        row.status = time > '09:00' ? 'kechikdi' : 'ishda'
      } else if (!row.left) {
        row.left = time
        const [ah, am] = row.arrived.split(':').map(Number)
        const [lh, lm] = time.split(':').map(Number)
        row.hours = Number((((lh * 60 + lm) - (ah * 60 + am)) / 60).toFixed(2))
      }
    },
  },
})

export const {
  calcCreated,
  calcPaid,
  advanceAdded,
  advanceDeleted,
  timesheetScanned,
} = payrollSlice.actions

export default payrollSlice.reducer
