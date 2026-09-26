import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { formatDate, formatDateTime } from '@/lib/format'
import { extractErrorMessage } from '@/services/apiHelpers'
import * as employeeService from '@/services/employeeService'
import * as recruitmentService from '@/services/recruitmentService'
import { ledgerAmalLabel } from './xodimlarData'

// Backend "Employee" — xodimning shaxs profili. Eksport qilingan — Xodimlar ro'yxati/formasi
// (XodimlarListPage.jsx, XodimModal.jsx) shundan foydalanadi.
export function mapEmployee(e) {
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
    // Backend'ning o'z ish holati (ro'yxat sahifasi uchun — sahifalab yuklanganda ish tarixisiz).
    employmentStatus: e.employment_status ?? '',
    yaratilgan: e.created_at ? formatDateTime(new Date(e.created_at)) : '',
    ozgartirilgan: e.updated_at ? formatDateTime(new Date(e.updated_at)) : '',
  }
}

// Backend Employee.employment_status qiymatlari sxemada sanab ko'rsatilmagan — ishdan
// chiqarilganni bildiruvchi qiymatlar true, qolganlari (ishlayapti) false.
export function isEmployeeDismissed(employee) {
  return /dismiss|fired|terminat|inactive|chiqarilgan|bo.?shagan/i.test(employee?.employmentStatus ?? '')
}

// "Ishga qabul qilish" uch holatli ish jarayoni (Qoralama/Tasdiqlangan/Bekor qilingan).
// Backend RecruitmentDismissal endi `status` maydonini qaytaradi (draft/approved/cancelled,
// faqat o'qiladi — o'zgartirish .../{id}/approve/ va .../{id}/cancel/ orqali). Frontendda
// "approved" tarixiy sabablarga ko'ra "confirmed" deb yuritiladi. Backend qiymati bo'lmasa
// (eski javob) — avval shu brauzerda localStorage'ga yozilgan belgi zaxira sifatida o'qiladi.
const RECRUITMENT_STATUSES = ['draft', 'confirmed', 'cancelled']
const BACKEND_STATUS = { draft: 'draft', approved: 'confirmed', cancelled: 'cancelled' }
// Frontend holati -> backend `status` query qiymati (ro'yxat filtri uchun).
export const RECRUITMENT_STATUS_PARAM = { draft: 'draft', confirmed: 'approved', cancelled: 'cancelled' }
const STATUS_STORAGE_PREFIX = 'gilam:recruitmentStatus:'

function readLocalStatus(id) {
  try {
    const v = localStorage.getItem(STATUS_STORAGE_PREFIX + id)
    return RECRUITMENT_STATUSES.includes(v) ? v : null
  } catch {
    return null
  }
}

function mapRecruitmentStatus(id, raw) {
  return BACKEND_STATUS[raw] ?? readLocalStatus(id) ?? 'confirmed'
}

// Kerakli holatga backend endpointi orqali o'tkazadi ('draft' uchun endpoint yo'q — o'zgarmaydi).
// Yangilangan hujjatni qaytaradi (yoki null).
async function applyBackendStatus(id, status) {
  if (status === 'confirmed') return recruitmentService.approveRecruitmentDismissal(id)
  if (status === 'cancelled') return recruitmentService.cancelRecruitmentDismissal(id)
  return null
}

// Backend "RecruitmentDismissal" — bitta "ishga olish"/"ishdan chiqarish" hujjati.
// Eksport qilingan — XodimlarDetailPage.jsx ish tarixi jadvali va Ishga qabul qilish ro'yxati
// shundan foydalanadi.
// MUHIM: backend RO'YXAT (`GET .../`) va DETAL (`GET .../{id}/`) uchun IKKI XIL serializer
// ishlatadi (real sxema bilan tasdiqlangan) — ro'yxat faqat tekis `employee_name`/
// `branch_name`/`position_name`/`organization_name` (ID'siz, `type`siz, karta/oylik'siz)
// qaytaradi, detal esa nested `employee_info`/`branch_info`/`position_info` (ID bilan) +
// `type`/`card_number`/`salary_type`/summalar. Shuning uchun har bir maydon avval nested
// (detal) shaklni, topilmasa tekis (ro'yxat) shaklni o'qiydi — qaysi endpointdan kelganidan
// qat'i nazar to'g'ri ishlashi uchun. `type` ro'yxatda umuman yo'q — uni chaqiruvchi o'zi
// bilgan holda belgilashi kerak (getAllRecruitmentDismissalsTagged'ga qarang).
export function mapRecruitment(r) {
  return {
    id: r.id,
    type: r.type, // 'recruitment' | 'dismissal' — faqat detal javobida yoki chaqiruvchi belgilasa bor
    status: mapRecruitmentStatus(r.id, r.status),
    employeeId: r.employee_info?.id ?? '',
    employeeName: r.employee_info?.full_name ?? r.employee_name ?? '',
    branchId: r.branch_info?.id ?? '',
    branch: r.branch_info?.name ?? r.branch_name ?? '',
    // Faqat ro'yxat javobida bor (tashkilotni topish uchun filial ID kerak emas) — detaldan
    // kelganda bo'sh qoladi, chaqiruvchi tomon filiallar ro'yxatidan qidirib topadi (eski usul).
    tashkilot: r.organization_name ?? '',
    lavozim: r.position_info?.name ?? r.position_name ?? '',
    lavozimId: r.position_info?.id ?? '',
    kartaRaqami: r.card_number ?? '',
    ishHaqiTuri: r.salary_type ?? 'fixed_amount',
    fixSumma: Number(r.fix_summa) || 0,
    fixFoiz: Number(r.fix_percent) || 0,
    extraSumma: Number(r.extra_summa) || 0,
    extraFoiz: Number(r.extra_percent) || 0,
    sana: r.rec_dism_date ?? '',
    dismissalReason: r.dismissal_reason ?? '',
    // Xom ISO qiymat — combineXodim shu bo'yicha saralaydi (lug'aviy taqqoslash to'g'ri ishlashi uchun).
    yaratilganAt: r.created_at ?? '',
    yaratilgan: r.created_at ? formatDateTime(new Date(r.created_at)) : '',
    ozgartirilgan: r.updated_at ? formatDateTime(new Date(r.updated_at)) : '',
  }
}

// Xodim profili + shu xodimga tegishli barcha ishga olish/chiqarish hujjatlarini birlashtiradi —
// eng oxirgi hujjat (sana bo'yicha) xodimning joriy lavozimi/oyligi/holatini belgilaydi.
// Eksport qilingan — createKadr/updateKadr natijasini state.list bilan bir xil (holat/lavozim
// maydonlari bor) shaklga keltirish uchun.
export function combineXodim(employee, records) {
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
    history: sorted,
  }
}

// Eksport qilingan — KadrModal.jsx (shaxsiy profilni to'g'ridan-to'g'ri yaratish/tahrirlash,
// "Ishga olish"siz) shundan foydalanadi.
export function buildEmployeePayload(draft) {
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
    stir: draft.stir ? draft.stir.replace(/\s/g, '') : '',
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

// bulk-create endpointining har bir item shakli — buildRecruitmentPayload bilan bir xil, faqat
// `type` (butun so'rov uchun bitta marta, "recruitment" deb qat'iy belgilangan) va
// `dismissal_reason` (bu endpointda mavjud emas) siz.
function buildBulkRecruitmentItem(employeeId, draft) {
  const { type: _type, dismissal_reason: _reason, ...item } = buildRecruitmentPayload('recruitment', employeeId, draft)
  return item
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

  // "Ishga qabul qilish" ro'yxati — RecruitmentDismissal hujjatlari (type='recruitment'),
  // Xodimlar bilan bog'liq lekin alohida ro'yxat sifatida ko'rsatiladi.
  recruitments: [],
  recruitmentsStatus: 'idle',
  recruitmentsError: '',

  saveStatus: 'idle',
  saveError: '',
}

// combineXodim'ga "eng oxirgi" va "eng oxirgi ISHGA OLISH" hujjat(lar)ining filial/lavozim/
// karta/oylik maydonlari kerak — bular ro'yxat javobida umuman yo'q (yuqoridagi mapRecruitment
// izohiga qarang), faqat DETAL javobida bor. Shuning uchun aniqlangan hujjat(lar)ni alohida,
// to'liq holda qayta so'raymiz (ko'pi bilan 2 ta qo'shimcha so'rov — bitta xodim sahifasi
// uchun qabul qilinadigan narx). `tashkilot` maydoni ataylab saqlanadi (detalda yo'q, faqat
// ro'yxatda bor edi — aks holda enrichlash uni bo'shatib qo'yardi).
async function enrichLatestRecords(records) {
  const sorted = [...records].sort((a, b) => {
    if (a.sana !== b.sana) return a.sana < b.sana ? 1 : -1
    return a.yaratilganAt < b.yaratilganAt ? 1 : -1
  })
  const latest = sorted[0]
  const latestHire = sorted.find((r) => r.type === 'recruitment')
  const idsToFetch = [...new Set([latest?.id, latestHire?.id].filter(Boolean))]
  if (idsToFetch.length === 0) return records
  const fullRaw = await Promise.all(idsToFetch.map((fid) => recruitmentService.getRecruitmentDismissal(fid)))
  const fullById = new Map(fullRaw.map((raw) => [raw.id, mapRecruitment(raw)]))
  return records.map((r) => {
    if (!fullById.has(r.id)) return r
    const { tashkilot: _ignored, ...full } = fullById.get(r.id)
    return { ...r, ...full }
  })
}

export const fetchXodimlar = createAsyncThunk('xodimlar/fetchXodimlar', async (_, { rejectWithValue }) => {
  try {
    const [employeesRaw, recordsRaw] = await Promise.all([
      employeeService.getAllEmployees(),
      recruitmentService.getAllRecruitmentDismissalsTagged(),
    ])
    const employees = employeesRaw.map(mapEmployee)
    const records = recordsRaw.map(mapRecruitment)
    // Ro'yxat javobida xodim ID'si yo'q (faqat F.I.SH. matni bor) — shuning uchun hujjatni
    // xodimga ID emas, F.I.SH. bo'yicha bog'laymiz. Kamchilik: bir xil ismli ikki xodim bo'lsa
    // noto'g'ri moslashishi mumkin — bu backendning ro'yxat javobi ID bermasligi bilan bog'liq
    // cheklov, ID'siz boshqa ishonchli yo'l yo'q (har bir xodim uchun alohida so'rov N+1 bo'lardi).
    return employees.map((e) => combineXodim(e, records.filter((r) => r.employeeName === e.name)))
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
        recruitmentService.getAllRecruitmentDismissalsTagged({ employee: id }),
      ])
      const records = await enrichLatestRecords(recordsRaw.map(mapRecruitment))
      return combineXodim(mapEmployee(employeeRaw), records)
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
      // Bu POST javobi ("EmployeeRecruitment" sxemasi) `type` maydonini qaytarmaydi (u
      // ushbu action uchun doim "recruitment" — sxemada ham yo'q), o'zimiz belgilaymiz.
      return combineXodim(employee, [mapRecruitment({ ...recRaw, type: 'recruitment' })])
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
        recruitmentService.getAllRecruitmentDismissalsTagged({ employee: id }),
      ])
      const records = await enrichLatestRecords(recordsRaw.map(mapRecruitment))
      return combineXodim(mapEmployee(employeeRaw), records)
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Yangilashda xatolik yuz berdi'))
    }
  }
)

// Ishdan chiqarish — maxsus "dismiss" endpointi orqali (faqat xodim/sabab/fayl kerak, filial/
// lavozim/karta/oylik xodimning hozirgi faol yozuvidan backend tomonidan avtomatik ko'chiriladi,
// mijoz tomonidan qo'lda qayta yuborilmaydi — eski usul shu maydonlarni qo'lda re-send qilardi,
// bu esa chaqiruvchi tomonda eskirgan/noto'g'ri qiymat yuborish xavfini tug'dirar edi).
export const terminateXodim = createAsyncThunk(
  'xodimlar/terminateXodim',
  async ({ id, reason, file }, { rejectWithValue }) => {
    try {
      await recruitmentService.dismissEmployee({ employeeId: id, reason, file })
      const [employeeRaw, recordsRaw] = await Promise.all([
        employeeService.getEmployee(id),
        recruitmentService.getAllRecruitmentDismissalsTagged({ employee: id }),
      ])
      const records = await enrichLatestRecords(recordsRaw.map(mapRecruitment))
      return combineXodim(mapEmployee(employeeRaw), records)
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
        recruitmentService.getAllRecruitmentDismissalsTagged({ employee: id }),
      ])
      const records = await enrichLatestRecords(recordsRaw.map(mapRecruitment))
      return combineXodim(mapEmployee(employeeRaw), records)
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Qayta ishga olishda xatolik yuz berdi'))
    }
  }
)

// Xodimlar ro'yxati — shaxsiy profilni to'g'ridan-to'g'ri yaratish/tahrirlash/o'chirish,
// "Ishga olish" (Recruitment) hujjatisiz. "Ishga qabul qilish" bo'limining lavozim/oylik
// biriktirish oqimidan alohida — ikkalasi ham xuddi shu Employee resursi ustida ishlaydi.
export const createKadr = createAsyncThunk('xodimlar/createKadr', async (draft, { rejectWithValue }) => {
  try {
    const raw = await employeeService.createEmployee(buildEmployeePayload(draft))
    return combineXodim(mapEmployee(raw), [])
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error, 'Saqlashda xatolik yuz berdi'))
  }
})

export const updateKadr = createAsyncThunk('xodimlar/updateKadr', async ({ id, draft }, { rejectWithValue }) => {
  try {
    const raw = await employeeService.updateEmployee(id, buildEmployeePayload(draft))
    return mapEmployee(raw)
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error, 'Yangilashda xatolik yuz berdi'))
  }
})

export const deleteKadr = createAsyncThunk('xodimlar/deleteKadr', async (id, { rejectWithValue }) => {
  try {
    await employeeService.deleteEmployee(id)
    return id
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error, 'O‘chirishda xatolik yuz berdi'))
  }
})

// "Ishga qabul qilish" ro'yxati — faqat 'recruitment' turidagi hujjatlar (bu bo'lim "ishga
// olish" jarayoni haqida; 'dismissal' hujjatlari bu yerga chiqmasligi kerak — avval type filtri
// yo'q edi, shuning uchun bitta xodimni ishdan chiqarish hujjati ham shu ro'yxatda, xuddi yangi
// ishga olingandek ko'rinardi). Backend `type` bo'yicha haqiqiy filtrlashni qo'llab-quvvatlaydi.
export const fetchRecruitments = createAsyncThunk('xodimlar/fetchRecruitments', async (_, { rejectWithValue }) => {
  try {
    const results = await recruitmentService.getAllRecruitmentDismissals({ type: 'recruitment' })
    // `type` so'rov parametri sifatida filtrlaydi, lekin ro'yxat javobida maydonning o'zi yo'q
    // (yuqoridagi mapRecruitment izohiga qarang) — biz aniq bilgan holda qo'lda belgilaymiz.
    return results.map((r) => mapRecruitment({ ...r, type: 'recruitment' }))
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error, 'Ro‘yxatni yuklab bo‘lmadi'))
  }
})

// Yangi "Ishga qabul qilish" hujjati — backend uni 'draft' (Saqlash) holatida yaratadi;
// 'confirmed' (Tasdiqlash) tanlansa yaratilgandan so'ng approve endpointi chaqiriladi.
export const createRecruitment = createAsyncThunk(
  'xodimlar/createRecruitment',
  async ({ employeeId, status, draft }, { rejectWithValue }) => {
    try {
      const raw = await recruitmentService.createRecruitmentDismissal(
        buildRecruitmentPayload('recruitment', employeeId, draft)
      )
      await applyBackendStatus(raw.id, status)
      // Bu POST javobi ("EmployeeRecruitment" sxemasi) `type` maydonini qaytarmaydi — o'zimiz belgilaymiz.
      return { ...mapRecruitment({ ...raw, type: 'recruitment' }), status }
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Saqlashda xatolik yuz berdi'))
    }
  }
)

// Bir nechta xodimni bitta so'rovda ishga olish (bulk-create) — navbatdagi har bir xodim
// uchun bitta-bitta POST yuborish o'rniga, hammasini bitta so'rovda yuboradi.
export const bulkCreateRecruitments = createAsyncThunk(
  'xodimlar/bulkCreateRecruitments',
  async ({ items, status }, { rejectWithValue }) => {
    try {
      const rawItems = await recruitmentService.bulkCreateRecruitments(
        items.map(({ employeeId, draft }) => buildBulkRecruitmentItem(employeeId, draft))
      )
      const mapped = rawItems.map((raw) => mapRecruitment({ ...raw, type: 'recruitment' }))
      await Promise.all(mapped.map((r) => applyBackendStatus(r.id, status)))
      return mapped.map((r) => ({ ...r, status }))
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Saqlashda xatolik yuz berdi'))
    }
  }
)

export const updateRecruitment = createAsyncThunk(
  'xodimlar/updateRecruitment',
  async ({ id, employeeId, status, draft }, { rejectWithValue }) => {
    try {
      const raw = await recruitmentService.updateRecruitmentDismissal(
        id,
        buildRecruitmentPayload('recruitment', employeeId, draft)
      )
      // Holat haqiqatan o'zgargandagina endpoint chaqiriladi (qayta approve xato berishi mumkin).
      if (status && BACKEND_STATUS[raw.status] !== status) await applyBackendStatus(id, status)
      return { ...mapRecruitment(raw), ...(status ? { status } : {}) }
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Yangilashda xatolik yuz berdi'))
    }
  }
)

// Faqat holatni o'zgartiradi (Tasdiqlash/Bekor qilish) — backend approve/cancel endpointlari orqali.
export const setRecruitmentStatus = createAsyncThunk(
  'xodimlar/setRecruitmentStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      await applyBackendStatus(id, status)
      return { id, status }
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Holatni o‘zgartirishda xatolik yuz berdi'))
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

      .addCase(createKadr.pending, (state) => {
        state.saveStatus = 'loading'
        state.saveError = ''
      })
      .addCase(createKadr.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded'
        state.list.unshift(action.payload)
      })
      .addCase(createKadr.rejected, (state, action) => {
        state.saveStatus = 'failed'
        state.saveError = action.payload || 'Xatolik'
      })

      .addCase(updateKadr.pending, (state) => {
        state.saveStatus = 'loading'
        state.saveError = ''
      })
      .addCase(updateKadr.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded'
        // Faqat shaxsiy maydonlar yangilanadi — holat/lavozim/ish tarixi (recruitment'dan
        // kelgan qismi) tegilmaydi.
        const idx = state.list.findIndex((x) => x.id === action.payload.id)
        if (idx !== -1) state.list[idx] = { ...state.list[idx], ...action.payload }
        if (state.current?.id === action.payload.id) state.current = { ...state.current, ...action.payload }
      })
      .addCase(updateKadr.rejected, (state, action) => {
        state.saveStatus = 'failed'
        state.saveError = action.payload || 'Xatolik'
      })

      .addCase(deleteKadr.pending, (state) => {
        state.saveStatus = 'loading'
        state.saveError = ''
      })
      .addCase(deleteKadr.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded'
        state.list = state.list.filter((x) => x.id !== action.payload)
      })
      .addCase(deleteKadr.rejected, (state, action) => {
        state.saveStatus = 'failed'
        state.saveError = action.payload || 'Xatolik'
      })

      .addCase(fetchRecruitments.pending, (state) => {
        state.recruitmentsStatus = 'loading'
        state.recruitmentsError = ''
      })
      .addCase(fetchRecruitments.fulfilled, (state, action) => {
        state.recruitmentsStatus = 'succeeded'
        state.recruitments = action.payload
      })
      .addCase(fetchRecruitments.rejected, (state, action) => {
        state.recruitmentsStatus = 'failed'
        state.recruitmentsError = action.payload || 'Xatolik'
      })

      .addCase(createRecruitment.pending, (state) => {
        state.saveStatus = 'loading'
        state.saveError = ''
      })
      .addCase(createRecruitment.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded'
        state.recruitments.unshift(action.payload)
      })
      .addCase(createRecruitment.rejected, (state, action) => {
        state.saveStatus = 'failed'
        state.saveError = action.payload || 'Xatolik'
      })

      .addCase(bulkCreateRecruitments.pending, (state) => {
        state.saveStatus = 'loading'
        state.saveError = ''
      })
      .addCase(bulkCreateRecruitments.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded'
        state.recruitments.unshift(...action.payload)
      })
      .addCase(bulkCreateRecruitments.rejected, (state, action) => {
        state.saveStatus = 'failed'
        state.saveError = action.payload || 'Xatolik'
      })

      .addCase(updateRecruitment.pending, (state) => {
        state.saveStatus = 'loading'
        state.saveError = ''
      })
      .addCase(updateRecruitment.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded'
        const idx = state.recruitments.findIndex((r) => r.id === action.payload.id)
        if (idx !== -1) state.recruitments[idx] = action.payload
      })
      .addCase(updateRecruitment.rejected, (state, action) => {
        state.saveStatus = 'failed'
        state.saveError = action.payload || 'Xatolik'
      })

      .addCase(setRecruitmentStatus.pending, (state) => {
        state.saveStatus = 'loading'
        state.saveError = ''
      })
      .addCase(setRecruitmentStatus.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded'
        const idx = state.recruitments.findIndex((r) => r.id === action.payload.id)
        if (idx !== -1) state.recruitments[idx] = { ...state.recruitments[idx], ...action.payload }
      })
      .addCase(setRecruitmentStatus.rejected, (state, action) => {
        state.saveStatus = 'failed'
        state.saveError = action.payload || 'Xatolik'
      })
  },
})

export default xodimlarSlice.reducer
