import { Loader2 } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { cn } from '@/lib/utils'
import { formatNumber } from '@/lib/format'
import StatCards from '@/pages/Filiallar/components/StatCards'
import { useOrgUsers } from '../useOrgUsers'

export const TH =
  'sticky top-0 z-10 h-10 bg-[#9AC2FF] px-4 text-[12px] font-semibold uppercase leading-[18px] text-[#0A0A0A] dark:bg-[#0052D2]/40 dark:text-white'
export const TD = 'px-4 text-[13px] text-[#0A0A0A] dark:text-muted-foreground'
export const TD_LINK = 'cursor-pointer px-4 text-[13px] font-medium text-[#0052D2] hover:underline dark:text-[#60A5FA]'
export const TD_NUM = 'px-4 text-right text-[13px] text-[#0A0A0A] dark:text-white'
export const TD_IDX = 'px-4 text-[13px] text-[#737373] dark:text-muted-foreground'

// Tashkilot tafsilotidagi 4 ta karta — har biri o'z ichki sahifasiga olib boradi.
// Joriy sahifaning kartasi (`active`) bosilmaydigan qilib ko'rsatiladi.
export function orgStatItems(org, active, usersCount = org.stats.foydalanuvchilar) {
  return [
    { key: 'filiallar', title: 'FILIALLAR', value: `${formatNumber(org.stats.filiallar, 0)} ta` },
    { key: 'foydalanuvchilar', title: 'FOYDALANUVCHILAR', value: `${formatNumber(usersCount, 0)} ta` },
    { key: 'mijozlar', title: 'MIJOZLAR', value: `${formatNumber(org.stats.mijozlar, 0)} ta` },
    { key: 'savdo', title: 'SAVDO', value: `${formatNumber(org.stats.savdo, 2)} UZS` },
  ].map(({ key, ...it }) => (key === active ? it : { ...it, to: `/tashkilotlar/${org.id}/${key}` }))
}

// head: [{ label, align }]
// state: 'loading' | 'empty' | 'ready' — jadval tanasi o'rniga yuklanish/bo'sh holatni ko'rsatadi.
export default function TashkilotSubShell({ org, active, crumbTail, head, state = 'ready', emptyText, children }) {
  const orgUsers = useOrgUsers(org.id)
  const usersCount = orgUsers.loaded && !orgUsers.failed ? orgUsers.users.length : org.stats.foydalanuvchilar
  usePageHeader([
    { label: 'Tashkilotlar', to: '/tashkilotlar' },
    { label: org.name, to: `/tashkilotlar/${org.id}` },
    { label: crumbTail },
  ])

  return (
    <div className="flex h-full flex-col gap-3">
      <StatCards items={orgStatItems(org, active, usersCount)} />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg bg-[#EFF1F7] dark:bg-white/[0.04]">
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                {head.map((h) => (
                  <th key={h.label} className={cn(TH, h.align === 'right' ? 'text-right' : 'text-left')}>
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {state === 'loading' ? (
                <tr>
                  <td colSpan={head.length} className="py-14 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-[#0052D2]" />
                  </td>
                </tr>
              ) : state === 'empty' ? (
                <tr>
                  <td colSpan={head.length} className="py-14 text-center text-sm text-[#737373]">
                    {emptyText || 'Ma’lumot yo‘q'}
                  </td>
                </tr>
              ) : (
                children
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
