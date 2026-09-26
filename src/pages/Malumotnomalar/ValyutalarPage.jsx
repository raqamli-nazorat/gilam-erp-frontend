import { useEffect, useMemo, useState } from 'react'
import { Filter, Loader2, Plus, RefreshCw, Search } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { cn } from '@/lib/utils'
import { dmyToIso, matchesDateRange } from '@/lib/format'
import { useServerPagedList } from '@/hooks/useServerPagedList'
import { extractErrorMessage } from '@/services/apiHelpers'
import { currencyApi, currencyLedgerApi } from '@/services/financeReferenceService'
import {
  buildCurrencyLedgerPayload,
  buildCurrencyPayload,
  mapCurrency,
  mapCurrencyLedger,
} from '@/features/malumotnomalar/financeReferenceData'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Toast from '@/components/Toast'
import ReferenceDeleteModal from './components/ReferenceDeleteModal'
import ValyutaModal from './components/ValyutaModal'
import KursModal from './components/KursModal'
import SyncRatesModal from './components/SyncRatesModal'
import {
  EMPTY_KURSLAR_FILTERS,
  EMPTY_VALYUTA_FILTERS,
  KurslarFilterModal,
  ValyutalarFilterModal,
} from './components/ValyutaFilterModal'

const TH =
  'sticky top-0 z-10 h-10 bg-[#F5F5F5] px-4 text-left text-[13px] font-semibold leading-[18px] whitespace-nowrap text-[#525252] dark:bg-white/5 dark:text-muted-foreground'
const TD =
  'border-b border-[#F0F0F0] px-4 text-[13px] whitespace-nowrap text-[#525252] dark:border-white/5 dark:text-muted-foreground'

export default function ValyutalarPage() {
  const [activeTab, setActiveTab] = useState('currencies') // 'currencies' | 'ledgers'

  // Qidiruv va filtrlar (har bir tab uchun)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const [valyutaFilters, setValyutaFilters] = useState(EMPTY_VALYUTA_FILTERS)
  const [valyutaFilterOpen, setValyutaFilterOpen] = useState(false)

  const [kursFilters, setKursFilters] = useState(EMPTY_KURSLAR_FILTERS)
  const [kursFilterOpen, setKursFilterOpen] = useState(false)

  // Modallar holati
  const [modalCurrency, setModalCurrency] = useState(null) // 'new' | record | null
  const [delCurrency, setDelCurrency] = useState(null)

  const [modalKurs, setModalKurs] = useState(null) // 'new' | record | null
  const [delKurs, setDelKurs] = useState(null)

  const [syncConfirmOpen, setSyncConfirmOpen] = useState(false)
  const [syncing, setSyncing] = useState(false)

  const [allCurrencies, setAllCurrencies] = useState([])
  const [toast, setToast] = useState('')

  // Boshlang'ich tab sonlari
  const [otherCurrencyCount, setOtherCurrencyCount] = useState(null)
  const [otherLedgerCount, setOtherLedgerCount] = useState(null)

  usePageHeader([{ label: "Ma'lumotnomalar" }, { label: 'Valyutalar' }])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(''), 3000)
    return () => clearTimeout(t)
  }, [toast])

  // Faqat boshqa tabning hisoblagichi uchun bitta yengil so'rov (takroriy so'rov bo'lmasligi uchun)
  useEffect(() => {
    currencyLedgerApi
      .page({ page: 1 })
      .then((res) => setOtherLedgerCount(res.count))
      .catch(() => {})
  }, [])

  // ── 1. Valyutalar ro'yxati ──
  const fetchCurrenciesPage = useMemo(
    () => (params) => currencyApi.page(params).then((res) => ({ ...res, results: res.results.map(mapCurrency) })),
    []
  )

  const currencyQueryParams = useMemo(
    () => ({
      search: activeTab === 'currencies' ? debouncedSearch.trim() : '',
      name: valyutaFilters.nomi.trim(),
      short_name: valyutaFilters.shortName.trim(),
      start_date: dmyToIso(valyutaFilters.yaratilganDan),
      end_date: dmyToIso(valyutaFilters.yaratilganGacha),
    }),
    [activeTab, debouncedSearch, valyutaFilters]
  )

  const {
    items: currencies,
    totalCount: currenciesTotalCount,
    isLoading: currenciesLoading,
    isLoadingMore: currenciesLoadingMore,
    error: currenciesError,
    hasMore: currenciesHasMore,
    containerRef: currenciesScrollRef,
    sentinelRef: currenciesSentinelRef,
    handleScroll: handleCurrenciesScroll,
    reload: reloadCurrencies,
  } = useServerPagedList(fetchCurrenciesPage, currencyQueryParams, {
    enabled: activeTab === 'currencies',
  })

  // Valyutalar yuklanganda allCurrencies'ni to'ldirish
  useEffect(() => {
    if (currencies.length > 0 && allCurrencies.length === 0) {
      setAllCurrencies(currencies)
    }
  }, [currencies, allCurrencies])

  // Kurslar modali ochilganda barcha valyutalarni to'liq ta'minlash
  const ensureCurrencies = () => {
    if (allCurrencies.length === 0) {
      currencyApi
        .list()
        .then((list) => setAllCurrencies(list.map(mapCurrency)))
        .catch(() => {})
    }
  }

  // ── 2. Kurslar ro'yxati ──
  const fetchLedgersPage = useMemo(
    () => (params) =>
      currencyLedgerApi.page(params).then((res) => ({ ...res, results: res.results.map(mapCurrencyLedger) })),
    []
  )

  const ledgerQueryParams = useMemo(
    () => ({
      search: activeTab === 'ledgers' ? debouncedSearch.trim() : '',
      currency: kursFilters.currencyId || undefined,
      start_date: dmyToIso(kursFilters.kunDan || kursFilters.yaratilganDan),
      end_date: dmyToIso(kursFilters.kunGacha || kursFilters.yaratilganGacha),
    }),
    [activeTab, debouncedSearch, kursFilters]
  )

  const {
    items: ledgers,
    totalCount: ledgersTotalCount,
    isLoading: ledgersLoading,
    isLoadingMore: ledgersLoadingMore,
    error: ledgersError,
    hasMore: ledgersHasMore,
    containerRef: ledgersScrollRef,
    sentinelRef: ledgersSentinelRef,
    handleScroll: handleLedgersScroll,
    reload: reloadLedgers,
  } = useServerPagedList(fetchLedgersPage, ledgerQueryParams, {
    enabled: activeTab === 'ledgers',
  })

  // Tab sonlari
  const currenciesCount =
    activeTab === 'currencies'
      ? currenciesTotalCount
      : (otherCurrencyCount ?? currenciesTotalCount ?? currencies.length)

  const ledgersCount =
    activeTab === 'ledgers' ? ledgersTotalCount : (otherLedgerCount ?? ledgersTotalCount ?? 0)

  // Filtrlar faolligi
  const hasCurrencyFilter = Object.values(valyutaFilters).some(Boolean)
  const hasKursFilter = Object.values(kursFilters).some(Boolean)

  // Ko'rsatiladigan qatorlar
  const shownCurrencies = useMemo(() => {
    let out = currencies
    if (valyutaFilters.ozgartirilganDan || valyutaFilters.ozgartirilganGacha) {
      out = out.filter((r) =>
        matchesDateRange(r.ozgartirilgan, valyutaFilters.ozgartirilganDan, valyutaFilters.ozgartirilganGacha)
      )
    }
    return out
  }, [currencies, valyutaFilters])

  const shownLedgers = useMemo(() => {
    let out = ledgers
    if (kursFilters.currencyId) {
      out = out.filter((r) => r.currencyId === kursFilters.currencyId)
    }
    if (kursFilters.kunDan || kursFilters.kunGacha) {
      out = out.filter((r) => matchesDateRange(r.day, kursFilters.kunDan, kursFilters.kunGacha))
    }
    if (kursFilters.ozgartirilganDan || kursFilters.ozgartirilganGacha) {
      out = out.filter((r) =>
        matchesDateRange(r.ozgartirilgan, kursFilters.ozgartirilganDan, kursFilters.ozgartirilganGacha)
      )
    }
    return out
  }, [ledgers, kursFilters])

  // ── Amallar: Valyuta ──
  async function saveCurrency(draft) {
    const payload = buildCurrencyPayload(draft)
    try {
      if (modalCurrency === 'new') {
        await currencyApi.create(payload)
      } else {
        await currencyApi.update(modalCurrency.id, payload)
      }
      setToast('Saqlandi')
      reloadCurrencies()
    } catch (err) {
      setToast({ variant: 'error', message: extractErrorMessage(err, 'Saqlashda xatolik yuz berdi') })
      throw err
    }
  }

  async function confirmDeleteCurrency() {
    try {
      await currencyApi.remove(delCurrency.id)
      setToast('O‘chirildi')
      reloadCurrencies()
    } catch (err) {
      setToast({ variant: 'error', message: extractErrorMessage(err, 'O‘chirishda xatolik yuz berdi') })
    }
  }

  // ── Amallar: Kurs ──
  async function saveKurs(draft) {
    const payload = buildCurrencyLedgerPayload(draft)
    try {
      if (modalKurs === 'new') {
        await currencyLedgerApi.create(payload)
      } else {
        await currencyLedgerApi.update(modalKurs.id, payload)
      }
      setToast('Saqlandi')
      reloadLedgers()
    } catch (err) {
      setToast({ variant: 'error', message: extractErrorMessage(err, 'Saqlashda xatolik yuz berdi') })
      throw err
    }
  }

  async function confirmDeleteKurs() {
    try {
      await currencyLedgerApi.remove(delKurs.id)
      setToast('O‘chirildi')
      reloadLedgers()
    } catch (err) {
      setToast({ variant: 'error', message: extractErrorMessage(err, 'O‘chirishda xatolik yuz berdi') })
    }
  }

  // Markaziy bank kurslarini yangilash (sync)
  async function handleSyncRates() {
    setSyncing(true)
    try {
      await currencyLedgerApi.sync()
      setToast('Markaziy bank kurslari muvaffaqiyatli yangilandi')
      setSyncConfirmOpen(false)
      reloadLedgers()
    } catch (err) {
      setToast({
        variant: 'error',
        message: extractErrorMessage(err, 'Markaziy bank kurslarini yangilashda xatolik yuz berdi'),
      })
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="flex h-full flex-col gap-4">
      {/* ── Yuqori boshqaruv paneli ── */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        {/* Chap taraf: Tab tugmalari (Valyutalar / Kurslar) */}
        <div className="inline-flex items-center gap-1 rounded-lg bg-[#F5F5F5] p-1 dark:bg-white/5">
          <button
            type="button"
            onClick={() => {
              if (activeTab !== 'currencies') {
                setOtherLedgerCount(ledgersTotalCount)
                setActiveTab('currencies')
                setSearch('')
              }
            }}
            className={cn(
              'flex h-8 items-center gap-2 whitespace-nowrap rounded-[7px] px-3 text-[13px] font-medium transition-colors',
              activeTab === 'currencies'
                ? 'bg-white text-[#0A0A0A] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] dark:bg-card dark:text-white'
                : 'text-[#737373] hover:text-[#0A0A0A] dark:text-muted-foreground dark:hover:text-white'
            )}
          >
            <span>Valyutalar</span>
            {currenciesCount != null && (
              <span
                className={cn(
                  'inline-flex h-[18px] min-w-[20px] items-center justify-center rounded-full px-1.5 text-[12px] font-medium',
                  activeTab === 'currencies'
                    ? 'bg-[#EAF1FE] text-[#0052D2] dark:bg-[#0052D2]/20 dark:text-[#60A5FA]'
                    : 'text-[#737373] dark:text-muted-foreground'
                )}
              >
                {currenciesCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              if (activeTab !== 'ledgers') {
                setOtherCurrencyCount(currenciesTotalCount)
                setActiveTab('ledgers')
                setSearch('')
                ensureCurrencies()
              }
            }}
            className={cn(
              'flex h-8 items-center gap-2 whitespace-nowrap rounded-[7px] px-3 text-[13px] font-medium transition-colors',
              activeTab === 'ledgers'
                ? 'bg-white text-[#0A0A0A] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] dark:bg-card dark:text-white'
                : 'text-[#737373] hover:text-[#0A0A0A] dark:text-muted-foreground dark:hover:text-white'
            )}
          >
            <span>Kurslar</span>
            {ledgersCount != null && (
              <span
                className={cn(
                  'inline-flex h-[18px] min-w-[20px] items-center justify-center rounded-full px-1.5 text-[12px] font-medium',
                  activeTab === 'ledgers'
                    ? 'bg-[#EAF1FE] text-[#0052D2] dark:bg-[#0052D2]/20 dark:text-[#60A5FA]'
                    : 'text-[#737373] dark:text-muted-foreground'
                )}
              >
                {ledgersCount}
              </span>
            )}
          </button>
        </div>

        {/* O'ng taraf: Qidiruv, Filtr, Yangilash va Qo'shish tugmalari */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-[260px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Qidirish"
              className="h-9 w-[260px] rounded-lg border-[#E5E5E5] bg-white pl-9 pr-3 text-sm text-[#0A0A0A] shadow-[0px_1px_2px_0px_#0000001A] placeholder:text-[#737373] focus-visible:ring-[#0052D2] dark:border-white/10 dark:bg-card dark:text-white"
            />
          </div>

          <Button
            variant="outline"
            onClick={() => {
              if (activeTab === 'currencies') {
                setValyutaFilterOpen(true)
              } else {
                ensureCurrencies()
                setKursFilterOpen(true)
              }
            }}
            className={cn(
              'h-9 gap-2 rounded-lg border-[#E5E5E5] bg-white px-4 text-sm font-medium text-[#0A0A0A] shadow-[0px_1px_2px_0px_#0000001A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-foreground',
              (activeTab === 'currencies' ? hasCurrencyFilter : hasKursFilter) && 'border-[#0052D2] text-[#0052D2]'
            )}
          >
            <Filter className="h-4 w-4" /> Filtr
          </Button>

          {activeTab === 'ledgers' && (
            <Button
              variant="outline"
              disabled={syncing}
              onClick={() => setSyncConfirmOpen(true)}
              className="h-9 gap-2 rounded-lg border-[#E5E5E5] bg-white px-4 text-sm font-medium text-[#0A0A0A] shadow-[0px_1px_2px_0px_#0000001A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-foreground"
            >
              <RefreshCw className={cn('h-4 w-4', syncing && 'animate-spin text-[#0052D2]')} />
              Yangilash
            </Button>
          )}

          <Button
            onClick={() => {
              if (activeTab === 'currencies') {
                setModalCurrency('new')
              } else {
                ensureCurrencies()
                setModalKurs('new')
              }
            }}
            className="h-9 gap-2 rounded-lg bg-[#0052D2] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
          >
            <Plus className="h-4 w-4" />
            {activeTab === 'currencies' ? 'Yangi valyuta' : 'Yangi kurs'}
          </Button>
        </div>
      </div>

      {/* ── Jadval qismi: Valyutalar tabi ── */}
      {activeTab === 'currencies' && (
        <div
          ref={currenciesScrollRef}
          onScroll={handleCurrenciesScroll}
          className="min-h-0 flex-1 overflow-auto rounded-xl bg-white dark:bg-card"
        >
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                <th className={cn(TH, 'w-12')}>#</th>
                <th className={cn(TH, 'w-[35%]')}>Nomi</th>
                <th className={cn(TH, 'w-[20%]')}>Qisqa nomi</th>
                <th className={cn(TH, 'w-[22%]')}>Yaratilgan</th>
                <th className={TH}>Yangilangan</th>
              </tr>
            </thead>
            <tbody>
              {currenciesLoading && shownCurrencies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-6 w-6 animate-spin text-[#0052D2]" />
                      <p className="text-sm text-[#737373]">Yuklanmoqda…</p>
                    </div>
                  </td>
                </tr>
              ) : currenciesError && shownCurrencies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <p className="text-sm text-[#DC2626]">Xatolik yuz berdi</p>
                      <Button
                        variant="outline"
                        onClick={reloadCurrencies}
                        className="h-8 rounded-lg border-[#E5E5E5] bg-white px-3 text-[13px] font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
                      >
                        Qayta urinish
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : shownCurrencies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-sm text-[#737373] dark:text-muted-foreground">
                    Yozuv yo‘q
                  </td>
                </tr>
              ) : (
                shownCurrencies.map((r, i) => (
                  <tr
                    key={r.id}
                    onClick={() => setModalCurrency(r)}
                    className="h-11 cursor-pointer hover:bg-[#F9FAFB] dark:hover:bg-white/5"
                  >
                    <td className={cn(TD, 'w-12')}>{i + 1}</td>
                    <td className={cn(TD, 'font-medium text-[#0052D2] dark:text-[#60A5FA]')}>
                      <div className="truncate">{r.name}</div>
                    </td>
                    <td className={TD}>
                      <div className="truncate">{r.shortName}</div>
                    </td>
                    <td className={TD}>{r.yaratilgan}</td>
                    <td className={TD}>{r.ozgartirilgan}</td>
                  </tr>
                ))
              )}
              {shownCurrencies.length > 0 && currenciesHasMore && !currenciesLoading && (
                <tr ref={currenciesSentinelRef} className="h-1 border-0 p-0">
                  <td colSpan={5} className="h-1 border-0 p-0" />
                </tr>
              )}
              {currenciesLoadingMore && (
                <tr>
                  <td colSpan={5} className="py-4 text-center">
                    <div className="inline-flex items-center gap-2 text-xs font-medium text-[#737373] dark:text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin text-[#0052D2]" />
                      Ko‘proq ma’lumotlar yuklanmoqda…
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Jadval qismi: Kurslar tabi ── */}
      {activeTab === 'ledgers' && (
        <div
          ref={ledgersScrollRef}
          onScroll={handleLedgersScroll}
          className="min-h-0 flex-1 overflow-auto rounded-xl bg-white dark:bg-card"
        >
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                <th className={cn(TH, 'w-12')}>#</th>
                <th className={cn(TH, 'w-[28%]')}>Valyuta</th>
                <th className={cn(TH, 'w-[18%]')}>Kurs</th>
                <th className={cn(TH, 'w-[18%]')}>Kun</th>
                <th className={cn(TH, 'w-[18%]')}>Yaratilgan</th>
                <th className={TH}>Yangilangan</th>
              </tr>
            </thead>
            <tbody>
              {ledgersLoading && shownLedgers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-6 w-6 animate-spin text-[#0052D2]" />
                      <p className="text-sm text-[#737373]">Yuklanmoqda…</p>
                    </div>
                  </td>
                </tr>
              ) : ledgersError && shownLedgers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <p className="text-sm text-[#DC2626]">Xatolik yuz berdi</p>
                      <Button
                        variant="outline"
                        onClick={reloadLedgers}
                        className="h-8 rounded-lg border-[#E5E5E5] bg-white px-3 text-[13px] font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
                      >
                        Qayta urinish
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : shownLedgers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-sm text-[#737373] dark:text-muted-foreground">
                    Yozuv yo‘q
                  </td>
                </tr>
              ) : (
                shownLedgers.map((r, i) => (
                  <tr
                    key={r.id}
                    onClick={() => {
                      ensureCurrencies()
                      setModalKurs(r)
                    }}
                    className="h-11 cursor-pointer hover:bg-[#F9FAFB] dark:hover:bg-white/5"
                  >
                    <td className={cn(TD, 'w-12')}>{i + 1}</td>
                    <td className={cn(TD, 'font-medium text-[#0052D2] dark:text-[#60A5FA]')}>
                      <div className="truncate">{r.valyuta}</div>
                    </td>
                    <td className={cn(TD, 'font-normal text-[#0A0A0A] dark:text-white')}>{r.kursFormatted}</td>
                    <td className={TD}>{r.day}</td>
                    <td className={TD}>{r.yaratilgan}</td>
                    <td className={TD}>{r.ozgartirilgan}</td>
                  </tr>
                ))
              )}
              {shownLedgers.length > 0 && ledgersHasMore && !ledgersLoading && (
                <tr ref={ledgersSentinelRef} className="h-1 border-0 p-0">
                  <td colSpan={6} className="h-1 border-0 p-0" />
                </tr>
              )}
              {ledgersLoadingMore && (
                <tr>
                  <td colSpan={6} className="py-4 text-center">
                    <div className="inline-flex items-center gap-2 text-xs font-medium text-[#737373] dark:text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin text-[#0052D2]" />
                      Ko‘proq ma’lumotlar yuklanmoqda…
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Valyuta qo'shish / tahrirlash modali ── */}
      <ValyutaModal
        open={!!modalCurrency}
        onOpenChange={(next) => !next && setModalCurrency(null)}
        record={modalCurrency === 'new' ? null : modalCurrency}
        onSave={saveCurrency}
        onDelete={() => {
          const rec = modalCurrency
          setModalCurrency(null)
          setDelCurrency(rec)
        }}
      />

      {/* ── Valyutani o'chirish modali (Image 3) ── */}
      <ReferenceDeleteModal
        open={!!delCurrency}
        onOpenChange={(next) => !next && setDelCurrency(null)}
        title="Valyutani o‘chirish?"
        summary={
          delCurrency
            ? [
                { label: 'Nomi', value: delCurrency.name },
                { label: 'Qisqa nomi', value: delCurrency.shortName },
              ]
            : null
        }
        record={delCurrency}
        onDelete={confirmDeleteCurrency}
      />

      {/* ── Valyutalar filtri modali ── */}
      <ValyutalarFilterModal
        open={valyutaFilterOpen}
        onOpenChange={setValyutaFilterOpen}
        filters={valyutaFilters}
        onApply={setValyutaFilters}
      />

      {/* ── Kurs qo'shish / tahrirlash modali ── */}
      <KursModal
        open={!!modalKurs}
        onOpenChange={(next) => !next && setModalKurs(null)}
        record={modalKurs === 'new' ? null : modalKurs}
        onSave={saveKurs}
        onDelete={() => {
          const rec = modalKurs
          setModalKurs(null)
          setDelKurs(rec)
        }}
        currencies={allCurrencies}
      />

      {/* ── Kursni o'chirish modali (Image 3) ── */}
      <ReferenceDeleteModal
        open={!!delKurs}
        onOpenChange={(next) => !next && setDelKurs(null)}
        title="Kursni o‘chirish?"
        summary={
          delKurs
            ? [
                { label: 'Valyuta', value: delKurs.valyuta },
                { label: 'Kurs', value: delKurs.kursFormatted },
                { label: 'Kun', value: delKurs.day },
              ]
            : null
        }
        record={delKurs}
        onDelete={confirmDeleteKurs}
      />

      {/* ── Kurslar filtri modali ── */}
      <KurslarFilterModal
        open={kursFilterOpen}
        onOpenChange={setKursFilterOpen}
        filters={kursFilters}
        onApply={setKursFilters}
        currencyOptions={allCurrencies.map((c) => ({
          value: c.id,
          label: c.shortName || c.short_name ? `${c.name} (${c.shortName || c.short_name})` : c.name,
        }))}
      />

      {/* ── Kurslarni yangilash tasdiqlash modali (Image 4) ── */}
      <SyncRatesModal
        open={syncConfirmOpen}
        onOpenChange={setSyncConfirmOpen}
        onConfirm={handleSyncRates}
        loading={syncing}
      />

      <Toast message={toast} />
    </div>
  )
}