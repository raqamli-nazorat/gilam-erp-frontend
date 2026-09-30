import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, Check, Loader2, Plus, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { PagedSelect } from '@/components/ui/paged-select'
import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import { accrualRetentionOptions } from '@/services/optionSources'
import { extractErrorMessage } from '@/services/apiHelpers'
import { computeAdjustment } from '@/features/oylikHisoblash/oylikGroups'


// Xodim hisobi paneli. Qo'shimcha/ushlanmalar — haqiqiy "Qo'shimcha va ushlanma" hujjatlari
// (finance/accrual-retention-documents); qo'shish/o'chirish darhol backendga yuboriladi.
//   employee: { name, typeLabel, currency, base, rate, additionsList, deductionsList, totalOwn }
//   onAdd({ accrualRetentionId }) / onRemove(item) — Promise qaytaradi, xato bo'lsa throw.
export default function EmployeeSalaryDrawer({
  open,
  onClose,
  employee,
  onAdd,
  onRemove,
  currencyMap = {},
  readOnly = false,
}) {
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (open) {
      setMounted(true)
      const t = setTimeout(() => setVisible(true), 20)
      return () => clearTimeout(t)
    }
    setVisible(false)
    const t = setTimeout(() => setMounted(false), 300)
    return () => clearTimeout(t)
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!mounted || !employee) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className={cn(
          'fixed inset-0 bg-black/50 transition-opacity duration-300',
          visible ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
      />

      <div
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-[480px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out dark:bg-[#18181B]',
          visible ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#F0F0F0] px-6 dark:border-white/10">
          <h2 className="text-[18px] font-bold text-[#0A0A0A] dark:text-white">Xodim hisobi</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-black dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-6">
          <div>
            <h3 className="text-[18px] font-bold text-[#0A0A0A] dark:text-white">{employee.name}</h3>
            {employee.tabNum && (
              <p className="mt-0.5 text-[13px] text-[#737373] dark:text-gray-400">Tab. raqami {employee.tabNum}</p>
            )}
          </div>

          <div className="space-y-2.5 rounded-2xl bg-[#F5F5F7] p-4 dark:bg-white/5">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[#525252] dark:text-gray-400">Oylik turi</span>
              <span className="text-[14px] font-semibold text-[#0A0A0A] dark:text-white">{employee.typeLabel}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[#525252] dark:text-gray-400">Belgilangan qiymat</span>
              <span className="text-[15px] font-bold text-[#0A0A0A] dark:text-white">
                {formatNumber(employee.base, 2)} {employee.currency}
              </span>
            </div>
          </div>

          <AdjustmentSection
            title="Qo‘shimchalar"
            isRetention={false}
            items={employee.additionsList}
            employee={employee}
            currencyMap={currencyMap}
            readOnly={readOnly}
            onAdd={onAdd}
            onRemove={onRemove}
          />

          <AdjustmentSection
            title="Ushlanmalar"
            isRetention
            items={employee.deductionsList}
            employee={employee}
            currencyMap={currencyMap}
            readOnly={readOnly}
            onAdd={onAdd}
            onRemove={onRemove}
          />

          <div className="flex items-center justify-between rounded-2xl bg-[#EAF2FF] p-4 dark:bg-[#0052D2]/15">
            <div className="text-sm font-semibold text-[#0A0A0A] dark:text-white">Jami</div>
            <div className="text-[20px] font-semibold text-[#0A0A0A] dark:text-white">
              {formatNumber(employee.totalOwn, 2)} {employee.currency}
            </div>
          </div>
        </div>

        <div className="flex h-[72px] shrink-0 items-center justify-end gap-3 border-t border-[#F0F0F0] bg-[#F9FAFB] px-6 dark:border-white/10 dark:bg-white/5">
          <Button type="button" variant="outline" onClick={onClose} className="h-10 rounded-[10px] px-5 text-sm font-medium">
            <X className="mr-1.5 size-4" /> Yopish
          </Button>
        </div>
      </div>
    </div>
  )
}

function AdjustmentSection({ title, isRetention, items, employee, currencyMap, readOnly, onAdd, onRemove }) {
  const navigate = useNavigate()
  const [adding, setAdding] = useState(false)
  const [picked, setPicked] = useState(null)
  const [busy, setBusy] = useState(false)
  const [removingId, setRemovingId] = useState(null)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setAdding(false)
    setPicked(null)
    setError('')
  }, [employee?.employeeId])

  const preview = useMemo(
    () => (picked ? computeAdjustment(picked, employee, currencyMap) : 0),
    [picked, employee, currencyMap]
  )

  const sign = isRetention ? '-' : '+'
  const color = isRetention ? 'text-[#DC2626]' : 'text-[#16A34A]'

  const submit = async () => {
    if (!picked) return setError('Turini tanlang')
    setBusy(true)
    setError('')
    try {
      await onAdd({ accrualRetentionId: picked.id })
      setAdding(false)
      setPicked(null)
    } catch (err) {
      setError(extractErrorMessage(err, 'Qo‘shishda xatolik yuz berdi'))
    } finally {
      setBusy(false)
    }
  }

  const remove = async (item) => {
    setRemovingId(item.id)
    setError('')
    try {
      await onRemove(item)
    } catch (err) {
      setError(extractErrorMessage(err, 'O‘chirishda xatolik yuz berdi'))
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-[15px] font-bold text-[#0A0A0A] dark:text-white">{title}</h4>
        {!readOnly && (
          <button
            type="button"
            onClick={() => setAdding((v) => !v)}
            className="flex items-center gap-1 text-[13px] font-semibold text-[#0A0A0A] transition-colors hover:text-[#0052D2] dark:text-white dark:hover:text-[#60A5FA]"
          >
            <Plus className="size-4" /> Qo‘shish
          </button>
        )}
      </div>

      {error && (
        <div className="whitespace-pre-line rounded-lg bg-red-50 p-2.5 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </div>
      )}

      {adding && (
        <div className="space-y-3 rounded-2xl border border-gray-100 bg-[#F5F5F7] p-4 dark:border-white/5 dark:bg-white/5">
          <div>
            <label className="mb-1.5 block text-[13px] text-[#525252] dark:text-gray-400">
              {isRetention ? 'Ushlanma turi' : 'Qo‘shimcha turi'}
            </label>
            <PagedSelect
              value={picked?.id || ''}
              onChange={(_, item) => setPicked(item || null)}
              fetchPage={accrualRetentionOptions}
              // params={{ is_retention: isRetention }}
              selectedLabel={picked?.name || ''}
              placeholder="Turini tanlang"
              className="h-10 rounded-[10px] bg-white"
            />
          </div>

          {picked && (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[13px] text-[#525252] dark:text-gray-400">Qiymat</span>
                <span className="font-semibold text-[#0A0A0A] dark:text-white">{adjustmentInfo(picked, currencyMap)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[13px] text-[#525252] dark:text-gray-400">
                  {isRetention ? 'Hisobdan ushlab qolinadi' : 'Hisobga qo‘shiladi'}
                </span>
                <span className={cn('text-[15px] font-bold', color)}>
                  {sign}
                  {formatNumber(preview, 2)}
                </span>
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setAdding(false)
                setPicked(null)
              }}
              className="h-9 rounded-xl border-gray-200 bg-white px-4 text-sm font-semibold text-[#0A0A0A] hover:bg-gray-50 dark:border-white/10 dark:bg-zinc-800 dark:text-white"
            >
              <X className="mr-1.5 size-4" /> Bekor qilish
            </Button>
            <Button
              type="button"
              onClick={submit}
              disabled={busy || !picked}
              className="h-9 rounded-xl bg-[#0052D2] px-5 text-sm font-semibold text-white hover:bg-[#0047B8]"
            >
              {busy ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : <Check className="mr-1.5 size-4" />}
              Qo‘shish
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2.5">
        {items.length === 0 && !adding && (
          <p className="text-[13px] text-[#A3A3A3]">Mavjud emas</p>
        )}
        {items.map((item) => (
          <div
            key={item.id}
            className="group flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-3.5 dark:border-white/10 dark:bg-white/5"
          >
            <div>
              <div className="text-[14px] font-bold text-[#0A0A0A] dark:text-white">{item.name}</div>
              <div className="mt-0.5 text-xs text-[#737373] dark:text-gray-400">
                {item.info}
                {item.status === 'draft' && ' · Qoralama'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => item.id && navigate(`/qoshimcha-va-ushlanma/${item.id}`)}
                className="group/link inline-flex items-center gap-1 transition-opacity hover:opacity-80"
                title="Hujjat sahifasiga o‘tish"
              >
                <span className={cn('text-[14px] font-bold', color)}>
                  {sign}
                  {formatNumber(item.amount, 2)}
                </span>
                <ArrowUpRight className="size-4 shrink-0 text-[#0052D2] transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 dark:text-blue-400" />
              </button>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => setItemToDelete(item)}
                  disabled={removingId === item.id}
                  className="p-1 text-gray-400 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100 disabled:opacity-100"
                  title="O‘chirish"
                >
                  {removingId === item.id ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* O'chirishni tasdiqlash modali */}
      <Dialog open={!!itemToDelete} onOpenChange={(o) => !o && !removingId && setItemToDelete(null)}>
        <DialogContent
          showCloseButton={false}
          className="w-full gap-0 overflow-hidden rounded-[20px] p-0 shadow-2xl ring-0 sm:max-w-[420px] border-none dark:bg-[#18181B]"
        >
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#F0F0F0] px-6 dark:border-white/10">
            <DialogTitle className="text-[18px] font-bold text-[#0A0A0A] dark:text-white">
              O‘chirishni tasdiqlaysizmi?
            </DialogTitle>
            <DialogClose
              render={
                <button
                  type="button"
                  aria-label="Yopish"
                  disabled={removingId === itemToDelete?.id}
                  className="flex size-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-black dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <X className="size-5" />
                </button>
              }
            />
          </div>

          <div className="p-6 space-y-4">
            <p className="text-[14px] text-[#525252] dark:text-gray-300">
              Ushbu qo‘shimcha/ushlanma hujjatini hisobdan o‘chirishni xohlaysizmi?
            </p>

            {itemToDelete && (
              <div className="rounded-2xl bg-[#F5F5F7] p-4 space-y-2 text-sm dark:bg-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-[#737373] dark:text-gray-400">Nomi</span>
                  <span className="font-semibold text-[#0A0A0A] dark:text-white">{itemToDelete.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#737373] dark:text-gray-400">Turi</span>
                  <span className="text-[#737373] dark:text-gray-300">{itemToDelete.info}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#737373] dark:text-gray-400">Summa</span>
                  <span className={cn('font-bold', color)}>
                    {sign}
                    {formatNumber(itemToDelete.amount, 2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex h-[72px] shrink-0 items-center justify-end gap-3 border-t border-[#F0F0F0] bg-[#F9FAFB] px-6 dark:border-white/10 dark:bg-white/5">
            <Button
              type="button"
              variant="outline"
              disabled={removingId === itemToDelete?.id}
              onClick={() => setItemToDelete(null)}
              className="h-10 rounded-[10px] px-5 text-sm font-medium"
            >
              Bekor qilish
            </Button>
            <Button
              type="button"
              disabled={removingId === itemToDelete?.id}
              onClick={async () => {
                if (!itemToDelete) return
                const target = itemToDelete
                await remove(target)
                setItemToDelete(null)
              }}
              className="h-10 rounded-[10px] bg-[#DC2626] px-5 text-sm font-semibold text-white hover:bg-[#B91C1C]"
            >
              {removingId === itemToDelete?.id ? (
                <Loader2 className="mr-1.5 size-4 animate-spin" />
              ) : (
                <Trash2 className="mr-1.5 size-4" />
              )}
              Ha, o‘chirish
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function adjustmentInfo(ar, currencyMap = {}) {
  if (ar?.type === 'percent') return `Foiz, ${formatNumber(Number(ar.value) || 0, 2)} %`
  const cur = currencyMap[ar?.currency] || ar?.currency_info?.short_name || 'UZS'
  return `Summa, ${formatNumber(Number(ar?.value) || 0, 2)} ${cur}`
}
