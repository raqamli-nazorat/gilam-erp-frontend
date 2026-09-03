import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Check, ChevronLeft, ChevronUp, Filter, Plus, Search, Trash2, X } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import {
  genericListConfig,
  MALUMOTNOMA_CONFIG,
  MALUMOTNOMA_INDEX,
} from '@/features/malumotnomalar/malumotnomalarData'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import RecordModal from './components/RecordModal'
import DeleteRecordModal from './components/DeleteRecordModal'
import ListFilterModal, { emptyListFilters } from './components/ListFilterModal'

const TH = 'px-3 text-[13px] font-semibold uppercase leading-[18px] text-[#525252] dark:text-muted-foreground'

export default function MalumotnomaDetailPage() {
  const { slug } = useParams()
  const meta = MALUMOTNOMA_INDEX[slug]
  const config = MALUMOTNOMA_CONFIG[slug] ?? genericListConfig(meta?.name ?? slug)

  if (config.kind === 'card') return <CardDetail name={meta?.name ?? slug} config={config} />
  return <ListDetail name={meta?.name ?? slug} config={config} />
}

function BackLink() {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      onClick={() => navigate('/malumotnomalar')}
      className="flex items-center gap-1.5 text-[15px] font-medium text-[#0A0A0A] transition-colors hover:text-[#0052D2] dark:text-white"
    >
      <ChevronLeft className="h-4 w-4" /> Ma'lumotnomalar
    </button>
  )
}

/* ─────────────── Card (Rekvizitlar) ─────────────── */
function CardDetail({ name, config }) {
  const [editing, setEditing] = useState(false)
  const [data, setData] = useState(() => {
    const d = {}
    config.cards.forEach((c) => c.fields.forEach((f) => { d[f.key] = f.value }))
    return d
  })
  const [draft, setDraft] = useState(data)

  usePageHeader(name)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <BackLink />
        {editing ? (
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              onClick={() => { setDraft(data); setEditing(false) }}
              className="h-9 gap-2 border-[#E5E5E5] bg-white px-4 text-sm font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
            >
              <X className="h-4 w-4" /> Bekor qilish
            </Button>
            <Button
              onClick={() => { setData(draft); setEditing(false) }}
              className="h-9 gap-2 rounded-md bg-[#0052D2] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
            >
              <Check className="h-4 w-4" /> Saqlash
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={() => { setDraft(data); setEditing(true) }}
            className="h-9 px-4 text-sm font-medium text-[#0A0A0A] border-[#E5E5E5] bg-white hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
          >
            Tahrirlash
          </Button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {config.cards.map((card) => (
          <div key={card.title} className="rounded-xl border border-[#E5E5E5] bg-white p-5 dark:border-white/10 dark:bg-card">
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.4px] text-[#737373] dark:text-muted-foreground">{card.title}</p>
            <div className="flex flex-col gap-3">
              {card.fields.map((f) => (
                <div key={f.key} className={editing ? '' : 'flex items-center justify-between gap-4'}>
                  {editing ? (
                    <>
                      <Label className="mb-1.5 block text-[13px] font-normal text-[#525252] dark:text-muted-foreground">{f.label}</Label>
                      <Input
                        value={draft[f.key] ?? ''}
                        onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
                        className="h-10 w-full rounded-md border-[#E5E5E5] bg-white px-3 text-[14px] text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:border-white/10 dark:bg-card dark:text-white"
                      />
                    </>
                  ) : (
                    <>
                      <span className="text-[13px] text-[#737373] dark:text-muted-foreground">{f.label}</span>
                      <span className="text-right text-[14px] font-medium text-[#0A0A0A] dark:text-white">{data[f.key]}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────── List (Omborlar va boshqalar) ─────────────── */
function ListDetail({ name, config }) {
  const sortKey = config.sortKey || config.columns.find((c) => c.sortable)?.key || 'name'
  const searchKeys = useMemo(() => config.searchKeys || ['name'], [config])

  const [rows, setRows] = useState(config.rows)
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [asc, setAsc] = useState(true)
  const [modalRec, setModalRec] = useState(null) // record | 'new' | null
  const [delRec, setDelRec] = useState(null)
  const [filters, setFilters] = useState(() => emptyListFilters(config.filterFields))
  const [filterOpen, setFilterOpen] = useState(false)

  const counts = useMemo(
    () => ({ active: rows.filter((r) => r.active).length, archived: rows.filter((r) => !r.active).length, all: rows.length }),
    [rows]
  )
  const hasFilter = Object.values(filters).some(Boolean)

  usePageHeader(name, { label: String(counts.all), variant: 'new' })

  const shown = useMemo(() => {
    let out = rows
    if (tab === 'active') out = out.filter((r) => r.active)
    if (tab === 'archived') out = out.filter((r) => !r.active)
    if (search) {
      const q = search.toLowerCase()
      out = out.filter((r) => searchKeys.some((k) => String(r[k] ?? '').toLowerCase().includes(q)))
    }
    Object.entries(filters).forEach(([k, v]) => {
      if (!v) return
      if (k === '__holat') out = out.filter((r) => (v === 'Faol' ? r.active : !r.active))
      else if (k === '__year') out = out.filter((r) => String(r.date ?? '').endsWith(v))
      else out = out.filter((r) => String(r[k] ?? '') === v)
    })
    const key = (r) => {
      const v = String(r[sortKey] ?? '')
      const m = v.match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
      return m ? `${m[3]}${m[2]}${m[1]}` : v
    }
    // Sana ustuni bo'yicha standart tartib — eng yangisi tepada
    const dir = sortKey === 'date' ? (asc ? -1 : 1) : (asc ? 1 : -1)
    return [...out].sort((a, b) => dir * key(a).localeCompare(key(b), 'uz'))
  }, [rows, tab, search, asc, filters, sortKey, searchKeys])

  function saveRecord(values) {
    if (modalRec === 'new') {
      setRows((r) => [{ id: `n-${Date.now()}`, ...values }, ...r])
    } else {
      setRows((r) => r.map((x) => (x.id === modalRec.id ? { ...x, ...values } : x)))
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E5E5] pb-2 dark:border-white/10">
        <div className="flex items-center gap-6">
          <BackLink />
          {[['active', 'Faol', counts.active], ['archived', 'Arxiv', counts.archived], ['all', 'Barchasi', counts.all]].map(([key, label, n]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                'relative flex items-center gap-1.5 pb-2.5 pt-1 text-sm transition-colors',
                tab === key ? 'font-medium text-[#0A0A0A] dark:text-white' : 'font-normal text-[#737373] hover:text-[#0A0A0A] dark:text-muted-foreground'
              )}
            >
              {label}
              <span className={cn(
                'inline-flex h-[18px] min-w-[22px] items-center justify-center rounded-full px-1.5 text-[12px] font-medium',
                tab === key ? 'bg-[#EAF1FE] text-[#0052D2] dark:bg-[#0052D2]/20 dark:text-[#60A5FA]' : 'bg-[#F5F5F5] text-[#737373] dark:bg-white/10 dark:text-muted-foreground'
              )}>{n}</span>
              {tab === key && <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#0052D2]" />}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative w-[280px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={config.searchPlaceholder}
              className="h-9 w-[280px] rounded-md border-[#E5E5E5] bg-white pl-9 pr-3 text-sm dark:border-white/10 dark:bg-card dark:text-white"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setFilterOpen(true)}
            className={cn(
              'h-9 gap-2 border-[#E5E5E5] bg-white px-4 text-sm font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-foreground',
              hasFilter && 'border-[#0052D2] text-[#0052D2]'
            )}
          >
            <Filter className="h-4 w-4" /> Filtr
          </Button>
          <Button
            onClick={() => setModalRec('new')}
            className="h-9 gap-2 rounded-md bg-[#0052D2] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
          >
            <Plus className="h-4 w-4" /> Yangi {config.entity}
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#E5E5E5] bg-white dark:border-white/10 dark:bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F5F5F5] dark:bg-white/5">
              <tr className="h-11 border-b border-[#E5E5E5] dark:border-white/10">
                <th className={cn(TH, 'w-10 text-left')}>#</th>
                {config.columns.map((c) => (
                  <th key={c.key} className={cn(TH, c.align === 'right' ? 'text-right' : 'text-left')}>
                    {c.sortable ? (
                      <button type="button" onClick={() => setAsc((v) => !v)} className="inline-flex items-center gap-1">
                        {c.label} <ChevronUp className={cn('h-3 w-3 transition-transform', !asc && 'rotate-180')} />
                      </button>
                    ) : c.label}
                  </th>
                ))}
                <th className={cn(TH, 'text-left')}>HOLAT</th>
                <th className={cn(TH, 'w-10')} />
              </tr>
            </thead>
            <tbody>
              {shown.length === 0 ? (
                <tr><td colSpan={config.columns.length + 4} className="py-14 text-center text-sm text-[#737373]">Yozuv yo'q</td></tr>
              ) : shown.map((r, i) => (
                <tr
                  key={r.id}
                  onClick={() => setModalRec(r)}
                  className="group h-12 cursor-pointer border-b border-[#E5E5E5] last:border-0 hover:bg-[#F9FAFB] dark:border-white/5 dark:hover:bg-white/5"
                >
                  <td className="px-3 text-[13px] text-[#737373]">{i + 1}</td>
                  {config.columns.map((c, ci) => (
                    <td
                      key={c.key}
                      className={cn(
                        'px-3 text-[13px]',
                        c.align === 'right' ? 'text-right' : 'text-left',
                        ci === 0 ? 'font-medium text-[#0A0A0A] dark:text-white' : 'text-[#525252] dark:text-muted-foreground'
                      )}
                    >
                      {c.num != null ? formatNumber(r[c.key], c.num) : (r[c.key] || '—')}
                    </td>
                  ))}
                  <td className="px-3">
                    <span className={cn(
                      'inline-flex h-[22px] items-center rounded-full px-2.5 text-[11px] font-medium tracking-[0.3px]',
                      r.active
                        ? 'bg-[#E6FAF1] text-[#047A47] dark:bg-[#047A47]/20 dark:text-[#34D399]'
                        : 'bg-[#F5F5F5] text-[#737373] dark:bg-white/10 dark:text-muted-foreground'
                    )}>{r.active ? 'Faol' : 'Arxiv'}</span>
                  </td>
                  <td className="px-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setDelRec(r)}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-[#737373] opacity-0 transition-opacity hover:bg-[#FEECEC] hover:text-[#DC2626] group-hover:opacity-100 dark:hover:bg-[#DC2626]/15"
                      aria-label="O'chirish"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <RecordModal
        open={!!modalRec}
        onOpenChange={(next) => !next && setModalRec(null)}
        entity={config.entity}
        fields={config.modalFields}
        record={modalRec === 'new' ? null : modalRec}
        onSave={saveRecord}
      />
      <DeleteRecordModal
        open={!!delRec}
        onOpenChange={(next) => !next && setDelRec(null)}
        entity={config.entity}
        record={delRec}
        note={config.deleteNote}
        onDelete={() => setRows((r) => r.filter((x) => x.id !== delRec.id))}
      />
      <ListFilterModal
        open={filterOpen}
        onOpenChange={setFilterOpen}
        fields={config.filterFields}
        filters={filters}
        onApply={setFilters}
      />
    </div>
  )
}
