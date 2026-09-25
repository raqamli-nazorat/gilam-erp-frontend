import { useEffect, useState } from 'react'

// Ro'yxat sahifalaridagi tab hisoblagichlari (Barchasi / Faol / Bloklangan ...) — sahifaga
// kirgan zahoti hammasi ko'rinadi.
//
// - Ochiq tabning soni jadvalning O'Z so'rovidagi `count`dan olinadi (qo'shimcha so'rovsiz —
//   oldin "Barchasi" uchun jadval so'rovining aynan takrori ketardi).
// - Qolgan tablarning soni (`variants`) har biri uchun bitta 1-sahifa so'rovi bilan, ketma-ket
//   olinadi. `baseParams` (masalan qidiruv) o'zgarsa qayta so'raladi.
// - "Barchasi" boshqa tab ochiq bo'lganda variantlar yig'indisi sifatida hisoblanadi (holat
//   ikki qiymatli: faol + bloklangan = barchasi) — buning uchun ham alohida so'rov yo'q.
//
// `fetchPage(params)` — { count } qaytaruvchi servis funksiyasi (modul darajasida, barqaror).
// `variants` — { tabKey: { ...params } }, masalan { active: { is_blocked: false }, blocked: { is_blocked: true } }.
// `listTab` — hozir jadvalga yuklanayotgan tab kaliti ('all' yoki variants kalitlaridan biri).
// Natija: { all, [tabKey]: number } — hali ma'lum bo'lmaganlari undefined.
export function useTabCounts(fetchPage, baseParams, variants, listTab, totalCount, isLoading) {
  const [fetched, setFetched] = useState({ key: '', counts: {} })
  const key = JSON.stringify([baseParams, variants])

  useEffect(() => {
    let cancelled = false
    const [base, vars] = JSON.parse(key)
    setFetched({ key, counts: {} })
    ;(async () => {
      for (const [tabKey, extra] of Object.entries(vars)) {
        try {
          const res = await fetchPage({ ...base, ...extra, page: 1 })
          if (cancelled) return
          setFetched((prev) => (prev.key === key ? { key, counts: { ...prev.counts, [tabKey]: res.count } } : prev))
        } catch {
          // Hisoblagich muhim emas — xato bo'lsa bu tabning soni ko'rinmaydi.
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [fetchPage, key])

  const counts = fetched.key === key ? { ...fetched.counts } : {}
  // Ochiq tabning aniq soni — jadval so'rovidan (variant so'rovidan yangiroq bo'lishi mumkin).
  if (!isLoading) counts[listTab] = totalCount
  if (counts.all === undefined) {
    const parts = Object.keys(variants).map((k) => counts[k])
    if (parts.every((n) => typeof n === 'number')) counts.all = parts.reduce((a, b) => a + b, 0)
  }
  return counts
}
