import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { formatDate, formatDateTime } from '@/lib/format'
import { extractErrorMessage } from '@/services/apiHelpers'
import * as employeeService from '@/services/employeeService'
import * as recruitmentService from '@/services/recruitmentService'
import { ledgerAmalLabel } from './xodimlarData'

// Backend "Employee" — xodimning shaxs profili.
function mapEmployee(e) {
  return {
    id: e.id,
    name: e.full_name ?? '',
    tashkilot: e.organization_info?.name ?? '',
    tashkilotId: e.organization_info?.id ?? '',
    filial: e.branch_info?.name ?? '',
    filialId: e.branch_info?.id ?? '',
    viloyat: e.region_info?.name ?? '',
    viloyatId: e.region_info?.id ?? '',
    tuman: e.district_info?.name ?? '',
    tumanId: e.district_info?.id ?? '',
    manzil: e.address ?? '',
    passportSeria: e.passport_seria ?? '',
    passportNumber: e.passport_number ?? '',
    jshshir: e.jsshr ?? '',
    stir: e.stir ?? '',
    phone: e.phone_number ?? '',
    tavsif: e.description ?? '',
    yaratilgan: e.created_at ? formatDateTime(new Date(e.created_at)) : '',
    ozgartirilgan: e.updated_at ? formatDateTime(new Date(e.updated_at)) : '',
  }
}

// Backend "RecruitmentDismissal" — bitta "ishga olish"/"ishdan chiqarish" hujjati.
function mapRecruitment(r) {
  return {
    id: r.id,
    type: r.type, // 'recruitment' | 'dismissal'
    employeeId: r.employee_info?.id ?? '',
    branchId: r.branch_info?.id ?? '',
    branch: r.branch_info?.name ?? '',
    lavozim: r.position_info?.name ?? '',
    lavozimId: r.position_info?.id ?? '',
    kartaRaqami: r.card_number ?? '',
    ishHaqiTuri: r.salary_type ?? 'fixed_amount',
    fixSumma: Number(r.fix_summa) || 0,
    fixFoiz: Number(r.fix_percent) || 0,
    extraSumma: Number(r.extra_summa) || 0,
    extraFoiz: Number(r.extra_percent) || 0,
    sana: r.rec_dism_date ?? '',
    dismissalReason: r.dismissal_reason ?? '',
    yaratilganAt: r.created_at ?? '',
  }
}

// Xodim profili + shu xodimga tegishli barcha ishga olish/chiqarish hujjatlarini birlashtiradi —
// eng oxirgi hujjat (sana bo'yicha) xodimning joriy lavozimi/oyligi/holatini belgilaydi.
function combineXodim(employee, records) {
  const sorted = [...records].sort((a, b) => {
    if (a.sana !== b.sana) return a.sana < b.sana ? 1 : -1
    return a.yaratilganAt < b.yaratilganAt ? 1 : -1
  })
  const latest = sorted[0]
  const latestHire = sorted.find((r) => r.type === 'recruitment')
  const holat = !latest ? 'yangi' : latest.type === 'recruitment' ? 'faol' : 'boshagan'

  return {
    ...employee,
    filial: latest?.branch || employee.filial,
    filialId: latest?.branchId || employee.filialId,
    lavozim: latestHire?.lavozim ?? '',
    lavozimId: latestHire?.lavozimId ?? '',
    kartaRaqami: latestHire?.kartaRaqami ?? '',
    ishHaqiTuri: latestHire?.ishHaqiTuri ?? 'fixed_amount',
    ishHaqiSummasi: latestHire?.fixSumma ?? 0,
    ishHaqiFoizi: latestHire?.fixFoiz ?? 0,
    qoshimchaSumma: latestHire?.extraSumma ?? 0,
    qoshimchaFoizi: latestHire?.extraFoiz ?? 0,
    ishgaOlinganSana: latestHire?.sana ? formatDate(latestHire.sana) : '',
    holat,
    // Eng oxirgi "recruitment" turidagi hujjat id'si — "Tahrirlash" shuni PATCH qiladi;
    // yo'q bo'lsa (hali umuman ishga olinmagan yoki hozir ishdan chiqarilgan) Tahrirlash yangi hujjat yaratadi.
    latestHireId: latestHire?.id ?? null,
    termination: latest?.type === 'dismissal' ? { reason: latest.dismissalReason, at: formatDate(latest.sana) } : null,
  }
}

function buildEmployeePayload(draft) {
  return {
    full_name: (draft.name ?? '').trim(),
    organization: draft.tashkilot || undefined,
    branch: draft.filial || undefined,
    region: draft.viloyat || undefined,
    district: draft.tuman || undefined,
    address: draft.manzil ?? '',
    passport_seria: draft.passportSeria ?? '',
    passport_number: draft.passportNumber ?? '',
    jsshr: draft.jshshir ?? '',
    stir: draft.stir ?? '',
    phone_number: draft.phone ? draft.phone.replace(/[\s-]/g, '') : '',
    description: draft.tavsif ?? '',
  }
}

function buildRecruitmentPayload(type, employeeId, draft) {
  return {
    type,
    employee: employeeId,
    branch: draft.filial || undefined,
    position: draft.lavozim || undefined,
    card_number: draft.kartaRaqami ?? '',
    salary_type: draft.ishHaqiTuri || 'fixed_amount',
    fix_summa: draft.ishHaqiSummasi ?? 0,
    fix_percent: draft.ishHaqiFoizi ?? 0,
    extra_summa: draft.qoshimchaSumma ?? 0,
    extra_percent: draft.qoshimchaFoizi ?? 0,
    rec_dism_date: draft.ishgaOlinganSana || undefined,
    dismissal_reason: draft.dismissalReason ?? '',
  }
}

const initialState = {
  list: [],
  listStatus: 'idle', // idle | loading | succeeded | failed
  listError: '',

  current: null,
  detailStatus: 'idle',
  detailError: '',

  ledger: [],
  ledgerStatus: 'idle',

  saveStatus: 'idle',
  saveError: '',
}

export const fetchXodimlar = createAsyncThunk('xodimlar/fetchXodimlar', async (_, { rejectWithValue }) => {
  try {
    const [employeesRaw, recordsRaw] = await Promise.all([
      employeeService.getAllEmployees(),
      recruitmentService.getAllRecruitmentDismissals(),
    ])
    const employees = employeesRaw.map(mapEmployee)
    const records = recordsRaw.map(mapRecruitment)
    return employees.map((e) => combineXodim(e, records.filter((r) => r.employeeId === e.id)))
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error, 'Xodimlarni yuklab bo‘lmadi'))
  }
})

export const fetchXodimDetail = createAsyncThunk(
  'xodimlar/fetchXodimDetail',
  async (id, { rejectWithValue }) => {
    try {
      const [employeeRaw, recordsRaw] = await Promise.all([
        employeeService.getEmployee(id),
        recruitmentService.getRecruitmentDismissalsByEmployee(id),
      ])
      return combineXodim(mapEmployee(employeeRaw), recordsRaw.map(mapRecruitment))
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Xodim topilmadi'))
    }
  }
)

export const fetchXodimLedger = createAsyncThunk(
  'xodimlar/fetchXodimLedger',
  async (id, { rejectWithValue }) => {
    try {
      const results = await recruitmentService.getEmployeeLedger(id)
      return results
        .map((l) => ({
          id: l.id,
          sana: l.created_at ? formatDateTime(new Date(l.created_at)) : '',
          amal: ledgerAmalLabel(l.type),
          filial: l.branch_info?.name ?? '',
        }))
        .sort((a, b) => (a.sana < b.sana ? 1 : -1))
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Xodim tarixini yuklab bo‘lmadi'))
    }
  }
)

// Bitta harakatda: avval Employee (shaxs) yaratiladi, so'ng shu shaxs uchun "Ishga olish"
// hujjati (RecruitmentDismissal, type=recruitment) yoziladi.
export const createXodim = createAsyncThunk(
  'xodimlar/createXodim',
  async (draft, { rejectWithValue }) => {
    try {
      const employeeRaw = await employeeService.createEmployee(buildEmployeePayload(draft))
      const employee = mapEmployee(employeeRaw)
      const recRaw = await recruitmentService.createRecruitmentDismissal(
        buildRecruitmentPayload('recruitment', employee.id, draft)
      )
      return combineXodim(employee, [mapRecruitment(recRaw)])
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Saqlashda xatolik yuz berdi'))
    }
  }
)

// "Xodimni tahrirlash" / "Xodimni ishga olish" (mavjud profil uchun) — eng oxirgi "recruitment"
// hujjati bo'lsa uni PATCH qiladi, bo'lmasa (hali ishga olinmagan yoki hozir bo'shagan) yangisini yaratadi.
export const updateXodim = createAsyncThunk(
  'xodimlar/updateXodim',
  async ({ id, recruitmentId, draft }, { rejectWithValue }) => {
    try {
      if (recruitmentId) {
        await recruitmentService.updateRecruitmentDismissal(recruitmentId, buildRecruitmentPayload('recruitment', id, draft))
      } else {
        await recruitmentService.createRecruitmentDismissal(buildRecruitmentPayload('recruitment', id, draft))
      }
      const [employeeRaw, recordsRaw] = await Promise.all([
        employeeService.getEmployee(id),
        recruitmentService.getRecruitmentDismissalsByEmployee(id),
      ])
      return combineXodim(mapEmployee(employeeRaw), recordsRaw.map(mapRecruitment))
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Yangilashda xatolik yuz berdi'))
    }
  }
)

// Ishdan chiqarish — yangi RecruitmentDismissal (type=dismissal) yozadi; sxema position/
// karta/oylik turini ham talab qilgani uchun xodimning oxirgi ma'lumotlari qayta yuboriladi.
export const terminateXodim = createAsyncThunk(
  'xodimlar/terminateXodim',
  async ({ id, reason, employee }, { rejectWithValue }) => {
    try {
      await recruitmentService.createRecruitmentDismissal(
        buildRecruitmentPayload('dismissal', id, {
          filial: employee.filialId,
          lavozim: employee.lavozimId,
          kartaRaqami: employee.kartaRaqami,
          ishHaqiTuri: employee.ishHaqiTuri,
          ishHaqiSummasi: employee.ishHaqiSummasi,
          ishHaqiFoizi: employee.ishHaqiFoizi,
          qoshimchaSumma: employee.qoshimchaSumma,
          qoshimchaFoizi: employee.qoshimchaFoizi,
          ishgaOlinganSana: new Date().toISOString().slice(0, 10),
          dismissalReason: reason,
        })
      )
      const [employeeRaw, recordsRaw] = await Promise.all([
        employeeService.getEmployee(id),
        recruitmentService.getRecruitmentDismissalsByEmployee(id),
      ])
      return combineXodim(mapEmployee(employeeRaw), recordsRaw.map(mapRecruitment))
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Ishdan chiqarishda xatolik yuz berdi'))
    }
  }
)

// Qayta ishga olish — yangi RecruitmentDismissal (type=recruitment) yozadi (lavozim/oylik
// yangilanishi mumkin).
export const rehireXodim = createAsyncThunk(
  'xodimlar/rehireXodim',
  async ({ id, draft }, { rejectWithValue }) => {
    try {
      await recruitmentService.createRecruitmentDismissal(buildRecruitmentPayload('recruitment', id, draft))
      const [employeeRaw, recordsRaw] = await Promise.all([
        employeeService.getEmployee(id),
        recruitmentService.getRecruitmentDismissalsByEmployee(id),
      ])
      return combineXodim(mapEmployee(employeeRaw), recordsRaw.map(mapRecruitment))
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Qayta ishga olishda xatolik yuz berdi'))
    }
  }
)

const xodimlarSlice = createSlice({
  name: 'xodimlar',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchXodimlar.pending, (state) => {
        state.listStatus = 'loading'
        state.listError = ''
      })
      .addCase(fetchXodimlar.fulfilled, (state, action) => {
        state.listStatus = 'succeeded'
        state.list = action.payload
      })
      .addCase(fetchXodimlar.rejected, (state, action) => {
        state.listStatus = 'failed'
        state.listError = action.payload || 'Xatolik'
      })

      .addCase(fetchXodimDetail.pending, (state) => {
        state.detailStatus = 'loading'
        state.detailError = ''
      })
      .addCase(fetchXodimDetail.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded'
        state.current = action.payload
      })
      .addCase(fetchXodimDetail.rejected, (state, action) => {
        state.detailStatus = 'failed'
        state.detailError = action.payload || 'Xatolik'
        state.current = null
      })

      .addCase(fetchXodimLedger.pending, (state) => {
        state.ledgerStatus = 'loading'
      })
      .addCase(fetchXodimLedger.fulfilled, (state, action) => {
        state.ledgerStatus = 'succeeded'
        state.ledger = action.payload
      })
      .addCase(fetchXodimLedger.rejected, (state) => {
        state.ledgerStatus = 'failed'
      })

      .addCase(createXodim.pending, (state) => {
        state.saveStatus = 'loading'
        state.saveError = ''
      })
      .addCase(createXodim.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded'
        state.list.unshift(action.payload)
      })
      .addCase(createXodim.rejected, (state, action) => {
        state.saveStatus = 'failed'
        state.saveError = action.payload || 'Xatolik'
      })

      .addCase(updateXodim.pending, (state) => {
        state.saveStatus = 'loading'
        state.saveError = ''
      })
      .addCase(updateXodim.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded'
        const idx = state.list.findIndex((x) => x.id === action.payload.id)
        if (idx !== -1) state.list[idx] = action.payload
        if (state.current?.id === action.payload.id) state.current = action.payload
      })
      .addCase(updateXodim.rejected, (state, action) => {
        state.saveStatus = 'failed'
        state.saveError = action.payload || 'Xatolik'
      })

      .addCase(terminateXodim.pending, (state) => {
        state.saveStatus = 'loading'
        state.saveError = ''
      })
      .addCase(terminateXodim.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded'
        const idx = state.list.findIndex((x) => x.id === action.payload.id)
        if (idx !== -1) state.list[idx] = action.payload
        if (state.current?.id === action.payload.id) state.current = action.payload
      })
      .addCase(terminateXodim.rejected, (state, action) => {
        state.saveStatus = 'failed'
        state.saveError = action.payload || 'Xatolik'
      })

      .addCase(rehireXodim.pending, (state) => {
        state.saveStatus = 'loading'
        state.saveError = ''
      })
      .addCase(rehireXodim.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded'
        const idx = state.list.findIndex((x) => x.id === action.payload.id)
        if (idx !== -1) state.list[idx] = action.payload
        if (state.current?.id === action.payload.id) state.current = action.payload
      })
      .addCase(rehireXodim.rejected, (state, action) => {
        state.saveStatus = 'failed'
        state.saveError = action.payload || 'Xatolik'
      })
  },
})

export default xodimlarSlice.reducer
