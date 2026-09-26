import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { fetchOrgBranches } from '@/features/tashkilotlar/tashkilotlarSlice'
import CopyButton from '@/components/ui/copy-button'
import { useOrg } from './useOrg'
import TashkilotSubShell, { TD, TD_IDX, TD_LINK, TD_NUM } from './components/TashkilotSubShell'

export default function TashkilotFiliallarPage() {
  const org = useOrg()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const branchesStatus = useSelector((s) => s.tashkilotlar.branchesStatus)
  const orgId = org?.id

  // Tashkilot detali filiallarni to'liq qaytarmasligi mumkin — shu tashkilot filiallarini alohida so'raymiz.
  useEffect(() => {
    if (orgId) dispatch(fetchOrgBranches(orgId))
  }, [orgId, dispatch])

  if (!org) return null

  const rows = org.branches ?? []
  const state = rows.length > 0 ? 'ready' : branchesStatus === 'loading' ? 'loading' : 'empty'

  return (
    <TashkilotSubShell
      org={org}
      active="filiallar"
      crumbTail="Filiallar"
      state={state}
      emptyText="Filial yo‘q"
      head={[
        { label: '#' },
        { label: 'NOMI' },
        { label: 'TELEFON' },
        { label: 'VILOYAT / TUMAN' },
        { label: 'MANZIL' },
        { label: 'XODIM', align: 'right' },
        { label: 'OMBOR', align: 'right' },
        { label: 'HOLAT' },
      ]}
    >
      {rows.map((b, i) => (
        <tr key={b.id || i} className="h-10 hover:bg-[#E3E9F6] dark:hover:bg-white/5">
          <td className={TD_IDX}>{i + 1}</td>
          <td className={TD_LINK} onClick={() => navigate(`/filiallar/${b.id}`)}>
            {b.name || ''}
          </td>
          <td className={cn(TD, 'text-[#525252]')}>
            {b.phone ? (
              <span className="inline-flex items-center">
                <CopyButton value={b.phone} className="mr-1.5" />
                {b.phone}
              </span>
            ) : (
              ''
            )}
          </td>
          <td className={cn(TD, 'text-[#737373]')}>{[b.viloyat, b.tuman].filter(Boolean).join(', ') || ''}</td>
          <td className={cn(TD, 'text-[#737373]')}>{b.manzil || ''}</td>
          <td className={TD_NUM}>{`${b.xodim ?? 0} ta`}</td>
          <td className={TD_NUM}>{`${b.ombor ?? 0} ta`}</td>
          <td className={TD}>
            <StatusPill closed={b.isClosed} />
          </td>
        </tr>
      ))}
    </TashkilotSubShell>
  )
}

function StatusPill({ closed }) {
  return (
    <span
      className={cn(
        'inline-flex h-[22px] items-center rounded-full px-2.5 text-[11px] font-medium tracking-[0.3px]',
        closed
          ? 'bg-[#F5F5F5] text-[#737373] dark:bg-white/10 dark:text-muted-foreground'
          : 'bg-[#E6FAF1] text-[#047A47] dark:bg-[#047A47]/20 dark:text-[#34D399]'
      )}
    >
      {closed ? 'Yopilgan' : 'Faol'}
    </span>
  )
}
