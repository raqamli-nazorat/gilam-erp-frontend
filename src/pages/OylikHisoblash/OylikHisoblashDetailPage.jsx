import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Filter, Search, X } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { cn } from '@/lib/utils'
import { formatDateTime, formatNumber } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import OylikStatusBadge from './components/OylikStatusBadge'
import EmployeeSalaryDrawer from './components/EmployeeSalaryDrawer'
import ApproveConfirmModal from './components/ApproveConfirmModal'
import CancelConfirmModal from './components/CancelConfirmModal'
import {
  approveSalaryThunk,
  cancelSalaryThunk,
  fetchSingleSalaryThunk,
  updateSalaryThunk,
} from '@/features/oylikHisoblash/oylikSlice'
import { MONTH_NAMES, MOCK_OYLIK_ITEMS } from '@/features/oylikHisoblash/oylikData'

const TH =
  'sticky top-0 z-10 h-12 bg-[#F5F5F5] px-4 text-left text-[13px] font-medium whitespace-nowrap text-[#0A0A0A] dark:bg-[#1f1f23] dark:text-white'
const TD =
  'h-[52px] border-b border-[#F0F0F0] px-4 text-[14px] whitespace-nowrap text-[#0A0A0A] dark:border-white/5 dark:text-white'
const COLS = 10

const fold = (s) => String(s || '').toLocaleLowerCase('uz').replace(/[ʻʼ‘’`']/g, "'")

export default function OylikHisoblashDetailPage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { items, activeDetail, detailLoading } = useSelector((state) => state.oylikHisoblash)

  // Hisobni items yoki activeDetail ichidan topish, bo'lmasa MOCK_OYLIK_ITEMS dan olish
  const hisob = useMemo(() => {
    return (
      items.find((x) => String(x.id) === String(id)) ||
      (activeDetail?.id === id ? activeDetail : null) ||
      MOCK_OYLIK_ITEMS.find((x) => String(x.id) === String(id)) ||
      MOCK_OYLIK_ITEMS[0]
    )
  }, [items, activeDetail, id])

  const [search, setSearch] = useState('')
  const [selectedEmp, setSelectedEmp] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [approveOpen, setApproveOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [mockStatus, setMockStatus] = useState(null)

  // Agar hisob items ichida topilmasa va mock bo'lmasa, backenddan yakka o'zini yuklaymiz
  useEffect(() => {
    if (id && id !== 'test-hisob-1' && (!hisob || String(hisob.id) !== String(id))) {
      dispatch(fetchSingleSalaryThunk(id))
    }
  }, [dispatch, id, hisob])

  const currentStatus = mockStatus || hisob?.status || 'draft'
  const monthName = hisob ? MONTH_NAMES[hisob.for_month || hisob.forMonth] || hisob.for_month || hisob.forMonth : ''
  const branchName = hisob?.branch_info?.name || hisob?.branchName || hisob?.branch_name || ''
  const orgName = hisob?.branch_info?.organization?.name || hisob?.branch_info?.organization_name || hisob?.orgName || ''
  const createdAt = hisob?.created_at ? formatDateTime(new Date(hisob.created_at)) : (hisob?.createdAt || '')

  usePageHeader(`Oylik hisoblash > ${branchName || ''}, ${monthName || ''}`)

  const [employeeOverrides, setEmployeeOverrides] = useState({})
  const [saveSuccessToast, setSaveSuccessToast] = useState(false)

  // Xodimlar ro'yxati (faqat backenddan kelgan ma'lumotlar yoki mock)
  const employees = useMemo(() => {
    let list = []
    if (hisob) {
      if (Array.isArray(hisob.employees) && hisob.employees.length > 0) {
        list = hisob.employees
      } else if (hisob.employee_info) {
        list = [
          {
            id: hisob.employee_info.id || hisob.id,
            tabNum: hisob.employee_info.tab_num || hisob.employee_info.id?.slice(0, 4) || '-',
            name: hisob.employee_info.full_name || hisob.employee_info.name || '-',
            type: hisob.type || 'Oylik',
            currency: hisob.currency_info?.short_name || hisob.currency_info?.name || 'UZS',
            salary: Number(hisob.amount || 0),
            additions: Number(hisob.additions || 0),
            deductions: Number(hisob.deductions || 0),
            totalUzs: Number(hisob.amount || 0),
            totalUsd: hisob.currency_amount ? Number(hisob.currency_amount) : null,
            details: hisob.details || null,
          },
        ]
      }
    }
    return list.map((emp) => {
      const override = employeeOverrides[emp.id]
      return override ? { ...emp, ...override } : emp
    })
  }, [hisob, employeeOverrides])

  // Xodimlar bo'yicha qidiruv
  const filteredEmployees = useMemo(() => {
    const q = fold(search.trim())
    if (!q) return employees
    return employees.filter(
      (e) =>
        fold(e.name).includes(q) ||
        fold(e.tabNum).includes(q) ||
        fold(e.type).includes(q) ||
        fold(e.currency).includes(q)
    )
  }, [employees, search])

  // Jami summani hisoblash
  const totalUzs = useMemo(() => {
    if (employees.length > 0) {
      return employees.reduce((sum, e) => sum + (Number(e.totalUzs || e.salary) || 0), 0)
    }
    return Number(hisob?.amount || 0)
  }, [hisob, employees])

  if (detailLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <p className="text-sm text-[#737373]">Yuklanmoqda...</p>
      </div>
    )
  }

  if (!hisob) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <p className="text-sm text-[#737373]">Hisob topilmadi</p>
        <Button variant="outline" onClick={() => navigate('/oylik-hisoblash')}>
          Ro‘yxatga qaytish
        </Button>
      </div>
    )
  }

  // Xodim ma'lumotini saqlash
  const handleSaveEmployee = async (updatedEmp) => {
    setEmployeeOverrides((prev) => ({
      ...prev,
      [updatedEmp.id]: updatedEmp,
    }))
    if (hisob?.id && hisob.id !== 'test-hisob-1') {
      try {
        await dispatch(
          updateSalaryThunk({
            id: hisob.id,
            payload: {
              amount: updatedEmp.totalUzs || updatedEmp.salary,
            },
          })
        )
      } catch (e) {
        console.error(e)
      }
    }
  }

  // Umumiy saqlash
  const handleSaveAll = async () => {
    setActionLoading(true)
    try {
      if (hisob?.id && hisob.id !== 'test-hisob-1') {
        await dispatch(
          updateSalaryThunk({
            id: hisob.id,
            payload: {
              amount: totalUzs,
            },
          })
        ).unwrap()
      }
      setSaveSuccessToast(true)
      setTimeout(() => setSaveSuccessToast(false), 3000)
    } catch (e) {
      console.error(e)
    } finally {
      setActionLoading(false)
    }
  }

  // Tasdiqlash
  const handleApprove = async () => {
    setActionLoading(true)
    try {
      if (hisob?.id === 'test-hisob-1') {
        setMockStatus('approved')
        return
      }
      await dispatch(approveSalaryThunk(hisob.id)).unwrap()
    } finally {
      setActionLoading(false)
      setApproveOpen(false)
    }
  }

  // Bekor qilish
  const handleCancel = async ({ reason, attachment, file }) => {
    setActionLoading(true)
    try {
      if (hisob?.id === 'test-hisob-1') {
        setMockStatus('cancelled')
        return
      }
      await dispatch(
        cancelSalaryThunk({ id: hisob.id, reason, attachment: attachment || file })
      ).unwrap()
    } finally {
      setActionLoading(false)
      setCancelOpen(false)
    }
  }

  const isDraft = currentStatus === 'draft'
  const isApproved = currentStatus === 'approved' || currentStatus === 'confirmed'
  const isCancelled = currentStatus === 'cancelled'

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      {/* Toast xabari */}
      {saveSuccessToast && (
        <div className="fixed top-5 right-5 z-50 rounded-xl bg-[#00A34D] px-4 py-2.5 text-sm font-semibold text-white shadow-lg animate-in fade-in slide-in-from-top-2">
          Hisob muvaffaqiyatli saqlandi!
        </div>
      )}

      {/* Status banner (Bekor qilingan yoki Tasdiqlangan holatda Figma bilan 1 xil) */}
      {isCancelled && (
        <div className="shrink-0 rounded-lg bg-[#FEECEC] border border-[#FCA5A5]/40 px-4 py-2 text-xs font-semibold text-[#DC2626] dark:bg-red-950/40 dark:border-red-900/50 dark:text-red-400">
          Hisob bekor qilingan. Summalar hisobga olinmaydi.
        </div>
      )}

      {isApproved && (
        <div className="shrink-0 rounded-lg bg-[#E6FAF1] border border-[#86EFAC]/40 px-4 py-2 text-xs font-semibold text-[#047A47] dark:bg-emerald-950/40 dark:border-emerald-900/50 dark:text-emerald-400">
          Hisob tasdiqlangan. Summalarni o‘zgartirib bo‘lmaydi.
        </div>
      )}

      {/* Yuqori ma'lumotlar kartalari (Figma rasmidagidek 5 ta alohida rangli pastel karta) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 shrink-0">
        {/* Sana */}
        <div className="rounded-xl bg-[#DCEBFE] p-3.5 sm:p-4 text-[#0A0A0A] dark:bg-[#1E3A8A]/30 dark:text-white">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-[#374151] dark:text-[#93C5FD]">
            SANA
          </span>
          <span className="mt-1 block text-[17px] font-bold text-[#0A0A0A] dark:text-white truncate">
            {createdAt || '-'}
          </span>
        </div>

        {/* Tashkilot */}
        <div className="rounded-xl bg-[#FCD3C1] p-3.5 sm:p-4 text-[#0A0A0A] dark:bg-[#7C2D12]/30 dark:text-white">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-[#374151] dark:text-[#FDBA74]">
            TASHKILOT
          </span>
          <span
            className="mt-1 block text-[17px] font-bold text-[#0A0A0A] dark:text-white truncate"
            title={orgName || '-'}
          >
            {orgName || '-'}
          </span>
        </div>

        {/* Filial */}
        <div className="rounded-xl bg-[#C3F8D2] p-3.5 sm:p-4 text-[#0A0A0A] dark:bg-[#064E3B]/30 dark:text-white">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-[#374151] dark:text-[#86EFAC]">
            FILIAL
          </span>
          <span
            className="mt-1 block text-[17px] font-bold text-[#0A0A0A] dark:text-white truncate"
            title={branchName || '-'}
          >
            {branchName || '-'}
          </span>
        </div>

        {/* Oy uchun */}
        <div className="rounded-xl bg-[#F4FAC0] p-3.5 sm:p-4 text-[#0A0A0A] dark:bg-[#713F12]/30 dark:text-white">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-[#374151] dark:text-[#FDE047]">
            OY UCHUN
          </span>
          <span className="mt-1 block text-[17px] font-bold uppercase text-[#0A0A0A] dark:text-white truncate">
            {monthName || '-'}
          </span>
        </div>

        {/* Holati */}
        <div className="rounded-xl bg-[#DDD8FE] p-3.5 sm:p-4 text-[#0A0A0A] dark:bg-[#4C1D95]/30 dark:text-white">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-[#374151] dark:text-[#C4B5FD]">
            HOLATI
          </span>
          <span className="mt-1 block text-[17px] font-bold text-[#0A0A0A] dark:text-white truncate">
            {isCancelled ? 'Bekor qilingan' : isApproved ? 'Tasdiqlangan' : 'Qoralama'}
          </span>
        </div>
      </div>

      {/* Qidiruv va boshqaruv */}
      <div className="flex shrink-0 items-center justify-start gap-3">
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
          className="h-9 gap-2 rounded-lg border-[#E5E5E5] bg-white px-4 text-sm font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-foreground"
        >
          <Filter className="h-4 w-4" /> Filtr
        </Button>
      </div>

      {/* Xodimlar jadvali */}
      <div className="min-h-0 flex-1 overflow-auto rounded-xl bg-white shadow-xs border border-[#F0F0F0] dark:bg-card dark:border-white/10">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr>
              <th className={cn(TH, 'w-10 text-center')}>#</th>
              <th className={TH}>Tab. raqami</th>
              <th className={TH}>Xodim</th>
              <th className={TH}>Oylik turi</th>
              <th className={TH}>Valyuta</th>
              <th className={TH}>Berilgan oylik qiymati</th>
              <th className={TH}>Qo‘shimchalar</th>
              <th className={TH}>Ushlanmalar</th>
              <th className={TH}>Jami [UZS]</th>
              <th className={TH}>Jami [USD]</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length === 0 ? (
              <tr>
                <td
                  colSpan={COLS}
                  className="py-12 text-center text-sm text-[#737373] dark:text-muted-foreground"
                >
                  Xodim topilmadi
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp, idx) => (
                <tr
                  key={emp.id || idx}
                  onClick={
                    isDraft
                      ? () => {
                          setSelectedEmp(emp)
                          setDrawerOpen(true)
                        }
                      : undefined
                  }
                  className={cn(
                    'transition-colors dark:hover:bg-white/5',
                    isDraft ? 'cursor-pointer hover:bg-[#F9FAFB]' : 'cursor-default'
                  )}
                >
                  <td className={cn(TD, 'w-10 text-center text-[#525252] dark:text-muted-foreground')}>
                    {idx + 1}
                  </td>
                  <td className={cn(TD, 'font-medium text-[#525252] dark:text-muted-foreground')}>
                    {emp.tabNum || '-'}
                  </td>
                  <td className={cn(TD, 'font-medium text-[#0A0A0A] dark:text-white')}>
                    {emp.name || '-'}
                  </td>
                  <td className={TD}>{emp.type || 'Oylik'}</td>
                  <td className={TD}>{emp.currency || 'UZS'}</td>
                  <td className={TD}>{formatNumber(emp.salary, 2)}</td>
                  <td className={cn(TD, 'font-medium text-[#16A34A]')}>
                    {emp.additions > 0 ? `+${formatNumber(emp.additions, 2)}` : '0,00'}
                  </td>
                  <td className={cn(TD, 'font-medium text-[#DC2626]')}>
                    {emp.deductions ? formatNumber(emp.deductions, 2) : '0,00'}
                  </td>
                  <td className={cn(TD, 'font-semibold text-[#0A0A0A] dark:text-white')}>
                    {formatNumber(emp.totalUzs, 2)}
                  </td>
                  <td className={TD}>
                    {emp.totalUsd ? formatNumber(emp.totalUsd, 2) : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pastki panel (Footer bar - 3-rasmdagi bilan bir xil) */}
      <div className="shrink-0 rounded-xl bg-white border border-[#E5E5E5] p-4 dark:bg-card dark:border-white/10 space-y-3">
        {/* Yuqori qator: Jami summa */}
        <div className="flex items-center justify-between border-b border-[#F0F0F0] dark:border-white/10">
          <span className="text-[13px] font-semibold text-[#0A0A0A] dark:text-white">
            Jami, UZS ({employees.length} ta xodim)
          </span>
          <span className="text-[13px] font-bold text-[#0A0A0A] dark:text-white">
            {formatNumber(totalUzs, 2)}
          </span>
        </div>

        {/* Pastki qator: Tugmalar */}
        <div className="flex items-center justify-end gap-3">
          {isDraft && (
            <>
              <Button
                type="button"
                onClick={() => setCancelOpen(true)}
                className="h-10 px-4 rounded-[8px] bg-[#DC2626] hover:bg-[#B91C1C] text-white font-medium text-sm flex items-center gap-1.5 shadow-none cursor-pointer"
              >
                <X className="h-4 w-4 stroke-[2.5]" /> Bekor qilish
              </Button>
              <Button
                type="button"
                onClick={handleSaveAll}
                disabled={actionLoading}
                className="h-10 px-4 rounded-[8px] bg-[#0052D2] hover:bg-[#0047B8] text-white font-medium text-sm flex items-center gap-1.5 shadow-none cursor-pointer"
              >
                <Check className="h-4 w-4 stroke-[2.5]" /> Saqlash
              </Button>
              <Button
                type="button"
                onClick={() => setApproveOpen(true)}
                disabled={actionLoading}
                className="h-10 px-4 rounded-[8px] bg-[#00A34D] hover:bg-[#008A41] text-white font-medium text-sm flex items-center gap-1.5 shadow-none cursor-pointer"
              >
                <Check className="h-4 w-4 stroke-[2.5]" /> Tasdiqlash
              </Button>
            </>
          )}

          {/* Bekor qilingan yoki Tasdiqlangan holatda faqat 3-rasmdagi Jurnalga qaytish tugmasi */}
          {!isDraft && (
            <Button
              type="button"
              onClick={() => navigate('/oylik-hisoblash')}
              className="h-10 px-5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-[#0A0A0A] hover:bg-gray-50 dark:bg-zinc-800 dark:border-white/10 dark:text-white shadow-none cursor-pointer"
            >
              <ChevronLeft className="size-4 mr-1.5" /> Jurnalga qaytish
            </Button>
          )}
        </div>
      </div>

      {/* Modallar va Drawer */}
      <EmployeeSalaryDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        employee={selectedEmp}
        onSave={handleSaveEmployee}
        readOnly={!isDraft}
      />

      <ApproveConfirmModal
        open={approveOpen}
        onOpenChange={setApproveOpen}
        hisob={hisob}
        onConfirm={handleApprove}
        loading={actionLoading}
      />

      <CancelConfirmModal
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        hisob={hisob}
        onConfirm={handleCancel}
        loading={actionLoading}
      />
    </div>
  )
}
