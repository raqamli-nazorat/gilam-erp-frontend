import { createSlice } from '@reduxjs/toolkit'
import { EXPENSE_EXCHANGE_RATE, initialExpenses, makeExpense } from './expensesMockData'

const initialState = {
  list: initialExpenses,
  exchangeRate: EXPENSE_EXCHANGE_RATE,
}

const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    expenseAdded: {
      reducer(state, action) {
        state.list.unshift(action.payload)
      },
      prepare(input) {
        return { payload: makeExpense(input) }
      },
    },
    expenseDeleted(state, action) {
      state.list = state.list.filter((e) => e.id !== action.payload)
    },
  },
})

export const { expenseAdded, expenseDeleted } = expensesSlice.actions
export default expensesSlice.reducer
