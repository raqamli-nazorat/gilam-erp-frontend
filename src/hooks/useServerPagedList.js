import { useCallback, useEffect, useRef, useState } from 'react'

// Backendning sahifalangan (page/results/count/next) ro'yxatini "scroll pagination" bilan
// yuklaydi: butun ro'yxatni bitta so'rovda yig'ib olish o'rniga (ortiqcha so'rovlar), faqat
// birinchi sahifani, keyin foydalanuvchi jadvalni pastga aylantirganda navbatdagi sahifani
// so'raydi. AuditJurnaliPage.jsx'da qo'lda yozilgan (va ishlayotgani tasdiqlangan) shu xil
// naqshning qayta ishlatsa bo'ladigan versiyasi.
//
// `fetchFn(params)` — `{ results, count, next }` qaytaradigan funksiya (masalan bir servis
// funksiyasi, masalan `organizationService.getOrganizationsPage`); `page` avtomatik qo'shiladi,
// alohida `useCallback`ga o'rab bermasa ham bo'ladi — modul darajasidagi funksiya barqaror.
// `params` (masalan {search, ...filtrlar}) o'zgarsa, ro'yxat 1-sahifadan qayta yuklanadi.
export function useServerPagedList(fetchFn, params, options = {}) {
  const { enabled = true } = options
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  // Javobdagi qo'shimcha `counts` (bo'lsa) — masalan tab hisoblagichlari uchun.
  const [counts, setCounts] = useState(null)
  const [hasMore, setHasMore] = useState(false)
  const [isLoading, setIsLoading] = useState(enabled)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState(null)

  const containerRef = useRef(null)
  const sentinelRef = useRef(null)
  const isFetchingRef = useRef(false)
  const paramsKey = JSON.stringify(params ?? {})

  const load = useCallback(
    async (pageNum, { append = false } = {}) => {
      if (!enabled || isFetchingRef.current) return
      isFetchingRef.current = true
      if (append) setIsLoadingMore(true)
      else {
        setIsLoading(true)
        setError(null)
      }
      try {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        const { results, count, next, counts: resCounts } = await fetchFn({ ...JSON.parse(paramsKey), page: pageNum })
        setItems((prev) => (append ? [...prev, ...results] : results))
        setTotalCount(count)
        setCounts(resCounts ?? null)
        setHasMore(Boolean(next))
      } catch (err) {
        setError(err)
      } finally {
        setIsLoading(false)
        setIsLoadingMore(false)
        isFetchingRef.current = false
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fetchFn, paramsKey, enabled]
  )

  // params yoki enabled o'zgarganda (qidiruv/filtr) 1-sahifadan qayta yuklaymiz
  useEffect(() => {
    if (!enabled) {
      setIsLoading(false)
      return
    }
    setPage(1)
    if (containerRef.current) containerRef.current.scrollTop = 0
    load(1, { append: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load, enabled])

  const loadMore = useCallback(() => {
    if (isFetchingRef.current || isLoading || isLoadingMore || !hasMore || items.length === 0) return
    const nextPage = page + 1
    setPage(nextPage)
    load(nextPage, { append: true })
  }, [isLoading, isLoadingMore, hasMore, items.length, page, load])

  // IntersectionObserver orqali scroll pagination (asosiy usul)
  useEffect(() => {
    const sentinel = sentinelRef.current
    const container = containerRef.current
    if (!sentinel || !container || !hasMore || isLoading || isLoadingMore || items.length === 0) return undefined
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && container.scrollHeight > container.clientHeight) loadMore()
      },
      { root: container, rootMargin: '60px', threshold: 0.1 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loadMore, hasMore, isLoading, isLoadingMore, items.length])

  // Fallback: konteyner scroll hodisasi (IntersectionObserver ishlamagan holatlar uchun)
  const handleScroll = useCallback(
    (e) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
      if (scrollHeight - scrollTop - clientHeight < 100) loadMore()
    },
    [loadMore]
  )

  return {
    items,
    setItems,
    page,
    totalCount,
    counts,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    containerRef,
    sentinelRef,
    handleScroll,
    reload: () => load(1, { append: false }),
  }
}
