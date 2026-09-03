import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ChevronDown, Filter, Plus, Receipt, Search, Trash2, X } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { formatDate, formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import {
  EXPENSE_TAB_COUNTS,
  KASSA_TAB,
} from '@/features/expenses/expensesMockData'
import { expenseAdded, expenseDeleted } from '@/features/expenses/expensesSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Toast from '@/components/Toast'
import ExpenseExportMenu from './components/ExpenseExportMenu'
import ExpenseFilterModal, { EMPTY_EXPENSE_FILTERS } from './components/ExpenseFilterModal'
import NewExpenseModal from './components/NewExpenseModal'
import DeleteExpenseModal from './components/DeleteExpenseModal'

const TABS = [
  ['all', 'Barchasi', 'all'],
  ['kichik', 'Kichik kassa', 'kichik'],
  ['transfer', "Pul o'tkazmalari", 'transfer'],
]

const TH ='px-3 text-[13px] font-semibold uppercase leading-[18px] text-[#525252] dark:text-muted-foreground'

export default function ExpensesListPage() {
  const dispatch = useDispatch()
  const list = useSelector((state) => state.expenses.list)
  const exchangeRate = useSelector((state) => state.expenses.exchangeRate)

  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(EMPTY_EXPENSE_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)
  const [newOpen, setNewOpen] = useState(false)
  const [toDelete, setToDelete] = useState(null)
  const [toast, setToast] = useState('')
  const [lastAddedId, setLastAddedId] = useState(null)

  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(''), 3500)
    return () => clearTimeout(t)
  }, [toast])
  useEffect(() => {
    if (!lastAddedId) return undefined
    const t = setTimeout(() => setLastAddedId(null), 4000)
    return () => clearTimeout(t)
  }, [lastAddedId])

  const chips = useMemo(() => {
    const out = []
    if (filters.from || filters.to) {
      out.push({ key: 'date', label: `Sana: ${filters.from ? formatDate(filters.from) : '…'} — ${filters.to ? formatDate(filters.to) : '…'}` })
    }
    if (filters.type) out.push({ key: 'type', label: `Turi: ${filters.type}` })
    if (filters.kassa) out.push({ key: 'kassa', label: `Kassa: ${filters.kassa}` })
    if (filters.author) out.push({ key: 'author', label: `Muallif: ${filters.author}` })
    if (filters.minUzs || filters.maxUzs) out.push({ key: 'sum', label: `Summa: ${filters.minUzs || 0} — ${filters.maxUzs || '∞'} UZS` })
    if (filters.onlyUzs && !filters.onlyUsd) out.push({ key: 'cur', label: 'Valyuta: Faqat UZS' })
    if (filters.onlyUsd && !filters.onlyUzs) out.push({ key: 'cur', label: 'Valyuta: Faqat dollarda' })
    return out
  }, [filters])

  function removeChip(key) {
    if (key === 'date') setFilters((f) => ({ ...f, from: '', to: '' }))
    if (key === 'type') setFilters((f) => ({ ...f, type: '' }))
    if (key === 'kassa') setFilters((f) => ({ ...f, kassa: '' }))
    if (key === 'author') setFilters((f) => ({ ...f, author: '' }))
    if (key === 'sum') setFilters((f) => ({ ...f, minUzs: '', maxUzs: '' }))
    if (key === 'cur') setFilters((f) => ({ ...f, onlyUzs: false, onlyUsd: false }))
  }

  const filtered = useMemo(() => {
    return list.filter((e) => {
      if (tab !== 'all' && KASSA_TAB[e.kassa] !== tab) return false
      if (search) {
        const q = search.toLowerCase()
        if (!`${e.type} ${e.note}`.toLowerCase().includes(q)) return false
      }
      if (filters.from && e.date < filters.from) return false
      if (filters.to && e.date > filters.to) return false
      if (filters.type && e.type !== filters.type) return false
      if (filters.kassa && e.kassa !== filters.kassa) return false
      if (filters.author && e.author !== filters.author) return false
      if (filters.minUzs && (e.amountUzs ?? 0) < Number(filters.minUzs)) return false
      if (filters.maxUzs && (e.amountUzs ?? 0) > Number(filters.maxUzs)) return false
      if (filters.onlyUzs && !filters.onlyUsd && e.amountUzs == null) return false
      if (filters.onlyUsd && !filters.onlyUzs && e.amountUsd == null) return false
      return true
    })
  }, [list, tab, search, filters])

  const isNarrowed = !!search || chips.length > 0
  usePageHeader('Xarajatlar', {
    label: isNarrowed ? String(filtered.length) : String(EXPENSE_TAB_COUNTS.all),
    variant: 'new',
  })

  function handleSave(input) {
    const action = dispatch(expenseAdded(input))
    setLastAddedId(action.payload.id)
    setToast(`Xarajat saqlandi · ${formatNumber(input.amountUzs, 0)} UZS`)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E5E5] pb-2 dark:border-white/10">
        <div className="flex items-center gap-6">
          {TABS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                'relative flex cursor-pointer items-center gap-1.5 pb-2.5 pt-1 text-sm transition-colors',
                tab === key
                  ? 'font-medium text-[#0A0A0A] dark:text-white'
                  : 'font-normal text-[#737373] hover:text-[#0A0A0A] dark:text-muted-foreground'
              )}
            >
              {label}
              <span
                className={cn(
                  'inline-flex h-[18px] min-w-[24px] items-center justify-center rounded-full px-1.5 text-[12px] font-medium leading-[16px]',
                  tab === key
                    ? 'bg-[#EAF1FE] text-[#0052D2] dark:bg-[#0052D2]/20 dark:text-[#60A5FA]'
                    : 'bg-[#F5F5F5] text-[#737373] dark:bg-white/10 dark:text-muted-foreground'
                )}
              >
                {key === 'all' ? EXPENSE_TAB_COUNTS.all : key === 'kichik' ? EXPENSE_TAB_COUNTS.kichik : EXPENSE_TAB_COUNTS.transfer}
              </span>
              {tab === key && <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#0052D2]" />}
            </button>
          ))}
        </div>

        <div className="flex flex-1 items-center justify-end gap-2.5">
          <div className="relative w-[300px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
            <Input
              placeholder="Xarajat turi yoki izoh…"
              className="h-9 w-[300px] rounded-md border-[#E5E5E5] bg-white pl-9 pr-3 text-sm text-[#0A0A0A] placeholder:text-[#737373] focus-visible:ring-[#0052D2] dark:border-white/10 dark:bg-card dark:text-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setFilterOpen(true)}
            className="h-9 gap-2 border-[#E5E5E5] bg-white px-4 text-sm font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-foreground"
          >
            <Filter className="h-4 w-4" /> Filtr
          </Button>
          <ExpenseExportMenu />
          <Button
            onClick={() => setNewOpen(true)}
            className="h-9 gap-2 rounded-md bg-[#0052D2] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
          >
            <Plus className="h-4 w-4" /> Yangi xarajat
          </Button>
        </div>
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E5E5] bg-[#F9FAFB] px-3 py-1 text-[12px] text-[#0A0A0A] dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              {chip.label}
              <button
                type="button"
                onClick={() => removeChip(chip.key)}
                className="text-[#737373] transition-colors hover:text-[#0A0A0A] dark:hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <button
            type="button"
            className="text-[13px] font-medium text-[#0052D2] hover:underline"
            onClick={() => setFilters(EMPTY_EXPENSE_FILTERS)}
          >
            Tozalash
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-[#E5E5E5] bg-white dark:border-white/10 dark:bg-card">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F5F5F5] dark:bg-white/5">
              <Receipt className="h-6 w-6 text-[#737373]" />
            </div>
            <p className="font-medium">Tanlangan davrda xarajat yo'q</p>
            <p className="text-sm text-[#737373]">Davrni o'zgartiring yoki yangi xarajat kiriting</p>
            <Button
              onClick={() => setNewOpen(true)}
              className="h-9 gap-2 bg-[#0052D2] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
            >
              <Plus className="h-4 w-4" /> Yangi xarajat
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-[#F5F5F5] dark:bg-white/5">
              <TableRow className="h-10 border-b border-[#E5E5E5] hover:bg-transparent dark:border-white/10">
                <TableHead className={cn(TH, 'w-10')}>#</TableHead>
                <TableHead className={TH}>
                  <span className="inline-flex items-center gap-1">SANA <ChevronDown className="h-3 w-3" /></span>
                </TableHead>
                <TableHead className={TH}>XARAJAT TURI</TableHead>
                <TableHead className={TH}>KASSADAN</TableHead>
                <TableHead className={TH}>IZOH</TableHead>
                <TableHead className={cn(TH, 'text-right')}>SUMMA, USD</TableHead>
                <TableHead className={cn(TH, 'text-right')}>SUMMA, UZS</TableHead>
                <TableHead className={TH}>MUALLIF</TableHead>
                <TableHead className={cn(TH, 'w-10')} />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((e, i) => (
                <TableRow
                  key={e.id}
                  className={cn(
                    'group h-11 border-b border-[#E5E5E5] hover:bg-[#F9FAFB] dark:border-white/5 dark:hover:bg-white/5',
                    e.id === lastAddedId && 'bg-[#EAF1FE] dark:bg-[#0052D2]/15'
                  )}
                >
                  <TableCell className="px-3 text-[13px] leading-[18px] text-[#525252] dark:text-muted-foreground">{i + 1}</TableCell>
                  <TableCell className="px-3 text-[13px] leading-[18px] text-[#525252] dark:text-muted-foreground">{formatDate(e.date)}</TableCell>
                  <TableCell className="px-3 text-[13px] font-medium leading-[18px] text-[#0A0A0A] dark:text-white">{e.type}</TableCell>
                  <TableCell className="px-3 text-[13px] leading-[18px] text-[#525252] dark:text-muted-foreground">{e.kassa}</TableCell>
                  <TableCell className="max-w-[220px] truncate px-3 text-[13px] leading-[18px] text-[#525252] dark:text-muted-foreground">{e.note || '—'}</TableCell>
                  <TableCell className="px-3 text-right text-[13px] leading-[18px] text-[#0A0A0A] dark:text-white">{e.amountUsd != null ? formatNumber(e.amountUsd) : '—'}</TableCell>
                  <TableCell className="px-3 text-right text-[13px] font-medium leading-[18px] text-[#0A0A0A] dark:text-white">{formatNumber(e.amountUzs, 3)}</TableCell>
                  <TableCell className="px-3 text-[13px] leading-[18px] text-[#525252] dark:text-muted-foreground">{e.author}</TableCell>
                  <TableCell className="px-3">
                    <button
                      type="button"
                      onClick={() => setToDelete(e)}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-[#737373] opacity-0 transition-opacity hover:bg-[#FEECEC] hover:text-[#DC2626] group-hover:opacity-100 dark:hover:bg-[#DC2626]/15"
                      aria-label="O'chirish"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <ExpenseFilterModal open={filterOpen} onOpenChange={setFilterOpen} filters={filters} onApply={setFilters} />
      <NewExpenseModal open={newOpen} onOpenChange={setNewOpen} exchangeRate={exchangeRate} onSave={handleSave} />
      <DeleteExpenseModal
        open={!!toDelete}
        onOpenChange={(next) => !next && setToDelete(null)}
        expense={toDelete}
        onDelete={() => {
          if (toDelete) {
            dispatch(expenseDeleted(toDelete.id))
            setToast("Xarajat o'chirildi")
          }
        }}
      />
      <Toast message={toast} />
    </div>
  )
}
