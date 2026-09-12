import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { formatDateTime } from '@/lib/format'
import * as geoService from '@/services/geoService'
import { extractErrorMessage } from '@/services/apiHelpers'

// Tashkilot/filial shakllaridagi "Viloyat"/"Tuman" selectlari va "Ma'lumotnomalar >
// Davlat/Viloyat/Tuman" boshqaruv sahifalari uchun — Region/District APIsi shu yerda saqlanadi.
function mapRegion(r) {
  return {
    id: r.id,
    name: r.name ?? '',
    countryId: r.country_info?.id ?? '',
    countryName: r.country_info?.name ?? '',
    yaratilgan: r.created_at ? formatDateTime(new Date(r.created_at)) : '',
    ozgartirilgan: r.updated_at ? formatDateTime(new Date(r.updated_at)) : '',
  }
}
function mapDistrict(d) {
  return {
    id: d.id,
    name: d.name ?? '',
    regionId: d.region_info?.id ?? '',
    regionName: d.region_info?.name ?? '',
    yaratilgan: d.created_at ? formatDateTime(new Date(d.created_at)) : '',
    ozgartirilgan: d.updated_at ? formatDateTime(new Date(d.updated_at)) : '',
  }
}

const initialState = {
  regions: [],
  regionsStatus: 'idle', // idle | loading | succeeded | failed
  regionsError: '',
  districtsByRegion: {}, // { [regionId]: {id,name}[] } — select'lar uchun kesh
  districtsStatus: {}, // { [regionId]: 'idle' | 'loading' | 'succeeded' | 'failed' }

  allDistricts: [], // "Tumanlar" boshqaruv jadvali uchun — barcha viloyatlar bo'yicha
  allDistrictsStatus: 'idle',
  allDistrictsError: '',

  saveStatus: 'idle',
  saveError: '',
}

export const fetchRegions = createAsyncThunk(
  'geo/fetchRegions',
  async (_, { getState, rejectWithValue }) => {
    if (getState().geo.regionsStatus === 'succeeded') return null
    try {
      const results = await geoService.getAllRegions()
      return results.map(mapRegion)
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Viloyatlarni yuklab bo‘lmadi'))
    }
  }
)

export const fetchDistricts = createAsyncThunk(
  'geo/fetchDistricts',
  async (regionId, { getState, rejectWithValue }) => {
    if (!regionId) return { regionId, list: [] }
    if (getState().geo.districtsByRegion[regionId]) return null
    try {
      const results = await geoService.getDistrictsByRegion(regionId)
      return { regionId, list: results.map(mapDistrict) }
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Tumanlarni yuklab bo‘lmadi'))
    }
  }
)

export const fetchAllDistricts = createAsyncThunk(
  'geo/fetchAllDistricts',
  async (_, { rejectWithValue }) => {
    try {
      const results = await geoService.getAllDistricts()
      return results.map(mapDistrict)
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Tumanlarni yuklab bo‘lmadi'))
    }
  }
)

export const createRegion = createAsyncThunk(
  'geo/createRegion',
  // `...rest` — masalan "kodi": hozircha backend qabul qilmaydi/qaytarmaydi, lekin
  // qo'shilgach ishlab ketishi uchun forma maydoni saqlanadi va so'rovga qo'shib yuboriladi.
  async ({ name, country, ...rest }, { rejectWithValue }) => {
    try {
      const raw = await geoService.createRegion({ name, country, ...rest })
      return mapRegion(raw)
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Saqlashda xatolik yuz berdi'))
    }
  }
)

export const updateRegion = createAsyncThunk(
  'geo/updateRegion',
  async ({ id, name, country, ...rest }, { rejectWithValue }) => {
    try {
      const raw = await geoService.updateRegion(id, { name, country, ...rest })
      return mapRegion(raw)
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Yangilashda xatolik yuz berdi'))
    }
  }
)

export const deleteRegion = createAsyncThunk(
  'geo/deleteRegion',
  async (id, { rejectWithValue }) => {
    try {
      await geoService.deleteRegion(id)
      return id
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'O‘chirishda xatolik yuz berdi'))
    }
  }
)

export const createDistrict = createAsyncThunk(
  'geo/createDistrict',
  async ({ name, region, ...rest }, { rejectWithValue }) => {
    try {
      const raw = await geoService.createDistrict({ name, region, ...rest })
      return mapDistrict(raw)
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Saqlashda xatolik yuz berdi'))
    }
  }
)

export const updateDistrict = createAsyncThunk(
  'geo/updateDistrict',
  async ({ id, name, region, ...rest }, { rejectWithValue }) => {
    try {
      const raw = await geoService.updateDistrict(id, { name, region, ...rest })
      return mapDistrict(raw)
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Yangilashda xatolik yuz berdi'))
    }
  }
)

export const deleteDistrict = createAsyncThunk(
  'geo/deleteDistrict',
  async (id, { rejectWithValue }) => {
    try {
      await geoService.deleteDistrict(id)
      return id
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'O‘chirishda xatolik yuz berdi'))
    }
  }
)

const geoSlice = createSlice({
  name: 'geo',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRegions.pending, (state) => {
        state.regionsStatus = 'loading'
        state.regionsError = ''
      })
      .addCase(fetchRegions.fulfilled, (state, action) => {
        state.regionsStatus = 'succeeded'
        if (action.payload) state.regions = action.payload
      })
      .addCase(fetchRegions.rejected, (state, action) => {
        state.regionsStatus = 'failed'
        state.regionsError = action.payload || 'Xatolik'
      })

      .addCase(fetchDistricts.pending, (state, action) => {
        state.districtsStatus[action.meta.arg] = 'loading'
      })
      .addCase(fetchDistricts.fulfilled, (state, action) => {
        const regionId = action.meta.arg
        if (!action.payload) {
          state.districtsStatus[regionId] = 'succeeded'
          return
        }
        state.districtsByRegion[action.payload.regionId] = action.payload.list
        state.districtsStatus[regionId] = 'succeeded'
      })
      .addCase(fetchDistricts.rejected, (state, action) => {
        state.districtsStatus[action.meta.arg] = 'failed'
      })

      .addCase(fetchAllDistricts.pending, (state) => {
        state.allDistrictsStatus = 'loading'
        state.allDistrictsError = ''
      })
      .addCase(fetchAllDistricts.fulfilled, (state, action) => {
        state.allDistrictsStatus = 'succeeded'
        state.allDistricts = action.payload
      })
      .addCase(fetchAllDistricts.rejected, (state, action) => {
        state.allDistrictsStatus = 'failed'
        state.allDistrictsError = action.payload || 'Xatolik'
      })

      .addCase(createRegion.pending, (state) => {
        state.saveStatus = 'loading'
        state.saveError = ''
      })
      .addCase(createRegion.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded'
        state.regions.unshift(action.payload)
      })
      .addCase(createRegion.rejected, (state, action) => {
        state.saveStatus = 'failed'
        state.saveError = action.payload || 'Xatolik'
      })

      .addCase(updateRegion.pending, (state) => {
        state.saveStatus = 'loading'
        state.saveError = ''
      })
      .addCase(updateRegion.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded'
        const idx = state.regions.findIndex((r) => r.id === action.payload.id)
        if (idx !== -1) state.regions[idx] = action.payload
      })
      .addCase(updateRegion.rejected, (state, action) => {
        state.saveStatus = 'failed'
        state.saveError = action.payload || 'Xatolik'
      })

      .addCase(deleteRegion.fulfilled, (state, action) => {
        state.regions = state.regions.filter((r) => r.id !== action.payload)
      })

      .addCase(createDistrict.pending, (state) => {
        state.saveStatus = 'loading'
        state.saveError = ''
      })
      .addCase(createDistrict.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded'
        state.allDistricts.unshift(action.payload)
        const bucket = state.districtsByRegion[action.payload.regionId]
        if (bucket) bucket.unshift({ id: action.payload.id, name: action.payload.name })
      })
      .addCase(createDistrict.rejected, (state, action) => {
        state.saveStatus = 'failed'
        state.saveError = action.payload || 'Xatolik'
      })

      .addCase(updateDistrict.pending, (state) => {
        state.saveStatus = 'loading'
        state.saveError = ''
      })
      .addCase(updateDistrict.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded'
        const idx = state.allDistricts.findIndex((d) => d.id === action.payload.id)
        if (idx !== -1) state.allDistricts[idx] = action.payload
        // Eski/yangi viloyat keshlarini yangilash (agar yuklangan bo'lsa)
        Object.keys(state.districtsByRegion).forEach((regionId) => {
          state.districtsByRegion[regionId] = state.districtsByRegion[regionId].filter((d) => d.id !== action.payload.id)
        })
        const bucket = state.districtsByRegion[action.payload.regionId]
        if (bucket) bucket.unshift({ id: action.payload.id, name: action.payload.name })
      })
      .addCase(updateDistrict.rejected, (state, action) => {
        state.saveStatus = 'failed'
        state.saveError = action.payload || 'Xatolik'
      })

      .addCase(deleteDistrict.fulfilled, (state, action) => {
        state.allDistricts = state.allDistricts.filter((d) => d.id !== action.payload)
        Object.keys(state.districtsByRegion).forEach((regionId) => {
          state.districtsByRegion[regionId] = state.districtsByRegion[regionId].filter((d) => d.id !== action.payload)
        })
      })
  },
})

export default geoSlice.reducer
