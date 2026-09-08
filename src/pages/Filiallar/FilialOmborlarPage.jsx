import { cn } from '@/lib/utils'
import { formatNumber } from '@/lib/format'
import { useBranch } from './useBranch'
import FilialSubShell, { TD, TD_LINK, TD_NUM, TH } from './components/FilialSubShell'

const HOLAT_BADGE = {
  Mavjud: 'bg-[#E6FAF1] text-[#047A47] dark:bg-[#047A47]/20 dark:text-[#34D399]',
  Band: 'bg-[#FFF8E6] text-[#B45309] dark:bg-[#B45309]/20 dark:text-[#FBBF24]',
  Tugagan: 'bg-[#F5F5F5] text-[#737373] dark:bg-white/10 dark:text-muted-foreground',
}

export default function FilialOmborlarPage() {
  const branch = useBranch()
  if (!branch) return null

  const s = branch.detail.omborStats
  const rows = branch.detail.omborlar
  const rulonlar = branch.detail.rulonlar ?? []

  return (
    <FilialSubShell
      branch={branch}
      crumbTail="Omborlar"
      tableFill={false}
      statItems={[
        { title: 'OMBORLAR', value: `${formatNumber(s.omborlar, 0)} ta` },
        { title: 'RULON', value: `${formatNumber(s.rulon, 0)} ta` },
        { title: 'QOLDIQ', value: `${formatNumber(s.qoldiq, 2)} m²` },
        { title: 'QIYMAT', value: `${formatNumber(s.qiymat, 2)} UZS` },
      ]}
      subtitle={`OMBORLAR, ${branch.name}, ${s.omborlar} ta`}
      head={[
        { label: 'NOMI' },
        { label: 'MANZIL' },
        { label: 'RULON', align: 'right' },
        { label: 'QOLDIQ, m²', align: 'right' },
        { label: 'QIYMAT', align: 'right' },
        { label: 'HOLAT' },
      ]}
      belowTable={
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-white shadow-sm dark:bg-card">
          <div className="min-h-0 flex-1 overflow-auto">
            <table className="w-full border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  {['TOVAR', 'RULON №', 'OMBOR', 'BOSHLANG‘ICH, m', 'QOLDIQ, m', 'OBREZOK', 'HOLAT'].map((h, i) => (
                    <th key={h} className={cn(TH, i === 3 || i === 4 ? 'text-right' : 'text-left')}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rulonlar.map((r) => (
                  <tr key={r.id} className="h-[56px] hover:bg-[#F9FAFB] dark:hover:bg-white/5">
                    <td className={TD_LINK}>{r.tovar}</td>
                    <td className={cn(TD, 'text-[#737373]')}>{r.rulonNo}</td>
                    <td className={TD}>{r.ombor}</td>
                    <td className={TD_NUM}>{formatNumber(r.boshlangich, 2)}</td>
                    <td className={TD_NUM}>{formatNumber(r.qoldiq, 2)} UZS</td>
                    <td className={cn(TD, 'text-[#737373]')}>{r.obrezok ? 'Ha' : '—'}</td>
                    <td className="px-4">
                      <span
                        className={cn(
                          'inline-flex h-[22px] items-center rounded-full px-2.5 text-[11px] font-medium tracking-[0.3px]',
                          HOLAT_BADGE[r.holat] ?? HOLAT_BADGE.Mavjud
                        )}
                      >
                        {r.holat}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      }
    >
      {rows.map((o) => (
        <tr key={o.id} className="h-[60px] hover:bg-[#F9FAFB] dark:hover:bg-white/5">
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
