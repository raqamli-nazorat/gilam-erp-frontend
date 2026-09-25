import { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Filter, Loader2, Plus, Search, Users } from 'lucide-react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Copy01Icon, UserGroupIcon } from '@hugeicons/core-free-icons/index'
import { usePageHeader } from '@/hooks/usePageHeader'
import { cn } from '@/lib/utils'
import { matchesDateRange } from '@/lib/format'
import { useServerPagedList } from '@/hooks/useServerPagedList'
import { useTabCounts } from '@/hooks/useTabCounts'
import { holatLabel } from '@/features/foydalanuvchilar/foydalanuvchilarData'
import { createUser, mapUser } from '@/features/foydalanuvchilar/foydalanuvchilarSlice'
import * as userService from '@/services/userService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Toast from '@/components/Toast'
import UserModal from './components/UserModal'
import UserFilterModal, { EMPTY_USER_FILTERS } from './components/UserFilterModal'

const TH =
  'sticky top-0 z-10 h-10 bg-[#F5F5F5] px-4 text-[13px] font-semibold uppercase leading-[18px] text-[#737373] dark:bg-white/5 dark:text-muted-foreground'

// Jadval "scroll pagination" bilan yuklanadi — qidiruv va tab/"Holat" (backend `is_blocked`
// filtri) serverga so'rov parametri sifatida yuboriladi. Tab hisoblagichlari endi barcha
// foydalanuvchilarni yuklab sanalmaydi — "Barchasi" jadval so'rovining o'z `count`idan,
// Faol/Bloklangan esa bittadan 1-sahifa so'rovidan olinadi (useTabCounts). "Tashkilot"/"Filial"/"Rol"/sana filtrlari
// yuklangan qatorlar ustida ishlaydi.
function fetchUsersPage(params) {
  return userService.getUsersPage(params).then((res) => ({ ...res, results: res.results.map(mapUser) }))
}

export default function FoydalanuvchilarListPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filters, setFilters] = useState(EMPTY_USER_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [toast, setToast] = useState('')

  usePageHeader('Platforma › Foydalanuvchilar')


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

  function copyPhone(e, phone) {
    e.stopPropagation()
    navigator.clipboard?.writeText(String(phone))
    setToast('Telefon nusxalandi')
  }

  const hasFilter = Object.values(filters).some(Boolean)
  const isBlockedParam = tab === 'all' ? undefined : tab === 'blocked'

  const {
    items: pagedUsers,
    totalCount,
    isLoading: usersLoading,
    isLoadingMore: usersLoadingMore,
    error: usersError,
    hasMore: usersHasMore,
    containerRef: usersScrollRef,
    sentinelRef: usersSentinelRef,
    handleScroll: handleUsersScroll,
    reload: reloadUsers,
  } = useServerPagedList(fetchUsersPage, {
    search: debouncedSearch.trim(),
    is_blocked: isBlockedParam,
  })

  // Tab hisoblagichlari — sahifaga kirganda hammasi ko'rinadi: ochiq tab jadvalning o'z `count`idan,
  // qolganlari bittadan 1-sahifa so'rovi bilan (useTabCounts).
  const countTab = isBlockedParam === undefined ? 'all' : isBlockedParam ? 'blocked' : 'active'
  const counts = useTabCounts(
    userService.getUsersPage,
    { search: debouncedSearch.trim() },
    { active: { is_blocked: false }, blocked: { is_blocked: true } },
    countTab,
    totalCount,
    usersLoading
  )

  const shown = useMemo(() => {
    let out = pagedUsers
    if (filters.tashkilot) out = out.filter((u) => u.tashkilot === filters.tashkilot)
    if (filters.filial) out = out.filter((u) => u.filial === filters.filial)
    if (filters.rol) out = out.filter((u) => u.rol === filters.rol)
    if (filters.holat) out = out.filter((u) => (filters.holat === 'Faol' ? u.holat === 'active' : u.holat === 'blocked'))
    if (filters.sanaDan || filters.sanaGacha)
      out = out.filter((u) => matchesDateRange(u.yaratilgan, filters.sanaDan, filters.sanaGacha))
    return out
  }, [pagedUsers, filters])

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-0.5 rounded-lg bg-[#F5F5F5] p-1 dark:bg-white/5">
          {[
            ['all', 'Barchasi', counts.all],
            ['active', 'Faol', counts.active],
            ['blocked', 'Bloklangan', counts.blocked],
          ].map(([key, label, n]) => {
            const active = tab === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={cn(
                  'flex h-7 items-center gap-1.5 rounded-[7px] px-2 text-[13px] font-medium transition-colors',
                  active
                    ? 'bg-white text-[#0A0A0A] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] dark:bg-card dark:text-white'
                    : 'text-[#737373] hover:text-[#0A0A0A] dark:text-muted-foreground dark:hover:text-white'
                )}
              >
                {label}
                {n != null && (
                  <span
                    className={cn(
                      'inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1.5 text-[12px] font-medium',
                      active
                        ? 'bg-[#EAF1FE] text-[#0052D2] dark:bg-[#0052D2]/20 dark:text-[#60A5FA]'
                        : 'text-[#A3A3A3] dark:text-muted-foreground'
                    )}
                  >
                    {n}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div className="flex flex-1 items-center justify-end gap-2.5">
          <div className="relative w-[280px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="F.I.SH. yoki telefon…"
              className="h-9 w-[280px] rounded-md border-[#E5E5E5] bg-white pl-9 pr-3 text-sm text-[#0A0A0A] shadow-[0px_1px_2px_0px_#0000001A] placeholder:text-[#737373] focus-visible:ring-[#0052D2] dark:border-white/10 dark:bg-card dark:text-white"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/malumotnomalar/rollar')}
            className="h-9 gap-2 border-[#E5E5E5] bg-white px-4 text-sm font-medium text-[#0A0A0A] shadow-[0px_1px_2px_0px_#0000001A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-foreground"
          >
            <HugeiconsIcon icon={UserGroupIcon} size={16} strokeWidth={2} /> Rollar
          </Button>
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
            onClick={() => setModalOpen(true)}
            className="h-9 gap-2 rounded-md bg-[#0052D2] px-4 text-sm font-medium text-white hover:bg-[#0047B8]"
          >
            <Plus className="h-4 w-4" /> Qo'shish
          </Button>
        </div>
      </div>

      <div
        ref={usersScrollRef}
        onScroll={handleUsersScroll}
        className="min-h-0 flex-1 overflow-auto rounded-xl bg-white dark:bg-card"
      >
        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className={cn(TH, 'w-12 text-left')}>#</th>
              <th className={cn(TH, 'text-left')}>F.I.SH.</th>
              <th className={cn(TH, 'text-left')}>TELEFON</th>
              <th className={cn(TH, 'text-left')}>TASHKILOT</th>
              <th className={cn(TH, 'text-left')}>FILIAL</th>
              <th className={cn(TH, 'text-left')}>ROL</th>
              <th className={cn(TH, 'text-left')}>HOLAT</th>
            </tr>
          </thead>
          <tbody>
              {usersLoading && shown.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-6 w-6 animate-spin text-[#0052D2]" />
                      <p className="text-sm text-[#737373]">Yuklanmoqda…</p>
                    </div>
                  </td>
                </tr>
              ) : usersError && shown.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <p className="text-sm text-[#DC2626]">Xatolik yuz berdi</p>
                      <Button
                        variant="outline"
                        onClick={reloadUsers}
                        className="h-8 border-[#E5E5E5] bg-white px-3 text-[13px] font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
                      >
                        Qayta urinish
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : shown.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F5F5F5] dark:bg-white/5">
                        <Users className="h-6 w-6 text-[#737373]" />
                      </div>
                      <p className="text-sm text-[#737373]">Foydalanuvchi topilmadi</p>
                    </div>
                  </td>
                </tr>
              ) : (
                shown.map((u, i) => (
                  <tr
                    key={u.id}
                    onClick={() => navigate(`/foydalanuvchilar/${u.id}`)}
                    className="h-11 cursor-pointer hover:bg-[#F9FAFB] dark:hover:bg-white/5"
                  >
                    <td className="px-4 text-[13px] text-[#737373] dark:text-muted-foreground">{i + 1}</td>
                    <td className="px-4 text-[14px] font-medium text-[#0052D2] dark:text-[#60A5FA]">{u.name}</td>
                    <td className="px-4 text-[13px] text-[#737373] dark:text-muted-foreground">
                      {u.phone ? (
                        <span className="inline-flex items-center gap-1.5">
                          {u.phone}
                          <button
                            type="button"
                            onClick={(e) => copyPhone(e, u.phone)}
                            className="text-[#737373] transition-colors hover:text-[#0052D2] dark:hover:text-[#60A5FA]"
                            aria-label="Nusxa olish"
                          >
                            <HugeiconsIcon icon={Copy01Icon} size={16} strokeWidth={2} />
                          </button>
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 text-[13px] text-[#525252] dark:text-muted-foreground">{u.tashkilot}</td>
                    <td className="px-4 text-[13px] text-[#525252] dark:text-muted-foreground">{u.filial}</td>
                    <td className="px-4 text-[13px] text-[#0A0A0A] dark:text-white">{u.rol}</td>
                    <td className="px-4">
                      <span
                        className={cn(
                          'inline-flex h-[22px] items-center rounded-full px-2.5 text-[11px] font-medium tracking-[0.3px]',
                          u.holat === 'active'
                            ? 'bg-[#E6FAF1] text-[#047A47] dark:bg-[#047A47]/20 dark:text-[#34D399]'
                            : 'bg-[#FEECEC] text-[#DC2626] dark:bg-[#DC2626]/15 dark:text-[#F87171]'
                        )}
                      >
                        {holatLabel(u.holat)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
              {shown.length > 0 && usersHasMore && !usersLoading && (
                <tr ref={usersSentinelRef} className="h-1 border-0 p-0">
                  <td colSpan={7} className="h-1 border-0 p-0" />
                </tr>
              )}
              {usersLoadingMore && (
                <tr>
                  <td colSpan={7} className="py-4 text-center">
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

      <UserModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        user={null}
        onSave={(values) => {
          dispatch(createUser(values))
            .unwrap()
            .then((created) => navigate(`/foydalanuvchilar/${created.id}`))
            .catch((err) => setToast(err || 'Saqlashda xatolik yuz berdi'))
        }}
      />
      <UserFilterModal open={filterOpen} onOpenChange={setFilterOpen} filters={filters} onApply={setFilters} />

      <Toast message={toast} />
    </div>
  )
}
