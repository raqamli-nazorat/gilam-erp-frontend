import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Check, ChevronDown, ChevronLeft, FileText, Loader2, Pencil, Plus, X } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { useServerPagedList } from '@/hooks/useServerPagedList'
import { cn } from '@/lib/utils'
import { formatDate, formatDateTime, formatNumber, formatUzPhone } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { extractErrorMessage, fetchAllPages } from '@/services/apiHelpers'
import {
  approveAccrualRetentionDocument,
  cancelAccrualRetentionDocument,
  createAccrualRetentionDocument,
  getAccrualRetentionDocument,
  getAccrualRetentionDocumentsPage,
  patchAccrualRetentionDocument,
} from '@/services/accrualRetentionDocumentService'
import { calculateSalaries } from '@/services/calculatingSalaryService'
import { getEmployee } from '@/services/employeeService'
import { getRecruitmentDismissal } from '@/services/recruitmentService'
import { formatAccrualRetentionValue } from '@/features/accrualRetention/accrualRetentionData'
import { getCurrencyMap, makeHisobId } from '@/features/oylikHisoblash/oylikGroups'
import { ishHaqiTuriLabel } from '@/features/xodimlar/xodimlarData'
import QoshimchaStatusBadge from './components/QoshimchaStatusBadge'
import ApproveConfirmModal from './components/ApproveConfirmModal'
import CancelConfirmModal from './components/CancelConfirmModal'
import NewQoshimchaModal from './components/NewQoshimchaModal'
import StatusBanner from '@/components/ui/StatusBanner'

const TH =
  'sticky top-0 z-10 h-11 bg-[#93C5FD] px-4 text-left text-[13px] font-semibold uppercase tracking-wider text-[#1E3A8A] dark:bg-blue-950 dark:text-blue-200'
const TD =
  'h-12 border-b border-[#F0F0F0] px-4 text-[13.5px] whitespace-nowrap text-[#0A0A0A] dark:border-white/5 dark:text-white'

const STATUS_TEXT = { draft: 'Qoralama', approved: 'Tasdiqlangan', cancelled: 'Bekor qilingan' }

// Xodimning eng oxirgi tasdiqlangan "ishga olish" hujjati (lavozim, karta, oylik turi, sana)
async function loadCurrentRecruitment(employeeId) {
  const list = await fetchAllPages('hr/recruitment-dismissals/', {
    employee: employeeId,
    type: 'recruitment',
    status: 'approved',
  })
  if (!list.length) return null
  const latest = list.reduce((a, b) =>
    String(b.rec_dism_date || b.created_at) > String(a.rec_dism_date || a.created_at) ? b : a
  )
  return getRecruitmentDismissal(latest.id)
}

function InfoRow({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-[11px]">
      <span className="shrink-0 text-[#737373] dark:text-muted-foreground">{label}</span>
      <span className="truncate text-right font-semibold text-[#0A0A0A] dark:text-white">{children || '—'}</span>
    </div>
  )
}

function InfoCard({ title, children, className }) {
  return (
    <div className={cn(className, "overflow-hidden rounded-sm border border-[#E5E5E5] bg-[#EFF1F7] dark:border-white/10 dark:bg-card")}>
      <div className="bg-[#93C5FD] px-4 py-2.5 dark:bg-blue-900/60">
        <h3 className="text-[13px] font-semibold uppercase tracking-wider text-[#1E3A8A] dark:text-blue-100">{title}</h3>
      </div>
      <div className="divide-y divide-[#E5E5E5] text-[14px] dark:divide-white/5">{children}</div>
    </div>
  )
}

export default function QoshimchaUshlanmaDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [doc, setDoc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [employee, setEmployee] = useState(null)
  const [recruitment, setRecruitment] = useState(null)
  const [currencyMap, setCurrencyMap] = useState({})

  const [approveOpen, setApproveOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [newOpen, setNewOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [hisobotLoading, setHisobotLoading] = useState(false)
  const [actionError, setActionError] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    getCurrencyMap().then(setCurrencyMap)
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    setLoadError('')
    setActionError('')
    getAccrualRetentionDocument(id)
      .then((res) => active && setDoc(res))
      .catch((err) => active && setLoadError(extractErrorMessage(err, 'Hujjatni yuklashda xatolik yuz berdi')))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [id])

  const employeeId = doc?.employee_info?.id || null

  // Xodim profili va joriy ishga olish hujjati
  useEffect(() => {
    if (!employeeId) return undefined
    let active = true
    getEmployee(employeeId)
      .then((e) => active && setEmployee(e))
      .catch(() => active && setEmployee(null))
    loadCurrentRecruitment(employeeId)
      .then((r) => active && setRecruitment(r))
      .catch(() => active && setRecruitment(null))
    return () => {
      active = false
    }
  }, [employeeId])

  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(''), 3000)
    return () => clearTimeout(t)
  }, [toast])

  // Xodimning barcha qo'shimcha/ushlanmalari (scroll pagination)
  const fetchHistoryPage = useCallback(
    async (params) => {
      const res = await getAccrualRetentionDocumentsPage(params)
      return {
        ...res,
        results: (res?.results || []).map((item) => ({
          id: item.id,
          date: formatDateTime(new Date(item.date || item.created_at)),
          name: item.accrual_retention_info?.name || '—',
          isRetention: Boolean(item.accrual_retention_info?.is_retention),
          raw: item,
          status: item.status || 'draft',
        })),
      }
    },
    []
  )

  const historyQueryParams = useMemo(() => (employeeId ? { employee: employeeId } : null), [employeeId])

  const {
    items: historyItems,
    isLoading: historyLoading,
    isLoadingMore: historyLoadingMore,
    containerRef: historyContainerRef,
    sentinelRef: historySentinelRef,
    handleScroll: handleHistoryScroll,
    reload: reloadHistory,
  } = useServerPagedList(fetchHistoryPage, historyQueryParams, { enabled: Boolean(employeeId) })

  const employeeName = doc?.employee_info?.full_name || ''
  const typeName = doc?.accrual_retention_info?.name || ''
  const isRetention = Boolean(doc?.accrual_retention_info?.is_retention)
  const currentStatus = doc?.status || 'draft'
  const isDraft = currentStatus === 'draft'
  const isApproved = currentStatus === 'approved'
  const valueDisplay = formatAccrualRetentionValue(doc, currencyMap)

  usePageHeader([
    { label: "Qo'shimcha va ushlanma", to: '/qoshimcha-va-ushlanma' },
    doc ? `${employeeName}, ${typeName}` : '…',
  ])

  const runAction = async (fn, successMsg) => {
    setActionLoading(true)
    setActionError('')
    try {
      const updated = await fn()
      if (updated?.id) setDoc(updated)
      else setDoc(await getAccrualRetentionDocument(id))
      reloadHistory?.()
      setToast(successMsg)
      return true
    } catch (err) {
      setActionError(extractErrorMessage(err, 'Amalni bajarishda xatolik yuz berdi'))
      return false
    } finally {
      setActionLoading(false)
    }
  }

  const handleApprove = async () => {
    await runAction(() => approveAccrualRetentionDocument(doc.id), 'Hujjat tasdiqlandi')
    setApproveOpen(false)
  }

  const handleCancel = async (payload) => {
    await runAction(() => cancelAccrualRetentionDocument(doc.id, payload), 'Hujjat bekor qilindi')
    setCancelOpen(false)
  }

  // Tahrirlash oynasi xatoni o'zida ko'rsatadi — shuning uchun bu yerda throw qilinadi
  const handleEdit = async (payload) => {
    const updated = await patchAccrualRetentionDocument(doc.id, payload)
    setDoc(updated?.id ? updated : await getAccrualRetentionDocument(id))
    reloadHistory?.()
    setToast('Hujjat saqlandi')
  }

  const handleCreateDocument = async (payload) => {
    const created = await createAccrualRetentionDocument(payload)
    if (created?.id) navigate(`/qoshimcha-va-ushlanma/${created.id}`)
  }

  const handleOpenHisobot = async () => {
    const targetBranchId =
      doc?.branch_info?.id ||
      doc?.branch ||
      employee?.branch_info?.id ||
      employee?.branch
    if (!targetBranchId) {
      setActionError('Filial maʼlumoti topilmadi')
      return
    }

    // Eng birinchi sana (jadvaldagi 1-qator sanasi yoki joriy hujjat sanasi)
    const firstDateStr =
      historyItems?.[0]?.raw?.date ||
      historyItems?.[0]?.raw?.created_at ||
      doc?.date ||
      doc?.created_at ||
      new Date().toISOString()
    const targetDate = new Date(firstDateStr)
    const forMonth = !isNaN(targetDate.getTime()) ? targetDate.getMonth() + 1 : new Date().getMonth() + 1
    const year = !isNaN(targetDate.getTime()) ? targetDate.getFullYear() : new Date().getFullYear()

    setHisobotLoading(true)
    setActionError('')
    try {
      // Oylik hisobot oldin yaratilganligini tekshirish
      const existingSalaries = await fetchAllPages('hr/calculating-salaries/', {
        branch: targetBranchId,
        for_month: forMonth,
      })

      const hasHisobot = (existingSalaries || []).some((r) => {
        const d = r?.created_at ? new Date(r.created_at) : null
        const y = d && !isNaN(d.getTime()) ? d.getFullYear() : new Date().getFullYear()
        return y === Number(year)
      })

      if (!hasHisobot) {
        // Fonda userga ko'rsatmagan holda hisobot yaratish
        await calculateSalaries({ branch: targetBranchId, for_month: forMonth, year })
      }

      const hisobId = makeHisobId(targetBranchId, forMonth, year)
      navigate(`/oylik-hisoblash/${hisobId}`)
    } catch (err) {
      setActionError(extractErrorMessage(err, 'Hisobotni ochish yoki yaratishda xatolik yuz berdi'))
    } finally {
      setHisobotLoading(false)
    }
  }

  if (loading && !doc) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#0052D2]" />
      </div>
    )
  }

  if (!doc) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <p className="text-sm text-[#DC2626]">{loadError || 'Hujjat topilmadi'}</p>
        <Button variant="outline" onClick={() => navigate('/qoshimcha-va-ushlanma')}>
          Ro‘yxatga qaytish
        </Button>
      </div>
    )
  }

  const salaryInfo = recruitment
    ? recruitment.salary_type === 'sales_percent'
      ? `${ishHaqiTuriLabel(recruitment.salary_type)} — ${formatNumber(Number(recruitment.fix_percent) || 0, 0)}%`
      : recruitment.salary_type === 'fixed_amount'
        ? `${ishHaqiTuriLabel(recruitment.salary_type)} — ${formatNumber(Number(recruitment.fix_summa) || 0, 2)} UZS`
        : ishHaqiTuriLabel(recruitment.salary_type)
    : ''

  const orgName =
    doc?.branch_info?.organization_info?.name ||
    doc?.organization_info?.name ||
    employee?.organization_info?.name ||
    ''
  const branchName = doc?.branch_info?.name || employee?.branch_info?.name || ''
  const scheduleName =
    recruitment?.schedule_info?.name ||
    recruitment?.work_schedule_info?.name ||
    employee?.schedule_info?.name ||
    employee?.work_schedule_info?.name ||
    recruitment?.schedule?.name ||
    employee?.schedule?.name ||
    ''

  const bannerVariant = isDraft ? 'warning' : isApproved ? 'success' : 'danger'
  const bannerText = isDraft
    ? 'Tasdiqlangandan so‘ng hujjatni o‘zgartirib bo‘lmaydi.'
    : isApproved
      ? 'Hujjat tasdiqlangan. Uni o‘zgartirib bo‘lmaydi.'
      : `Hujjat bekor qilingan.${doc.cancel_reason ? ` Sabab: ${doc.cancel_reason}` : ''}`

  const orgId =
    doc?.branch_info?.organization_info?.id ||
    doc?.organization_info?.id ||
    employee?.organization_info?.id ||
    doc?.branch_info?.organization ||
    employee?.organization ||
    null
  const branchId = doc?.branch_info?.id || doc?.branch || employee?.branch_info?.id || employee?.branch || null
  const currentEmpId = doc?.employee_info?.id || doc?.employee || employee?.id || null

  const headerCards = [
    {
      label: 'Tashkilot',
      value: orgName,
      bg: '#F8C3B3',
      onClick: orgId ? () => window.open(`/tashkilotlar/${orgId}`, '_blank') : undefined,
    },
    {
      label: 'Filial',
      value: branchName,
      bg: '#B3F8C5',
      onClick: branchId ? () => window.open(`/filiallar/${branchId}`, '_blank') : undefined,
    },
    {
      label: 'Xodim',
      value: employeeName,
      bg: '#CDE7FE',
      onClick: currentEmpId ? () => window.open(`/malumotnomalar/xodimlar/${currentEmpId}`, '_blank') : undefined,
    },
    {
      label: 'Ish grafigi',
      value: scheduleName,
      bg: '#CDE7FE',
      onClick: () => window.open('/malumotnomalar/ish-grafigi', '_blank'),
    },
    {
      label: 'Holati',
      value: STATUS_TEXT[currentStatus],
      bg: '#DDD8FE',
    },
  ]

  return (
    <div className="flex h-full flex-col justify-between gap-3 overflow-hidden">
      {toast && (
        <div className="fixed right-5 top-5 z-50 rounded-xl bg-[#00A34D] px-4 py-2.5 text-sm font-semibold text-white shadow-lg">
          {toast}
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col space-y-2 overflow-hidden">
        <StatusBanner variant={bannerVariant}>
          <span className="mr-2">{bannerText}</span>
          {doc.cancel_attachment && (
            <a href={doc.cancel_attachment} target="_blank" rel="noreferrer" className="underline font-semibold">
              Hujjat
            </a>
          )}
        </StatusBanner>

        {actionError && (
          <StatusBanner variant="danger" text={actionError} />
        )}

        <div className="grid shrink-0 grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          {headerCards.map((c) => (
            <div
              key={c.label}
              onClick={c.onClick}
              className={cn(
                'flex min-h-[72px] flex-col justify-between rounded-sm px-4 py-3 text-left text-[#0A0A0A]',
                c.onClick && 'cursor-pointer transition-[filter] hover:brightness-[0.97]'
              )}
              style={{ backgroundColor: c.bg }}
            >
              <span className="text-[12px] font-semibold uppercase tracking-[0.4px] text-[#0A0A0A]/80">
                {c.label}
              </span>
              <span className="flex items-center justify-between gap-2">
                <span className="truncate text-[20px] font-semibold leading-tight text-[#0A0A0A]" title={c.value}>
                  {c.value || ''}
                </span>
              </span>
            </div>
          ))}
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 items-stretch gap-2 overflow-hidden lg:grid-cols-12">
          {/* Xodimning barcha qo'shimcha/ushlanmalari */}
          <div className="flex h-full flex-col overflow-hidden rounded-sm border border-[#E5E5E5] bg-[#EFF1F7] lg:col-span-8 dark:border-white/10 dark:bg-card">
            <div ref={historyContainerRef} onScroll={handleHistoryScroll} className="flex-1 overflow-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr>
                    <th className={cn(TH, 'w-12 text-center')}>#</th>
                    <th className={TH}>Sana va vaqt</th>
                    <th className={TH}>Qo‘shimcha va ushlanma</th>
                    <th className={TH}>Qiymat</th>
                    <th className={TH}>Holat</th>
                  </tr>
                </thead>
                <tbody>
                  {historyLoading && historyItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center">
                        <Loader2 className="mx-auto h-5 w-5 animate-spin text-[#0052D2]" />
                      </td>
                    </tr>
                  ) : historyItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-sm text-[#737373]">
                        Ma'lumot mavjud emas
                      </td>
                    </tr>
                  ) : (
                    historyItems.map((h, idx) => {
                      const isCurrent = String(h.id) === String(id)
                      return (
                        <tr
                          key={h.id}
                          className={cn(
                            'transition-colors hover:bg-[#F9FAFB] dark:hover:bg-white/5',
                            isCurrent ? 'bg-[#F0F7FF]/70 font-medium dark:bg-blue-950/40' : 'cursor-pointer'
                          )}
                        >
                          <td className={cn(TD, 'text-center font-medium text-[#737373]')}>{idx + 1}</td>
                          <td className={cn(TD, 'text-[#525252] dark:text-muted-foreground')}>{h.date}</td>
                          <td className={cn(TD, 'font-medium')}>{h.name}</td>
                          <td className={cn(TD, 'font-semibold', h.isRetention ? 'text-[#DC2626]' : 'text-[#16A34A]')}>
                            {h.isRetention ? '−' : '+'}
                            {formatAccrualRetentionValue(h.raw, currencyMap)}
                          </td>
                          <td className={TD}>
                            <QoshimchaStatusBadge status={h.status} />
                          </td>
                        </tr>
                      )
                    })
                  )}
                  {historyLoadingMore && (
                    <tr>
                      <td colSpan={5} className="py-3 text-center">
                        <Loader2 className="mx-auto h-4 w-4 animate-spin text-[#0052D2]" />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div ref={historySentinelRef} className="h-1" />
            </div>

            <button
              type="button"
              onClick={() => setNewOpen(true)}
              className="z-10 flex w-full shrink-0 cursor-pointer items-center justify-center gap-2 border-t border-dashed border-[#D1D5DB] bg-[#EFF1F7] py-3 text-sm font-semibold text-[#0A0A0A] transition-colors hover:bg-black/5 dark:border-white/15 dark:bg-card dark:text-white dark:hover:bg-white/5"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" /> Qo‘shish
            </button>
          </div>

          <div className="h-full space-y-3 overflow-y-auto pr-1 lg:col-span-4">
            <InfoCard title="Hujjat ma'lumotlari">
              <InfoRow label="Sana">{doc.date ? formatDateTime(new Date(doc.date)) : ''}</InfoRow>
              <InfoRow label="Filial">{doc.branch_info?.name}</InfoRow>
              <InfoRow label="Xodim">{employeeName}</InfoRow>
              <InfoRow label="Lavozimi">{recruitment?.position_info?.name}</InfoRow>
              <InfoRow label="Yaratilgan">{doc.created_at ? formatDateTime(new Date(doc.created_at)) : ''}</InfoRow>
              <InfoRow label="Yangilangan">{doc.updated_at ? formatDateTime(new Date(doc.updated_at)) : ''}</InfoRow>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-[#737373] dark:text-muted-foreground">Holati</span>
                <QoshimchaStatusBadge status={currentStatus} />
              </div>
            </InfoCard>

            <InfoCard title="Xodim ma'lumotlari" className={cn(!isDraft || !isApproved ? "h-[calc(100vh-557px)]" : "h-[calc(100vh-580px)]")}>
              <InfoRow label="Tashkiloti">{employee?.organization_info?.name}</InfoRow>
              <InfoRow label="Karta raqami">{recruitment?.card_number}</InfoRow>
              <InfoRow label="Ishga olingan sana">
                {recruitment?.rec_dism_date ? formatDate(recruitment.rec_dism_date) : ''}
              </InfoRow>
              <InfoRow label="Ish haqi turi">{salaryInfo}</InfoRow>
              <InfoRow label="Telefon">
                {employee?.phone_number ? formatUzPhone(employee.phone_number) || employee.phone_number : ''}
              </InfoRow>
            </InfoCard>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-3 rounded-xl border border-[#E5E5E5] bg-white p-4 dark:border-white/10 dark:bg-card">
        <Button
          type="button"
          onClick={handleOpenHisobot}
          disabled={actionLoading || hisobotLoading}
          className="h-10 gap-2 rounded-[10px] bg-[#0052D2] px-5 text-sm font-medium text-white hover:bg-[#0047B8]"
        >
          {hisobotLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />} Hisobot
        </Button>
        <div className='flex items-center gap-2'>
          {(isDraft || isApproved) && (
            <Button
              type="button"
              onClick={() => setCancelOpen(true)}
              disabled={actionLoading || hisobotLoading}
              className="h-10 gap-2 rounded-[10px] bg-[#DC2626] px-5 text-sm font-medium text-white hover:bg-[#B91C1C]"
            >
              <X className="h-4 w-4 stroke-[2.5]" /> Bekor qilish
            </Button>
          )}
          {isDraft && (
            <>
              <Button
                type="button"
                onClick={() => setEditOpen(true)}
                disabled={actionLoading || hisobotLoading}
                className="h-10 gap-2 rounded-[10px] bg-[#0052D2] px-5 text-sm font-medium text-white hover:bg-[#0047B8]"
              >
                <Pencil className="h-4 w-4" /> Tahrirlash
              </Button>
              <Button
                type="button"
                onClick={() => setApproveOpen(true)}
                disabled={actionLoading || hisobotLoading}
                className="h-10 gap-2 rounded-[10px] bg-[#00A34D] px-5 text-sm font-medium text-white hover:bg-[#008A41]"
              >
                <Check className="h-4 w-4 stroke-[2.5]" /> Tasdiqlash
              </Button>
            </>
          )}
        </div>
      </div>


      <ApproveConfirmModal
        open={approveOpen}
        onOpenChange={setApproveOpen}
        document={doc}
        currencyMap={currencyMap}
        onConfirm={handleApprove}
        loading={actionLoading}
      />

      <CancelConfirmModal
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        document={doc}
        currencyMap={currencyMap}
        onConfirm={handleCancel}
        loading={actionLoading}
      />

      <NewQoshimchaModal open={newOpen} onOpenChange={setNewOpen} initialData={doc} onCreate={handleCreateDocument} />

      <NewQoshimchaModal
        open={editOpen}
        onOpenChange={setEditOpen}
        initialData={doc}
        mode="edit"
        onCreate={handleEdit}
      />
    </div>
  )
}
