import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FilterField } from '@/components/ui/filter-modal'
import { DatePicker, fromISODate, toISODate } from '@/components/ui/date-picker'
import { PagedSelect } from '@/components/ui/paged-select'
import {
  branchOptions,
  employeeOptions,
  monthOptions,
  organizationOptions,
} from '@/services/optionSources'
import { MONTH_NAMES } from '@/features/oylikHisoblash/oylikData'

export const EMPTY_OYLIK_FILTERS = {
  orgId: '',
  orgName: '',
  branch: '', // branch uuid or id
  branchName: '',
  for_month: '', // 1-12
  for_month_name: '',
  employee: '', // employee uuid or id
  employeeName: '',
  start_date: '', // Yaratilgan sana dan
  end_date: '', // Yaratilgan sana gacha
  updated_dan: '', // Yangilangan dan
  updated_gacha: '', // Yangilangan gacha
  status: '', // draft | approved | cancelled
}

export default function OylikFilterModal({
  open,
  onOpenChange,
  filters,
  onApply,
}) {
  const [draft, setDraft] = useState(filters || EMPTY_OYLIK_FILTERS)

  useEffect(() => {
    if (open) {
      setDraft(filters || EMPTY_OYLIK_FILTERS)
    }
  }, [open, filters])

  const setField = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  const handleReset = () => {
    setDraft(EMPTY_OYLIK_FILTERS)
    onApply(EMPTY_OYLIK_FILTERS)
    onOpenChange(false)
  }

  const handleApply = () => {
    onApply(draft)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-full gap-0 overflow-hidden rounded-[16px] p-0 shadow-[0px_12px_24px_-6px_#01091C24] ring-0 sm:max-w-[560px] dark:bg-card"
      >
        {/* Header */}
        <div className="flex h-[60px] shrink-0 items-center justify-between gap-2 border-b border-[#F0F0F0] px-6 dark:border-white/10">
          <DialogTitle className="text-[18px] font-semibold text-[#0A0A0A] dark:text-white">
            Filtr
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

        {/* Body (2-rasmdagi form maydonlari - PagedSelect scroll pagination bilan) */}
        <div className="space-y-4 px-6 py-5">
          {/* 1-qator: Tashkilot va Filial */}
          <div className="grid grid-cols-2 gap-4">
            <FilterField label="Tashkilot">
              <PagedSelect
                value={draft.orgId}
                onChange={(val, item) =>
                  setDraft((d) => ({
                    ...d,
                    orgId: val,
                    orgName: item?.name ?? '',
                    branch: d.orgId !== val ? '' : d.branch,
                    branchName: d.orgId !== val ? '' : d.branchName,
                  }))
                }
                fetchPage={organizationOptions}
                selectedLabel={draft.orgName}
                placeholder="Barchasi"
                allowAll
                className="h-10 rounded-[10px]"
              />
            </FilterField>
            <FilterField label="Filial">
              <PagedSelect
                value={draft.branch}
                onChange={(val, item) =>
                  setDraft((d) => ({
                    ...d,
                    branch: val,
                    branchName: item?.name ?? '',
                  }))
                }
                fetchPage={branchOptions}
                params={draft.orgId ? { organization: draft.orgId } : undefined}
                selectedLabel={draft.branchName}
                placeholder="Barchasi"
                allowAll
                className="h-10 rounded-[10px]"
              />
            </FilterField>
          </div>

          {/* 2-qator: Oy va Xodim */}
          <div className="grid grid-cols-2 gap-4">
            <FilterField label="Oy">
              <PagedSelect
                value={draft.for_month}
                onChange={(val, item) =>
                  setDraft((d) => ({
                    ...d,
                    for_month: val,
                    for_month_name: item?.name ?? '',
                  }))
                }
                fetchPage={monthOptions}
                selectedLabel={draft.for_month_name || MONTH_NAMES[draft.for_month]}
                placeholder="Barchasi"
                allowAll
                className="h-10 rounded-[10px]"
              />
            </FilterField>
            <FilterField label="Xodim">
              <PagedSelect
                value={draft.employee}
                onChange={(val, item) =>
                  setDraft((d) => ({
                    ...d,
                    employee: val,
                    employeeName: item?.name ?? '',
                  }))
                }
                fetchPage={employeeOptions}
                params={draft.branch ? { branch: draft.branch } : undefined}
                selectedLabel={draft.employeeName}
                placeholder="Barchasi"
                allowAll
                className="h-10 rounded-[10px]"
              />
            </FilterField>
          </div>

          {/* 3-qator: Yaratilgan (dan - gacha) */}
          <FilterField label="Yaratilgan">
            <div className="grid grid-cols-2 gap-4">
              <DatePicker
                label="dan"
                placeholder="KK.OO.YYYY"
                value={fromISODate(draft.start_date)}
                onChange={(d) => setField('start_date', toISODate(d))}
              />
              <DatePicker
                label="gacha"
                placeholder="KK.OO.YYYY"
                value={fromISODate(draft.end_date)}
                onChange={(d) => setField('end_date', toISODate(d))}
              />
            </div>
          </FilterField>

          {/* 4-qator: Yangilangan (dan - gacha) */}
          <FilterField label="Yangilangan">
            <div className="grid grid-cols-2 gap-4">
              <DatePicker
                label="dan"
                placeholder="KK.OO.YYYY"
                value={fromISODate(draft.updated_dan)}
                onChange={(d) => setField('updated_dan', toISODate(d))}
              />
              <DatePicker
                label="gacha"
                placeholder="KK.OO.YYYY"
                value={fromISODate(draft.updated_gacha)}
                onChange={(d) => setField('updated_gacha', toISODate(d))}
              />
            </div>
          </FilterField>
        </div>

        {/* Footer (2-rasmdagi Tozalash va Qo'llash tugmalari) */}
        <div className="flex h-[72px] shrink-0 items-center justify-end gap-3 bg-[#F9FAFB] px-6 border-t border-[#F0F0F0] dark:bg-white/5 dark:border-white/10">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="h-10 gap-2 rounded-[10px] border-[#E5E5E5] bg-white px-5 text-[14px] font-medium text-[#0A0A0A] shadow-sm hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
          >
            <X className="size-4" /> Tozalash
          </Button>
          <Button
            type="button"
            onClick={handleApply}
            className="h-10 gap-2 rounded-[10px] bg-[#0052D2] px-6 text-[14px] font-medium text-white shadow-sm hover:bg-[#0047B8]"
          >
            <Check className="size-4" /> Qo‘llash
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
