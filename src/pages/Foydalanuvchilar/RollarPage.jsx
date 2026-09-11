import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Filter, Plus } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { cn } from '@/lib/utils'
import { roleAdded, roleUpdated } from '@/features/foydalanuvchilar/foydalanuvchilarSlice'
import { Button } from '@/components/ui/button'
import RoleModal from './components/RoleModal'
import RoleFilterModal, { EMPTY_ROLE_FILTERS } from './components/RoleFilterModal'

const TH =
  'sticky top-0 z-10 h-10 bg-[#F5F5F5] px-4 text-[13px] font-semibold uppercase leading-[18px] text-[#737373] dark:bg-white/5 dark:text-muted-foreground'

export default function RollarPage() {
  const dispatch = useDispatch()
  const roles = useSelector((s) => s.foydalanuvchilar.roles)
  const users = useSelector((s) => s.foydalanuvchilar.list)

  const [filters, setFilters] = useState(EMPTY_ROLE_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [editRole, setEditRole] = useState(null)

  usePageHeader([{ label: "Ma'lumotnomalar" }, { label: 'Rollar' }])

  const countOf = (name) => users.filter((u) => u.rol === name).length
  const hasFilter = Object.values(filters).some(Boolean)

  const shownRoles = useMemo(() => {
    let out = roles
    if (filters.tashkilot) out = out.filter((r) => r.tashkilot === filters.tashkilot)
    if (filters.holat) out = out.filter((r) => (filters.holat === 'Faol' ? r.holat === 'active' : r.holat !== 'active'))
    const dan = Number(filters.foydalanuvchiDan) || 0
    const gacha = Number(filters.foydalanuvchiGacha) || 0
    if (dan) out = out.filter((r) => countOf(r.name) >= dan)
    if (gacha) out = out.filter((r) => countOf(r.name) <= gacha)
    return out
  }, [roles, filters]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="relative flex items-center gap-1.5 pb-2.5 pt-1 text-sm font-medium text-[#0A0A0A] dark:text-white">
          Rollar
          <span className="inline-flex h-[18px] min-w-[22px] items-center justify-center rounded-full bg-[#EAF1FE] px-1.5 text-[12px] font-medium text-[#0052D2] dark:bg-[#0052D2]/20 dark:text-[#60A5FA]">
            {shownRoles.length}
          </span>
          <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#0052D2]" />
        </div>
        <div className="flex items-center gap-2.5">
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
          <Button
            onClick={() => setAddOpen(true)}
            className="h-9 gap-2 rounded-md bg-[#0052D2] px-4 text-sm font-medium text-white hover:bg-[#0047B8]"
          >
            <Plus className="h-4 w-4" /> Qo'shish
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto rounded-xl bg-white dark:bg-card">
        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className={cn(TH, 'w-12 text-left')}>#</th>
              <th className={cn(TH, 'text-left')}>NOMI</th>
              <th className={cn(TH, 'text-right')}>FOYDALANUVCHILAR</th>
              <th className={cn(TH, 'text-left')}>YARATILGAN</th>
              <th className={cn(TH, 'text-left')}>O‘ZGARTIRILGAN</th>
              <th className={cn(TH, 'text-left')}>HOLAT</th>
            </tr>
          </thead>
          <tbody>
            {shownRoles.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-sm text-[#737373] dark:text-muted-foreground">
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
                  <td className="px-4 text-[13px] text-[#737373] dark:text-muted-foreground">{i + 1}</td>
                  <td className="px-4 text-[14px] font-medium text-[#0052D2] dark:text-[#60A5FA]">{r.name}</td>
                  <td className="px-4 text-right text-[13px] text-[#0A0A0A] dark:text-white">{countOf(r.name)}</td>
                  <td className="px-4 text-[13px] text-[#737373] dark:text-muted-foreground">{r.yaratilgan}</td>
                  <td className="px-4 text-[13px] text-[#737373] dark:text-muted-foreground">{r.ozgartirilgan}</td>
                  <td className="px-4">
                    <span
                      className={cn(
                        'inline-flex h-[22px] items-center rounded-full px-2.5 text-[11px] font-medium tracking-[0.3px]',
                        r.holat === 'active'
                          ? 'bg-[#E6FAF1] text-[#047A47] dark:bg-[#047A47]/20 dark:text-[#34D399]'
                          : 'bg-[#F5F5F5] text-[#737373] dark:bg-white/10 dark:text-muted-foreground'
                      )}
                    >
                      {r.holat === 'active' ? 'Faol' : 'Nofaol'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <RoleModal open={addOpen} onOpenChange={setAddOpen} onSave={(values) => dispatch(roleAdded(values))} />
      <RoleModal
        open={!!editRole}
        onOpenChange={(o) => !o && setEditRole(null)}
        role={editRole}
        onSave={(values) => editRole && dispatch(roleUpdated({ id: editRole.id, patch: values }))}
      />
      <RoleFilterModal open={filterOpen} onOpenChange={setFilterOpen} filters={filters} onApply={setFilters} />
    </div>
  )
}
