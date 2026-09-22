import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Filter, Loader2, Plus, Search } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { formatNumber, formatDateTime, matchesDateRange } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useServerPagedList } from '@/hooks/useServerPagedList'
import {
  genericListConfig,
  MALUMOTNOMA_CONFIG,
  MALUMOTNOMA_INDEX,
  MALUMOTNOMA_MENU,
  withRecordMeta,
} from '@/features/malumotnomalar/malumotnomalarData'
import {
  REFERENCE_API_REGISTRY,
  buildReferencePayload,
  qualitySlice,
} from '@/features/malumotnomalar/referenceEntities'
import { mapRecord } from '@/features/malumotnomalar/referenceSlices'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import CopyButton from '@/components/ui/copy-button'
import Toast from '@/components/Toast'
import RecordModal from './components/RecordModal'
import DeleteRecordModal from './components/DeleteRecordModal'
import MalumotnomaFilterModal, { EMPTY_MALUMOTNOMA_FILTERS } from './components/MalumotnomaFilterModal'

const TH =
  'sticky top-0 z-10 bg-[#F5F5F5] px-4 text-[13px] font-semibold uppercase leading-[18px] text-[#525252] dark:bg-white/5 dark:text-muted-foreground'
const TD_MUTED = 'px-4 text-[13px] text-[#737373] dark:text-muted-foreground'

export default function MalumotnomaDetailPage({ slug: slugProp }) {
  const params = useParams()
  const slug = slugProp ?? params.slug
  const name =
    MALUMOTNOMA_MENU.find((m) => m.slug === slug)?.name ?? MALUMOTNOMA_INDEX[slug]?.name ?? slug
  const raw = MALUMOTNOMA_CONFIG[slug]
  const config = raw?.kind === 'list' ? raw : genericListConfig(name)
  const apiEntry = REFERENCE_API_REGISTRY[slug]

  if (apiEntry) return <ApiListDetail key={slug} slug={slug} name={name} config={config} apiEntry={apiEntry} />
  return <ListDetail key={slug} slug={slug} name={name} config={config} />
}

// Backend'da to'liq CRUD endpointi bor ma'lumotnomalar (sifat/rang/birlik/lavozim/kontragent
// turi) uchun — ro'yxat/saqlash/o'chirish real APIga boradi, jadval ko'rinishi ListDetail bilan bir xil.
// Jadval endi "scroll pagination" bilan (bitta-bitta sahifa) yuklanadi — qidiruv serverga
// so'rov parametri sifatida yuboriladi. Redux'dagi to'liq ro'yxat (`state[apiEntry.stateKey].list`)
// ga tegilmadi — masalan Lavozimlar shu ro'yxatga Xodim ishga olish oynasidagi "Lavozim"
// tanlagichida ham tayanadi. "Holat" (Faol/Arxiv) va sana oralig'i filtrlari uchun mos
// backend parametri tasdiqlanmagan — shular hozircha faqat YUKLANGAN qatorlar ustida ishlaydi.
function ApiListDetail({ slug, name, config, apiEntry }) {
  const dispatch = useDispatch()
  const state = useSelector((s) => s[apiEntry.stateKey])
  const [modalRec, setModalRec] = useState(null) // record | 'new' | null
  const [delRec, setDelRec] = useState(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filters, setFilters] = useState(EMPTY_MALUMOTNOMA_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)
  const [toast, setToast] = useState('')

  const hasFilter = Object.values(filters).some(Boolean)

  usePageHeader([{ label: "Ma'lumotnomalar" }, { label: name }])

  useEffect(() => {
    if (state.listStatus === 'idle') dispatch(apiEntry.slice.fetchItems())
  }, [state.listStatus, dispatch, apiEntry])

  // Dizayn kabi bir FK'ga ("Sifat") bog'liq ma'lumotnomalar uchun tanlagich ro'yxatini
  // ham yuklab, modal maydonining `options`'ini dinamik to'ldiramiz.
  const qualityState = useSelector((s) => s.sifatlar)
  useEffect(() => {
    if (apiEntry.hasQuality && qualityState.listStatus === 'idle') dispatch(qualitySlice.fetchItems())
  }, [apiEntry.hasQuality, qualityState.listStatus, dispatch])

  const modalFields = useMemo(() => {
    if (!apiEntry.hasQuality) return config.modalFields
    const options = qualityState.list.map((q) => ({ value: q.id, label: q.name }))
    return config.modalFields.map((f) => (f.key === 'sifatId' ? { ...f, options } : f))
  }, [config.modalFields, apiEntry.hasQuality, qualityState.list])

  // Qidiruvni 250ms kechiktirib yuboramiz — har bosilgan harfda so'rov jo'natmaslik uchun.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(''), 3000)
    return () => clearTimeout(t)
  }, [toast])

  const fetchRecordsPage = useCallback(
    (params) => apiEntry.slice.api.page(params).then((res) => ({ ...res, results: res.results.map(mapRecord) })),
    [apiEntry]
  )
  const {
    items: rows,
    isLoading: rowsLoading,
    isLoadingMore: rowsLoadingMore,
    error: rowsError,
    hasMore: rowsHasMore,
    containerRef: rowsScrollRef,
    sentinelRef: rowsSentinelRef,
    handleScroll: handleRowsScroll,
    reload: reloadRows,
  } = useServerPagedList(fetchRecordsPage, { search: debouncedSearch.trim() })

  const shown = useMemo(() => {
    let out = rows
    if (filters.holat) out = out.filter((r) => (filters.holat === 'Faol' ? r.active : !r.active))
    if (filters.yaratilganDan || filters.yaratilganGacha)
      out = out.filter((r) => matchesDateRange(r.yaratilgan, filters.yaratilganDan, filters.yaratilganGacha))
    return out
  }, [rows, filters])

  function saveRecord(values) {
    const payload = buildReferencePayload(apiEntry, values)
    const action =
      modalRec === 'new'
        ? apiEntry.slice.createItem(payload)
        : apiEntry.slice.updateItem({ id: modalRec.id, payload })
    dispatch(action)
      .unwrap()
      .then(() => {
        setToast('Saqlandi')
        reloadRows()
      })
      .catch((err) => setToast(err || 'Saqlashda xatolik yuz berdi'))
  }

  function confirmDelete() {
    dispatch(apiEntry.slice.deleteItem(delRec.id))
      .unwrap()
      .then(() => {
        setToast('O‘chirildi')
        reloadRows()
      })
      .catch((err) => setToast(err || 'O‘chirishda xatolik yuz berdi'))
  }

  const totalCols = config.columns.length + 4

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="relative w-[260px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={config.searchPlaceholder || 'Qidirish'}
              className="h-9 w-[260px] rounded-lg border-[#E5E5E5] bg-white pl-9 pr-3 text-sm text-[#0A0A0A] shadow-[0px_1px_2px_0px_#0000001A] placeholder:text-[#737373] focus-visible:ring-[#0052D2] dark:border-white/10 dark:bg-card dark:text-white"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setFilterOpen(true)}
            className={cn(
              'h-9 gap-2 border-[#E5E5E5] bg-white px-4 text-sm font-medium text-[#0A0A0A] shadow-[0px_1px_2px_0px_#0000001A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-foreground',
              hasFilter && 'border-[#0052D2] text-[#0052D2]'
            )}
          >
            <Filter className="h-4 w-4" /> Filtr
          </Button>
        </div>

        <Button
          onClick={() => setModalRec('new')}
          className="h-9 gap-2 rounded-md bg-[#0052D2] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
        >
          <Plus className="h-4 w-4" /> Qo‘shish
        </Button>
      </div>

      <div
        ref={rowsScrollRef}
        onScroll={handleRowsScroll}
        className="min-h-0 flex-1 overflow-auto rounded-xl bg-white dark:bg-card"
      >
        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className={cn(TH, 'h-10 w-12 text-left whitespace-nowrap')}>#</th>
              {config.columns.map((c, ci) => (
                <th
                  key={c.key}
                  className={cn(
                    TH,
                    'h-10 whitespace-nowrap',
                    c.align === 'right' ? 'text-right' : 'text-left',
                    c.key === 'tavsif'
                      ? 'max-w-[300px] 2xl:max-w-[300px]'
                      : ci === 0
                        ? 'max-w-[200px]'
                        : 'max-w-[220px]'
                  )}
                >
                  {c.label}
                </th>
              ))}
              <th className={cn(TH, 'h-10 text-left whitespace-nowrap')}>YARATILGAN</th>
              <th className={cn(TH, 'h-10 text-left whitespace-nowrap')}>O‘ZGARTIRILGAN</th>
              <th className={cn(TH, 'h-10 text-left whitespace-nowrap')}>HOLAT</th>
            </tr>
          </thead>
          <tbody>
            {rowsLoading && shown.length === 0 ? (
              <tr>
                <td colSpan={totalCols} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-6 w-6 animate-spin text-[#0052D2]" />
                    <p className="text-sm text-[#737373]">Yuklanmoqda…</p>
                  </div>
                </td>
              </tr>
            ) : rowsError && shown.length === 0 ? (
              <tr>
                <td colSpan={totalCols} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-sm text-[#DC2626]">Xatolik yuz berdi</p>
                    <Button
                      variant="outline"
                      onClick={reloadRows}
                      className="h-8 border-[#E5E5E5] bg-white px-3 text-[13px] font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
                    >
                      Qayta urinish
                    </Button>
                  </div>
                </td>
              </tr>
            ) : shown.length === 0 ? (
              <tr>
                <td colSpan={totalCols} className="py-16 text-center text-sm text-[#737373] dark:text-muted-foreground">
                  Yozuv yo‘q
                </td>
              </tr>
            ) : (
              shown.map((r, i) => (
                <tr
                  key={r.id}
                  onClick={() => setModalRec(r)}
                  className="h-11 cursor-pointer hover:bg-[#F9FAFB] dark:hover:bg-white/5"
                >
                  <td className={cn(TD_MUTED, 'w-12 whitespace-nowrap')}>{i + 1}</td>
                  {config.columns.map((c, ci) => (
                    <td
                      key={c.key}
                      className={cn(
                        'px-4 text-[13px] whitespace-nowrap',
                        c.align === 'right' ? 'text-right' : 'text-left',
                        ci === 0
                          ? 'text-[14px] font-medium text-[#0052D2] dark:text-[#60A5FA]'
                          : 'text-[#0A0A0A] dark:text-muted-foreground',
                        c.key === 'tavsif'
                          ? 'max-w-[300px] 2xl:max-w-[350px]'
                          : ci === 0
                            ? 'max-w-[200px]'
                            : 'max-w-[220px]'
                      )}
                    >
                      <div
                        className="flex items-center gap-2 min-w-0"
                        title={r[c.key] ? String(r[c.key]) : undefined}
                      >
                        {c.swatchKey && (
                          <span
                            className="h-6 w-6 shrink-0 rounded-md border border-black/10 dark:border-white/15"
                            style={{ backgroundColor: r[c.swatchKey] }}
                          />
                        )}
                        <span className="truncate min-w-0">
                          {c.num != null ? formatNumber(r[c.key], c.num) : r[c.key] || '—'}
                        </span>
                        {c.copyable && r[c.key] && <CopyButton value={r[c.key]} />}
                      </div>
                    </td>
                  ))}
                  <td className={cn(TD_MUTED, 'whitespace-nowrap')}>{r.yaratilgan}</td>
                  <td className={cn(TD_MUTED, 'whitespace-nowrap')}>{r.ozgartirilgan}</td>
                  <td className="px-4 whitespace-nowrap">
                    <span
                      className={cn(
                        'inline-flex h-[22px] items-center rounded-full px-2.5 text-[11px] font-medium tracking-[0.3px]',
                        r.active
                          ? 'bg-[#E6FAF1] text-[#047A47] dark:bg-[#047A47]/20 dark:text-[#34D399]'
                          : 'bg-[#F5F5F5] text-[#737373] dark:bg-white/10 dark:text-muted-foreground'
                      )}
                    >
                      {r.active ? 'Faol' : 'Arxiv'}
                    </span>
                  </td>
                </tr>
              ))
            )}
            {shown.length > 0 && rowsHasMore && !rowsLoading && (
              <tr ref={rowsSentinelRef} className="h-1 border-0 p-0">
                <td colSpan={totalCols} className="h-1 border-0 p-0" />
              </tr>
            )}
            {rowsLoadingMore && (
              <tr>
                <td colSpan={totalCols} className="py-4 text-center">
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

      <RecordModal
        open={!!modalRec}
        onOpenChange={(next) => !next && setModalRec(null)}
        entity={config.entity}
        fields={modalFields}
        record={modalRec === 'new' ? null : modalRec}
        onSave={saveRecord}
        onDelete={() => {
          const rec = modalRec
          setModalRec(null)
          setDelRec(rec)
        }}
      />
      <DeleteRecordModal
        open={!!delRec}
        onOpenChange={(next) => !next && setDelRec(null)}
        entity={config.entity}
        record={delRec}
        fields={modalFields}
        onDelete={confirmDelete}
      />
      <MalumotnomaFilterModal
        open={filterOpen}
        onOpenChange={setFilterOpen}
        slug={slug}
        filters={filters}
        onApply={setFilters}
      />
      <Toast message={toast} />
    </div>
  )
}

function ListDetail({ slug, name, config }) {
  const [rows, setRows] = useState(() => withRecordMeta(config.rows))
  const [modalRec, setModalRec] = useState(null) // record | 'new' | null
  const [delRec, setDelRec] = useState(null)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(EMPTY_MALUMOTNOMA_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)

  const hasFilter = Object.values(filters).some(Boolean)
  const searchKeys = config.searchKeys ?? ['name']

  usePageHeader([{ label: "Ma'lumotnomalar" }, { label: name }])

  const shown = useMemo(() => {
    let out = rows
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      out = out.filter((r) => searchKeys.some((k) => String(r[k] ?? '').toLowerCase().includes(q)))
    }
    if (filters.holat) out = out.filter((r) => (filters.holat === 'Faol' ? r.active : !r.active))
    if (filters.yaratilganDan || filters.yaratilganGacha)
      out = out.filter((r) => matchesDateRange(r.yaratilgan, filters.yaratilganDan, filters.yaratilganGacha))
    if (filters.tashkilot) out = out.filter((r) => !r.tashkilot || r.tashkilot === filters.tashkilot)
    return out
  }, [rows, search, searchKeys, filters])

  function saveRecord(values) {
    if (modalRec === 'new') {
      const now = formatDateTime()
      setRows((r) => [{ id: `n-${Date.now()}`, yaratilgan: now, ozgartirilgan: now, ...values }, ...r])
    } else {
      // Tahrirlashda sana maydonlari qo'lda tahrirlanadi — modaldan kelgan qiymat saqlanadi.
      setRows((r) => r.map((x) => (x.id === modalRec.id ? { ...x, ...values } : x)))
    }
  }

  const totalCols = config.columns.length + 4

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="relative w-[260px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={config.searchPlaceholder || 'Qidirish'}
              className="h-9 w-[260px] rounded-lg border-[#E5E5E5] bg-white pl-9 pr-3 text-sm text-[#0A0A0A] shadow-[0px_1px_2px_0px_#0000001A] placeholder:text-[#737373] focus-visible:ring-[#0052D2] dark:border-white/10 dark:bg-card dark:text-white"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setFilterOpen(true)}
            className={cn(
              'h-9 gap-2 border-[#E5E5E5] bg-white px-4 text-sm font-medium text-[#0A0A0A] shadow-[0px_1px_2px_0px_#0000001A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-foreground',
              hasFilter && 'border-[#0052D2] text-[#0052D2]'
            )}
          >
            <Filter className="h-4 w-4" /> Filtr
          </Button>
        </div>

        <Button
          onClick={() => setModalRec('new')}
          className="h-9 gap-2 rounded-md bg-[#0052D2] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
        >
          <Plus className="h-4 w-4" /> Qo‘shish
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto rounded-xl bg-white dark:bg-card">
        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className={cn(TH, 'h-10 w-12 text-left whitespace-nowrap')}>#</th>
              {config.columns.map((c, ci) => (
                <th
                  key={c.key}
                  className={cn(
                    TH,
                    'h-10 whitespace-nowrap',
                    c.align === 'right' ? 'text-right' : 'text-left',
                    c.key === 'tavsif'
                      ? 'max-w-[320px] 2xl:max-w-[480px]'
                      : ci === 0
                        ? 'max-w-[200px]'
                        : 'max-w-[220px]'
                  )}
                >
                  {c.label}
                </th>
              ))}
              <th className={cn(TH, 'h-10 text-left whitespace-nowrap')}>YARATILGAN</th>
              <th className={cn(TH, 'h-10 text-left whitespace-nowrap')}>O‘ZGARTIRILGAN</th>
              <th className={cn(TH, 'h-10 text-left whitespace-nowrap')}>HOLAT</th>
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 ? (
              <tr>
                <td colSpan={totalCols} className="py-16 text-center text-sm text-[#737373] dark:text-muted-foreground">
                  Yozuv yo‘q
                </td>
              </tr>
            ) : (
              shown.map((r, i) => (
                <tr
                  key={r.id}
                  onClick={() => setModalRec(r)}
                  className="h-11 cursor-pointer hover:bg-[#F9FAFB] dark:hover:bg-white/5"
                >
                  <td className={cn(TD_MUTED, 'w-12 whitespace-nowrap')}>{i + 1}</td>
                  {config.columns.map((c, ci) => (
                    <td
                      key={c.key}
                      className={cn(
                        'px-4 text-[13px] whitespace-nowrap',
                        c.align === 'right' ? 'text-right' : 'text-left',
                        ci === 0
                          ? 'text-[14px] font-medium text-[#0052D2] dark:text-[#60A5FA]'
                          : 'text-[#0A0A0A] dark:text-muted-foreground',
                        c.key === 'tavsif'
                          ? 'max-w-[320px] 2xl:max-w-[480px]'
                          : ci === 0
                            ? 'max-w-[200px]'
                            : 'max-w-[220px]'
                      )}
                    >
                      <div
                        className="flex items-center gap-2 min-w-0"
                        title={r[c.key] ? String(r[c.key]) : undefined}
                      >
                        {c.swatchKey && (
                          <span
                            className="h-6 w-6 shrink-0 rounded-md border border-black/10 dark:border-white/15"
                            style={{ backgroundColor: r[c.swatchKey] }}
                          />
                        )}
                        <span className="truncate min-w-0">
                          {c.num != null ? formatNumber(r[c.key], c.num) : r[c.key] || '—'}
                        </span>
                        {c.copyable && r[c.key] && <CopyButton value={r[c.key]} />}
                      </div>
                    </td>
                  ))}
                  <td className={cn(TD_MUTED, 'whitespace-nowrap')}>{r.yaratilgan}</td>
                  <td className={cn(TD_MUTED, 'whitespace-nowrap')}>{r.ozgartirilgan}</td>
                  <td className="px-4 whitespace-nowrap">
                    <span
                      className={cn(
                        'inline-flex h-[22px] items-center rounded-full px-2.5 text-[11px] font-medium tracking-[0.3px]',
                        r.active
                          ? 'bg-[#E6FAF1] text-[#047A47] dark:bg-[#047A47]/20 dark:text-[#34D399]'
                          : 'bg-[#F5F5F5] text-[#737373] dark:bg-white/10 dark:text-muted-foreground'
                      )}
                    >
                      {r.active ? 'Faol' : 'Arxiv'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <RecordModal
        open={!!modalRec}
        onOpenChange={(next) => !next && setModalRec(null)}
        entity={config.entity}
        fields={config.modalFields}
        record={modalRec === 'new' ? null : modalRec}
        onSave={saveRecord}
        onDelete={() => {
          const rec = modalRec
          setModalRec(null)
          setDelRec(rec)
        }}
      />
      <DeleteRecordModal
        open={!!delRec}
        onOpenChange={(next) => !next && setDelRec(null)}
        entity={config.entity}
        record={delRec}
        fields={config.modalFields}
        onDelete={() => setRows((r) => r.filter((x) => x.id !== delRec.id))}
      />
      <MalumotnomaFilterModal
        open={filterOpen}
        onOpenChange={setFilterOpen}
        slug={slug}
        filters={filters}
        onApply={setFilters}
      />
    </div>
  )
}
