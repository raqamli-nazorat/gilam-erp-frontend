import { axiosAPI } from './axiosAPI'
import { fetchAllPages, unwrapData } from './apiHelpers'

// "Ishga olish/Ishdan chiqarish" hujjatlari (RecruitmentDismissal) — har biri bitta xodimning
// bitta filialga ishga olinishi yoki ishdan chiqarilishini bildiradi (type: recruitment|dismissal).
export async function getAllRecruitmentDismissals() {
  return fetchAllPages('hr/recruitment-dismissals/')
}

export async function getRecruitmentDismissalsByEmployee(employeeId) {
  return fetchAllPages('hr/recruitment-dismissals/', { employee: employeeId })
}

export async function createRecruitmentDismissal(payload) {
  const response = await axiosAPI.post('hr/recruitment-dismissals/', payload)
  return unwrapData(response)
}

// Xodim daftari (EmployeeLedger) — har bir xodim bo'yicha voqealar jurnali, faqat o'qish uchun.
export async function getEmployeeLedger(employeeId) {
  return fetchAllPages('hr/employee-ledgers/', { employee: employeeId })
}
