import { cn } from '@/lib/utils'
import { formatNumber } from '@/lib/format'
import { useBranch } from './useBranch'
import FilialSubShell, { CopyBtn, TD, TD_IDX, TD_LINK, TD_NUM } from './components/FilialSubShell'

export default function FilialMijozlarPage() {
  const branch = useBranch()
  if (!branch) return null

  const s = branch.detail.mijozStats
  const rows = branch.detail.mijozlar

  return (
    <FilialSubShell
      branch={branch}
      crumbTail="Mijozlar"
      statItems={[
        { title: 'MIJOZLAR', value: `${formatNumber(s.mijozlar, 0)} ta` },
        { title: 'QARZI BOR', value: `${formatNumber(s.qarziBor, 0)} ta` },
        { title: 'JAMI QARZ', value: `${formatNumber(s.jamiQarz, 2)} UZS` },
        { title: "O‘RTACHA CHEK", value: `${formatNumber(s.ortachaChek, 2)} UZS` },
      ]}
      head={[
        { label: '#' },
        { label: 'F.I.SH. / TASHKILOT' },
        { label: 'TELEFON' },
        { label: 'BUYURTMA', align: 'right' },
        { label: 'JAMI XARID', align: 'right' },
        { label: 'QARZ', align: 'right' },
        { label: 'OXIRGI SAVDO' },
      ]}
    >
      {rows.map((m, i) => (
        <tr key={m.id} className="h-11 hover:bg-[#F9FAFB] dark:hover:bg-white/5">
          <td className={TD_IDX}>{i + 1}</td>
          <td className={TD_LINK}>{m.name}</td>
          <td className={cn(TD, 'text-[#737373]')}>{m.phone}<CopyBtn value={m.phone} /></td>
          <td className={TD_NUM}>{formatNumber(m.buyurtma, 0)}</td>
          <td className={TD_NUM}>{formatNumber(m.jamiXarid, 0)}</td>
          <td className={TD_NUM}>{formatNumber(m.qarz, 0)}</td>
          <td className={cn(TD, 'text-[#737373]')}>{m.oxirgi}</td>
        </tr>
      ))}
    </FilialSubShell>
  )
}
