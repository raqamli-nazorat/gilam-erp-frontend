import { useEffect, useState } from 'react'
import { AlertTriangle, Check, Loader2, Plus, Tag, X } from 'lucide-react'
import { formatNumber } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { PagedSelect } from '@/components/ui/paged-select'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { unitOptions, warehouseOptions } from '@/services/optionSources'
import { extractErrorMessage } from '@/services/apiHelpers'
import { createPartiesForRows, validateRowForParty } from '@/services/receiptService'

const labelClass = 'mb-1.5 text-[12px] font-normal leading-[16px] text-[#737373]'

// Har bir belgilangan qator uchun backendda alohida partiya (catalog/product-parties/) yaratadi.
// Backend partiyani filialga bog'laydi — filial tanlangan ombordan olinadi.
export default function BatchCreateModal({ open, onOpenChange, rows, receipt, onCreated }) {
  const [warehouse, setWarehouse] = useState(null)
  const [unit, setUnit] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  const warehouseId = receipt?.warehouseId
  const warehouseName = receipt?.warehouse
  const branchId = receipt?.branchId

  useEffect(() => {
    if (!open) return undefined
    setErrors({})
    setWarehouse(warehouseId ? { id: warehouseId, name: warehouseName, branchId } : null)
    // O'lchov birligi majburiy — m² (kv.m) bo'lsa avtomatik tanlanadi
    let cancelled = false
    unitOptions({ page: 1 })
      .then((res) => {
        if (cancelled) return
        const sqm = res.results.find((u) => /m²|m2|kv/i.test(u.name))
        setUnit((prev) => prev ?? sqm ?? res.results[0] ?? null)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [open, warehouseId, warehouseName, branchId])

  const pending = rows.filter((r) => !r.partyId)
  const invalidCount = pending.filter((r) => validateRowForParty(r)).length
  const blocker = !warehouse?.id
    ? 'Ombor tanlang'
    : !warehouse.branchId
      ? 'Omborga filial biriktirilmagan'
      : !unit?.id
        ? "O'lchov birligini tanlang"
        : null

  async function handleCreate() {
    if (blocker || pending.length === 0) return
    setSubmitting(true)
    setErrors({})
    try {
      const results = await createPartiesForRows(pending, {
        branchId: warehouse.branchId,
        unitId: unit.id,
        warehouseName: warehouse.name,
        receiptNumber: receipt.number,
      })
      const created = results.filter((r) => r.ok)
      const failed = results.filter((r) => !r.ok)
      if (created.length) onCreated(created)
      if (failed.length === 0) {
        onOpenChange(false)
      } else {
        setErrors(
          Object.fromEntries(
            failed.map((f) => [f.rowId, typeof f.error === 'string' ? f.error : extractErrorMessage(f.error)])
          )
        )
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !submitting && onOpenChange(next)}>
      <DialogContent className="p-5 sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-[17px] font-semibold leading-[24px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            Partiya yaratish
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-start gap-2.5 rounded-lg bg-[#F5F5F5] px-3.5 py-3 text-[13px] font-normal leading-[18px] text-[#525252] dark:bg-white/5 dark:text-muted-foreground">
          <Tag className="mt-0.5 h-4 w-4 shrink-0 text-[#737373]" />
          <span>
            Partiya — bu aniq rulon. Har bir belgilangan qator uchun alohida partiya raqami va shtrix
            kod yaratiladi.
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className={labelClass}>Ombor</p>
            <PagedSelect
              value={warehouse?.id ?? ''}
              selectedLabel={warehouse?.name}
              fetchPage={warehouseOptions}
              placeholder="Ombor tanlang"
              className="h-9"
              disabled={submitting}
              onChange={(id, item) => setWarehouse(item)}
            />
          </div>
          <div>
            <p className={labelClass}>O'lchov birligi</p>
            <PagedSelect
              value={unit?.id ?? ''}
              selectedLabel={unit?.name}
              fetchPage={unitOptions}
              placeholder="Tanlang"
              className="h-9"
              disabled={submitting}
              onChange={(id, item) => setUnit(item)}
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.4px] text-[#737373]">
            Yaratiladigan partiyalar · {pending.length} ta
          </p>
          <div className="max-h-56 space-y-1.5 overflow-y-auto rounded-lg border border-[#E5E5E5] p-1.5 dark:border-white/10">
            {rows.map((row) => {
              const error = errors[row.id] ?? (row.partyId ? null : validateRowForParty(row))
              return (
                <div key={row.id} className="rounded-md px-2.5 py-2 text-[13px]">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-[#0A0A0A] dark:text-white">
                      {row.quality} {row.design} {formatNumber(row.m2, 0)} {row.shape}
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      {row.partyId ? (
                        <span className="flex items-center gap-1 text-[#047A47]">
                          <Check className="h-3.5 w-3.5" /> {row.partiya}
                        </span>
                      ) : (
                        <span className="text-[#737373]">{row.partiya || 'Avtomatik'}</span>
                      )}
                      <span className="text-[#0A0A0A] dark:text-white">{formatNumber(row.m2)} m²</span>
                    </span>
                  </div>
                  {error && <p className="mt-1 text-[12px] text-red-600 dark:text-red-400">{error}</p>}
                </div>
              )
            })}
          </div>
        </div>

        {invalidCount > 0 && (
          <p className="flex items-center gap-1.5 text-[12px] text-[#B45309]">
            <AlertTriangle className="h-3.5 w-3.5" />
            {invalidCount} ta qatorda sifat/rang tanlanmagan — qatorni bosib tahrirlang.
          </p>
        )}
        <p className="text-[12px] font-normal text-[#737373]">
          Yaratilgandan keyin har bir partiyaga shtrix va QR kodli yorliq chop etiladi.
        </p>

        <DialogFooter className="mt-2 gap-2 border-t border-[#E5E5E5] pt-4 dark:border-white/10">
          {blocker && <p className="mr-auto self-center text-[12px] text-[#B45309]">{blocker}</p>}
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={() => onOpenChange(false)}
            className="h-9 gap-1.5 border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
          >
            <X className="h-4 w-4" /> Bekor qilish
          </Button>
          <Button
            type="button"
            disabled={submitting || !!blocker || pending.length === 0}
            onClick={handleCreate}
            className="h-9 gap-1.5 bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8] disabled:opacity-50"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Yaratish ({pending.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
