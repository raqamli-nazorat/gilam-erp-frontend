import { NavLink, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toggleSidebar, setSidebarCollapsed } from '@/features/ui/uiSlice'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  BalanceScaleIcon,
  Book01Icon,
  CashierIcon,
  Chart01Icon,
  Invoice01Icon,
  PackageReceive01Icon,
  Settings01Icon,
  ShoppingCartCheckIn01Icon,
  ShoppingCartCheckOut01Icon,
  ShoppingCartRemove01Icon,
  SidebarLeft01Icon,
  Tag01Icon,
  UserGroupIcon,
} from '@/components/ui/icons'

const NAV_ITEMS = [
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
  { to: '/malumotnomalar', label: "Ma'lumotnomalar", icon: Book01Icon },
  { to: '/boshqalar', label: 'Boshqalar', icon: Settings01Icon },
]

export default function Sidebar() {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.auth.user)
  const collapsed = useSelector((state) => state.ui.sidebarCollapsed)
  const { pathname } = useLocation()

  return (
    <aside
      onClick={() => {
        // Yig'ilgan holatda sidebar'ning istalgan joyiga bosilsa, u yoyiladi.
        if (collapsed) dispatch(setSidebarCollapsed(false))
      }}
      className={cn(
        'flex h-screen shrink-0 flex-col bg-[#1B3E75] text-white transition-[width] duration-200',
        collapsed ? 'w-[76px] cursor-pointer' : 'w-[280px]'
      )}
    >
      <div className={cn('flex items-center px-5 py-5', collapsed ? 'flex-col gap-3' : 'justify-between')}>
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
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            dispatch(toggleSidebar())
          }}
          className="rounded-md p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          aria-label={collapsed ? "Sidebar'ni yoyish" : "Sidebar'ni yig'ish"}
        >
          <SidebarLeft01Icon className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {NAV_ITEMS.map(({ to, label, icon: Icon, children }) =>
          collapsed ? (
            <Tooltip key={to}>
              <TooltipTrigger
                render={
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center justify-center rounded-lg py-2.5 text-white/75 transition-colors hover:bg-white/10 hover:text-white',
                        isActive && 'bg-white/15 text-white'
                      )
                    }
                  >
                    <Icon className="shrink-0" />
                  </NavLink>
                }
              />
              <TooltipContent side="right">{label}</TooltipContent>
            </Tooltip>
          ) : (
            <div key={to}>
              <NavLink
                to={to}
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white',
                  (children ? pathname.startsWith(to) : pathname === to) && 'bg-white/15 text-white'
                )}
              >
                <Icon className="shrink-0" />
                <span className="truncate">{label}</span>
              </NavLink>

              {children && pathname.startsWith(to) && (
                <div className="mt-1 space-y-0.5 pb-1 pl-9">
                  {children.map((child) => (
                    <NavLink
                      key={child.label}
                      to={child.to}
                      end={child.end}
                      onClick={(e) => e.stopPropagation()}
                      className={({ isActive }) =>
                        cn(
                          'block rounded-md px-3 py-1.5 text-[13px] font-normal text-white/60 transition-colors hover:bg-white/10 hover:text-white',
                          isActive && 'bg-white/10 font-medium text-white'
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
        )}
      </nav>

      <div
        className={cn(
          'flex items-center gap-3 border-t border-white/10 py-4',
          collapsed ? 'justify-center px-2' : 'px-5'
        )}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-semibold">
          {user?.initials ?? '?'}
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user?.fullName ?? 'Foydalanuvchi'}</p>
            <p className="truncate text-xs text-white/60">{user?.role ?? '—'}</p>
          </div>
        )}
      </div>
    </aside>
  )
}
