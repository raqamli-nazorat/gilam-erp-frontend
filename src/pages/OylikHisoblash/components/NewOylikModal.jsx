import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { PagedSelect } from '@/components/ui/paged-select'
import { Input } from '@/components/ui/input'
import { MONTH_NAMES } from '@/features/oylikHisoblash/oylikData'
import {
  branchOptions,
  monthOptions,
  organizationOptions,
} from '@/services/optionSources'
import { extractErrorMessage } from '@/services/apiHelpers'
import { formatDateTime } from '@/lib/format'

export default function NewOylikModal({
  open,
  onOpenChange,
  onCreate,
}) {
  const [date, setDate] = useState('')
  const [orgId, setOrgId] = useState('')
  const [orgName, setOrgName] = useState('')
  const [branchId, setBranchId] = useState('')
  const [branchName, setBranchName] = useState('')
  const [forMonth, setForMonth] = useState(String(new Date().getMonth() + 1))
  const [monthName, setMonthName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setDate(formatDateTime(new Date()))
      setOrgId('')
      setOrgName('')
      setBranchId('')
      setBranchName('')
      const curMonth = String(new Date().getMonth() + 1)
      setForMonth(curMonth)
      setMonthName(MONTH_NAMES[curMonth] || '')
      setError('')
      setLoading(false)
    }
  }, [open])

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!orgId) {
      setError('Tashkilotni tanlang')
      return
    }
    if (!branchId) {
      setError('Filialni tanlang')
      return
    }
    if (!forMonth) {
      setError('Oyni tanlang')
      return
    }

    setLoading(true)
    setError('')

    try {
      await onCreate({
        date,
        organization: orgId,
        orgId,
        organizationName: orgName,
        branch: branchId,
        branchId,
        branchName,
        for_month: Number(forMonth),
        forMonth: Number(forMonth),
        year: 2026,
      })
      onOpenChange(false)
    } catch (err) {
      setError(extractErrorMessage(err, 'Hisoblashda xatolik yuz berdi'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-full gap-0 overflow-hidden rounded-[16px] p-0 shadow-[0px_12px_24px_-6px_#01091C24] ring-0 sm:max-w-[560px] dark:bg-card"
      >
        {/* Header */}
        <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-[#F0F0F0] px-6 dark:border-white/10">
          <DialogTitle className="text-[18px] font-semibold text-[#0A0A0A] dark:text-white">
            Yangi hisob
          </DialogTitle>
          <DialogClose
            render={
              <button
                type="button"
                aria-label="Yopish"
                className="flex size-8 items-center justify-center rounded-md text-[#525252] transition-colors hover:bg-[#F5F5F5] hover:text-[#0A0A0A] dark:text-white/70 dark:hover:bg-white/10"
              >
                <X className="size-5" />
              </button>
            }
          />
        </div>

        {/* Forma (5-rasm) */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-6 py-5">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400 whitespace-pre-line">
                {error}
              </div>
            )}

            {/* 1-qator: Sana va Tashkilot */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-[#525252] dark:text-muted-foreground">
                  Sana
                </label>
                <Input
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="26.09.2026 09:00"
                  className="h-10 rounded-[10px] border-[#E5E5E5] bg-white text-sm text-[#0A0A0A] focus-visible:ring-[#0052D2] dark:border-white/10 dark:bg-card dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-[#525252] dark:text-muted-foreground">
                  Tashkilot
                </label>
                <PagedSelect
                  value={orgId}
                  onChange={(val, item) => {
                    setOrgId(val)
                    setOrgName(item?.name ?? '')
                    setBranchId('')
                    setBranchName('')
                  }}
                  fetchPage={organizationOptions}
                  selectedLabel={orgName}
                  placeholder="Tashkilot tanlang"
                  className="h-10 rounded-[10px]"
                />
              </div>
            </div>

            {/* 2-qator: Filial va Oy uchun */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-[#525252] dark:text-muted-foreground">
                  Filial
                </label>
                <PagedSelect
                  value={branchId}
                  onChange={(val, item) => {
                    setBranchId(val)
                    setBranchName(item?.name ?? '')
                  }}
                  fetchPage={branchOptions}
                  params={orgId ? { organization: orgId } : undefined}
                  selectedLabel={branchName}
                  placeholder={orgId ? 'Filial tanlang' : 'Avval tashkilotni tanlang'}
                  disabled={!orgId}
                  className="h-10 rounded-[10px]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-[#525252] dark:text-muted-foreground">
                  Oy uchun
                </label>
                <PagedSelect
                  value={forMonth}
                  onChange={(val, item) => {
                    setForMonth(val)
                    setMonthName(item?.name ?? '')
                  }}
                  fetchPage={monthOptions}
                  selectedLabel={monthName || MONTH_NAMES[forMonth]}
                  placeholder="Oy tanlang"
                  className="h-10 rounded-[10px]"
                />
              </div>
            </div>

            {/* Eslatma matni */}
            <p className="pt-2 text-[13px] leading-5 text-[#737373] dark:text-muted-foreground">
              Xodimlar, Tab. raqami va soatlar tasdiqlangan tabeldan avtomatik to‘ldiriladi.
            </p>
          </div>

          {/* Footer (5-rasm) */}
          <div className="flex h-[72px] shrink-0 items-center justify-end gap-3 border-t border-[#F0F0F0] bg-[#F9FAFB] px-6 dark:border-white/10 dark:bg-white/5">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10 gap-2 rounded-[10px] border-[#E5E5E5] bg-white px-5 text-[14px] font-medium text-[#0A0A0A] shadow-sm hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
            >
              <X className="size-4" /> Bekor qilish
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="h-10 gap-2 rounded-[10px] bg-[#0052D2] px-6 text-[14px] font-medium text-white shadow-sm hover:bg-[#0047B8]"
            >
              <Check className="size-4" /> {loading ? 'Hisoblanmoqda...' : 'Yaratish'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
