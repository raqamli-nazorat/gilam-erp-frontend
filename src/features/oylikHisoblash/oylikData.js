// Oylik hisoblash uchun doimiylar (Mock ma'lumotlar olib tashlangan, faqat backend API orqali ishlaydi)

export const OYLIK_MONTHS = [
  { value: 1, label: 'Yanvar' },
  { value: 2, label: 'Fevral' },
  { value: 3, label: 'Mart' },
  { value: 4, label: 'Aprel' },
  { value: 5, label: 'May' },
  { value: 6, label: 'Iyun' },
  { value: 7, label: 'Iyul' },
  { value: 8, label: 'Avgust' },
  { value: 9, label: 'Sentyabr' },
  { value: 10, label: 'Oktyabr' },
  { value: 11, label: 'Noyabr' },
  { value: 12, label: 'Dekabr' },
]

export const MONTH_NAMES = {
  1: 'Yanvar',
  2: 'Fevral',
  3: 'Mart',
  4: 'Aprel',
  5: 'May',
  6: 'Iyun',
  7: 'Iyul',
  8: 'Avgust',
  9: 'Sentyabr',
  10: 'Oktyabr',
  11: 'Noyabr',
  12: 'Dekabr',
}

export const OYLIK_STATUS = {
  draft: 'Qoralama',
  approved: 'Tasdiqlangan',
  cancelled: 'Bekor qilingan',
}

export const STATUS_BADGE_CLASSES = {
  draft: 'bg-[#FFF4E5] text-[#B45309] dark:bg-[#B45309]/20 dark:text-[#FBBF24]',
  approved: 'bg-[#E6FAF1] text-[#047A47] dark:bg-[#047A47]/20 dark:text-[#34D399]',
  cancelled: 'bg-[#FEECEC] text-[#DC2626] dark:bg-[#DC2626]/20 dark:text-[#F87171]',
}

// Tekshirish uchun 1 ta mock ma'lumot
export const MOCK_OYLIK_ITEMS = [
  {
    id: 'test-hisob-1',
    for_month: 9,
    forMonth: 9,
    year: 2026,
    amount: 16450000,
    totalAmount: 16450000,
    status: 'draft',
    created_at: '2026-09-26T14:30:00Z',
    updated_at: '2026-09-26T15:45:00Z',
    createdAt: '26.09.2026 14:30',
    updatedAt: '26.09.2026 15:45',
    branch: 'b1',
    branchId: 'b1',
    branchName: "Bo'ston filiali",
    branch_info: {
      id: 'b1',
      name: "Bo'ston filiali",
      organization: {
        id: 'org1',
        name: "Bo'ston Gilam MChJ",
      },
      organization_name: "Bo'ston Gilam MChJ",
    },
    orgId: 'org1',
    orgName: "Bo'ston Gilam MChJ",
    employee_count: 3,
    employeeCount: 3,
    employees: [
      {
        id: 'emp-1',
        tabNum: '0127',
        name: 'Alimov Anvar Rustamovich',
        type: 'Oylik',
        currency: 'UZS',
        salary: 5000000,
        additions: 500000,
        deductions: 250000,
        totalUzs: 5250000,
        totalUsd: null,
        details: {
          maosh: { info: '168 s, 100%' },
          bonus: { info: 'Sotuv, 15%' },
          mukofot: { amount: 100000, info: 'Yaxshi ko‘rsatkich' },
        },
      },
      {
        id: 'emp-2',
        tabNum: '0128',
        name: 'Karimova Dilnoza Bahodirovna',
        type: 'Oylik',
        currency: 'UZS',
        salary: 4500000,
        additions: 300000,
        deductions: 100000,
        totalUzs: 4700000,
        totalUsd: null,
        details: {
          maosh: { info: '168 s, 100%' },
          bonus: { info: 'Kassir bonusi' },
        },
      },
      {
        id: 'emp-3',
        tabNum: '0129',
        name: 'Sobirov Jasur Otabekovich',
        type: 'Oylik',
        currency: 'UZS',
        salary: 6000000,
        additions: 800000,
        deductions: 300000,
        totalUzs: 6500000,
        totalUsd: null,
        details: {
          maosh: { info: '176 s, 100%' },
          bonus: { info: 'Usta ustamasi' },
        },
      },
    ],
  },
]

