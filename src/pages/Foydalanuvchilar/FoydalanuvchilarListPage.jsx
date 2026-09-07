import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Filter, Plus, Search, Shield, Users } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { cn } from '@/lib/utils'
import { holatLabel } from '@/features/foydalanuvchilar/foydalanuvchilarData'
import { userAdded } from '@/features/foydalanuvchilar/foydalanuvchilarSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import UserModal from './components/UserModal'
import UserFilterModal, { EMPTY_USER_FILTERS } from './components/UserFilterModal'

const TH =
  'sticky top-0 z-10 h-10 bg-[#F5F5F5] px-4 text-[13px] font-semibold uppercase leading-[18px] text-[#737373] dark:bg-white/5 dark:text-muted-foreground'

// "14.02.2024 10:24" -> Date
function parseDateTime(s) {
  const m = String(s ?? '').match(/^(\d{2})\.(\d{2})\.(\d{4})/)
  if (!m) return null
  return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]))
}

function matchesSanaFilter(yaratilgan, preset) {
  if (!preset) return true
  const d = parseDateTime(yaratilgan)
  if (!d) return false
  const now = new Date()
  if (preset === 'Bugun') return d.toDateString() === now.toDateString()
  if (preset === 'Shu hafta') {
    const diff = (now - d) / (1000 * 60 * 60 * 24)
    return diff >= 0 && diff <= 7
  }
  if (preset === 'Shu oy') return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  if (preset === 'Shu yil') return d.getFullYear() === now.getFullYear()
  return true
}

export default function FoydalanuvchilarListPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const users = useSelector((s) => s.foydalanuvchilar.list)

  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(EMPTY_USER_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  usePageHeader('Platforma › Foydalanuvchilar')

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
    if (filters.sana) out = out.filter((u) => matchesSanaFilter(u.yaratilgan, filters.sana))
    return out
  }, [users, tab, search, filters])

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E5E5] pb-2 dark:border-white/10">
        <div className="flex items-center gap-6">
          {[
            ['all', 'Barchasi', counts.all],
            ['active', 'Faol', counts.active],
            ['blocked', 'Bloklangan', counts.blocked],
          ].map(([key, label, n]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                'relative flex items-center gap-1.5 pb-2.5 pt-1 text-sm transition-colors',
                tab === key
                  ? 'font-medium text-[#0A0A0A] dark:text-white'
                  : 'font-normal text-[#737373] hover:text-[#0A0A0A] dark:text-muted-foreground'
              )}
            >
              {label}
              <span
                className={cn(
                  'inline-flex h-[18px] min-w-[22px] items-center justify-center rounded-full px-1.5 text-[12px] font-medium',
                  tab === key
                    ? 'bg-[#EAF1FE] text-[#0052D2] dark:bg-[#0052D2]/20 dark:text-[#60A5FA]'
                    : 'bg-[#F5F5F5] text-[#737373] dark:bg-white/10 dark:text-muted-foreground'
                )}
              >
                {n}
              </span>
              {tab === key && <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#0052D2]" />}
            </button>
          ))}
        </div>

        <div className="flex flex-1 items-center justify-end gap-2.5">
          <div className="relative w-[300px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="F.I.SH. yoki telefon…"
              className="h-9 w-[300px] rounded-md border-[#E5E5E5] bg-white pl-9 pr-3 text-sm text-[#0A0A0A] placeholder:text-[#737373] focus-visible:ring-[#0052D2] dark:border-white/10 dark:bg-card dark:text-white"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/foydalanuvchilar/rollar')}
            className="h-9 gap-2 border-[#E5E5E5] bg-white px-4 text-sm font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-foreground"
          >
            <Shield className="h-4 w-4" /> Rollar
          </Button>
          <Button
            variant="outline"
            onClick={() => setFilterOpen(true)}
            className={cn(
              'h-9 gap-2 border-[#E5E5E5] bg-white px-4 text-sm font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-foreground',
              hasFilter && 'border-[#0052D2] text-[#0052D2]'
            )}
          >
            <Filter className="h-4 w-4" /> Filtr
          </Button>
          <Button
            onClick={() => setModalOpen(true)}
            className="h-9 gap-2 rounded-md bg-[#0052D2] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
          >
            <Plus className="h-4 w-4" /> Yangi foydalanuvchi
          </Button>
        </div>
      </div>

      <p className="text-[12px] font-semibold uppercase tracking-[0.4px] text-[#737373] dark:text-muted-foreground">
        Foydalanuvchilar, {shown.length} ta
      </p>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-white shadow-sm dark:bg-card">
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                <th className={cn(TH, 'text-left')}>F.I.SH.</th>
                <th className={cn(TH, 'text-left')}>TELEFON</th>
                <th className={cn(TH, 'text-left')}>TASHKILOT</th>
                <th className={cn(TH, 'text-left')}>FILIAL</th>
                <th className={cn(TH, 'text-left')}>ROL</th>
                <th className={cn(TH, 'text-left')}>HOLAT</th>
              </tr>
            </thead>
            <tbody>
              {shown.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F5F5F5] dark:bg-white/5">
                        <Users className="h-6 w-6 text-[#737373]" />
                      </div>
                      <p className="text-sm text-[#737373]">Foydalanuvchi topilmadi</p>
                    </div>
                  </td>
                </tr>
              ) : (
                shown.map((u) => (
                  <tr
                    key={u.id}
                    onClick={() => navigate(`/foydalanuvchilar/${u.id}`)}
                    className="h-[72px] cursor-pointer hover:bg-[#F9FAFB] dark:hover:bg-white/5"
                  >
                    <td className="px-4 text-[14px] font-medium text-[#0052D2] dark:text-[#60A5FA]">{u.name}</td>
                    <td className="px-4 text-[13px] text-[#737373] dark:text-muted-foreground">{u.phone}</td>
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
      </div>

      <UserModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        user={null}
        onSave={(values) => {
          const action = dispatch(userAdded(values))
          navigate(`/foydalanuvchilar/${action.payload.id}`)
        }}
      />
      <UserFilterModal open={filterOpen} onOpenChange={setFilterOpen} filters={filters} onApply={setFilters} />
    </div>
  )
}
