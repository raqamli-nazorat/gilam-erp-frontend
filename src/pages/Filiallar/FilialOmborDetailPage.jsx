import { useParams } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { formatNumber } from '@/lib/format'
import { usePageHeader } from '@/hooks/usePageHeader'
import { useBranch } from './useBranch'
import { TD, TD_LINK, TD_NUM, TH } from './components/FilialSubShell'

const HOLAT_BADGE = {
  Mavjud: 'bg-[#E6FAF1] text-[#047A47] dark:bg-[#047A47]/20 dark:text-[#34D399]',
  Band: 'bg-[#FFF8E6] text-[#B45309] dark:bg-[#B45309]/20 dark:text-[#FBBF24]',
  Tugagan: 'bg-[#F5F5F5] text-[#737373] dark:bg-white/10 dark:text-muted-foreground',
}

const HEAD = ['TOVAR', 'RULON №', 'OMBOR', 'BOSHLANG‘ICH, m', 'QOLDIQ, m', 'OBREZOK', 'HOLAT']

export default function FilialOmborDetailPage() {
  const { omborId } = useParams()
  const branch = useBranch()
  const ombor = branch?.detail.omborlar.find((o) => o.id === omborId)
  usePageHeader(
    branch && ombor
      ? [
          { label: branch.name, to: `/filiallar/${branch.id}` },
          { label: 'Omborlar', to: `/filiallar/${branch.id}/omborlar` },
          { label: ombor.name },
        ]
      : 'Filiallar'
  )
  if (!branch || !ombor) return null

  const rows = (branch.detail.rulonlar ?? []).filter((r) => r.ombor === ombor.name)

  return (
    <div className="flex h-full flex-col">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-white shadow-sm dark:bg-card">
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                {HEAD.map((h, i) => (
                  <th key={h} className={cn(TH, i === 3 || i === 4 ? 'text-right' : 'text-left')}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={HEAD.length} className="py-14 text-center text-sm text-[#737373] dark:text-muted-foreground">
                    Rulon yo‘q
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
