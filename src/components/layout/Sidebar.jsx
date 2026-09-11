import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ChevronDown } from 'lucide-react'
import { toggleSidebar, setSidebarCollapsed } from '@/features/ui/uiSlice'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Audit01Icon,
  BalanceScaleIcon,
  Briefcase01Icon,
  Building03Icon,
  CashierIcon,
  Chart01Icon,
  DashboardSquare01Icon,
  Invoice01Icon,
  MalumotnomalarIcon,
  PackageReceive01Icon,
  Settings01Icon,
  ShoppingCartCheckIn01Icon,
  ShoppingCartCheckOut01Icon,
  ShoppingCartRemove01Icon,
  SidebarLeft01Icon,
  Tag01Icon,
  UserGroupIcon,
  UserMultipleIcon,
} from '@/components/ui/icons'

const NAV_ITEMS = [
  { to: '/boshqaruv-paneli', label: 'Boshqaruv paneli', icon: DashboardSquare01Icon },
  { to: '/tashkilotlar', label: 'Tashkilotlar', icon: Building03Icon },
  { to: '/filiallar', label: 'Filiallar', icon: Briefcase01Icon },
  { to: '/foydalanuvchilar', label: 'Foydalanuvchilar', icon: UserMultipleIcon },
  {
    to: '/malumotnomalar',
    label: "Ma'lumotnomalar",
    icon: MalumotnomalarIcon,
    children: [
      { to: '/malumotnomalar/viloyat-va-tuman', label: 'Viloyat va tuman' },
      { to: '/malumotnomalar/rollar', label: 'Rollar' },
      { to: '/malumotnomalar/sifatlar', label: 'Sifatlar' },
      { to: '/malumotnomalar/ranglar', label: 'Ranglar' },
      { to: '/malumotnomalar/olchov-birliklari', label: "O'lchov birliklari" },
      { to: '/malumotnomalar/lavozimlar', label: 'Lavozimlar' },
      { to: '/malumotnomalar/kontragent-turlari', label: 'Kontragent turlari' },
    ],
  },
  { to: '/tovarlar-kirimi', label: 'Tovarlar kirimi', icon: ShoppingCartCheckIn01Icon },
  { to: '/bron-tovarlar', label: 'Bron tovarlar', icon: Tag01Icon },
  { to: '/tovarlar-savdosi', label: 'Tovarlar savdosi', icon: ShoppingCartCheckOut01Icon },
  { to: '/tovarlar-qaytarishi', label: 'Tovarlar qaytarishi', icon: ShoppingCartRemove01Icon },
  { to: '/qaytarish-kirimi', label: 'Qaytarish kirimi', icon: PackageReceive01Icon },
  { to: '/xarajatlar', label: 'Xarajatlar', icon: Invoice01Icon },
  {
    to: '/ish-haqi',
    label: 'Ish haqi',
    icon: UserGroupIcon,
    children: [
      { to: '/ish-haqi', label: 'Ish haqi hisoblash', end: true },
      { to: '/ish-haqi/avans', label: 'Avans va ushlanmalar' },
      { to: '/ish-haqi/tabel', label: 'Kunlik tabel' },
    ],
  },
  {
    to: '/kassa',
    label: 'Kassa',
    icon: CashierIcon,
    children: [
      { to: '/kassa', label: "Ish o'rni", end: true },
      { to: '/kassa/operatsiyalar', label: 'Kassa operatsiyalari' },
      { to: '/kassa/kun-yakuni', label: 'Kun yakuni' },
    ],
  },
  { to: '/hisobotlar', label: 'Hisobotlar', icon: Chart01Icon },
  { to: '/balans', label: 'Balans', icon: BalanceScaleIcon },
  { to: '/boshqalar', label: 'Boshqalar', icon: Settings01Icon },
]

// Sidebar pastiga yopishib turadigan element
const AUDIT_ITEM = { to: '/audit-jurnali', label: 'Audit jurnali', icon: Audit01Icon }

// Figma: aktiv element foni #4468BC (--nav-bg-hover), oq ikona + oq matn.
// Nofaol: #FFFFFF/60, hover: #FFFFFF/10. Yig'ilgan/yoyilgan holatda bir xil.
const ITEM_ACTIVE = 'bg-[#4468BC] text-white'
const ITEM_IDLE = 'text-white/60 hover:bg-white/10 hover:text-white'

export default function Sidebar() {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.auth.user)
  const collapsed = useSelector((state) => state.ui.sidebarCollapsed)
  const { pathname } = useLocation()

  // Bo'limlar qo'lda yig'ib/yoyiladi. `undefined` — marshrutga qarab (o'sha bo'limda bo'lsak — ochiq).
  const [openGroups, setOpenGroups] = useState({})
  const toggleGroup = (to) =>
    setOpenGroups((g) => ({ ...g, [to]: !(g[to] ?? pathname.startsWith(to)) }))
  const isExpanded = (to) => openGroups[to] ?? pathname.startsWith(to)

  const isActive = (to, hasChildren) =>
    hasChildren ? pathname.startsWith(to) : pathname === to || pathname.startsWith(`${to}/`)

  const avatar = (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-[#1B3E75]">
      {user?.initials ?? '?'}
    </div>
  )

  return (
    <aside
      onClick={() => {
        // Yig'ilgan holatda sidebar'ning istalgan joyiga bosilsa — faqat yoyiladi (navigatsiyasiz).
        if (collapsed) dispatch(setSidebarCollapsed(false))
      }}
      className={cn(
        'flex h-screen shrink-0 flex-col bg-[#1B3E75] text-white transition-[width] duration-500 ease-in-out',
        collapsed ? 'w-[76px] cursor-pointer' : 'w-[280px]'
      )}
    >
      <div className={cn('flex items-center px-5 py-5', collapsed ? 'justify-center' : 'justify-between')}>
        {collapsed ? (
          <div
            className="h-8 w-8 shrink-0"
            style={{
              backgroundImage: "url('/logo.svg')",
              backgroundSize: 'auto 100%',
              backgroundPosition: 'left center',
              backgroundRepeat: 'no-repeat',
            }}
          />
        ) : (
          <img src="/logo.svg" alt="GILAM" className="h-8 w-auto" />
        )}
        {!collapsed && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              dispatch(toggleSidebar())
            }}
            className="rounded-md p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Sidebar'ni yig'ish"
          >
            <SidebarLeft01Icon className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {NAV_ITEMS.map(({ to, label, icon: Icon, children }) => {
          const active = isActive(to, Boolean(children))
          const expanded = Boolean(children) && isExpanded(to)

          if (collapsed) {
            return (
              <Tooltip key={to}>
                <TooltipTrigger
                  render={
                    <NavLink
                      to={to}
                      // Yig'ilgan ikonaga bosilganda: ham o'sha bo'limga o'tadi, ham sidebar yoyiladi.
                      onClick={() => dispatch(setSidebarCollapsed(false))}
                      className={cn(
                        'mx-auto flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
                        active ? ITEM_ACTIVE : ITEM_IDLE
                      )}
                    >
                      <Icon className="shrink-0" />
                    </NavLink>
                  }
                />
                <TooltipContent side="right">{label}</TooltipContent>
              </Tooltip>
            )
          }

          return (
            <div key={to}>
              <div
                className={cn(
                  'flex h-11 items-center rounded-lg text-[15px] font-medium transition-colors',
                  active ? ITEM_ACTIVE : ITEM_IDLE
                )}
              >
                <NavLink
                  to={to}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (children) toggleGroup(to)
                  }}
                  className="flex h-full flex-1 items-center gap-3 rounded-lg px-3"
                >
                  <Icon className="shrink-0" />
                  <span className="truncate">{label}</span>
                </NavLink>
                {children && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleGroup(to)
                    }}
                    className="flex h-full items-center rounded-lg px-3 text-white/70 transition-colors hover:text-white"
                    aria-label={expanded ? "Bo'limni yig'ish" : "Bo'limni yoyish"}
                  >
                    <ChevronDown className={cn('h-4 w-4 shrink-0 transition-transform', expanded && 'rotate-180')} />
                  </button>
                )}
              </div>

              {expanded && (
                <div className="mt-1 space-y-0.5 pb-1 pl-9">
                  {children.map((child) => (
                    <NavLink
                      key={child.label}
                      to={child.to}
                      end={child.end}
                      onClick={(e) => e.stopPropagation()}
                      className={({ isActive: childActive }) =>
                        cn(
                          'block rounded-md px-3 py-1.5 text-[13px] font-normal text-white/55 transition-colors hover:bg-white/10 hover:text-white',
                          childActive && 'bg-white/10 font-medium text-white'
                        )
                      }
                    >
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <div className="shrink-0 px-3 pb-2 pt-1">
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <NavLink
                  to={AUDIT_ITEM.to}
                  onClick={() => dispatch(setSidebarCollapsed(false))}
                  className={cn(
                    'mx-auto flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
                    isActive(AUDIT_ITEM.to, false) ? ITEM_ACTIVE : ITEM_IDLE
                  )}
                >
                  <AUDIT_ITEM.icon className="shrink-0" />
                </NavLink>
              }
            />
            <TooltipContent side="right">{AUDIT_ITEM.label}</TooltipContent>
          </Tooltip>
        ) : (
          <NavLink
            to={AUDIT_ITEM.to}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              'flex h-11 items-center gap-3 rounded-lg px-3 text-[15px] font-medium transition-colors',
              isActive(AUDIT_ITEM.to, false) ? ITEM_ACTIVE : ITEM_IDLE
            )}
          >
            <AUDIT_ITEM.icon className="shrink-0" />
            <span className="flex-1 truncate">{AUDIT_ITEM.label}</span>
          </NavLink>
        )}
      </div>

      {collapsed ? (
        <div className="flex items-center justify-center border-t border-white/10 py-4">{avatar}</div>
      ) : (
        <NavLink
          to="/profil"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-3 border-t border-white/10 px-5 py-4 transition-colors hover:bg-white/10"
        >
          {avatar}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user?.fullName ?? 'Foydalanuvchi'}</p>
            <p className="truncate text-xs text-white/60">{user?.role ?? '—'}</p>
          </div>
        </NavLink>
      )}
    </aside>
  )
}
