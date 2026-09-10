import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { formatNumber } from '@/lib/format'
import { useBranch } from './useBranch'
import FilialSubShell, { TD, TD_LINK, TD_NUM } from './components/FilialSubShell'

export default function FilialOmborlarPage() {
  const branch = useBranch()
  const navigate = useNavigate()
  if (!branch) return null

  const s = branch.detail.omborStats
  const rows = branch.detail.omborlar

  return (
    <FilialSubShell
      branch={branch}
      crumbTail="Omborlar"
      statItems={[
        { title: 'OMBORLAR', value: `${formatNumber(s.omborlar, 0)} ta` },
        { title: 'RULON', value: `${formatNumber(s.rulon, 0)} ta` },
        { title: 'QOLDIQ', value: `${formatNumber(s.qoldiq, 2)} m²` },
        { title: 'QIYMAT', value: `${formatNumber(s.qiymat, 2)} UZS` },
      ]}
      head={[
        { label: 'NOMI' },
        { label: 'MANZIL' },
        { label: 'RULON', align: 'right' },
        { label: 'QOLDIQ, m²', align: 'right' },
        { label: 'QIYMAT', align: 'right' },
        { label: 'HOLAT' },
      ]}
    >
      {rows.map((o) => (
        <tr
          key={o.id}
          onClick={() => navigate(`/filiallar/${branch.id}/omborlar/${o.id}`)}
          className="h-[60px] cursor-pointer hover:bg-[#F9FAFB] dark:hover:bg-white/5"
        >
          <td className={TD_LINK}>{o.name}</td>
          <td className={cn(TD, 'text-[#737373]')}>{o.manzil}</td>
          <td className={TD_NUM}>{formatNumber(o.rulon, 0)}</td>
          <td className={TD_NUM}>{formatNumber(o.qoldiq, 2)} UZS</td>
          <td className={TD_NUM}>{formatNumber(o.qiymat, 2)} UZS</td>
          <td className="px-4">
            <span className="inline-flex h-[22px] items-center rounded-full bg-[#E6FAF1] px-2.5 text-[11px] font-medium tracking-[0.3px] text-[#047A47] dark:bg-[#047A47]/20 dark:text-[#34D399]">
              {o.holat}
            </span>
          </td>
        </tr>
      ))}
      <tr className="h-[52px] bg-[#F5F5F5] font-semibold dark:bg-white/5">
        <td className="px-4 text-[13px] text-[#0A0A0A] dark:text-white">JAMI</td>
        <td />
        <td className="px-4 text-right text-[13px] text-[#0A0A0A] dark:text-white">{formatNumber(s.rulon, 0)}</td>
        <td className="px-4 text-right text-[13px] text-[#0A0A0A] dark:text-white">{formatNumber(s.qoldiq, 2)} UZS</td>
        <td className="px-4 text-right text-[13px] text-[#0A0A0A] dark:text-white">{formatNumber(s.qiymat, 2)} UZS</td>
        <td />
      </tr>
    </FilialSubShell>
  )
}
