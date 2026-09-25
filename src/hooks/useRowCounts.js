import { useEffect, useRef, useState } from 'react'

// Jadvalda ko'rinib turgan (yuklangan) qatorlar uchun qo'shimcha sonlarni (masalan "N ta tuman")
// `countFn(id)` orqali oladi — so'rovlar parallel emas, KETMA-KET yuboriladi (bir vaqtda o'nlab
// so'rov ketib, backend 429 qaytarmasligi uchun). `version` o'zgarsa (masalan saqlash/o'chirishdan
// keyin) hammasi qaytadan olinadi. Natija: { [id]: number } — hali kelmaganlari yo'q.
export function useRowCounts(ids, countFn, version = 0) {
  const [counts, setCounts] = useState({})
  const requested = useRef(new Set())
  const lastVersion = useRef(version)
  const idsKey = ids.join(',')

  useEffect(() => {
    if (lastVersion.current !== version) {
      lastVersion.current = version
      requested.current = new Set()
      setCounts({})
    }
    const pending = ids.filter((id) => !requested.current.has(id))
    if (pending.length === 0) return undefined
    pending.forEach((id) => requested.current.add(id))

    let cancelled = false
    const done = new Set()
    ;(async () => {
      for (const id of pending) {
        if (cancelled) return
        try {
          const n = await countFn(id)
          done.add(id)
          setCounts((c) => ({ ...c, [id]: n }))
        } catch {
          requested.current.delete(id)
        }
      }
    })()
    return () => {
      cancelled = true
      // To'xtatilgan navbatdagi hali olinmaganlarni keyingi safar qayta so'rash uchun bo'shatamiz.
      pending.forEach((id) => !done.has(id) && requested.current.delete(id))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey, countFn, version])

  return counts
}
