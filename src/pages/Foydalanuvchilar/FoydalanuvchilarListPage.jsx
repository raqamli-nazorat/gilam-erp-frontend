import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Filter, Loader2, Plus, Search, Users } from 'lucide-react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Copy01Icon, UserGroupIcon } from '@hugeicons/core-free-icons/index'
import { usePageHeader } from '@/hooks/usePageHeader'
import { cn } from '@/lib/utils'
import { matchesDateRange } from '@/lib/format'
import { holatLabel } from '@/features/foydalanuvchilar/foydalanuvchilarData'
import { createUser, fetchUsers } from '@/features/foydalanuvchilar/foydalanuvchilarSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Toast from '@/components/Toast'
import UserModal from './components/UserModal'
import UserFilterModal, { EMPTY_USER_FILTERS } from './components/UserFilterModal'

const TH =
  'sticky top-0 z-10 h-10 bg-[#F5F5F5] px-4 text-[13px] font-semibold uppercase leading-[18px] text-[#737373] dark:bg-white/5 dark:text-muted-foreground'

export default function FoydalanuvchilarListPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const users = useSelector((s) => s.foydalanuvchilar.list)
  const listStatus = useSelector((s) => s.foydalanuvchilar.listStatus)
  const listError = useSelector((s) => s.foydalanuvchilar.listError)

  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(EMPTY_USER_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [toast, setToast] = useState('')

  usePageHeader('Platforma › Foydalanuvchilar')

  useEffect(() => {
    if (listStatus === 'idle') dispatch(fetchUsers())
  }, [listStatus, dispatch])

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

  const counts = useMemo(
    () => ({
      all: users.length,
      active: users.filter((u) => u.holat === 'active').length,
      blocked: users.filter((u) => u.holat === 'blocked').length,
    }),
    [users]
  )
  const hasFilter = Object.values(filters).some(Boolean)

  const shown = useMemo(() => {
    let out = users
    if (tab === 'active') out = out.filter((u) => u.holat === 'active')
    if (tab === 'blocked') out = out.filter((u) => u.holat === 'blocked')
    if (search) {
      const q = search.trim().toLowerCase()
      out = out.filter((u) => u.name.toLowerCase().includes(q) || u.phone.replace(/\D/g, '').includes(q.replace(/\D/g, '')))
    }
    if (filters.tashkilot) out = out.filter((u) => u.tashkilot === filters.tashkilot)
    if (filters.filial) out = out.filter((u) => u.filial === filters.filial)
    if (filters.rol) out = out.filter((u) => u.rol === filters.rol)
    if (filters.holat) out = out.filter((u) => (filters.holat === 'Faol' ? u.holat === 'active' : u.holat === 'blocked'))
    if (filters.sanaDan || filters.sanaGacha)
      out = out.filter((u) => matchesDateRange(u.yaratilgan, filters.sanaDan, filters.sanaGacha))
    return out
  }, [users, tab, search, filters])

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
            <Plus className="h-4 w-4" /> Yangi foydalanuvchi
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto rounded-xl bg-white dark:bg-card">
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
              {listStatus === 'loading' ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-6 w-6 animate-spin text-[#0052D2]" />
                      <p className="text-sm text-[#737373]">Yuklanmoqda…</p>
                    </div>
                  </td>
                </tr>
              ) : listStatus === 'failed' ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <p className="text-sm text-[#DC2626]">{listError || 'Xatolik yuz berdi'}</p>
                      <Button
                        variant="outline"
                        onClick={() => dispatch(fetchUsers())}
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
