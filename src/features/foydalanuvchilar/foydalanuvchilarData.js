// "Foydalanuvchilar" va "Rollar" bo'limlari endi haqiqiy APIga ulangan
// (foydalanuvchilarSlice.js) — bu yerda faqat kichik yordamchi qoladi.

const HOLAT = { active: 'Faol', blocked: 'Bloklangan' }
export const holatLabel = (s) => HOLAT[s] ?? s
