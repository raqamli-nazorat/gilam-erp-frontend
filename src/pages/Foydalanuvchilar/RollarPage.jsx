import { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Filter, Loader2, Plus, Search } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { cn } from '@/lib/utils'
import { matchesDateRange } from '@/lib/format'
import { useServerPagedList } from '@/hooks/useServerPagedList'
import { createRole, mapRole, updateRole } from '@/features/foydalanuvchilar/foydalanuvchilarSlice'
import * as roleService from '@/services/roleService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Toast from '@/components/Toast'
import RoleModal from './components/RoleModal'
import RoleFilterModal, { EMPTY_ROLE_FILTERS, GLOBAL_ROLES } from './components/RoleFilterModal'

const TH =
  'sticky top-0 z-10 bg-[#F5F5F5] px-4 text-[13px] font-semibold uppercase leading-[18px] text-[#525252] dark:bg-white/5 dark:text-muted-foreground'
const TD_MUTED = 'px-4 text-[13px] text-[#737373] dark:text-muted-foreground'

// Jadval endi "scroll pagination" bilan yuklanadi — qidiruv serverga so'rov parametri
// sifatida yuboriladi. Redux'dagi to'liq ro'yxatga (`state.foydalanuvchilar.roles`) tegilmadi
// — Foydalanuvchi shakli/filtridagi rol tanlagichlari shunga tayanadi. "Tashkilot"/"Turi"/
// foydalanuvchilar soni filtrlari uchun mos backend parametri tasdiqlanmagan — shular
// hozircha faqat YUKLANGAN qatorlar ustida ishlaydi.
function fetchRolesPage(params) {
  return roleService.getRolesPage(params).then((res) => ({ ...res, results: res.results.map(mapRole) }))
}

export default function RollarPage() {
  const dispatch = useDispatch()

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filters, setFilters] = useState(EMPTY_ROLE_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [editRole, setEditRole] = useState(null)
  const [toast, setToast] = useState('')

  usePageHeader([{ label: "Ma'lumotnomalar" }, { label: 'Rollar' }])

  // Qidiruvni 250ms kechiktirib yuboramiz — har bosilgan harfda so'rov jo'natmaslik uchun.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(''), 3000)
    return () => clearTimeout(t)
  }, [toast])

  const {
    items: roles,
    isLoading: rolesLoading,
    isLoadingMore: rolesLoadingMore,
    error: rolesError,
    hasMore: rolesHasMore,
    containerRef: rolesScrollRef,
    sentinelRef: rolesSentinelRef,
    handleScroll: handleRolesScroll,
    reload: reloadRoles,
  } = useServerPagedList(fetchRolesPage, {
    search: debouncedSearch.trim(),
    // Tashkilot va turi backendda filtrlanadi (organization, is_system) — to'liq natija.
    organization: filters.tashkilot && filters.tashkilot !== GLOBAL_ROLES ? filters.tashkilot : undefined,
    is_system: filters.holat === 'Tizim roli' ? true : filters.holat === 'Odatiy rol' ? false : undefined,
  })

  const hasFilter = Object.values(filters).some(Boolean)

  const shownRoles = useMemo(() => {
    let out = roles
    // "Barcha tashkilotlar" (tashkilotsiz umumiy rollar) uchun backendda filtr yo'q.
    if (filters.tashkilot === GLOBAL_ROLES) out = out.filter((r) => !r.tashkilotId)
    if (filters.sanaDan || filters.sanaGacha) out = out.filter((r) => matchesDateRange(r.yaratilgan, filters.sanaDan, filters.sanaGacha))
    const dan = Number(filters.foydalanuvchiDan) || 0
    const gacha = Number(filters.foydalanuvchiGacha) || 0
    if (dan) out = out.filter((r) => r.usersCount >= dan)
    if (gacha) out = out.filter((r) => r.usersCount <= gacha)
    return out
  }, [roles, filters])

  function saveRole(values) {
    const action = editRole ? updateRole({ id: editRole.id, draft: values }) : createRole(values)
    dispatch(action)
      .unwrap()
      .then(() => {
        setToast('Saqlandi')
        reloadRoles()
      })
      .catch((err) => setToast({ variant: 'error', message: err || 'Saqlashda xatolik yuz berdi' }))
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

      <div
        ref={rolesScrollRef}
        onScroll={handleRolesScroll}
        className="min-h-0 flex-1 overflow-auto rounded-xl bg-white dark:bg-card"
      >
        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className={cn(TH, 'h-10 w-12 text-left')}>#</th>
              <th className={cn(TH, 'h-10 text-left')}>NOMI</th>
              <th className={cn(TH, 'h-10 text-left')}>TASHKILOT</th>
              <th className={cn(TH, 'h-10 text-right')}>FOYDALANUVCHILAR</th>
              <th className={cn(TH, 'h-10 text-left')}>YARATILGAN</th>
              <th className={cn(TH, 'h-10 text-left')}>O‘ZGARTIRILGAN</th>
            </tr>
          </thead>
          <tbody>
            {rolesLoading && shownRoles.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-6 w-6 animate-spin text-[#0052D2]" />
                    <p className="text-sm text-[#737373]">Yuklanmoqda…</p>
                  </div>
                </td>
              </tr>
            ) : rolesError && shownRoles.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-sm text-[#DC2626]">Xatolik yuz berdi</p>
                    <Button
                      variant="outline"
                      onClick={reloadRoles}
                      className="h-8 border-[#E5E5E5] bg-white px-3 text-[13px] font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
                    >
                      Qayta urinish
                    </Button>
                  </div>
                </td>
              </tr>
            ) : shownRoles.length === 0 ? (
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
                  <td className={TD_MUTED}>{i + 1}</td>
                  <td className="px-4 text-[14px] font-medium text-[#0052D2] dark:text-[#60A5FA]">{r.name}</td>
                  <td className="px-4 text-[13px] text-[#0A0A0A] dark:text-muted-foreground">{r.tashkilot}</td>
                  <td className="px-4 text-right text-[13px] text-[#0A0A0A] dark:text-white">{r.usersCount}</td>
                  <td className={TD_MUTED}>{r.yaratilgan}</td>
                  <td className={TD_MUTED}>{r.ozgartirilgan}</td>
                </tr>
              ))
            )}
            {shownRoles.length > 0 && rolesHasMore && !rolesLoading && (
              <tr ref={rolesSentinelRef} className="h-1 border-0 p-0">
                <td colSpan={6} className="h-1 border-0 p-0" />
              </tr>
            )}
            {rolesLoadingMore && (
              <tr>
                <td colSpan={6} className="py-4 text-center">
                  <div className="inline-flex items-center gap-2 text-xs font-medium text-[#737373] dark:text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin text-[#0052D2]" />
                    Ko‘proq ma’lumotlar yuklanmoqda…
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <RoleModal open={addOpen} onOpenChange={setAddOpen} onSave={saveRole} />
      <RoleModal open={!!editRole} onOpenChange={(o) => !o && setEditRole(null)} role={editRole} onSave={saveRole} />
      <RoleFilterModal open={filterOpen} onOpenChange={setFilterOpen} filters={filters} onApply={setFilters} />
      <Toast message={toast} />
    </div>
  )
}
