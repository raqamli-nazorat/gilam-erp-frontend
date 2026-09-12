import { cn } from '@/lib/utils'
import { formatNumber } from '@/lib/format'
import { useBranch } from './useBranch'
import FilialSubShell, { CopyBtn, TD, TD_IDX, TD_LINK } from './components/FilialSubShell'

export default function FilialXodimlarPage() {
  const branch = useBranch()
  if (!branch) return null

  const s = branch.detail.xodimlarStats
  const rows = branch.detail.xodimlar

  return (
    <FilialSubShell
      branch={branch}
      crumbTail="Xodimlar"
      statItems={[
        { title: 'XODIMLAR', value: `${formatNumber(s.xodimlar, 0)} ta` },
        { title: 'SOTUVCHI', value: `${formatNumber(s.sotuvchi, 0)} ta` },
        { title: 'KASSIR', value: `${formatNumber(s.kassir, 0)} ta` },
        { title: 'ISH HAQI FONDI', value: `${formatNumber(s.ishHaqiFondi, 2)} UZS` },
      ]}
      head={[
        { label: '#' },
        { label: 'F.I.SH.' },
        { label: 'LAVOZIM' },
        { label: 'TELEFON' },
        { label: 'ISH HAQI TURI' },
        { label: 'ISHGA KIRGAN' },
        { label: 'HOLAT' },
      ]}
    >
      {rows.map((x, i) => {
        const working = x.holat === 'Faol'
        return (
          <tr key={x.id} className="h-11 hover:bg-[#F9FAFB] dark:hover:bg-white/5">
            <td className={TD_IDX}>{i + 1}</td>
            <td className={TD_LINK}>{x.name}</td>
            <td className={TD}>{x.lavozim}</td>
            <td className={cn(TD, 'text-[#737373]')}>{x.phone}<CopyBtn value={x.phone} /></td>
            <td className={TD}>{x.ishHaqiTuri}</td>
            <td className={cn(TD, 'text-[#737373]')}>{x.ishgaKirgan}</td>
            <td className="px-4">
              <span
                className={cn(
                  'inline-flex h-[22px] items-center rounded-full px-2.5 text-[11px] font-medium tracking-[0.3px]',
                  working
                    ? 'bg-[#E6FAF1] text-[#047A47] dark:bg-[#047A47]/20 dark:text-[#34D399]'
                    : 'bg-[#FFF8E6] text-[#B45309] dark:bg-[#B45309]/20 dark:text-[#FBBF24]'
                )}
              >
                {working ? 'Ishlayapti' : x.holat}
              </span>
            </td>
          </tr>
        )
      })}
    </FilialSubShell>
  )
}
