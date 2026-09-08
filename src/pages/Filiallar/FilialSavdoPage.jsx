import { usePageHeader } from '@/hooks/usePageHeader'
import { cn } from '@/lib/utils'
import { formatNumber } from '@/lib/format'
import { useBranch } from './useBranch'
import StatCards from './components/StatCards'

const LABEL = 'mb-3 text-[12px] font-semibold uppercase tracking-[0.4px] text-[#737373] dark:text-muted-foreground'
const CARD = 'rounded-xl bg-white p-5 shadow-sm dark:bg-card'
const TH = 'h-11 bg-[#F5F5F5] px-4 text-[12px] font-semibold uppercase leading-[18px] text-[#737373] dark:bg-white/5 dark:text-muted-foreground'
const TD_LINK = 'px-4 text-[13px] font-medium text-[#0052D2] dark:text-[#60A5FA]'
const TD_NUM = 'px-4 text-right text-[13px] text-[#0A0A0A] dark:text-white'

export default function FilialSavdoPage() {
  const branch = useBranch()
  usePageHeader(branch ? `${branch.name} › Savdo` : 'Filiallar')
  if (!branch) return null

  const sv = branch.detail.savdo
  const maxBar = Math.max(...sv.dinamika, 1)

  return (
    <div className="flex flex-col gap-6 pb-2">
      <StatCards
        items={[
          { title: 'SAVDO, 12 OY', value: `${formatNumber(sv.stats.savdo12, 2)} UZS` },
          { title: 'BUYURTMA', value: `${formatNumber(sv.stats.buyurtma, 0)} ta` },
          { title: "O‘RTACHA CHEK", value: `${formatNumber(sv.stats.ortachaChek, 2)} UZS` },
          { title: 'QAYTARISH', value: `${formatNumber(sv.stats.qaytarish, 2)} UZS` },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          <p className={LABEL}>SAVDO DINAMIKASI, 12 OY</p>
          <div className={CARD}>
            <div className="flex h-[280px] items-end gap-2">
              {sv.dinamika.map((v, i) => (
                <div
                  key={sv.oylar[i]}
                  className={cn(
                    'flex-1 rounded-t-md',
                    i === sv.dinamika.length - 1 ? 'bg-[#0052D2]' : 'bg-[#DCE7FB] dark:bg-white/10'
                  )}
                  style={{ height: `${Math.max(4, (v / maxBar) * 100)}%` }}
                />
              ))}
            </div>
            <div className="mt-2 flex gap-2 text-[12px] text-[#737373] dark:text-muted-foreground">
              {sv.oylar.map((m) => (
                <span key={m} className="flex-1 text-center">{m}</span>
              ))}
            </div>
          </div>
        </div>

        <div>
          <p className={LABEL}>TO‘LOV USULI, 12 OY</p>
          <div className={CARD}>
            <div className="flex flex-col gap-4">
              {sv.tolov.map((t) => (
                <div key={t.usul}>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="font-medium text-[#0A0A0A] dark:text-white">{t.usul}</span>
                    <span className="text-[#737373] dark:text-muted-foreground">
                      {formatNumber(t.pct, 1)} % <span className="ml-2 font-medium text-[#0A0A0A] dark:text-white">{formatNumber(t.summa, 0)}</span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#EFF1F7] dark:bg-white/10">
                    <div className="h-full rounded-full bg-[#0052D2]" style={{ width: `${t.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between rounded-lg bg-[#F5F5F5] px-3 py-2.5 text-[13px] font-semibold text-[#0A0A0A] dark:bg-white/5 dark:text-white">
              <span>JAMI</span>
              <span>{formatNumber(sv.tolovJami, 0)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <MiniTable
          label="ENG KO‘P SOTILGAN TOVARLAR"
          indexed
          head={['TOVAR', 'm²', 'SUMMA']}
          rows={sv.topTovarlar.map((t) => [t.name, formatNumber(t.m2, 0), formatNumber(t.summa, 0)])}
        />
        <MiniTable
          label="SOTUVCHILAR"
          head={['XODIM', 'SAVDO', 'SUMMA']}
          rows={sv.sotuvchilar.map((s) => [s.name, formatNumber(s.savdo, 0), formatNumber(s.summa, 0)])}
        />
      </div>
    </div>
  )
}

function MiniTable({ label, head, rows, indexed }) {
  return (
    <div>
      <p className={LABEL}>{label}</p>
      <div className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr>
              {indexed && <th className={cn(TH, 'w-12 text-left')}>#</th>}
              {head.map((h, i) => (
                <th key={h} className={cn(TH, i === 0 ? 'text-left' : 'text-right')}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={r[0]} className="h-[52px] hover:bg-[#F9FAFB] dark:hover:bg-white/5">
                {indexed && <td className="px-4 text-[13px] text-[#737373] dark:text-muted-foreground">{ri + 1}</td>}
                <td className={TD_LINK}>{r[0]}</td>
                <td className={TD_NUM}>{r[1]}</td>
                <td className={TD_NUM}>{r[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
