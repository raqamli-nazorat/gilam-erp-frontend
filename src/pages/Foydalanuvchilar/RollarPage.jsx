import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Filter, Loader2, Plus, Search } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { cn } from '@/lib/utils'
import { createRole, deleteRole, fetchRoles, updateRole } from '@/features/foydalanuvchilar/foydalanuvchilarSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Toast from '@/components/Toast'
import RoleModal from './components/RoleModal'
import RoleFilterModal, { EMPTY_ROLE_FILTERS } from './components/RoleFilterModal'

const TH =
  'sticky top-0 z-10 bg-[#F5F5F5] px-4 text-[13px] font-semibold uppercase leading-[18px] text-[#525252] dark:bg-white/5 dark:text-muted-foreground'
const TD_MUTED = 'px-4 text-[13px] text-[#737373] dark:text-muted-foreground'

export default function RollarPage() {
  const dispatch = useDispatch()
  const roles = useSelector((s) => s.foydalanuvchilar.roles)
  const rolesStatus = useSelector((s) => s.foydalanuvchilar.rolesStatus)
  const rolesError = useSelector((s) => s.foydalanuvchilar.rolesError)

  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(EMPTY_ROLE_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [editRole, setEditRole] = useState(null)
  const [toast, setToast] = useState('')

  usePageHeader([{ label: "Ma'lumotnomalar" }, { label: 'Rollar' }])

  useEffect(() => {
    if (rolesStatus === 'idle') dispatch(fetchRoles())
  }, [rolesStatus, dispatch])

  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(''), 3000)
    return () => clearTimeout(t)
  }, [toast])

  const hasFilter = Object.values(filters).some(Boolean)

  const shownRoles = useMemo(() => {
    let out = roles
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      out = out.filter((r) => r.name.toLowerCase().includes(q))
    }
    if (filters.tashkilot) {
      out = out.filter((r) => (filters.tashkilot === 'Barcha tashkilotlar' ? !r.tashkilotId : r.tashkilot === filters.tashkilot))
    }
    if (filters.holat) out = out.filter((r) => (filters.holat === 'Tizim roli' ? r.isSystem : !r.isSystem))
    const dan = Number(filters.foydalanuvchiDan) || 0
    const gacha = Number(filters.foydalanuvchiGacha) || 0
    if (dan) out = out.filter((r) => r.usersCount >= dan)
    if (gacha) out = out.filter((r) => r.usersCount <= gacha)
    return out
  }, [roles, search, filters])

  function saveRole(values) {
    const action = editRole ? updateRole({ id: editRole.id, draft: values }) : createRole(values)
    dispatch(action)
      .unwrap()
      .then(() => setToast('Saqlandi'))
      .catch((err) => setToast(err || 'Saqlashda xatolik yuz berdi'))
  }

  function removeRole() {
    dispatch(deleteRole(editRole.id))
      .unwrap()
      .then(() => setToast('O‘chirildi'))
      .catch((err) => setToast(err || 'O‘chirishda xatolik yuz berdi'))
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="relative w-[260px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Qidirish"
              className="h-9 w-[260px] rounded-lg border-[#E5E5E5] bg-white pl-9 pr-3 text-sm text-[#0A0A0A] shadow-[0px_1px_2px_0px_#0000001A] placeholder:text-[#737373] focus-visible:ring-[#0052D2] dark:border-white/10 dark:bg-card dark:text-white"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setFilterOpen(true)}
            className={cn(
              'h-9 gap-2 border-[#E5E5E5] bg-white px-4 text-sm font-medium text-[#0A0A0A] shadow-[0px_1px_2px_0px_#0000001A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-foreground',
              hasFilter && 'border-[#0052D2] text-[#0052D2]'
            )}
          >
            <Filter className="h-4 w-4" /> Filtr
          </Button>
        </div>

        <Button
          onClick={() => setAddOpen(true)}
          className="h-9 gap-2 rounded-md bg-[#0052D2] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
        >
          <Plus className="h-4 w-4" /> Qo‘shish
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto rounded-xl bg-white dark:bg-card">
        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className={cn(TH, 'h-10 w-12 text-left')}>#</th>
              <th className={cn(TH, 'h-10 text-left')}>NOMI</th>
              <th className={cn(TH, 'h-10 text-left')}>TASHKILOT</th>
              <th className={cn(TH, 'h-10 text-right')}>FOYDALANUVCHILAR</th>
              <th className={cn(TH, 'h-10 text-left')}>YARATILGAN</th>
              <th className={cn(TH, 'h-10 text-left')}>O‘ZGARTIRILGAN</th>
              <th className={cn(TH, 'h-10 text-left')}>TURI</th>
            </tr>
          </thead>
          <tbody>
            {rolesStatus === 'loading' && shownRoles.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-6 w-6 animate-spin text-[#0052D2]" />
                    <p className="text-sm text-[#737373]">Yuklanmoqda…</p>
                  </div>
                </td>
              </tr>
            ) : rolesStatus === 'failed' && shownRoles.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center">
                  <p className="text-sm text-[#DC2626]">{rolesError || 'Xatolik yuz berdi'}</p>
                </td>
              </tr>
            ) : shownRoles.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-sm text-[#737373] dark:text-muted-foreground">
                  Rol topilmadi
                </td>
              </tr>
            ) : (
              shownRoles.map((r, i) => (
                <tr
                  key={r.id}
                  onClick={() => setEditRole(r)}
                  className="h-11 cursor-pointer hover:bg-[#F9FAFB] dark:hover:bg-white/5"
                >
                  <td className={TD_MUTED}>{i + 1}</td>
                  <td className="px-4 text-[14px] font-medium text-[#0052D2] dark:text-[#60A5FA]">{r.name}</td>
                  <td className={TD_MUTED}>{r.tashkilot}</td>
                  <td className="px-4 text-right text-[13px] text-[#0A0A0A] dark:text-white">{r.usersCount}</td>
                  <td className={TD_MUTED}>{r.yaratilgan}</td>
                  <td className={TD_MUTED}>{r.ozgartirilgan}</td>
                  <td className="px-4">
                    <span
                      className={cn(
                        'inline-flex h-[22px] items-center rounded-full px-2.5 text-[11px] font-medium tracking-[0.3px]',
                        r.isSystem
                          ? 'bg-[#EAF1FE] text-[#0052D2] dark:bg-[#0052D2]/20 dark:text-[#60A5FA]'
                          : 'bg-[#F5F5F5] text-[#737373] dark:bg-white/10 dark:text-muted-foreground'
                      )}
                    >
                      {r.isSystem ? 'Tizim roli' : 'Odatiy rol'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <RoleModal open={addOpen} onOpenChange={setAddOpen} onSave={saveRole} />
      <RoleModal
        open={!!editRole}
        onOpenChange={(o) => !o && setEditRole(null)}
        role={editRole}
        onSave={saveRole}
        onDelete={() => {
          removeRole()
          setEditRole(null)
        }}
      />
      <RoleFilterModal open={filterOpen} onOpenChange={setFilterOpen} filters={filters} onApply={setFilters} />
      <Toast message={toast} />
    </div>
  )
}
