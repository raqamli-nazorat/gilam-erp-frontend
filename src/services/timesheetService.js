import { axiosAPI } from './axiosAPI'
import { fetchAllPages, fetchPage, unwrapData } from './apiHelpers'

/**
 * Xodimlar tabeli (EmployeeTimesheet) va uning kunlik qatorlari (EmployeeTimesheetItem) API xizmati
 * Backend endpointlari: /api/v1/hr/timesheets/, /api/v1/hr/timesheet-items/
 */

// ── Tabellar ─────────────────────────────────────────────────────────────

// Sahifalangan ro'yxat (scroll pagination)
// params: { organization, branch, year, for_month, status, start_date, end_date,
//           updated_start_date, updated_end_date, search, ordering, page }
export async function getTimesheetsPage(params = {}) {
  return fetchPage('hr/timesheets/', params)
}

export async function getTimesheet(id) {
  const response = await axiosAPI.get(`hr/timesheets/${id}/`)
  return unwrapData(response)
}

// payload: { branch: uuid, year: 2026, for_month: 1-12 }
export async function createTimesheet(payload) {
  const response = await axiosAPI.post('hr/timesheets/', payload)
  return unwrapData(response)
}

// payload: { branch?, year?, for_month? } — faqat qoralama tabel uchun
export async function patchTimesheet(id, payload) {
  const response = await axiosAPI.patch(`hr/timesheets/${id}/`, payload)
  return unwrapData(response)
}

export async function deleteTimesheet(id) {
  const response = await axiosAPI.delete(`hr/timesheets/${id}/`)
  return unwrapData(response)
}

export async function approveTimesheet(id) {
  const response = await axiosAPI.post(`hr/timesheets/${id}/approve/`, {})
  return unwrapData(response)
}

// { reason, file } — hujjat bo'lsa multipart (cancel_reason + cancel_document), aks holda JSON.
export async function cancelTimesheet(id, { reason = '', file = null } = {}) {
  // Sxemada cancel/ tanasi yo'q — maydon nomi kelishilmaguncha ikkala kalit ham yuboriladi
  let body = { cancel_reason: reason, reason }
  if (file) {
    body = new FormData()
    body.append('cancel_reason', reason)
    body.append('reason', reason)
    body.append('cancel_document', file)
  }
  const response = await axiosAPI.post(`hr/timesheets/${id}/cancel/`, body)
  return unwrapData(response)
}

// Davomat platformasidan qatorlarni qayta to'ldirish (faqat qoralama). Backendda hali yo'q bo'lsa
// (404/405) — null qaytadi va sahifa shunchaki qayta yuklaydi.
export async function syncTimesheet(id) {
  try {
    const response = await axiosAPI.post(`hr/timesheets/${id}/sync/`, {})
    return unwrapData(response)
  } catch (err) {
    if ([404, 405].includes(err?.response?.status)) return null
    throw err
  }
}

// ── Tabel qatorlari (xodimning kunlik davomati) ──────────────────────────

// Tabelning barcha qatorlari (barcha sahifalar yig'iladi)
// params: { employee, date_from, date_to, ordering, search }
export async function getAllTimesheetItems(timesheetId, params = {}) {
  // page_size — backend qo'llab-quvvatlasa bitta tabel (~900 qator) kam so'rovda keladi; qo'llamasa e'tiborsiz qoladi
  return fetchAllPages('hr/timesheet-items/', { page_size: 1000, ordering: 'date', ...params, employee_timesheet: timesheetId })
}

// payload: { employee_timesheet, employee, date, work_hour_in_plan, input_date, output_lunch_date,
//            input_lunch_date, output_date, work_hour_in_fact }
export async function createTimesheetItem(payload) {
  const response = await axiosAPI.post('hr/timesheet-items/', payload)
  return unwrapData(response)
}

export async function patchTimesheetItem(id, payload) {
  const response = await axiosAPI.patch(`hr/timesheet-items/${id}/`, payload)
  return unwrapData(response)
}

export async function deleteTimesheetItem(id) {
  const response = await axiosAPI.delete(`hr/timesheet-items/${id}/`)
  return unwrapData(response)
}
