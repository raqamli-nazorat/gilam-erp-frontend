import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Check, Loader2, Trash2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fetchOrganizations } from '@/features/tashkilotlar/tashkilotlarSlice'
import { fetchPermissions } from '@/features/foydalanuvchilar/foydalanuvchilarSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const fieldCls =
  'h-9 w-full rounded-[8px] border border-[#E5E5E5] bg-white px-3 text-[14px] font-normal text-[#0A0A0A] shadow-[0px_1px_2px_0px_#0000001A] placeholder:text-[#737373] dark:border-white/10 dark:bg-card dark:text-white'
const labelCls = 'mb-1.5 block text-[12px] font-medium leading-4 text-[#525252] dark:text-muted-foreground'

// tashkilot bu yerda backend UUID'i (bo'sh = "Barcha tashkilotlar" / tizim darajasidagi rol)
const EMPTY = { name: '', tashkilot: '', permissions: [] }

export default function RoleModal({ open, onOpenChange, role, onSave, onDelete }) {
  const isEdit = !!role
  const [draft, setDraft] = useState(EMPTY)
  const dispatch = useDispatch()

  const orgs = useSelector((s) => s.tashkilotlar.list)
  const orgsStatus = useSelector((s) => s.tashkilotlar.listStatus)
  const permissions = useSelector((s) => s.foydalanuvchilar.permissions)
  const permissionsStatus = useSelector((s) => s.foydalanuvchilar.permissionsStatus)

  useEffect(() => {
    if (!open) return
    if (orgsStatus === 'idle') dispatch(fetchOrganizations())
    if (!isEdit) dispatch(fetchPermissions())
    setDraft(
      role
        ? { name: role.name ?? '', tashkilot: role.tashkilotId ?? '', permissions: [] }
        : EMPTY
    )
  }, [open, role, dispatch, orgsStatus, isEdit])

  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }))
  const togglePermission = (id) =>
    setDraft((d) => ({
      ...d,
      permissions: d.permissions.includes(id) ? d.permissions.filter((p) => p !== id) : [...d.permissions, id],
    }))
  const canSave = draft.name.trim().length > 1

  function handleSave() {
    // Tahrirlashda "permissions" umuman yuborilmaydi — backend joriy ruxsatlarni qaytarmagani
    // uchun uni tasodifan bo'shatib qo'ymaslik uchun faqat yaratishda yuboriladi.
    const payload = isEdit
      ? { name: draft.name.trim(), tashkilot: draft.tashkilot }
      : { name: draft.name.trim(), tashkilot: draft.tashkilot, permissions: draft.permissions }
    onSave(payload)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-full gap-0 overflow-hidden rounded-[12px] p-0 shadow-[0px_12px_24px_-6px_#01091C24] ring-0 sm:max-w-[560px] dark:bg-card"
      >
        <div className="flex h-[60px] shrink-0 items-center justify-between gap-2 pl-6 pr-4">
          <DialogTitle className="text-[18px] font-semibold leading-6 text-[#0A0A0A] dark:text-white">
            {isEdit ? 'Tahrirlash' : 'Yangi rol'}
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

        <div className="max-h-[70vh] overflow-auto px-6 pb-6 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label className={labelCls}>Rol nomi</Label>
              <Input
                value={draft.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Masalan: Katta kassir"
                className={fieldCls}
              />
            </div>

            <div className="col-span-2">
              <Label className={labelCls}>Tashkilot</Label>
              <Select value={draft.tashkilot || '__none'} onValueChange={(v) => set('tashkilot', v === '__none' ? '' : v)}>
                <SelectTrigger className={fieldCls}>
                  <SelectValue>
                    {(v) => {
                      if (v === '__none') return 'Barcha tashkilotlar'
                      return orgs.find((o) => o.id === v)?.name ?? ''
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">Barcha tashkilotlar</SelectItem>
                  {orgsStatus === 'loading' ? (
                    <div className="flex items-center gap-2 px-3 py-2 text-sm text-[#737373]">
                      <Loader2 className="h-4 w-4 animate-spin" /> Yuklanmoqda…
                    </div>
                  ) : (
                    orgs.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {!isEdit ? (
            <div className="mt-4">
              <Label className={labelCls}>Ruxsatlar</Label>
              <div className="grid max-h-[240px] grid-cols-2 gap-x-3 gap-y-1.5 overflow-auto rounded-[8px] border border-[#E5E5E5] p-3 dark:border-white/10">
                {permissionsStatus === 'loading' ? (
                  <div className="col-span-2 flex items-center justify-center gap-2 py-4 text-sm text-[#737373]">
                    <Loader2 className="h-4 w-4 animate-spin" /> Yuklanmoqda…
                  </div>
                ) : (
                  permissions.map((p) => (
                    <label key={p.id} className="flex cursor-pointer items-center gap-2 py-0.5 text-[13px] text-[#0A0A0A] dark:text-white">
                      <input
                        type="checkbox"
                        checked={draft.permissions.includes(p.id)}
                        onChange={() => togglePermission(p.id)}
                        className="size-4 accent-[#0052D2]"
                      />
                      {p.name}
                    </label>
                  ))
                )}
              </div>
            </div>
          ) : (
            <p className="mt-4 text-[12px] text-[#737373] dark:text-muted-foreground">
              Ruxsatlarni tahrirlash hozircha qo‘llab-quvvatlanmaydi (backend joriy ruxsatlarni qaytarmaydi).
            </p>
          )}
        </div>

        <div className={cn('flex h-[72px] shrink-0 items-center gap-2 bg-[#F5F5F5] px-6 dark:bg-white/5', isEdit && !role?.isSystem ? 'justify-between' : 'justify-end')}>
          {isEdit && !role?.isSystem && (
            <Button
              type="button"
              onClick={() => onDelete?.()}
              className="h-9 gap-2 rounded-[8px] bg-[#DC2626] px-4 text-[14px] font-medium text-white shadow-[0px_1px_2px_0px_#0000001A] hover:bg-[#B91C1C]"
            >
              <Trash2 className="size-4" /> O‘chirish
            </Button>
          )}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-9 gap-2 rounded-[8px] border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#0A0A0A] shadow-[0px_1px_2px_0px_#0000001A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
            >
              <X className="size-4" /> Bekor qilish
            </Button>
            <Button
              type="button"
              disabled={!canSave}
              onClick={handleSave}
              className="h-9 gap-2 rounded-[8px] bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0px_1px_2px_0px_#0000001A] hover:bg-[#0047B8] disabled:bg-[#E5E5E5] disabled:text-[#A3A3A3] disabled:opacity-100 dark:disabled:bg-white/10"
            >
              <Check className="size-4" /> Saqlash
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
