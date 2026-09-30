import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Check, ChevronLeft, Filter, Loader2, Pencil, Search, X } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { cn } from '@/lib/utils'
import { formatDateTime, formatNumber } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { fetchAllPages, extractErrorMessage } from '@/services/apiHelpers'
import {
  approveCalculatingSalary,
  calculateSalaries,
  cancelCalculatingSalary,
  patchCalculatingSalary,
} from '@/services/calculatingSalaryService'
import {
  cancelAccrualRetentionDocument,
  createAccrualRetentionDocument,
  deleteAccrualRetentionDocument,
} from '@/services/accrualRetentionDocumentService'
import {
  computeAdjustment,
  deriveStatus,
  getCurrencyMap,
  getHisobRows,
  makeHisobId,
  monthRange,
  parseHisobId,
  SALARY_TYPE_LABEL,
} from '@/features/oylikHisoblash/oylikGroups'
import { MONTH_NAMES } from '@/features/oylikHisoblash/oylikData'
import EmployeeSalaryDrawer, { adjustmentInfo } from './components/EmployeeSalaryDrawer'
import ApproveConfirmModal from './components/ApproveConfirmModal'
import CancelConfirmModal from './components/CancelConfirmModal'
import NewOylikModal from './components/NewOylikModal'
import OylikDetailFilterModal, { EMPTY_OYLIK_DETAIL_FILTERS } from './components/OylikDetailFilterModal'
import StatusBanner from '@/components/ui/StatusBanner'

const TH =
  'sticky top-0 z-10 h-12 bg-[#F5F5F5] px-4 text-left text-[13px] font-medium whitespace-nowrap text-[#0A0A0A] dark:bg-[#1f1f23] dark:text-white'
const TD =
  'h-[52px] border-b border-[#F0F0F0] px-4 text-[14px] whitespace-nowrap text-[#0A0A0A] dark:border-white/5 dark:text-white'
const COLS = 10

// Hujjat sanasi — hisob oyi ichida: joriy oy bo'lsa hozirgi vaqt, aks holda oyning oxirgi kuni
function docDateForMonth(year, month) {
  const now = new Date()
  if (now.getFullYear() === year && now.getMonth() + 1 === month) return now.toISOString()
  return new Date(year, month, 0, 12, 0).toISOString()
}

export default function OylikHisoblashDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const key = useMemo(() => parseHisobId(id), [id])

  const [rows, setRows] = useState([])
  const [docs, setDocs] = useState([])
  const [currencyMap, setCurrencyMap] = useState({})
  const [baseInfo, setBaseInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [version, setVersion] = useState(0)

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filters, setFilters] = useState(EMPTY_OYLIK_DETAIL_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)

  const [selectedEmpId, setSelectedEmpId] = useState(null)
  const [approveOpen, setApproveOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState('')
  const [toast, setToast] = useState('')

  const reload = useCallback(() => setVersion((v) => v + 1), [])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250)
    return () => clearTimeout(t)
  }, [search])

  // 1. Shu oydagi qo'shimcha va ushlanma hujjatlari hamda valyutalar (faqat oy/filial yoki version o'zgarganda yuklanadi)
  useEffect(() => {
    if (!key) return undefined
    let active = true
    const { from, to } = monthRange(key.year, key.forMonth)
    Promise.all([
      fetchAllPages('finance/accrual-retention-documents/', { branch: key.branchId, date_from: from, date_to: to }),
      getCurrencyMap(),
    ])
      .then(([accrualDocs, curMap]) => {
        if (!active) return
        setDocs(accrualDocs.filter((d) => d.status !== 'cancelled'))
        setCurrencyMap(curMap)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [key?.branchId, key?.forMonth, key?.year, version])

  // 2. Hisob qatorlari (search va filtrlarda faqat shunga so'rov yuboriladi)
  useEffect(() => {
    if (!key) {
      setLoading(false)
      return undefined
    }
    let active = true
    setLoading(true)
    setLoadError('')
    getHisobRows({
      branchId: key.branchId,
      forMonth: key.forMonth,
      year: key.year,
      employee: filters.employee || undefined,
      currency: filters.currency || undefined,
      search: debouncedSearch.trim() || undefined,
    })
      .then((hisobRows) => {
        if (!active) return
        setRows(hisobRows)
        if (hisobRows.length > 0) {
          const f = hisobRows[0]
          setBaseInfo({
            branch_info: f.branch_info,
            organization_info: f.organization_info,
            created_at: hisobRows.reduce((min, r) => (!min || r.created_at < min ? r.created_at : min), ''),
            status: deriveStatus(hisobRows),
          })
        }
      })
      .catch((err) => {
        if (active) setLoadError(extractErrorMessage(err, 'Hisobni yuklashda xatolik yuz berdi'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [key, version, filters.employee, filters.currency, debouncedSearch])

  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(''), 3000)
    return () => clearTimeout(t)
  }, [toast])

  const hasFilters = Boolean(filters.employee || filters.currency || debouncedSearch.trim())

  const status = rows.length > 0 ? deriveStatus(rows) : baseInfo?.status || 'draft'
  const isDraft = status === 'draft'
  const isApproved = status === 'approved'
  const isCancelled = status === 'cancelled'

  const first = rows[0] || baseInfo
  const branchName = first?.branch_info?.name || ''
  const orgName = first?.organization_info?.name || ''
  const monthName = key ? MONTH_NAMES[key.forMonth] : ''
  const createdAtIso =
    rows.reduce((min, r) => (!min || r.created_at < min ? r.created_at : min), '') ||
    baseInfo?.created_at ||
    ''

  usePageHeader([{ label: 'Oylik hisoblash', to: '/oylik-hisoblash' }, branchName ? `${branchName}, ${monthName}` : '…'])

  // Xodimlar jadvali qatorlari (hisob-kitob bilan)
  const employees = useMemo(() => {
    return rows.map((row) => {
      const employeeId = row.employee_info?.id
      const currency = row.currency_info?.short_name || ''
      const isUzs = currency === 'UZS'
      const amount = Number(row.amount) || 0
      const currencyAmount = Number(row.currency_amount) || 0
      const base = isUzs ? amount : currencyAmount || amount
      const rate = !isUzs && currencyAmount > 0 ? amount / currencyAmount : 1
      const salaryType = row.salary_type || row.salary_type_info?.name || ''
      const emp = {
        id: row.id,
        row,
        employeeId,
        name: row.employee_info?.full_name || '',
        tabNum: row.employee_info?.tab_number || '',
        typeLabel: SALARY_TYPE_LABEL[salaryType] || salaryType || '',
        currency,
        isUzs,
        base,
        rate,
        status: row.status,
      }
      const additionsList = []
      const deductionsList = []
      for (const d of docs) {
        if (d.employee_info?.id !== employeeId) continue
        const ar = d.accrual_retention_info || {}
        const item = {
          id: d.id,
          name: ar.name || '',
          info: adjustmentInfo(ar, currencyMap),
          amount: computeAdjustment(ar, emp, currencyMap),
          status: d.status,
        }
        ;(ar.is_retention ? deductionsList : additionsList).push(item)
      }
      const additions = additionsList.reduce((s, i) => s + i.amount, 0)
      const deductions = deductionsList.reduce((s, i) => s + i.amount, 0)
      const totalOwn = base + additions - deductions
      return {
        ...emp,
        additionsList,
        deductionsList,
        additions,
        deductions,
        totalOwn,
        totalUzs: isUzs ? totalOwn : totalOwn * rate,
      }
    })
  }, [rows, docs, currencyMap])

  // Tahrirlash oynasining boshlang'ich qiymatlari (barqaror obyekt — aks holda oyna har renderda tozalanadi)
  const orgIdOfHisob = first?.organization_info?.id || ''
  const editInitial = useMemo(
    () => ({
      date: createdAtIso ? formatDateTime(new Date(createdAtIso)) : '',
      orgId: orgIdOfHisob,
      orgName,
      branchId: key?.branchId || '',
      branchName,
      forMonth: key?.forMonth,
    }),
    [createdAtIso, orgIdOfHisob, orgName, key, branchName]
  )

  // Bekor qilingan qatorlar jami summaga qo'shilmaydi (butun hisob bekor qilinmagan bo'lsa)
  const counted = isCancelled ? employees : employees.filter((e) => e.status !== 'cancelled')
  const totalUzs = counted.reduce((s, e) => s + e.totalUzs, 0)

  const hisobSummary = {
    branchName,
    forMonth: key?.forMonth,
    employeeCount: employees.length,
    totalAmount: totalUzs,
  }

  const selectedEmp = employees.find((e) => e.employeeId === selectedEmpId) || null

  // ── Amallar ──
  const runAction = async (fn, successMsg) => {
    setActionLoading(true)
    setActionError('')
    try {
      await fn()
      if (successMsg) setToast(successMsg)
      reload()
      return true
    } catch (err) {
      setActionError(extractErrorMessage(err, 'Amalni bajarishda xatolik yuz berdi'))
      return false
    } finally {
      setActionLoading(false)
    }
  }

  const draftRows = rows.filter((r) => r.status === 'draft')

  const handleApprove = async () => {
    await runAction(async () => {
      for (const r of draftRows) await approveCalculatingSalary(r.id)
    }, 'Hisob tasdiqlandi')
    setApproveOpen(false)
  }

  const handleCancel = async ({ reason, attachment }) => {
    await runAction(async () => {
      for (const r of draftRows) await cancelCalculatingSalary(r.id, { reason, attachment })
    }, 'Hisob bekor qilindi')
    setCancelOpen(false)
  }

  // Tahrirlash: filial/oy o'zgarsa — qoralama qatorlar ko'chiriladi; o'zgarmasa —
  // tasdiqlangan tabel asosida qayta hisoblanadi.
  const handleEdit = async ({ branch, forMonth, year }) => {
    const changed = branch !== key.branchId || forMonth !== key.forMonth
    if (changed) {
      for (const r of draftRows) await patchCalculatingSalary(r.id, { branch, for_month: forMonth })
    } else {
      await calculateSalaries({ branch, for_month: forMonth, year })
    }
    setToast('Hisob saqlandi')
    const nextId = makeHisobId(branch, forMonth, changed ? key.year : year)
    if (nextId !== id) navigate(`/oylik-hisoblash/${nextId}`, { replace: true })
    else reload()
  }

  const handleAddAdjustment = async ({ accrualRetentionId }) => {
    const created = await createAccrualRetentionDocument({
      branch: key.branchId,
      employee: selectedEmpId,
      accrual_retention: accrualRetentionId,
      date: docDateForMonth(key.year, key.forMonth),
    })
    if (created?.id) setDocs((prev) => [...prev, created])
    else reload()
  }

  const handleRemoveAdjustment = async (item) => {
    if (item.status === 'draft') await deleteAccrualRetentionDocument(item.id)
    else await cancelAccrualRetentionDocument(item.id, { reason: 'Oylik hisobidan olib tashlandi' })
    setDocs((prev) => prev.filter((d) => d.id !== item.id))
  }

  if (!key) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <p className="text-sm text-[#737373]">Hisob topilmadi</p>
        <Button variant="outline" onClick={() => navigate('/oylik-hisoblash')}>
          Ro‘yxatga qaytish
        </Button>
      </div>
    )
  }

  if (loading && rows.length === 0 && !baseInfo) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-[#0052D2]" />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <p className="text-sm text-[#DC2626]">{loadError}</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={reload}>
            Qayta urinish
          </Button>
          <Button variant="outline" onClick={() => navigate('/oylik-hisoblash')}>
            Ro‘yxatga qaytish
          </Button>
        </div>
      </div>
    )
  }

  if (!hasFilters && rows.length === 0 && !baseInfo && !loading) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <p className="text-sm text-[#737373]">Hisob topilmadi</p>
        <Button variant="outline" onClick={() => navigate('/oylik-hisoblash')}>
          Ro‘yxatga qaytish
        </Button>
      </div>
    )
  }

  const cards = [
    { label: 'Sana', value: createdAtIso ? formatDateTime(new Date(createdAtIso)) : '', cls: 'bg-[#CDE7FE] dark:bg-[#1E3A8A]/30' },
    {
      label: 'Tashkilot',
      value: orgName || '',
      cls: 'bg-[#F8C3B3] dark:bg-[#7C2D12]/30',
      onClick: orgIdOfHisob ? () => window.open(`/tashkilotlar/${orgIdOfHisob}`, '_blank') : undefined,
    },
    {
      label: 'Filial',
      value: branchName || '',
      cls: 'bg-[#B3F8C5] dark:bg-[#064E3B]/30',
      onClick: key?.branchId ? () => window.open(`/filiallar/${key.branchId}`, '_blank') : undefined,
    },
    { label: 'Oy uchun', value: (monthName || '').toUpperCase(), cls: 'bg-[#EEF8B3] dark:bg-[#713F12]/30' },
    {
      label: 'Holati',
      value: isCancelled ? 'Bekor qilingan' : isApproved ? 'Tasdiqlangan' : 'Qoralama',
      cls: 'bg-[#D7D5FD] dark:bg-[#4C1D95]/30',
    },
  ]

  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      {toast && (
        <div className="fixed right-5 top-5 z-50 rounded-xl bg-[#00A34D] px-4 py-2.5 text-sm font-semibold text-white shadow-lg">
          {toast}
        </div>
      )}

      {isCancelled && (
        <StatusBanner variant="danger">
          Hisob bekor qilingan. Summalar hisobga olinmaydi.
          {first?.cancel_reason && <span className="text-[#B91C1C] dark:text-red-300"> Sabab: {first.cancel_reason}</span>}
        </StatusBanner>
      )}
      {isApproved && (
        <StatusBanner variant="success" text="Hisob tasdiqlangan. Summalarni o‘zgartirib bo‘lmaydi." />
      )}
      {!isCancelled && !isApproved && (
        <StatusBanner variant="warning" text="Hisob qoralamada. Tasdiqlangandan so‘ng summalarni o‘zgartirib bo‘lmaydi." />
      )}
      {actionError && (
        <StatusBanner variant="danger" text={actionError} />
      )}


      <div className="grid shrink-0 grid-cols-2 gap-3 sm:grid-cols-5">
        {cards.map((c) => {
          const len = String(c.value ?? '').length
          const fontSize =
            len > 28
              ? 'clamp(12.5px, 0.9vw, 14.5px)'
              : len > 20
                ? 'clamp(13.5px, 1.0vw, 16px)'
                : len > 13
                  ? 'clamp(14.5px, 1.15vw, 18px)'
                  : 'clamp(16px, 1.3vw, 20px)'

          return (
            <div
              key={c.label}
              onClick={c.onClick}
              className={cn(
                'flex flex-col justify-between rounded-sm p-3.5 sm:p-4 text-[#0A0A0A] dark:text-white',
                c.onClick && 'cursor-pointer transition-[filter] hover:brightness-[0.97]',
                c.cls
              )}
            >
              <span className="block text-[12px] font-medium uppercase tracking-wide text-[#0A0A0A]/80 dark:text-white/70">
                {c.label}
              </span>
              <span
                className="mt-1 block truncate font-semibold leading-tight"
                style={{ fontSize }}
                title={c.value}
              >
                {c.value}
              </span>
            </div>
          )
        })}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <div className="relative w-[300px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Qidirish"
            className="h-9 w-[300px] rounded-lg border-[#E5E5E5] bg-white pl-9 pr-3 text-sm text-[#0A0A0A] placeholder:text-[#737373] focus-visible:ring-[#0052D2] dark:border-white/10 dark:bg-card dark:text-white"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setFilterOpen(true)}
          className={cn(
            'h-9 gap-2 rounded-lg border-[#E5E5E5] bg-white px-4 text-sm font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-foreground',
            (filters.currency || filters.employee) && 'border-[#0052D2] text-[#0052D2]'
          )}
        >
          <Filter className="h-4 w-4" /> Filtr
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-white dark:bg-card">
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr>
                <th className={cn(TH, 'w-10')}>#</th>
                <th className={TH}>Tab. raqami</th>
                <th className={TH}>Xodim</th>
                <th className={TH}>Oylik turi</th>
                <th className={TH}>Valyuta</th>
                <th className={cn(TH, 'text-right')}>Belgilangan qiymat</th>
                <th className={cn(TH, 'text-right')}>Qo‘shimchalar</th>
                <th className={cn(TH, 'text-right')}>Ushlanmalar</th>
                <th className={cn(TH, 'text-right')}>Jami</th>
                <th className={cn(TH, 'text-right')}>Jami (UZS)</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={COLS} className="py-12 text-center text-sm text-[#737373] dark:text-muted-foreground">
                    Xodim topilmadi
                  </td>
                </tr>
              ) : (
                employees.map((emp, idx) => (
                  <tr
                    key={emp.id}
                    onClick={() => setSelectedEmpId(emp.employeeId)}
                    className={cn(
                      'cursor-pointer transition-colors hover:bg-[#F9FAFB] dark:hover:bg-white/5',
                      !isCancelled && emp.status === 'cancelled' && 'opacity-50'
                    )}
                  >
                    <td className={cn(TD, 'w-10 text-[#525252] dark:text-muted-foreground')}>{idx + 1}</td>
                    <td className={TD}>{emp.tabNum || ''}</td>
                    <td className={cn(TD, 'text-[#0052D2] dark:text-[#60A5FA]')}>{emp.name}</td>
                    <td className={TD}>{emp.typeLabel}</td>
                    <td className={TD}>{emp.currency}</td>
                    <td className={cn(TD, 'text-right')}>{formatNumber(emp.base, 2)}</td>
                    <td className={cn(TD, 'text-right', emp.additions > 0 && 'text-[#16A34A]')}>
                      {emp.additions > 0 ? `+${formatNumber(emp.additions, 2)}` : formatNumber(0, 2)}
                    </td>
                    <td className={cn(TD, 'text-right', emp.deductions > 0 && 'text-[#DC2626]')}>
                      {emp.deductions > 0 ? `-${formatNumber(emp.deductions, 2)}` : formatNumber(0, 2)}
                    </td>
                    <td className={cn(TD, 'text-right')}>{formatNumber(emp.totalOwn, 2)}</td>
                    <td className={cn(TD, 'text-right')}>{emp.isUzs ? '' : formatNumber(emp.totalUzs, 2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex h-12 shrink-0 items-center justify-between border-t border-[#F0F0F0] px-4 dark:border-white/10">
          <span className="text-[14px] font-semibold text-[#0A0A0A] dark:text-white">
            Jami, UZS ({counted.length} ta xodim)
          </span>
          <span className="text-[14px] font-semibold text-[#0A0A0A] dark:text-white">{formatNumber(totalUzs, 2)}</span>
        </div>
      </div>

      {isDraft && (
        <div className="flex shrink-0 items-center justify-end gap-3">
          <Button
            type="button"
            onClick={() => setCancelOpen(true)}
            disabled={actionLoading}
            className="h-10 gap-1.5 rounded-[8px] bg-[#DC2626] px-4 text-sm font-medium text-white hover:bg-[#B91C1C]"
          >
            <X className="h-4 w-4" /> Bekor qilish
          </Button>
          <Button
            type="button"
            onClick={() => setEditOpen(true)}
            disabled={actionLoading}
            className="h-10 gap-1.5 rounded-[8px] bg-[#0052D2] px-4 text-sm font-medium text-white hover:bg-[#0047B8]"
          >
            <Pencil className="h-4 w-4" /> Tahrirlash
          </Button>
          <Button
            type="button"
            onClick={() => setApproveOpen(true)}
            disabled={actionLoading}
            className="h-10 gap-1.5 rounded-[8px] bg-[#00A34D] px-4 text-sm font-medium text-white hover:bg-[#008A41]"
          >
            <Check className="h-4 w-4" /> Tasdiqlash
          </Button>
        </div>
      )}


      <EmployeeSalaryDrawer
        open={Boolean(selectedEmp)}
        onClose={() => setSelectedEmpId(null)}
        employee={selectedEmp}
        currencyMap={currencyMap}
        onAdd={handleAddAdjustment}
        onRemove={handleRemoveAdjustment}
        readOnly={!isDraft || selectedEmp?.status !== 'draft'}
      />

      <ApproveConfirmModal
        open={approveOpen}
        onOpenChange={setApproveOpen}
        hisob={hisobSummary}
        onConfirm={handleApprove}
        loading={actionLoading}
      />

      <CancelConfirmModal
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        hisob={hisobSummary}
        onConfirm={handleCancel}
        loading={actionLoading}
      />

      <NewOylikModal
        open={editOpen}
        onOpenChange={setEditOpen}
        mode="edit"
        initial={editInitial}
        onSubmit={handleEdit}
      />

      <OylikDetailFilterModal
        open={filterOpen}
        onOpenChange={setFilterOpen}
        filters={filters}
        onApply={(next) => setFilters(next)}
        branchId={key?.branchId}
      />
    </div>
  )
}
