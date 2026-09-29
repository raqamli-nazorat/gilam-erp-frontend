import { useEffect, useMemo, useState } from 'react'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { isValidUzPhone } from '@/lib/format'
import { PagedSelect } from '@/components/ui/paged-select'
import { branchOptions, employeeOptions, organizationOptions, roleOptions } from '@/services/optionSources'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PhoneInput } from '@/components/ui/phone-input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const fieldCls =
  'h-9 w-full rounded-lg border-[#E5E5E5] bg-white px-3.5 text-[15px] font-normal text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.06)] placeholder:text-[#737373] dark:border-white/10 dark:bg-card dark:text-white'
const labelCls = 'mb-2 block text-[14px] font-normal leading-[18px] text-[#3F3F46] dark:text-muted-foreground'

// tashkilot/filial/rol/employee bu yerda backend UUID'lari sifatida saqlanadi
const EMPTY = {
  employeeId: '',
  name: '',
  tashkilot: '',
  tashkilotName: '',
  filial: '',
  filialName: '',
  rol: '',
  rolName: '',
  holat: 'Faol',
  phone: '',
  password: '',
}

// user: null (yangi) | { ...record, tashkilotId, filialId, rolId, holat: 'active'|'blocked' }
export default function UserModal({ open, onOpenChange, user, onSave }) {
  const isEdit = !!user
  const [draft, setDraft] = useState(EMPTY)

  useEffect(() => {
    if (!open) return
    if (user) {
      setDraft({
        employeeId: user.employeeId ?? '',
        name: user.name ?? '',
        tashkilot: user.tashkilotId ?? '',
        tashkilotName: typeof user.tashkilot === 'object' ? user.tashkilot?.name ?? '' : user.tashkilot ?? '',
        filial: user.filialId ?? '',
        filialName: typeof user.filial === 'object' ? user.filial?.name ?? '' : user.filial ?? '',
        rol: user.rolId ?? '',
        rolName: user.rol ?? '',
        holat: user.holat === 'blocked' ? 'Bloklangan' : 'Faol',
        phone: user.phone ?? '',
        password: '',
      })
    } else {
      setDraft(EMPTY)
    }
  }, [open, user])

  const set = (k, v) =>
    setDraft((d) => {
      const next = { ...d, [k]: v }
      if (k === 'tashkilot' && v !== d.tashkilot) {
        next.filial = ''
        next.filialName = ''
      }
      return next
    })

  const baseline = useMemo(() => {
    if (!user) return null
    return {
      employeeId: user.employeeId ?? '',
      name: user.name ?? '',
      tashkilot: user.tashkilotId ?? '',
      filial: user.filialId ?? '',
      rol: user.rolId ?? '',
      holat: user.holat === 'blocked' ? 'Bloklangan' : 'Faol',
      phone: user.phone ?? '',
    }
  }, [user])

  const dirty = useMemo(() => {
    if (!baseline) return true
    return (
      draft.employeeId !== baseline.employeeId ||
      draft.name !== baseline.name ||
      draft.tashkilot !== baseline.tashkilot ||
      draft.filial !== baseline.filial ||
      draft.rol !== baseline.rol ||
      draft.holat !== baseline.holat ||
      draft.phone !== baseline.phone
    )
  }, [draft, baseline])

  const canSave =
    dirty &&
    (draft.name.trim().length > 1 || !!draft.employeeId) &&
    !!draft.tashkilot &&
    !!draft.filial &&
    !!draft.rol &&
    !!draft.phone &&
    isValidUzPhone(draft.phone) &&
    (isEdit || draft.password.trim().length >= 8)

  function handleSave() {
    onSave({ ...draft, name: draft.name.trim() })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 rounded-[20px] p-0 sm:max-w-[600px]">
        <DialogHeader className="flex flex-row items-center justify-between px-6 pb-2 pt-6">
          <DialogTitle className="text-[20px] font-semibold leading-[28px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            {isEdit ? 'Foydalanuvchi' : 'Yangi foydalanuvchi'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-x-6 gap-y-5 px-6 pb-4 pt-2">
          <div className="col-span-2">
            <Label className={labelCls}>F.I.SH. (Xodim)</Label>
            <PagedSelect
              value={draft.employeeId}
              onChange={(v, item) =>
                setDraft((d) => ({
                  ...d,
                  employeeId: v,
                  name: item?.name ?? '',
                  ...(item?.phone ? { phone: item.phone } : {}),
                  ...(item?.organizationId ? { tashkilot: item.organizationId, tashkilotName: item.organizationName } : {}),
                  ...(item?.branchId ? { filial: item.branchId, filialName: item.branchName } : {}),
                }))
              }
              fetchPage={employeeOptions}
              selectedLabel={draft.name}
              placeholder="Xodimni tanlang"
              className={fieldCls}
            />
          </div>

          <div>
            <Label className={labelCls}>Tashkilot</Label>
            <PagedSelect
              value={draft.tashkilot}
              onChange={(v, item) =>
                setDraft((d) => ({
                  ...d,
                  tashkilot: v,
                  tashkilotName: item?.name ?? '',
                }))
              }
              fetchPage={organizationOptions}
              disabled={true}
              selectedLabel={draft.tashkilotName}
              placeholder="Xodimdan olinadi"
              className={fieldCls}
            />
          </div>
          <div>
            <Label className={labelCls}>Filial</Label>
            <PagedSelect
              value={draft.filial}
              onChange={(v, item) =>
                setDraft((d) => ({
                  ...d,
                  filial: v,
                  filialName: item?.name ?? '',
                }))
              }
              fetchPage={branchOptions}
              disabled={true}
              selectedLabel={draft.filialName}
              placeholder="Xodimdan olinadi"
              className={fieldCls}
            />
          </div>

          <div>
            <Label className={labelCls}>Rol</Label>
            <PagedSelect
              value={draft.rol}
              onChange={(v, item) =>
                setDraft((d) => ({
                  ...d,
                  rol: v,
                  rolName: item?.name ?? '',
                }))
              }
              fetchPage={roleOptions}
              selectedLabel={draft.rolName}
              placeholder="Rolni tanlang"
              className={fieldCls}
            />
          </div>
          <div>
            <Label className={labelCls}>Holat</Label>
            <Select value={draft.holat} onValueChange={(v) => set('holat', v)}>
              <SelectTrigger className={fieldCls}>
                <SelectValue>{draft.holat}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Faol">Faol</SelectItem>
                <SelectItem value="Bloklangan">Bloklangan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2">
            <Label className={labelCls}>Telefon</Label>
            <PhoneInput value={draft.phone} onChange={(v) => set('phone', v)} className={fieldCls} />
          </div>

          {!isEdit && (
            <div className="col-span-2">
              <Label className={labelCls}>Parol</Label>
              <Input
                type="password"
                value={draft.password}
                onChange={(e) => set('password', e.target.value)}
                placeholder="Kamida 8 belgi"
                className={fieldCls}
              />
            </div>
          )}
        </div>

        <DialogFooter className="mx-0 mb-0 mt-2 gap-2.5 rounded-b-[20px] border-t-0 bg-[#F5F5F5] px-6 py-4 dark:bg-white/5 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-11 gap-2 rounded-lg border border-[#E5E5E5] bg-white px-5 text-[15px] font-medium text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
          >
            <X className="h-4 w-4" /> Bekor qilish
          </Button>
          <Button
            type="button"
            disabled={!canSave}
            onClick={handleSave}
            className="h-11 gap-2 rounded-lg bg-[#0052D2] px-5 text-[15px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8] disabled:bg-[#E5E5E5] disabled:text-[#A3A3A3] disabled:opacity-100 dark:disabled:bg-white/10"
          >
            <Check className="h-4 w-4" /> Saqlash
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
