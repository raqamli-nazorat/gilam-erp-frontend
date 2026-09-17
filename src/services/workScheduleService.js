import { createReferenceApi } from './referenceService'

// Backend "WorkSchedule" (hr/work-schedules/) — CRUD shakli boshqa ma'lumotnomalar
// (sifat/birlik/rang/lavozim) bilan bir xil REST ko'rinishida, shuning uchun umumiy
// fabrikadan foydalanamiz.
export const workScheduleApi = createReferenceApi('hr/work-schedules/')
