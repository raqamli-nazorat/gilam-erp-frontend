// "Xodimlar" bo'limi endi haqiqiy API'ga ulangan:
//   Employee (hr/employees) — xodimning shaxs profili (F.I.SH., passport, telefon, manzil, tashkilot/filial).
//   RecruitmentDismissal (hr/recruitment-dismissals) — "ishga olish"/"ishdan chiqarish" hujjati
//     (lavozim, oylik turi/summasi, karta raqami, sana) — har bir xodim uchun bir nechta bo'lishi mumkin,
//     ENG OXIRGISI joriy holatni belgilaydi.
//   EmployeeLedger (hr/employee-ledgers) — xodim bo'yicha voqealar jurnali (faqat o'qish uchun).

// Backend SalaryTypeEnum: fixed_amount | sales_percent | founder.
export const ISH_HAQI_TURLARI = [
  { value: 'fixed_amount', label: 'Belgilangan summa' },
  { value: 'sales_percent', label: 'Savdodan foiz' },
  { value: 'founder', label: 'Asoschi' },
]
export const ishHaqiTuriLabel = (v) => ISH_HAQI_TURLARI.find((t) => t.value === v)?.label ?? v

// Xodimning joriy holati — eng oxirgi RecruitmentDismissal yozuvi turi bo'yicha aniqlanadi.
const HOLAT_LABEL = {
  yangi: 'Yangi',
  faol: 'Ishlayapti',
  boshagan: 'Bo‘shagan',
}
export const holatLabel = (s) => HOLAT_LABEL[s] ?? s

export const HOLAT_BADGE_CLS = {
  yangi: 'bg-[#0A0A0A] text-white dark:bg-white/20 dark:text-white',
  faol: 'bg-[#00A25C] text-white',
  boshagan: 'bg-[#B42318] text-white',
}
export const holatBadgeCls = (s) => HOLAT_BADGE_CLS[s] ?? HOLAT_BADGE_CLS.yangi

// EmployeeLedgerTypeEnum: recruitment | dismissal_work | change_position.
const LEDGER_AMAL_LABEL = {
  recruitment: 'Ishga olindi',
  dismissal_work: 'Ishdan chiqarildi',
  change_position: 'Lavozim o‘zgardi',
}
export const ledgerAmalLabel = (t) => LEDGER_AMAL_LABEL[t] ?? t
