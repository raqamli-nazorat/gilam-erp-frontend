// "Filiallar" bo'limi endi haqiqiy APIga ulangan (filiallarSlice.js) — bu yerda faqat
// boshqa hali mock bo'lgan bo'limlar (Ma'lumotnomalar) foydalanadigan umumiy ro'yxatlar qoladi.
import { TASHKILOT_NOMLARI, VILOYATLAR, TUMANLAR } from '@/features/tashkilotlar/tashkilotlarData'

export { VILOYATLAR, TUMANLAR, TASHKILOT_NOMLARI }

const HOLAT = { active: 'Faol', closed: 'Yopilgan' }
export const holatLabel = (s) => HOLAT[s] ?? s
