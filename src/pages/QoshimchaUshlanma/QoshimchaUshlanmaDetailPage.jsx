import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { AlertCircle, Check, ChevronLeft, ChevronRight, Loader2, Plus, X } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { useServerPagedList } from '@/hooks/useServerPagedList'
import { cn } from '@/lib/utils'
import { formatDateTime, formatDate, formatNumber, formatUzPhone } from '@/lib/format'
import { Button } from '@/components/ui/button'
import {
  approveAccrualRetentionDocument,
  cancelAccrualRetentionDocument,
  createAccrualRetentionDocument,
  getAccrualRetentionDocument,
  getAccrualRetentionDocumentsPage,
  patchAccrualRetentionDocument,
} from '@/services/accrualRetentionDocumentService'
import {
  formatAccrualRetentionValue,
  MOCK_ACCRUAL_RETENTION_DOCUMENTS,
  MOCK_EMPLOYEE_HISTORY,
} from '@/features/accrualRetention/accrualRetentionData'
import { localAddDocument, localUpdateDocumentStatus } from '@/features/accrualRetention/accrualRetentionSlice'
import QoshimchaStatusBadge from './components/QoshimchaStatusBadge'
import ApproveConfirmModal from './components/ApproveConfirmModal'
import CancelConfirmModal from './components/CancelConfirmModal'
import NewQoshimchaModal from './components/NewQoshimchaModal'

const TH =
  'sticky top-0 z-10 h-11 bg-[#93C5FD] px-4 text-left text-[13px] font-semibold uppercase tracking-wider text-[#1E3A8A] dark:bg-blue-950 dark:text-blue-200'
const TD =
  'h-12 border-b border-[#F0F0F0] px-4 text-[13.5px] whitespace-nowrap text-[#0A0A0A] dark:border-white/5 dark:text-white'

export default function QoshimchaUshlanmaDetailPage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const reduxItems = useSelector((state) => state.accrualRetention?.items || [])

  // Hujjatni Redux dan topish
  const initialDoc = useMemo(() => {
    return reduxItems.find((x) => String(x.id) === String(id)) || null
  }, [reduxItems, id])

  const [doc, setDoc] = useState(initialDoc)
  const [loading, setLoading] = useState(false)

  const [approveOpen, setApproveOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [newOpen, setNewOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Backenddan hujjatni yuklash
  useEffect(() => {
    let isMounted = true
    async function fetchDoc() {
      if (!id || id.startsWith('doc-')) return
      setLoading(true)
      try {
        const res = await getAccrualRetentionDocument(id)
        if (isMounted && res) {
          setDoc(res)
        }
      } catch (err) {
        console.error('Failed to fetch accrual retention document:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchDoc()
    return () => {
      isMounted = false
    }
  }, [id])

  const employeeId = doc?.employee || doc?.employee_info?.id || null

  // Tanlangan xodimga tegishli barcha ushlanma/qo'shimchalarni sahifalab olish
  const fetchHistoryPage = useCallback(
    async (params) => {
      try {
        const res = await getAccrualRetentionDocumentsPage(params)
        return {
          ...res,
          results: (res?.results || []).map((item) => ({
            id: item.id,
            date: item.date
              ? formatDateTime(new Date(item.date))
              : item.created_at
                ? formatDateTime(new Date(item.created_at))
                : '-',
            name: item.accrual_retention_info?.name || item.accrualRetentionName || item.name || '-',
            value: formatAccrualRetentionValue(item),
            status: item.status || 'draft',
          })),
          count: res?.count ?? (res?.results?.length || 0),
        }
      } catch (err) {
        console.error('Failed to fetch employee accrual retention history:', err)
        const mockFiltered = MOCK_ACCRUAL_RETENTION_DOCUMENTS.filter(
          (m) =>
            String(m.employee) === String(employeeId) ||
            String(m.employee_info?.id) === String(employeeId)
        )
        return {
          count: mockFiltered.length,
          results: mockFiltered.map((item) => ({
            id: item.id,
            date: item.date ? formatDateTime(new Date(item.date)) : '-',
            name: item.accrual_retention_info?.name || '-',
            value: formatAccrualRetentionValue(item),
            status: item.status || 'draft',
          })),
          next: null,
        }
      }
    },
    [employeeId]
  )

  const historyQueryParams = useMemo(() => {
    if (!employeeId) return null
    return { employee: employeeId }
  }, [employeeId])

  const {
    items: historyItems,
    isLoading: historyLoading,
    isLoadingMore: historyLoadingMore,
    containerRef: historyContainerRef,
    sentinelRef: historySentinelRef,
    handleScroll: handleHistoryScroll,
    reload: reloadHistory,
  } = useServerPagedList(fetchHistoryPage, historyQueryParams, {
    enabled: Boolean(employeeId),
  })

  // Yangi qo'shimcha yoki ushlanma yaratish
  const handleCreateDocument = async (payload) => {
    let created = null
    try {
      created = await createAccrualRetentionDocument({
        branch: payload.branch,
        employee: payload.employee,
        accrual_retention: payload.accrual_retention,
        date: payload.date,
      })
    } catch {
      created = {
        id: `doc-${Date.now()}`,
        branch: payload.branch,
        branch_info: { id: payload.branch, name: payload.branchName },
        employee: payload.employee,
        employee_info: {
          id: payload.employee,
          full_name: payload.employeeName,
          name: payload.employeeName,
        },
        accrual_retention: payload.accrual_retention,
        accrual_retention_info: payload.accrualRetentionItem,
        value: payload.accrualRetentionItem?.value || 0,
        type: payload.accrualRetentionItem?.type || 'percent',
        currency: payload.accrualRetentionItem?.currency_info?.short_name || 'UZS',
        date: payload.date,
        created_at: payload.date,
        updated_at: payload.date,
        created_by_info: { full_name: 'Anvarov Sardorbek' },
        status: 'draft',
      }
    }

    if (created) {
      dispatch(localAddDocument(created))
      if (String(payload.employee) === String(employeeId)) {
        if (reloadHistory) reloadHistory()
      }
    }
  }

  const employeeName =
    doc?.employee_info?.full_name || doc?.employee_info?.name || doc?.employeeName || ''
  const typeName =
    doc?.accrual_retention_info?.name || doc?.accrualRetentionName || ''
  const currentStatus = doc?.status || 'draft'
  const isDraft = currentStatus === 'draft'
  const valueDisplay = formatAccrualRetentionValue(doc)

  const headerTitle = `Qo'shimcha va ushlanma > ${employeeName}, ${typeName}`
  usePageHeader(headerTitle)

  // Tasdiqlash
  const handleApprove = async () => {
    setActionLoading(true)
    try {
      if (doc?.id && !String(doc.id).startsWith('doc-')) {
        await approveAccrualRetentionDocument(doc.id)
      }
      setDoc((prev) => ({ ...prev, status: 'approved' }))
      dispatch(localUpdateDocumentStatus({ id: doc.id, status: 'approved' }))
      setApproveOpen(false)
    } catch (err) {
      console.error('Approve failed:', err)
    } finally {
      setActionLoading(false)
    }
  }

  // Bekor qilish
  const handleCancel = async (payload) => {
    setActionLoading(true)
    try {
      if (doc?.id && !String(doc.id).startsWith('doc-')) {
        await cancelAccrualRetentionDocument(doc.id, payload)
      }
      setDoc((prev) => ({ ...prev, status: 'cancelled' }))
      dispatch(localUpdateDocumentStatus({ id: doc.id, status: 'cancelled' }))
      setCancelOpen(false)
    } catch (err) {
      console.error('Cancel failed:', err)
    } finally {
      setActionLoading(false)
    }
  }

  // Saqlash
  const handleSave = async () => {
    setActionLoading(true)
    try {
      if (doc?.id && !String(doc.id).startsWith('doc-')) {
        await patchAccrualRetentionDocument(doc.id, {
          branch: doc.branch,
          employee: doc.employee,
          accrual_retention: doc.accrual_retention,
        })
      }
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      console.error('Save failed:', err)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#0052D2]" />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col justify-between gap-3 overflow-hidden">
      <div className="flex-1 min-h-0 space-y-3 flex flex-col overflow-hidden">
        {/* Ogohlantirish banneri */}
        {isDraft ? (
          <div className="shrink-0 flex items-center gap-2.5 rounded-xl bg-[#FFF8E6] px-4 py-1 text-[11px] font-medium text-[#B45309] border border-[#FDE68A] dark:bg-[#78350F]/20 dark:border-[#B45309]/30 dark:text-[#FDE68A]">
            <span>Tasdiqlangandan so'ng hujjatni o'zgartirib bo'lmaydi.</span>
          </div>
        ) : currentStatus === 'approved' ? (
          <div className="shrink-0 flex items-center gap-2.5 rounded-xl bg-[#E6FAF1] px-4 py-1 text-[11px] font-medium text-[#047A47] border border-[#A7F3D0] dark:bg-[#064E3B]/20 dark:border-[#047A47]/30 dark:text-[#A7F3D0]">
            <span>Hujjat tasdiqlangan. Uni o'zgartirib bo'lmaydi.</span>
          </div>
        ) : (
          <div className="shrink-0 flex items-center gap-2.5 rounded-xl bg-[#FEECEC] px-4 py-1 text-[11px] font-medium text-[#DC2626] border border-[#FECACA] dark:bg-[#7F1D1D]/20 dark:border-[#DC2626]/30 dark:text-[#FECACA]">
            <span>Hujjat bekor qilingan. Uni o'zgartirib bo'lmaydi.</span>
          </div>
        )}

        {/* Yuqori 4 ta statistika kartalari (Figma 4-rasm) */}
        <div className="shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. HOLATI */}
          <div className="rounded-xl bg-[#EDE9FE] p-3 text-[#0A0A0A] dark:bg-[#5B21B6]/20 dark:text-white transition-all">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#0A0A0A] dark:text-[#A78BFA]">
              HOLATI
            </p>
            <p className="mt-1 text-[18px] font-bold">
              {currentStatus === 'draft'
                ? 'Qoralama'
                : currentStatus === 'approved'
                  ? 'Tasdiqlangan'
                  : 'Bekor qilingan'}
            </p>
          </div>

          {/* 2. XODIM */}
          <div className="rounded-xl bg-[#E0F2FE] p-3 text-[#0A0A0A] dark:bg-[#0369A1]/20 dark:text-white transition-all">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#0A0A0A] dark:text-[#38BDF8]">
              XODIM
            </p>
            <p className="mt-1 text-[18px] font-bold truncate" title={employeeName}>
              {employeeName}
            </p>
          </div>

          {/* 3. QO'SHIMCHA VA USHLANMA */}
          <div className="rounded-xl bg-[#FFEDD5] p-3 text-[#0A0A0A] dark:bg-[#C2410C]/20 dark:text-white transition-all">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#0A0A0A] dark:text-[#FB923C]">
              QO'SHIMCHA VA USHLANMA
            </p>
            <p className="mt-1 text-[18px] font-bold truncate" title={typeName}>
              {typeName}
            </p>
          </div>

          {/* 4. QIYMAT */}
          <div className="rounded-xl bg-[#DCFCE7] p-3 text-[#0A0A0A] dark:bg-[#15803D]/20 dark:text-white transition-all">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#0A0A0A] dark:text-[#4ADE80]">
              QIYMAT
            </p>
            <p className="mt-1 text-[18px] font-bold">
              {valueDisplay}
            </p>
          </div>
        </div>

        {/* Asosiy 2 ustunli kontent */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch flex-1 min-h-0 overflow-hidden">
          {/* Chap qism: Xodimning barcha hisob-kitoblari tarixi jadvali */}
          <div className="lg:col-span-8 h-full rounded-xl border border-[#E5E5E5] bg-[#EFF1F7] dark:border-white/10 dark:bg-card overflow-hidden flex flex-col">
            <div
              ref={historyContainerRef}
              onScroll={handleHistoryScroll}
              className="flex-1 overflow-auto"
            >
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                  <th className={cn(TH, 'w-12 text-center')}>#</th>
                  <th className={TH}>SANA VA VAQT</th>
                  <th className={TH}>QO'SHIMCHA VA USHLANMA</th>
                  <th className={TH}>QIYMAT</th>
                  <th className={TH}>HOLAT</th>
                </tr>
              </thead>
              <tbody>
                {historyLoading && historyItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto text-[#0052D2]" />
                    </td>
                  </tr>
                ) : historyItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-sm text-[#737373]">
                      Ma'lumot mavjud emas
                    </td>
                  </tr>
                ) : (
                  <>
                    {historyItems.map((h, idx) => {
                      const isCurrent = String(h.id) === String(id)
                      return (
                        <tr
                          key={h.id || idx}
                          onClick={() => {
                            if (h.id && !isCurrent) {
                              navigate(`/qoshimcha-va-ushlanma/${h.id}`)
                            }
                          }}
                          className={cn(
                            'transition-colors hover:bg-[#F9FAFB] dark:hover:bg-white/5',
                            !isCurrent && 'cursor-pointer',
                            isCurrent && 'bg-[#F0F7FF]/70 dark:bg-blue-950/40 font-medium'
                          )}
                        >
                          <td className={cn(TD, 'text-center text-[#737373] font-medium')}>
                            {idx + 1}
                          </td>
                          <td className={cn(TD, 'text-[#525252] dark:text-muted-foreground')}>
                            {h.date}
                          </td>
                          <td className={cn(TD, 'font-medium text-[#0A0A0A] dark:text-white')}>
                            {h.name}
                          </td>
                          <td className={cn(TD, 'font-semibold text-[#0A0A0A] dark:text-white')}>
                            {h.value}
                          </td>
                          <td className={TD}>
                            <QoshimchaStatusBadge status={h.status} />
                          </td>
                        </tr>
                      )
                    })}
                    {historyLoadingMore && (
                      <tr>
                        <td colSpan={5} className="py-3 text-center">
                          <Loader2 className="h-4 w-4 animate-spin mx-auto text-[#0052D2]" />
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
            <div ref={historySentinelRef} className="h-1" />
          </div>

          {/* Jadval ostida doimiy qotib turuvchi "+ Qo'shish" tugmasi */}
          <button
            type="button"
            onClick={() => setNewOpen(true)}
            className="shrink-0 flex w-full items-center justify-center gap-2 border-t border-dashed border-[#D1D5DB] py-3 text-sm font-semibold text-[#0A0A0A] bg-[#EFF1F7] hover:bg-black/5 dark:bg-card dark:border-white/15 dark:text-white dark:hover:bg-white/5 transition-colors cursor-pointer z-10"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" /> Qo‘shish
          </button>
        </div>

        {/* O'ng qism: Hujjat va Xodim ma'lumotlari (5 ustun / ~40%) */}
        <div className="lg:col-span-4 space-y-3 h-full overflow-y-auto pr-1">
          {/* 1. HUJJAT MA'LUMOTLARI */}
          <div className="rounded-xl border border-[#E5E5E5] bg-[#EFF1F7] dark:border-white/10 dark:bg-card overflow-hidden shadow-sm">
            <div className="bg-[#93C5FD] px-4 py-2.5 dark:bg-blue-900/60">
              <h3 className="text-[13px] font-semibold uppercase tracking-wider text-[#1E3A8A] dark:text-blue-100">
                HUJJAT MA'LUMOTLARI
              </h3>
            </div>
            <div className="divide-y divide-[#F0F0F0] dark:divide-white/5 text-[14px]">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-[#737373] dark:text-muted-foreground">Tabel nomer</span>
                <span className="font-semibold text-[#0A0A0A] dark:text-white">
                  {doc?.employee_details?.tab_num || doc?.employee_info?.tab_num || ''}
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-[#737373] dark:text-muted-foreground">Xodim</span>
                <span className="font-semibold text-[#0A0A0A] dark:text-white">
                  {employeeName}
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-[#737373] dark:text-muted-foreground">Lavozimi</span>
                <span className="font-semibold text-[#0A0A0A] dark:text-white">
                  {doc?.employee_details?.position_info?.name ||
                    doc?.employee_info?.position_name ||
                    doc?.employee_info?.position?.name ||
                    ''}
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-[#737373] dark:text-muted-foreground">Yaratilgan</span>
                <span className="font-semibold text-[#0A0A0A] dark:text-white">
                  {doc?.created_at ? formatDateTime(new Date(doc.created_at)) : (doc?.createdAt || '')}
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-[#737373] dark:text-muted-foreground">Yaratdi</span>
                <span className="font-semibold text-[#0A0A0A] dark:text-white">
                  {doc?.created_by_info?.full_name || doc?.created_by_info?.name || ''}
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-[#737373] dark:text-muted-foreground">Holati</span>
                <QoshimchaStatusBadge status={currentStatus} />
              </div>
            </div>
          </div>

          {/* 2. XODIM MA'LUMOTLARI */}
          <div className="rounded-xl border border-[#E5E5E5] bg-[#EFF1F7] dark:border-white/10 dark:bg-card overflow-hidden shadow-sm">
            <div className="bg-[#93C5FD] px-4 py-2.5 dark:bg-blue-900/60">
              <h3 className="text-[13px] font-semibold uppercase tracking-wider text-[#1E3A8A] dark:text-blue-100">
                XODIM MA'LUMOTLARI
              </h3>
            </div>
            <div className="divide-y divide-[#F0F0F0] dark:divide-white/5 text-[14px]">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-[#737373] dark:text-muted-foreground">Tashkiloti</span>
                <span className="font-semibold text-[#0A0A0A] dark:text-white text-right max-w-[60%] truncate" title={doc?.employee_details?.organization_info?.name || doc?.branch_info?.organization?.name || doc?.branch_info?.organization_name || doc?.employee_info?.organization_name || ''}>
                  {doc?.employee_details?.organization_info?.name ||
                    doc?.branch_info?.organization?.name ||
                    doc?.branch_info?.organization_name ||
                    doc?.employee_info?.organization_name ||
                    ''}
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-[#737373] dark:text-muted-foreground">Karta raqami</span>
                <span className="font-semibold text-[#0A0A0A] dark:text-white">
                  {doc?.employee_details?.card_number || doc?.employee_info?.card_number || ''}
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-[#737373] dark:text-muted-foreground">Ishga olingan sana</span>
                <span className="font-semibold text-[#0A0A0A] dark:text-white">
                  {doc?.employee_details?.hire_date
                    ? formatDate(doc.employee_details.hire_date)
                    : (doc?.employee_info?.hired_date || doc?.employee_info?.hire_date)
                      ? formatDate(doc?.employee_info?.hired_date || doc?.employee_info?.hire_date)
                      : ''}
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-[#737373] dark:text-muted-foreground">Ish haqi turi</span>
                <span className="font-semibold text-[#0A0A0A] dark:text-white">
                  {doc?.employee_details?.salary_type?.label ||
                    doc?.employee_details?.salary_type_label ||
                    (typeof doc?.employee_details?.salary_type === 'string' ? doc.employee_details.salary_type : '') ||
                    doc?.employee_info?.salary_type_label ||
                    ''}
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-[#737373] dark:text-muted-foreground">Telefon</span>
                <span className="font-semibold text-[#0A0A0A] dark:text-white">
                  {doc?.employee_details?.phone_number
                    ? (formatUzPhone(doc.employee_details.phone_number) || doc.employee_details.phone_number)
                    : doc?.employee_info?.phone_number
                      ? (formatUzPhone(doc.employee_info.phone_number) || doc.employee_info.phone_number)
                      : ''}
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-[#737373] dark:text-muted-foreground">Oxirgi kirish</span>
                <span className="font-semibold text-[#0A0A0A] dark:text-white">
                  {(doc?.employee_details?.last_login || doc?.employee_info?.last_login)
                    ? formatDateTime(new Date(doc.employee_details?.last_login || doc.employee_info?.last_login))
                    : ''}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Pastki harakatlar paneli (Fixed/Sticky at the bottom) */}
      {/* FOYDALANUVCHI TALABI: "detail da tasdiqlangan va bekor qilingan hujjatlar ustida hech qanday amal bajarb bolmaydi" */}
      <div className="shrink-0 rounded-xl bg-white border border-[#E5E5E5] p-4 shadow-sm dark:bg-card dark:border-white/10 flex items-center justify-between">
        <div>
          {saveSuccess && (
            <span className="text-sm font-medium text-[#00A34D] flex items-center gap-1.5">
              <Check className="h-4 w-4" /> Hujjat muvaffaqiyatli saqlandi
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {/* Qoralama holatda amallar tugmalari */}
          {isDraft ? (
            <>
              <Button
                type="button"
                onClick={() => setCancelOpen(true)}
                disabled={actionLoading}
                className="h-10 px-5 rounded-[10px] bg-[#DC2626] hover:bg-[#B91C1C] text-white font-medium text-sm flex items-center gap-2 shadow-none cursor-pointer"
              >
                <X className="h-4 w-4 stroke-[2.5]" /> Bekor qilish
              </Button>

              <Button
                type="button"
                onClick={handleSave}
                disabled={actionLoading}
                className="h-10 px-5 rounded-[10px] bg-[#0052D2] hover:bg-[#0047B8] text-white font-medium text-sm flex items-center gap-2 shadow-none cursor-pointer"
              >
                <Check className="h-4 w-4 stroke-[2.5]" /> Saqlash
              </Button>

              <Button
                type="button"
                onClick={() => setApproveOpen(true)}
                disabled={actionLoading}
                className="h-10 px-5 rounded-[10px] bg-[#00A34D] hover:bg-[#008A41] text-white font-medium text-sm flex items-center gap-2 shadow-none cursor-pointer"
              >
                <Check className="h-4 w-4 stroke-[2.5]" /> Tasdiqlash
              </Button>
            </>
          ) : currentStatus === 'approved' ? (
            <>
              <Button
                type="button"
                onClick={() => navigate('/qoshimcha-va-ushlanma')}
                className="h-10 px-5 rounded-[10px] border border-[#E5E5E5] bg-white text-sm font-medium text-[#0A0A0A] hover:bg-gray-50 dark:bg-card dark:border-white/10 dark:text-white shadow-none cursor-pointer flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" /> Jurnalga qaytish
              </Button>

              <Button
                type="button"
                onClick={() => setCancelOpen(true)}
                disabled={actionLoading}
                className="h-10 px-5 rounded-[10px] bg-[#DC2626] hover:bg-[#B91C1C] text-white font-medium text-sm flex items-center gap-2 shadow-none cursor-pointer"
              >
                <X className="h-4 w-4 stroke-[2.5]" /> Bekor qilish
              </Button>
            </>
          ) : (
            /* Bekor qilingan holatda FAQAT Jurnalga qaytish tugmasi */
            <Button
              type="button"
              onClick={() => navigate('/qoshimcha-va-ushlanma')}
              className="h-10 px-5 rounded-[10px] border border-[#E5E5E5] bg-white text-sm font-medium text-[#0A0A0A] hover:bg-gray-50 dark:bg-card dark:border-white/10 dark:text-white shadow-none cursor-pointer flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" /> Jurnalga qaytish
            </Button>
          )}
        </div>
      </div>

      {/* Modallar */}
      <ApproveConfirmModal
        open={approveOpen}
        onOpenChange={setApproveOpen}
        document={doc}
        onConfirm={handleApprove}
        loading={actionLoading}
      />

      <CancelConfirmModal
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        document={doc}
        onConfirm={handleCancel}
        loading={actionLoading}
      />

      <NewQoshimchaModal
        open={newOpen}
        onOpenChange={setNewOpen}
        initialData={doc}
        onCreate={handleCreateDocument}
      />
    </div>
  )
}
