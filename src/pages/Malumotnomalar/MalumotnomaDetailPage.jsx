import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Filter, Plus, Search } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { formatNumber, formatDateTime, matchesDateRange } from '@/lib/format'
import { cn } from '@/lib/utils'
import {
  genericListConfig,
  MALUMOTNOMA_CONFIG,
  MALUMOTNOMA_INDEX,
  MALUMOTNOMA_MENU,
  withRecordMeta,
} from '@/features/malumotnomalar/malumotnomalarData'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import CopyButton from '@/components/ui/copy-button'
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

  return <ListDetail key={slug} slug={slug} name={name} config={config} />
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
              <th className={cn(TH, 'h-10 w-12 text-left')}>#</th>
              {config.columns.map((c) => (
                <th key={c.key} className={cn(TH, 'h-10', c.align === 'right' ? 'text-right' : 'text-left')}>
                  {c.label}
                </th>
              ))}
              <th className={cn(TH, 'h-10 text-left')}>YARATILGAN</th>
              <th className={cn(TH, 'h-10 text-left')}>O‘ZGARTIRILGAN</th>
              <th className={cn(TH, 'h-10 text-left')}>HOLAT</th>
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
                  <td className={TD_MUTED}>{i + 1}</td>
                  {config.columns.map((c, ci) => (
                    <td
                      key={c.key}
                      className={cn(
                        'px-4 text-[13px]',
                        c.align === 'right' ? 'text-right' : 'text-left',
                        ci === 0
                          ? 'text-[14px] font-medium text-[#0052D2] dark:text-[#60A5FA]'
                          : 'text-[#0A0A0A] dark:text-muted-foreground'
                      )}
                    >
                      <span className="inline-flex items-center gap-2">
                        {c.swatchKey && (
                          <span
                            className="h-6 w-6 shrink-0 rounded-md border border-black/10 dark:border-white/15"
                            style={{ backgroundColor: r[c.swatchKey] }}
                          />
                        )}
                        <span>{c.num != null ? formatNumber(r[c.key], c.num) : r[c.key] || '—'}</span>
                        {c.copyable && r[c.key] && <CopyButton value={r[c.key]} />}
                      </span>
                    </td>
                  ))}
                  <td className={TD_MUTED}>{r.yaratilgan}</td>
                  <td className={TD_MUTED}>{r.ozgartirilgan}</td>
                  <td className="px-4">
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
