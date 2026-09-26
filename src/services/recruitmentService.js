import { axiosAPI } from './axiosAPI'
import { fetchAllPages, fetchPage, unwrapData } from './apiHelpers'

// "Ishga qabul qilish" ro'yxati — faqat `type=recruitment` hujjatlarning bitta sahifasi (scroll pagination).
export async function getRecruitmentsPage(params) {
  return fetchPage('hr/recruitment-dismissals/', { ...params, type: 'recruitment' })
}

// "Ishdan chiqarish" ro'yxati — faqat `type=dismissal` hujjatlarning bitta sahifasi (scroll
// pagination). Har sahifa uchun FAQAT BITTA so'rov — oldin `dismissal_reason` uchun har bir
// qatorga alohida detal so'rovi (recruitment-dismissals/{id}/) yuborilardi. Ro'yxat serializeri
// (RecruitmentDismissalList) sababni qaytarmasa, jadvalda "—" ko'rinadi (backend ro'yxatga
// `dismissal_reason` qo'shishi kerak); to'liq sabab tafsilot sahifasida ko'rinadi.
export async function getDismissalsPage(params) {
  return fetchPage('hr/recruitment-dismissals/', { ...params, type: 'dismissal' })
}

// "Ishga olish/Ishdan chiqarish" hujjatlari (RecruitmentDismissal) — har biri bitta xodimning
// bitta filialga ishga olinishi yoki ishdan chiqarilishini bildiradi (type: recruitment|dismissal).
// `params` (masalan { type: 'recruitment' }) — backend haqiqiy filtr sifatida qo'llab-quvvatlaydi.
export async function getAllRecruitmentDismissals(params) {
  return fetchAllPages('hr/recruitment-dismissals/', params)
}

export async function getRecruitmentDismissalsByEmployee(employeeId) {
  return fetchAllPages('hr/recruitment-dismissals/', { employee: employeeId })
}

// Bitta hujjatning TO'LIQ shakli (nested employee_info/branch_info/position_info + type,
// card_number, salary_type va h.k.) — ro'yxat endpointi (yuqoridagi funksiyalar) buларni
// qaytarmaydi, faqat tekis employee_name/branch_name/position_name (ID'siz, type'siz)
// qaytaradi (backend LIST va RETRIEVE uchun ataylab ikki xil serializer ishlatadi — real
// OpenAPI sxemasi bilan tasdiqlangan: RecruitmentDismissalList vs RecruitmentDismissal).
// Tahrirlash (ID kerak) yoki detal sahifa (karta/oylik kerak) uchun shu funksiya kerak.
export async function getRecruitmentDismissal(id) {
  const response = await axiosAPI.get(`hr/recruitment-dismissals/${id}/`)
  return unwrapData(response)
}

// `type` maydoni ro'yxat javobida yo'q (yuqoridagi izohga qarang) — shuning uchun bitta
// so'rovda hammasini olib, `.type`ga ishonish o'rniga ikkita alohida, `type` bo'yicha
// FILTRLANGAN so'rov yuboramiz (backend buni haqiqiy so'rov parametri sifatida qo'llaydi)
// va har bir natijani BIZ BILGAN turi bilan belgilaymiz. `combineXodim` (xodimlarSlice.js)
// kabi turga qarab ishlaydigan kod uchun shart.
export async function getAllRecruitmentDismissalsTagged(baseParams = {}) {
  const [recruitment, dismissal] = await Promise.all([
    fetchAllPages('hr/recruitment-dismissals/', { ...baseParams, type: 'recruitment' }),
    fetchAllPages('hr/recruitment-dismissals/', { ...baseParams, type: 'dismissal' }),
  ])
  return [
    ...recruitment.map((r) => ({ ...r, type: 'recruitment' })),
    ...dismissal.map((r) => ({ ...r, type: 'dismissal' })),
  ]
}

export async function createRecruitmentDismissal(payload) {
  const response = await axiosAPI.post('hr/recruitment-dismissals/', payload)
  return unwrapData(response)
}

// Mavjud "ishga olish" hujjatini tahrirlash (filial/lavozim/oylik/karta/sana/qo'shimcha).
export async function updateRecruitmentDismissal(id, payload) {
  const response = await axiosAPI.patch(`hr/recruitment-dismissals/${id}/`, payload)
  return unwrapData(response)
}

// Hujjat holatini o'zgartirish — backend `status` maydoni faqat o'qiladi (draft/approved/cancelled),
// uni faqat shu ikki endpoint o'zgartiradi. So'rov tanasi kerak emas.
export async function approveRecruitmentDismissal(id) {
  const response = await axiosAPI.post(`hr/recruitment-dismissals/${id}/approve/`, {})
  return unwrapData(response)
}

export async function cancelRecruitmentDismissal(id) {
  const response = await axiosAPI.post(`hr/recruitment-dismissals/${id}/cancel/`, {})
  return unwrapData(response)
}

// Xodim daftari (EmployeeLedger) — har bir xodim bo'yicha voqealar jurnali, faqat o'qish uchun.
export async function getEmployeeLedger(employeeId) {
  return fetchAllPages('hr/employee-ledgers/', { employee: employeeId })
}

// Ishdan chiqarishning maxsus (dedicated) endpointi — faqat xodim/sabab/hujjat kiritiladi,
// filial/lavozim/karta/oylik xodimning hozirgi faol yozuvidan backend tomonidan avtomatik
// ko'chiriladi (createRecruitmentDismissal(type=dismissal) orqali qo'lda qayta yuborishdan
// ancha ishonchli — qo'lda yuborilganda mijoz eski/noto'g'ri qiymatlarni jo'natishi mumkin edi).
// `file` berilsa multipart/form-data (attachment — PDF/Excel, 10 MB gacha) sifatida yuboriladi.
export async function dismissEmployee({ employeeId, reason, file }) {
  let body
  if (file) {
    body = new FormData()
    body.append('employee', employeeId)
    body.append('dismissal_reason', reason)
    body.append('attachment', file)
  } else {
    body = { employee: employeeId, dismissal_reason: reason }
  }
  const response = await axiosAPI.post('hr/recruitment-dismissals/dismiss/', body)
  return unwrapData(response)
}

// Bir nechta xodimni bitta so'rovda ishga olish — bulk-hire oynasidagi navbatni bitta-bitta
// POST qilish o'rniga (N ta so'rov) shu bitta maxsus endpointga yuboradi.
export async function bulkCreateRecruitments(items) {
  const response = await axiosAPI.post('hr/recruitment-dismissals/bulk-create/', { items })
  const payload = unwrapData(response)
  return payload?.items ?? []
}
