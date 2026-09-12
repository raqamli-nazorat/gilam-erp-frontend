import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, CopyIcon, Loader2, RefreshCw, Search } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { cn } from '@/lib/utils'
import { formatAuditDateTime, getActionInfo } from '@/features/audit/auditData'
import { getAuditLogs } from '@/services/auditService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Toast from '@/components/Toast'
import AuditFilterModal, { EMPTY_AUDIT_FILTERS } from './components/AuditFilterModal'
import AuditDetailModal from './components/AuditDetailModal'
import { HugeiconsIcon } from '@hugeicons/react'
import { FilterIcon } from '@hugeicons/core-free-icons/index'
import ExportDropdown from '@/components/ui/ExportDropdown'
import { exportAuditToExcel, exportAuditToPdf } from './utils/auditExport'

const TH =
  'sticky top-0 z-10 h-10 bg-[#F5F5F5] px-4 text-[13px] font-semibold uppercase leading-[18px] text-[#737373] dark:bg-white/5 dark:text-muted-foreground'

export default function AuditJurnaliPage() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filters, setFilters] = useState(EMPTY_AUDIT_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)
  const [ordering, setOrdering] = useState(null) // default null: API ga yuborilmaydi
  const [active, setActive] = useState(null)
  const [toast, setToast] = useState('')
  const [copiedKey, setCopiedKey] = useState(null)

  // Toast xabari chiqqanidan so'ng 3 soniya o'tib yo'qolishi
  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => {
      setToast('')
    }, 3000)
    return () => clearTimeout(timer)
  }, [toast])

  // Pagination & API state
  const [logs, setLogs] = useState([])
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState(null)

  const tableContainerRef = useRef(null)
  const sentinelRef = useRef(null)
  const isFetchingRef = useRef(false)
  const searchMountedRef = useRef(false)

  usePageHeader('Platforma › Audit jurnali')

  // Search debounce: birinchi yuklanishda ortiqcha ishga tushmaydi, faqat search o'zgarganda
  useEffect(() => {
    if (!searchMountedRef.current) {
      searchMountedRef.current = true
      return
    }
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
    }, 250)
    return () => clearTimeout(handler)
  }, [search])

  const hasFilter = useMemo(() => {
    return Object.values(filters).some((v) => v !== '' && v !== null && v !== undefined)
  }, [filters])

  // Loglarni API orqali yuklash funksiyasi
  const fetchLogs = useCallback(
    async ({ pageNum, isAppend = false }) => {
      if (isFetchingRef.current) return
      isFetchingRef.current = true

      if (isAppend) {
        setIsLoadingMore(true)
      } else {
        setIsLoading(true)
        setError(null)
      }

      try {
        const params = {
          page: pageNum,
          search: debouncedSearch.trim() || undefined,
          ordering: ordering || undefined, // faqat bosilgandan keyingina yuboriladi
          action: filters.action !== '' && filters.action !== undefined ? filters.action : undefined,
          actor: filters.actor?.trim() || undefined,
          start_date: filters.start_date || undefined,
          end_date: filters.end_date || undefined,
        }

        const res = await getAuditLogs(params)
        const payload = res?.data || res
        const results = payload?.results || []
        const count = payload?.count ?? results.length
        const next = payload?.next

        if (isAppend) {
          setLogs((prev) => [...prev, ...results])
        } else {
          setLogs(results)
        }

        setTotalCount(count)
        setHasMore(Boolean(next))
      } catch (err) {
        console.error('Audit jurnali yuklashda xatolik:', err)
        const msg =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          'Ma’lumotlarni yuklashda xatolik yuz berdi'
        setError(msg)
      } finally {
        setIsLoading(false)
        setIsLoadingMore(false)
        isFetchingRef.current = false
      }
    },
    [debouncedSearch, ordering, filters]
  )

  // debouncedSearch, ordering yoki filters o'zgarganda birinchi sahifadan yuklaymiz
  useEffect(() => {
    setPage(1)
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTop = 0
    }
    fetchLogs({ pageNum: 1, isAppend: false })
  }, [fetchLogs])

  // Scroll pagination / load next page
  const loadNextPage = useCallback(() => {
    if (isFetchingRef.current || isLoading || isLoadingMore || !hasMore || logs.length === 0) return
    const nextPage = page + 1
    setPage(nextPage)
    fetchLogs({ pageNum: nextPage, isAppend: true })
  }, [isLoading, isLoadingMore, hasMore, logs.length, page, fetchLogs])

  // IntersectionObserver orqali scroll pagination
  useEffect(() => {
    const sentinel = sentinelRef.current
    const container = tableContainerRef.current
    if (!sentinel || !container || !hasMore || isLoading || isLoadingMore || logs.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Faqat haqiqatdan konteynerda scroll bor bo'lsa va pastga yetganda
        if (entries[0].isIntersecting && container.scrollHeight > container.clientHeight) {
          loadNextPage()
        }
      },
      {
        root: container,
        rootMargin: '60px',
        threshold: 0.1,
      }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loadNextPage, hasMore, isLoading, isLoadingMore, logs.length])

  // Fallback: tableContainer scroll hodisasi
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    if (scrollHeight - scrollTop - clientHeight < 100) {
      loadNextPage()
    }
  }

  const handleExportCsv = () => {
    if (!logs.length) {
      setToast("Yuklash uchun ma'lumot yo'q")
      return
    }
    const headers = [
      'Sana',
      'Vaqt',
      'Foydalanuvchi',
      'Tashkilot',
      'Amal',
      'Jadval',
      'Yozuv ID',
      'IP manzil',
    ]
    const rows = logs.map((r) => {
      const dt = formatAuditDateTime(r.timestamp)
      const actionInfo = getActionInfo(r.action)
      const user = r.actor_name || r.actor || r.object_repr || '—'
      const org = r.organization_name || r.tashkilot || '—'
      const table = r.content_type_name || (r.content_type ? `ID: ${r.content_type}` : '—')
      const record = r.object_pk || r.object_id || '—'
      const ip = r.remote_addr || '—'

      return [
        `"${dt.date}"`,
        `"${dt.time}"`,
        `"${user}"`,
        `"${org}"`,
        `"${actionInfo.label}"`,
        `"${table}"`,
        `"${record}"`,
        `"${ip}"`,
      ]
    })
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const now = new Date()
    const d = String(now.getDate()).padStart(2, '0')
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const y = now.getFullYear()
    a.download = `audit-jurnali-${d}.${m}.${y}.csv`
    a.click()
    URL.revokeObjectURL(url)
    setToast('Audit jurnali CSV (.csv) formatida yuklab olindi')
  }

  const handleExportExcel = () => {
    if (!logs.length) {
      setToast("Yuklash uchun ma'lumot yo'q")
      return
    }
    try {
      exportAuditToExcel(logs)
      setToast('Audit jurnali Excel (.xlsx) formatida yuklab olindi')
    } catch (err) {
      console.error('Excel eksportda xatolik:', err)
      setToast('Excel faylini yuklashda xatolik yuz berdi')
    }
  }

  const handleExportPdf = () => {
    if (!logs.length) {
      setToast("Yuklash uchun ma'lumot yo'q")
      return
    }
    try {
      exportAuditToPdf(logs)
      setToast('Audit jurnali PDF (.pdf) formatida yuklab olindi')
    } catch (err) {
      console.error('PDF eksportda xatolik:', err)
      setToast('PDF faylini yuklashda xatolik yuz berdi')
    }
  }

  const handleCopy = (text, key, label, e) => {
    e.stopPropagation()
    if (!text || text === '—') return
    navigator.clipboard?.writeText(String(text))
    setCopiedKey(key)
    setToast(`${label} nusxalandi: ${text}`)
    setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev))
    }, 1500)
  }

  return (
    <>
      <div className="flex h-full flex-col gap-4">
        {/* Header filtrlari va qidiruv */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setDebouncedSearch(search)
                }
              }}
              placeholder="Jadval, yozuv ID yoki IP…"
              className="h-9 w-full max-w-[280px] rounded-lg focus-visible:border-[#c0d0e9] border-[#E5E5E5] bg-white pl-9 pr-3 text-sm text-[#0A0A0A] placeholder:text-[#737373] focus-visible:ring-[#c0d0e9] dark:border-white/10 dark:bg-card dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              onClick={() => setFilterOpen(true)}
              className={cn(
                'h-9 gap-2 rounded-lg border-[#E5E5E5] bg-white px-4 text-sm font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-foreground cursor-pointer',
                hasFilter && 'border-[#0052D2] text-[#0052D2]'
              )}
            >
              <HugeiconsIcon icon={FilterIcon} strokeWidth={2.5} className="h-4 w-4" />
              Filtr
              {hasFilter && (
                <span className="ml-1 inline-flex h-2 w-2 rounded-full bg-[#0052D2]" />
              )}
            </Button>
            <ExportDropdown
              onExportExcel={handleExportExcel}
              onExportPdf={handleExportPdf}
              onExportCsv={handleExportCsv}
            />
          </div>
        </div>

        <div
          ref={tableContainerRef}
          onScroll={handleScroll}
          className="min-h-0 flex-1 overflow-y-auto bg-white dark:bg-card"
        >
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead className="sticky top-0 z-10">
              <tr>
                <th className={cn(TH, 'text-start w-[50px]!')}>#</th>
                <th className={cn(TH, 'text-left')}>
                  <button
                    type="button"
                    onClick={() =>
                      setOrdering((prev) => {
                        if (!prev) return '-timestamp'
                        if (prev === '-timestamp') return 'timestamp'
                        return '-timestamp'
                      })
                    }
                    className="inline-flex items-center gap-1 cursor-pointer hover:text-[#0A0A0A] dark:hover:text-white transition-colors"
                  >
                    VAQT
                    <ChevronDown
                      className={cn(
                        'h-3.5 w-3.5 transition-transform text-[#737373]',
                        ordering === '-timestamp' && 'text-[#0052D2]',
                        ordering === 'timestamp' && 'rotate-180 text-[#0052D2]'
                      )}
                    />
                  </button>
                </th>
                <th className={cn(TH, 'text-left')}>FOYDALANUVCHI</th>
                <th className={cn(TH, 'text-left')}>TASHKILOT</th>
                <th className={cn(TH, 'text-left')}>AMAL</th>
                <th className={cn(TH, 'text-left')}>JADVAL</th>
                <th className={cn(TH, 'text-left')}>YOZUV</th>
                <th className={cn(TH, 'text-left')}>IP</th>
              </tr>
            </thead>
            <tbody>
              {/* Yuklanish holati (dastlabki) */}
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-[#737373] dark:text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin text-[#0052D2]" />
                      <span className="text-sm">Ma’lumotlar yuklanmoqda...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                /* Xatolik holati */
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-red-500">
                      <span className="text-sm font-medium">{error}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchLogs({ pageNum: 1, isAppend: false })}
                        className="mt-2 gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className="h-3.5 w-3.5" /> Qayta urinish
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                /* Bo'sh ro'yxat */
                <tr>
                  <td colSpan={8} className="py-16 text-center text-sm text-[#737373] dark:text-muted-foreground">
                    Yozuv topilmadi
                  </td>
                </tr>
              ) : (
                /* Loglar ro'yxati */
                logs.map((r, index) => {
                  const dt = formatAuditDateTime(r.timestamp)
                  const actionInfo = getActionInfo(r.action)
                  const userDisplay = r.actor_name || r.actor || r.object_repr || '—'
                  const orgDisplay = r.organization_name || r.tashkilot || '—'
                  const tableDisplay =
                    r.content_type_name || (r.content_type ? `ID: ${r.content_type}` : '—')
                  const recordDisplay = r.object_pk || r.object_id || '—'
                  const ipDisplay = r.remote_addr || '—'

                  return (
                    <tr
                      key={r.id || `audit-item-${index}`}
                      onClick={() => setActive(r)}
                      className="h-[52px] cursor-pointer border-b border-[#F0F0F0] hover:bg-[#F9FAFB] dark:border-white/5 dark:hover:bg-white/5 transition-colors"
                    >
                      <td className="px-4 text-[13px] text-[#737373] dark:text-white">
                        {index + 1}
                      </td>
                      <td className="px-4 text-[13px]">
                        <div className="flex flex-col">
                          <span className="font-medium text-[#737373] dark:text-white">
                            {dt.time}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 text-[13px] font-medium text-[#0A0A0A] dark:text-white">
                        <span className="line-clamp-1" title={userDisplay}>
                          {userDisplay}
                        </span>
                      </td>
                      <td className="px-4 text-[13px] text-[#737373] dark:text-muted-foreground">
                        <span className="line-clamp-1" title={orgDisplay}>
                          {orgDisplay}
                        </span>
                      </td>
                      <td className="px-4">
                        <span
                          className={cn(
                            'inline-flex h-[22px] items-center rounded-full px-2.5 text-[11px] font-semibold tracking-[0.3px]',
                            actionInfo.cls
                          )}
                        >
                          {actionInfo.label}
                        </span>
                      </td>
                      <td className="px-4 text-[13px] text-[#525252] dark:text-muted-foreground">
                        <span className="line-clamp-1" title={tableDisplay}>
                          {tableDisplay}
                        </span>
                      </td>
                      <td className="px-4 text-[13px]">
                        <div className="inline-flex items-center gap-1.5">
                          <span
                            className="max-w-[180px] truncate font-medium text-[#0A0A0A] dark:text-white"
                            title={String(recordDisplay)}
                          >
                            {String(recordDisplay)}
                          </span>
                          {recordDisplay !== '—' && (
                            <button
                              type="button"
                              onClick={(e) =>
                                handleCopy(recordDisplay, `yozuv-${r.id || index}`, 'Yozuv ID', e)
                              }
                              title="Nusxa olish"
                              className="inline-flex items-center justify-center rounded p-1 text-[#737373] transition-colors hover:bg-black/5 hover:text-[#0A0A0A] dark:text-muted-foreground dark:hover:bg-white/10 dark:hover:text-white cursor-pointer"
                            >
                              {copiedKey === `yozuv-${r.id || index}` ? (
                                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <CopyIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 text-[13px]">
                        <div className="inline-flex items-center gap-1.5">
                          <span className="text-[#737373] dark:text-muted-foreground">
                            {ipDisplay}
                          </span>
                          {ipDisplay !== '—' && (
                            <button
                              type="button"
                              onClick={(e) =>
                                handleCopy(ipDisplay, `ip-${r.id || index}`, 'IP manzil', e)
                              }
                              title="Nusxa olish"
                              className="inline-flex items-center justify-center rounded p-1 text-[#737373] transition-colors hover:bg-black/5 hover:text-[#0A0A0A] dark:text-muted-foreground dark:hover:bg-white/10 dark:hover:text-white cursor-pointer"
                            >
                              {copiedKey === `ip-${r.id || index}` ? (
                                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <CopyIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}

              {/* Scroll Sentinel qatori (faqat ma'lumotlar bor bo'lsa va keyingi sahifa mavjud bo'lsa) */}
              {logs.length > 0 && hasMore && !isLoading && (
                <tr ref={sentinelRef} className="h-1 p-0 border-0">
                  <td colSpan={8} className="p-0 h-1 border-0" />
                </tr>
              )}

              {/* Qo'shimcha sahifa yuklanayotgandagi loader */}
              {isLoadingMore && (
                <tr>
                  <td colSpan={8} className="py-4 text-center">
                    <div className="inline-flex items-center gap-2 text-xs font-medium text-[#737373] dark:text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin text-[#0052D2]" />
                      Ko‘proq ma’lumotlar yuklanmoqda...
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Filter va Detail modallari */}
        <AuditFilterModal
          open={filterOpen}
          onOpenChange={setFilterOpen}
          filters={filters}
          onApply={setFilters}
        />
        <AuditDetailModal row={active} onClose={() => setActive(null)} />
      </div>

      <Toast message={toast} />
    </>
  )
}
