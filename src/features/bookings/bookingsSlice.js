import { createSlice, nanoid } from '@reduxjs/toolkit'
import {
  BOOKING_EXCHANGE_RATE,
  initialBookings,
  nextBookingNumber,
  rollBookedM2,
} from './bookingsMockData'

function findBooking(state, id) {
  return state.list.find((b) => b.id === id)
}

const initialState = {
  list: initialBookings,
  exchangeRate: BOOKING_EXCHANGE_RATE,
}

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    bookingDraftCreated: {
      reducer(state, action) {
        state.list.unshift(action.payload)
      },
      prepare() {
        const number = nextBookingNumber()
        return {
          payload: {
            id: number,
            number,
            date: new Date().toISOString().slice(0, 10),
            time: new Date().toTimeString().slice(0, 5),
            customer: '',
            agent: "Mirzajonov G'afforjon",
            warehouse: 'Bron ombori',
            transport: 'Tanlanmagan',
            supplierDoc: '',
            status: 'draft',
            rooms: [],
            rolls: [],
            bronM2: 0,
            soldM2: 0,
            returnedM2: 0,
          },
        }
      },
    },
    bookingHeaderUpdated(state, action) {
      const { id, patch } = action.payload
      const b = findBooking(state, id)
      if (b) Object.assign(b, patch)
    },
    roomAdded(state, action) {
      const { id, room } = action.payload
      const b = findBooking(state, id)
      if (b) b.rooms.push({ ...room, id: room.id ?? nanoid() })
    },
    roomRemoved(state, action) {
      const { id, roomId } = action.payload
      const b = findBooking(state, id)
      if (b) b.rooms = b.rooms.filter((r) => r.id !== roomId)
    },
    rollsAdded(state, action) {
      const { id, rolls } = action.payload
      const b = findBooking(state, id)
      if (!b) return
      rolls.forEach((r) => b.rolls.push({ ...r, id: r.id ?? nanoid() }))
    },
    rollRemoved(state, action) {
      const { id, rollId } = action.payload
      const b = findBooking(state, id)
      if (b) b.rolls = b.rolls.filter((r) => r.id !== rollId)
    },
    rollToggled(state, action) {
      const { id, rollId } = action.payload
      const b = findBooking(state, id)
      if (!b) return
      const roll = b.rolls.find((r) => r.id === rollId)
      if (roll) roll.selected = !roll.selected
    },
    rollCut(state, action) {
      const { id, rollId } = action.payload
      const b = findBooking(state, id)
      if (!b) return
      const roll = b.rolls.find((r) => r.id === rollId)
      if (roll) {
        roll.cut = true
        roll.stockM2 = Math.max(0, Number((roll.stockM2 - rollBookedM2(roll)).toFixed(2)))
      }
    },
    bookingSold(state, action) {
      const { id, rollIds } = action.payload
      const b = findBooking(state, id)
      if (!b) return
      const soldArea = b.rolls
        .filter((r) => rollIds.includes(r.id))
        .reduce((s, r) => s + rollBookedM2(r), 0)
      b.soldM2 = Number((b.soldM2 + soldArea).toFixed(2))
      b.status = b.rolls.every((r) => rollIds.includes(r.id)) ? 'closed' : 'partial'
    },
    bookingCancelled(state, action) {
      const b = findBooking(state, action.payload)
      if (b) b.status = 'closed'
    },
    bookingSaved(state, action) {
      const b = findBooking(state, action.payload)
      if (b && b.status === 'draft') b.status = 'active'
    },
  },
})

export const {
  bookingDraftCreated,
  bookingHeaderUpdated,
  roomAdded,
  roomRemoved,
  rollsAdded,
  rollRemoved,
  rollToggled,
  rollCut,
  bookingSold,
  bookingCancelled,
  bookingSaved,
} = bookingsSlice.actions

export default bookingsSlice.reducer
