import { useState } from 'react'
import { Check, Printer } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import { DAY_END } from '@/features/kassa/kassaMockData'
import { Button } from '@/components/ui/button'
import { Download01Icon } from '@/components/ui/icons'
import Toast from '@/components/Toast'

const TH = 'px-3 text-[13px] font-semibold uppercase leading-[18px] text-[#525252] dark:text-muted-foreground'
const num = (n) => (n != null ? formatNumber(n) : '—')

export default function KassaDayEndPage() {
  const [closed, setClosed] = useState(false)
  const [toast, setToast] = useState('')
  const d = DAY_END

  usePageHeader('Kassa · kun yakuni')

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[16px] font-semibold text-[#0A0A0A] dark:text-white">
          {d.date} · {d.kassa} · {d.cashier}
        </h2>
        <div className="flex items-center gap-2.5">
          <Button variant="outline" className="h-9 gap-2 border-[#E5E5E5] bg-white px-4 text-sm font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white">
            <Printer className="h-4 w-4" /> Chop etish
          </Button>
          <Button variant="outline" className="h-9 gap-2 border-[#E5E5E5] bg-white px-4 text-sm font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white">
            <Download01Icon className="h-4 w-4" /> Yuklash
          </Button>
          <Button
            disabled={closed}
            onClick={() => { setClosed(true); setToast(`Kun yopildi · ${d.date}`) }}
            className="h-9 gap-2 rounded-md bg-[#0052D2] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8] disabled:bg-[#E5E5E5] disabled:text-[#A3A3A3] disabled:opacity-100 dark:disabled:bg-white/10"
          >
            <Check className="h-4 w-4" /> {closed ? 'Kun yopilgan' : 'Kunni yopish'}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="KUN BOSHIDAGI QOLDIQ" value={<span className="text-[#0A0A0A] dark:text-white">{formatNumber(d.openUsd)} USD</span>} sub={`${formatNumber(d.openUzs, 0)} UZS`} />
        <StatCard title="KIRIM" value={<span className="text-[#047A47] dark:text-[#34D399]">+{formatNumber(d.inUsd)} USD</span>} sub={`${d.inOps} ta operatsiya`} />
        <StatCard title="CHIQIM" value={<span className="text-[#B45309] dark:text-[#FBBF24]">−{formatNumber(d.outUsd)} USD</span>} sub={`${d.outOps} ta operatsiya`} />
        <StatCard title="KUN OXIRIDAGI QOLDIQ" value={<span className="text-[#0052D2] dark:text-[#60A5FA]">{formatNumber(d.closeUsd)} USD</span>} sub={`${formatNumber(d.closeUzs, 0)} UZS`} />
      </div>

      <div className="overflow-hidden rounded-xl border border-[#E5E5E5] bg-white dark:border-white/10 dark:bg-card">
        <table className="w-full text-sm">
          <thead className="bg-[#F5F5F5] dark:bg-white/5">
            <tr className="h-10 border-b border-[#E5E5E5] dark:border-white/10">
              <th className={cn(TH, 'w-10 text-left')}>#</th>
              <th className={cn(TH, 'text-left')}>OPERATSIYA TURI</th>
              <th className={cn(TH, 'text-right')}>SONI</th>
              <th className={cn(TH, 'text-right')}>KIRIM, USD</th>
              <th className={cn(TH, 'text-right')}>CHIQIM, USD</th>
              <th className={cn(TH, 'text-right')}>NAQD, USD</th>
              <th className={cn(TH, 'text-right')}>KARTA / O'TKAZMA, USD</th>
            </tr>
          </thead>
          <tbody>
            {d.rows.map((r, i) => (
              <tr key={r.type} className="h-12 border-b border-[#E5E5E5] last:border-0 dark:border-white/5">
                <td className="px-3 text-[13px] text-[#737373]">{i + 1}</td>
                <td className="px-3 text-[13px] font-medium text-[#0A0A0A] dark:text-white">{r.type}</td>
                <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{r.count}</td>
                <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{num(r.cashIn)}</td>
                <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{num(r.cashOut)}</td>
                <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{num(r.cash)}</td>
                <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{num(r.card)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-[#F5F5F5] dark:bg-white/5">
            <tr className="h-11">
              <td className="px-3" />
              <td className="px-3 text-[13px] font-semibold text-[#0A0A0A] dark:text-white">JAMI</td>
              <td className="px-3 text-right text-[13px] font-semibold text-[#0A0A0A] dark:text-white">{d.totals.count}</td>
              <td className="px-3 text-right text-[13px] font-semibold text-[#0A0A0A] dark:text-white">{formatNumber(d.totals.cashIn)}</td>
              <td className="px-3 text-right text-[13px] font-semibold text-[#0A0A0A] dark:text-white">{formatNumber(d.totals.cashOut)}</td>
              <td className="px-3 text-right text-[13px] font-semibold text-[#0A0A0A] dark:text-white">{formatNumber(d.totals.cash)}</td>
              <td className="px-3 text-right text-[13px] font-semibold text-[#0A0A0A] dark:text-white">{formatNumber(d.totals.card)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="rounded-lg bg-[#EAF1FE] px-4 py-3 text-[13px] text-[#0052D2] dark:bg-[#0052D2]/15 dark:text-[#60A5FA]">
        Kun yopilgandan keyin bu sanaga yangi operatsiya kiritib bo'lmaydi. Tuzatish faqat administrator huquqi bilan mumkin.
      </div>

      <Toast message={toast} />
    </div>
  )
}

function StatCard({ title, value, sub }) {
  return (
    <div className="rounded-xl border border-[#E5E5E5] bg-white p-4 dark:border-white/10 dark:bg-card">
      <p className="text-[12px] font-semibold uppercase tracking-[0.4px] text-[#737373] dark:text-muted-foreground">{title}</p>
      <p className="mt-1 text-[22px] font-bold leading-tight">{value}</p>
      <p className="mt-1 text-[12px] text-[#737373] dark:text-muted-foreground">{sub}</p>
    </div>
  )
}
