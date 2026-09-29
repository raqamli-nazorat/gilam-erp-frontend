import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, Check, X } from 'lucide-react'
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { PagedSelect } from '@/components/ui/paged-select'
import { Input } from '@/components/ui/input'
import { MONTH_NAMES } from '@/features/oylikHisoblash/oylikData'
import { parseDmyHm } from '@/features/oylikHisoblash/oylikGroups'
import { branchOptions, monthOptions, organizationOptions } from '@/services/optionSources'
import { extractErrorMessage } from '@/services/apiHelpers'
import { formatDateTime, maskDateTime } from '@/lib/format'

const LABEL = 'mb-1.5 block text-[13px] font-medium text-[#525252] dark:text-muted-foreground'

// Yangi hisob (mode="create") va Hisobni tahrirlash (mode="edit") oynasi.
// `initial` (tahrirlashda): { date, orgId, orgName, branchId, branchName, forMonth }
// `onSubmit({ date, year, orgId, branch, branchName, forMonth })` — xato bo'lsa throw qiladi.
export default function NewOylikModal({ open, onOpenChange, onSubmit, mode = 'create', initial }) {
  const navigate = useNavigate()
  const isEdit = mode === 'edit'

  const [date, setDate] = useState('')
  const [orgId, setOrgId] = useState('')
  const [orgName, setOrgName] = useState('')
  const [branchId, setBranchId] = useState('')
  const [branchName, setBranchName] = useState('')
  const [forMonth, setForMonth] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setDate(initial?.date || formatDateTime(new Date()))
    setOrgId(initial?.orgId || '')
    setOrgName(initial?.orgName || '')
    setBranchId(initial?.branchId || '')
    setBranchName(initial?.branchName || '')
    setForMonth(initial?.forMonth ? String(initial.forMonth) : String(new Date().getMonth() + 1))
    setError('')
    setLoading(false)
  }, [open, initial])

  const parsedDate = parseDmyHm(date)
  const canSubmit = Boolean(parsedDate && orgId && branchId && forMonth) && !loading

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!parsedDate) return setError('Sanani KK.OO.YYYY SS:MM ko‘rinishida kiriting')
    if (!orgId) return setError('Tashkilotni tanlang')
    if (!branchId) return setError('Filialni tanlang')
    if (!forMonth) return setError('Oyni tanlang')

    setLoading(true)
    setError('')
    try {
      await onSubmit({
        date: parsedDate,
        year: parsedDate.getFullYear(),
        orgId,
        branch: branchId,
        branchName,
        forMonth: Number(forMonth),
      })
      onOpenChange(false)
    } catch (err) {
      setError(extractErrorMessage(err, isEdit ? 'Saqlashda xatolik yuz berdi' : 'Hisoblashda xatolik yuz berdi'))
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
        <div className="flex h-[60px] shrink-0 items-center justify-between px-6">
          <DialogTitle className="text-[18px] font-semibold text-[#0A0A0A] dark:text-white">
            {isEdit ? 'Hisobni tahrirlash' : 'Yangi hisob'}
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

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-6 pb-5 pt-1">
            {error && (
              <div className="whitespace-pre-line rounded-lg bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LABEL}>Sana</label>
                <Input
                  value={date}
                  onChange={(e) => setDate(maskDateTime(e.target.value))}
                  placeholder="KK.OO.YYYY SS:MM"
                  inputMode="numeric"
                  className="h-10 rounded-[10px] border-[#E5E5E5] bg-white text-sm text-[#0A0A0A] focus-visible:ring-[#0052D2] dark:border-white/10 dark:bg-card dark:text-white"
                />
              </div>
              <div>
                <label className={LABEL}>Tashkilot</label>
                <PagedSelect
                  value={orgId}
                  onChange={(val, item) => {
                    setOrgId(val)
                    setOrgName(item?.name ?? '')
                    if (val !== orgId) {
                      setBranchId('')
                      setBranchName('')
                    }
                  }}
                  fetchPage={organizationOptions}
                  selectedLabel={orgName}
                  placeholder="Tashkilot tanlang"
                  className="h-10 rounded-[10px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LABEL}>Filial</label>
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
                <label className={LABEL}>Oy uchun</label>
                <PagedSelect
                  value={forMonth}
                  onChange={(val) => setForMonth(val)}
                  fetchPage={monthOptions}
                  selectedLabel={MONTH_NAMES[forMonth] || ''}
                  placeholder="Oy tanlang"
                  className="h-10 rounded-[10px]"
                />
              </div>
            </div>

            {isEdit && (
              <p className="text-[13px] leading-5 text-[#737373] dark:text-muted-foreground">
                Xodimlar, Tab. raqami va soatlar tasdiqlangan tabeldan avtomatik to‘ldiriladi.
              </p>
            )}
          </div>

          <div className="flex h-[76px] shrink-0 items-center justify-end gap-3 bg-[#F5F5F5] px-6 dark:bg-white/5">
            {!isEdit && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  onOpenChange(false)
                  navigate('/tabel')
                }}
                className="h-10 gap-2 rounded-[10px] px-4 text-[14px] font-medium text-[#0A0A0A] hover:bg-black/5 dark:text-white dark:hover:bg-white/10"
              >
                <CalendarDays className="size-4" /> Tabelga o‘tish
              </Button>
            )}
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
              disabled={!canSubmit}
              className="h-10 gap-2 rounded-[10px] bg-[#0052D2] px-6 text-[14px] font-medium text-white shadow-sm hover:bg-[#0047B8] disabled:bg-[#E5E5E5] disabled:text-[#A3A3A3] disabled:opacity-100 dark:disabled:bg-white/10 dark:disabled:text-white/40"
            >
              <Check className="size-4" />
              {loading ? (isEdit ? 'Saqlanmoqda...' : 'Hisoblanmoqda...') : isEdit ? 'Saqlash' : 'Yaratish'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
