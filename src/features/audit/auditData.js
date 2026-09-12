// Audit jurnali konstantalari va yordamchi funksiyalari

export const ACTION_CHOICES = [
  { value: 0, label: 'CREATE' },
  { value: 1, label: 'UPDATE' },
  { value: 2, label: 'DELETE' },
  { value: 3, label: 'ACCESS' },
]

export const AUDIT_FOYDALANUVCHILAR = [
  'Abdullayev Sherzod',
  'Axrorjon Nazarov',
  'Ergashev Qodir',
  'Ergasheva Dilnoza',
  'Ismoilov Bobur',
  'Karimov Anvar',
  'Mirzajonov G‘afforjon',
  'Nazarov Jasur',
  'Nazarova Gulnora',
  'Qodirova Malika',
  'Rahimova Nigora',
  'Rahmonov Aziz',
  'Rasulov Bahodir',
  'Rasulov Bekzod',
  'Salmonov Sardor',
  'Sobirov Aziz',
  'Toshev Dilshod',
  'Toshev Farrux',
  'Toshev Jamshid',
  'Yo‘ldoshev Nodir',
  'Yusupov Anvar',
  'Yusupov Bekzod',
]

export const JADVALLAR = [
  'Order',
  'OrderItem',
  'Payment',
  'DebtLedger',
  'InstallmentAgreement',
  'Warehouse',
  'ProductStock',
  'CarpetRoll',
  'StockTransaction',
  'Customer',
  'Employee',
  'EmployeeCommission',
  'Product',
  'SupplierPurchase',
  'Organization',
  'User',
  'Expense',
]

export const AUDIT_TASHKILOTLAR = [
  'Andijon Gilam Markazi',
  'Buxoro Gilam Savdo',
  'Farg‘ona To‘qimachilik',
  'Namangan Karpet',
  'Qashqadaryo Savdo',
  'SAG Gilamlari',
  'Xorazm Gilam',
]

export const ACTION_CONFIG = {
  0: {
    label: 'CREATE',
    title: 'Yaratish',
    cls: 'bg-[#E6FAF1] text-[#047A47] dark:bg-[#047A47]/20 dark:text-[#34D399]',
  },
  1: {
    label: 'UPDATE',
    title: "O'zgartirish",
    cls: 'bg-[#EAF1FE] text-[#0052D2] dark:bg-[#0052D2]/20 dark:text-[#60A5FA]',
  },
  2: {
    label: 'DELETE',
    title: "O'chirish",
    cls: 'bg-[#FEECEC] text-[#DC2626] dark:bg-[#DC2626]/15 dark:text-[#F87171]',
  },
  3: {
    label: 'ACCESS',
    title: 'Kirish',
    cls: 'bg-[#F3E8FF] text-[#7E22CE] dark:bg-[#7E22CE]/20 dark:text-[#C084FC]',
  },
}

export function getActionInfo(action) {
  if (action in ACTION_CONFIG) {
    return ACTION_CONFIG[action]
  }
  // Agar matn bo'lsa (INSERT, UPDATE, DELETE, ACCESS)
  const upper = String(action || '').toUpperCase()
  if (upper === 'INSERT' || upper === 'CREATE') return ACTION_CONFIG[0]
  if (upper === 'UPDATE') return ACTION_CONFIG[1]
  if (upper === 'DELETE') return ACTION_CONFIG[2]
  if (upper === 'ACCESS') return ACTION_CONFIG[3]

  return {
    label: upper || '—',
    title: upper || '—',
    cls: 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300',
  }
}

export const amalBadgeCls = (action) => getActionInfo(action).cls

/**
 * ISO timestamp dan sana va vaqt formatlash
 * @param {string} isoString
 */
export function formatAuditDateTime(isoString) {
  if (!isoString) return { date: '—', time: '—', full: '—' }
  try {
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return { date: isoString, time: '', full: isoString }

    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    const seconds = String(d.getSeconds()).padStart(2, '0')

    const date = `${day}.${month}.${year}`
    const time = `${hours}:${minutes}:${seconds}`
    return {
      date,
      time,
      full: `${date} ${time}`,
    }
  } catch {
    return { date: isoString, time: '', full: isoString }
  }
}

/**
 * Audit o'zgarishlarini (changes) eski va yangi qiymatlarga ajratish
 * API formati:
 * "changes": {
 *   "field_name": ["old_value", "new_value"]
 * }
 */
export function buildAuditDiff(row) {
  if (!row) return { before: null, after: null, additional: null }

  const changes = row.changes
  const additional = row.additional_data

  if (changes && typeof changes === 'object' && !Array.isArray(changes)) {
    const beforeObj = {}
    const afterObj = {}
    let hasBefore = false
    let hasAfter = false

    for (const [key, val] of Object.entries(changes)) {
      if (Array.isArray(val) && val.length >= 2) {
        const [oldVal, newVal] = val
        if (oldVal !== undefined && oldVal !== 'None' && oldVal !== null) {
          beforeObj[key] = oldVal
          hasBefore = true
        } else if (oldVal === null || oldVal === 'None') {
          beforeObj[key] = null
          hasBefore = true
        }

        if (newVal !== undefined && newVal !== 'None' && newVal !== null) {
          afterObj[key] = newVal
          hasAfter = true
        } else if (newVal === null || newVal === 'None') {
          afterObj[key] = null
          hasAfter = true
        }
      } else {
        afterObj[key] = val
        hasAfter = true
      }
    }

    return {
      before: hasBefore ? beforeObj : null,
      after: hasAfter ? afterObj : null,
      additional: additional || null,
    }
  }

  return {
    before: null,
    after: changes || null,
    additional: additional || null,
  }
}
