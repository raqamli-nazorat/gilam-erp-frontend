import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import CopyButton from '@/components/ui/copy-button'
import { useOrg } from './useOrg'
import { useOrgUsers } from './useOrgUsers'
import TashkilotSubShell, { TD, TD_IDX, TD_LINK } from './components/TashkilotSubShell'

export default function TashkilotFoydalanuvchilarPage() {
  const org = useOrg()
  const navigate = useNavigate()
  const { users: rows, loaded, failed } = useOrgUsers(org?.id)

  if (!org) return null

  const state = !loaded ? 'loading' : rows.length > 0 ? 'ready' : 'empty'

  return (
    <TashkilotSubShell
      org={org}
      active="foydalanuvchilar"
      crumbTail="Foydalanuvchilar"
      state={state}
      emptyText={failed ? 'Foydalanuvchilarni yuklab bo‘lmadi' : 'Foydalanuvchi yo‘q'}
      head={[
        { label: '#' },
        { label: 'F.I.SH.' },
        { label: 'TELEFON' },
        { label: 'ROL' },
        { label: 'FILIAL' },
        { label: 'YARATILGAN' },
        { label: 'HOLAT' },
      ]}
    >
      {rows.map((u, i) => (
        <tr key={u.id} className="h-10 hover:bg-[#E3E9F6] dark:hover:bg-white/5">
          <td className={TD_IDX}>{i + 1}</td>
          <td className={TD_LINK} onClick={() => navigate(`/foydalanuvchilar/${u.id}`)}>
            {u.name || ''}
          </td>
          <td className={cn(TD, 'text-[#525252]')}>
            {u.phone ? (
              <span className="inline-flex items-center">
                <CopyButton value={u.phone} className="mr-1.5" />
                {u.phone}
              </span>
            ) : (
              ''
            )}
          </td>
          <td className={TD}>{u.rol || ''}</td>
          <td className={cn(TD, 'text-[#737373]')}>{u.filial || ''}</td>
          <td className={cn(TD, 'text-[#737373]')}>{u.yaratilgan || ''}</td>
          <td className={TD}>
            <span
              className={cn(
                'inline-flex h-[22px] items-center rounded-full px-2.5 text-[11px] font-medium tracking-[0.3px]',
                u.holat === 'blocked'
                  ? 'bg-[#FEECEC] text-[#B42318] dark:bg-[#DC2626]/15 dark:text-[#F87171]'
                  : 'bg-[#E6FAF1] text-[#047A47] dark:bg-[#047A47]/20 dark:text-[#34D399]'
              )}
            >
              {u.holat === 'blocked' ? 'Bloklangan' : 'Faol'}
            </span>
          </td>
        </tr>
      ))}
    </TashkilotSubShell>
  )
}
