// Eslatma: "Tashkilotlar" bo'limi (list/detail/CRUD) endi haqiqiy APIga ulangan — bu yerdagi
// ro'yxatlar boshqa bo'limlarda (Filiallar, Ma'lumotnomalar) hali API bilan almashtirilmagani
// uchun saqlanib qolgan.

export const VILOYATLAR = [
  'Toshkent shahri',
  'Toshkent',
  'Samarqand',
  'Buxoro',
  'Andijon',
  'Farg‘ona',
  'Namangan',
  'Xorazm',
  'Qashqadaryo',
  'Surxondaryo',
  'Navoiy',
  'Jizzax',
  'Sirdaryo',
  'Qoraqalpog‘iston',
]

// Har bir viloyat uchun bir nechta tuman (modal'dagi "Tuman" select uchun)
export const TUMANLAR = {
  'Toshkent shahri': ['Chilonzor', 'Yunusobod', 'Sergeli', 'Mirzo Ulug‘bek', 'Yashnobod', 'Shayxontohur'],
  Toshkent: ['Zangiota', 'Qibray', 'Bo‘ka', 'Yangiyo‘l', 'Chirchiq'],
  Samarqand: ['Samarqand tumani', 'Temiryo‘l', 'Siyob', 'Bulung‘ur', 'Urgut', 'Kattaqo‘rg‘on'],
  Buxoro: ['Buxoro shahri', 'Kogon', 'G‘ijduvon', 'Vobkent', 'Romitan'],
  Andijon: ['Andijon shahri', 'Asaka', 'Xonobod', 'Shahrixon', 'Marhamat'],
  'Farg‘ona': ['Farg‘ona shahri', 'Qo‘qon shahri', 'Marg‘ilon', 'Quva', 'Rishton'],
  Namangan: ['Namangan shahri', 'Chust', 'Pop', 'Uchqo‘rg‘on', 'To‘raqo‘rg‘on'],
  Xorazm: ['Urganch shahri', 'Xiva', 'Gurlan', 'Xonqa', 'Yangibozor'],
  Qashqadaryo: ['Qarshi shahri', 'Shahrisabz', 'Kitob', 'G‘uzor', 'Koson'],
  Surxondaryo: ['Termiz shahri', 'Denov', 'Sherobod', 'Sho‘rchi', 'Jarqo‘rg‘on'],
  Navoiy: ['Navoiy shahri', 'Zarafshon', 'Karmana', 'Qiziltepa', 'Nurota'],
  Jizzax: ['Jizzax shahri', 'Zomin', 'G‘allaorol', 'Do‘stlik', 'Paxtakor'],
  Sirdaryo: ['Guliston shahri', 'Yangiyer', 'Sirdaryo tumani', 'Boyovut', 'Sayxunobod'],
  'Qoraqalpog‘iston': ['Nukus shahri', 'Xo‘jayli', 'Chimboy', 'To‘rtko‘l', 'Beruniy'],
}

// Filiallar/Foydalanuvchilar bo'limlari hali mock ma'lumot ustida ishlagani uchun
// tashkilot nomlari ro'yxati (select/filter'lar uchun) shu yerda saqlanadi.
export const TASHKILOT_NOMLARI = [
  'SAG Gilamlari', 'Buxoro Gilam Savdo', 'Namangan Karpet', 'Andijon Gilam Markazi',
  'Farg‘ona To‘qimachilik', 'Xorazm Gilam', 'Qashqadaryo Savdo', 'Navoiy Gilam Uyi',
  'Surxon Karpet', 'Jizzax Gilam', 'Sirdaryo Savdo', 'Qoraqalpog‘iston Gilam',
  'Toshkent Gilam Fabrikasi', 'Chirchiq To‘qimachilik', 'Zarafshon Karpet', 'Marg‘ilon Ipak Gilam',
  'Quva Palos', 'Rishton Hunarmand Gilam', 'Denov Gilam Savdo', 'Shahrisabz Gilam Markazi',
  'G‘ijduvon Gilam Uyi', 'Kogon To‘qimachilik', 'Yangiyer Karpet', 'Chust Gilam',
  'Pop To‘qimachilik', 'Uchqo‘rg‘on Gilam Savdo', 'Angren Palos', 'Bekobod Gilam',
  'Guliston To‘qimachilik', 'Zomin Gilam Uyi', 'Nurota Karpet', 'Karmana Gilam',
  'Beruniy To‘qimachilik', 'Xiva Gilam Ustaxonasi', 'Gurlan Karpet', 'Koson Gilam',
  'G‘uzor To‘qimachilik', 'Termiz Ipak Yo‘li', 'Sho‘rchi Palos', 'Jarqo‘rg‘on Gilam',
  'Urgut Gilam Savdo', 'Kattaqo‘rg‘on Karpet',
]
