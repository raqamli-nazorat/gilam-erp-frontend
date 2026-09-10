import { usePageHeader } from '@/hooks/usePageHeader'
import { cn } from '@/lib/utils'
import { formatNumber } from '@/lib/format'
import { useBranch } from './useBranch'
import StatCards from './components/StatCards'
import FilialFooter from './components/FilialFooter'

const LABEL = 'mb-3 text-[11px] font-medium uppercase tracking-[0.4px] text-[#737373] dark:text-muted-foreground'
const CARD = 'rounded-xl bg-white p-4 shadow-sm dark:bg-card'
const TH = 'sticky top-0 z-10 h-10 bg-[#9AC2FF] px-4 text-[12px] font-semibold uppercase leading-[18px] text-[#0A0A0A] dark:bg-[#0052D2]/40 dark:text-white'
const TD_LINK = 'px-4 text-[13px] font-medium text-[#0052D2] dark:text-[#60A5FA]'
const TD_NUM = 'px-4 text-right text-[13px] text-[#0A0A0A] dark:text-white'

export default function FilialSavdoPage() {
  const branch = useBranch()
  usePageHeader(branch ? [{ label: branch.name, to: `/filiallar/${branch.id}` }, { label: 'Savdo' }] : 'Filiallar')
  if (!branch) return null

  const sv = branch.detail.savdo
  const max = sv.dinamikaMax ?? Math.max(...sv.dinamika, 1)

  return (
    <div className="flex h-full flex-col gap-3">
      <StatCards
        items={[
          { title: 'SAVDO, 12 OY', value: `${formatNumber(sv.stats.savdo12, 2)} UZS` },
          { title: 'BUYURTMA', value: `${formatNumber(sv.stats.buyurtma, 0)} ta` },
          { title: "O‘RTACHA CHEK", value: `${formatNumber(sv.stats.ortachaChek, 2)} UZS` },
          { title: 'QAYTARISH', value: `${formatNumber(sv.stats.qaytarish, 2)} UZS` },
        ]}
      />

      <div className="grid shrink-0 gap-3 lg:grid-cols-[minmax(0,1fr)_396px]">
        {/* Savdo dinamikasi */}
        <div className={cn(CARD, 'flex h-[376px] flex-col gap-[14px]')}>
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium uppercase tracking-[0.4px] text-[#737373] dark:text-muted-foreground">
              SAVDO DINAMIKASI, {sv.dinamikaDavr ?? '12 OY'}
            </p>
            <span className="text-[11px] font-medium uppercase tracking-[0.4px] text-[#A3A3A3] dark:text-muted-foreground/70">
              {sv.dinamikaBirlik ?? 'mln UZS'}
            </span>
          </div>

          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex min-h-0 flex-1 gap-2">
              {/* Y o'qi */}
              <div className="flex flex-col justify-between py-[6px] text-right text-[11px] leading-none text-[#A3A3A3] dark:text-muted-foreground/70">
                {[max, max * 0.75, max * 0.5, max * 0.25, 0].map((v, i) => (
                  <span key={i}>{formatNumber(v, v % 1 === 0 ? 0 : 1)}</span>
                ))}
              </div>

              {/* Plot */}
              <div className="relative flex min-w-0 flex-1 flex-col">
                <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-px bg-[#EFF1F7] dark:bg-white/10" />
                  ))}
                </div>
                <div className="relative flex flex-1 items-end justify-between gap-1">
                  {sv.dinamika.map((v, i) => {
                    const last = i === sv.dinamika.length - 1
                    return (
                      <div key={sv.oylar[i]} className="flex h-full w-7 flex-col items-center justify-end">
                        <span
                          className={cn(
                            'mb-1 text-[11px] leading-none',
                            last ? 'font-medium text-[#0052D2]' : 'text-[#737373] dark:text-muted-foreground'
                          )}
                        >
                          {formatNumber(v, 1)}
                        </span>
                        <div
                          className="w-full rounded-t-[4px]"
                          style={{ height: `${(v / max) * 100}%`, backgroundColor: last ? '#0052D2' : '#EAF1FE' }}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Oylar */}
            <div className="mt-2 flex gap-2">
              <span className="invisible text-right text-[11px]" aria-hidden>
                {formatNumber(max, 0)}
              </span>
              <div className="flex flex-1 justify-between gap-1">
                {sv.oylar.map((m) => (
                  <span key={m} className="w-7 text-center text-[11px] text-[#A3A3A3] dark:text-muted-foreground/70">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* To'lov usuli */}
        <div className="flex h-[376px] flex-col overflow-hidden rounded-xl bg-white shadow-sm dark:bg-card">
          {sv.tolov.map((t) => (
            <div key={t.usul} className="flex flex-1 flex-col justify-center gap-2 px-4">
              <div className="flex items-center justify-between gap-3 text-[13px]">
                <span className="font-medium leading-[18px] text-[#0A0A0A] dark:text-white">{t.usul}</span>
                <span className="text-[12px] leading-4 text-[#737373] dark:text-muted-foreground">
                  {formatNumber(t.pct, 1)} %
                  <span className="ml-2 text-[13px] font-medium text-[#0A0A0A] dark:text-white">
                    {formatNumber(t.summa, 2)} UZS
                  </span>
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#9AC2FF]">
                <div className="h-full rounded-full bg-[#0052D2]" style={{ width: `${t.pct}%` }} />
              </div>
            </div>
          ))}
          <div className="flex h-12 shrink-0 items-center justify-between bg-[#9AC2FF] px-4 text-[13px] font-semibold text-[#0A0A0A] dark:bg-[#0052D2]/40 dark:text-white">
            <span>JAMI</span>
            <span>{formatNumber(sv.tolovJami, 2)} UZS</span>
          </div>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-2">
        <MiniTable
          label="ENG KO‘P SOTILGAN TOVARLAR"
          indexed
          head={['TOVAR', 'm²', 'SUMMA']}
          rows={sv.topTovarlar.map((t) => [t.name, formatNumber(t.m2, 0), `${formatNumber(t.summa, 2)} UZS`])}
        />
        <MiniTable
          label="SOTUVCHILAR"
          head={['XODIM', 'SAVDO', 'SUMMA']}
          rows={sv.sotuvchilar.map((s) => [s.name, `${formatNumber(s.savdo, 2)} UZS`, `${formatNumber(s.summa, 2)} UZS`])}
        />
      </div>

      <FilialFooter branch={branch} />
    </div>
  )
}

function MiniTable({ label, head, rows, indexed }) {
  return (
    <div className="flex min-h-0 flex-col">
      <p className={LABEL}>{label}</p>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-white shadow-sm dark:bg-card">
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full border-separate border-spacing-0 text-sm">
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
                <tr key={r[0]} className="h-[44px] hover:bg-[#F9FAFB] dark:hover:bg-white/5">
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
    </div>
  )
}
