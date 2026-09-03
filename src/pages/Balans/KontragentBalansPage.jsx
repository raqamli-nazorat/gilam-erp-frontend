import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Printer } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import { COUNTERPARTY_DETAIL } from '@/features/balans/balansData'
import { Button } from '@/components/ui/button'
import { Download01Icon } from '@/components/ui/icons'

const TH = 'px-3 text-[13px] font-semibold uppercase leading-[18px] text-[#525252] dark:text-muted-foreground'
const money = (v) => (v == null ? '—' : formatNumber(v, 2))

export default function KontragentBalansPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const d = COUNTERPARTY_DETAIL[id] ?? COUNTERPARTY_DETAIL['cp-1']

  usePageHeader('Kontragent balansi', { label: `${formatNumber(d.qoldiq)} USD`, variant: 'new' })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate('/balans')}
          className="flex items-center gap-1.5 text-[15px] font-medium text-[#0A0A0A] transition-colors hover:text-[#0052D2] dark:text-white"
        >
          <ChevronLeft className="h-4 w-4" /> Balans · Kontragentlar
        </button>
        <div className="flex items-center gap-2.5">
          <Button variant="outline" className="h-9 gap-2 border-[#E5E5E5] bg-white px-4 text-sm font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white">
            <Printer className="h-4 w-4" /> Akt-sverka
          </Button>
          <Button variant="outline" className="h-9 gap-2 border-[#E5E5E5] bg-white px-4 text-sm font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white">
            <Download01Icon className="h-4 w-4" /> Yuklash
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-x-10 gap-y-3 rounded-xl border border-[#E5E5E5] bg-white px-5 py-4 dark:border-white/10 dark:bg-card">
        <Field label="Kontragent" value={<span className="font-semibold text-[#0A0A0A] dark:text-white">{d.name}</span>} />
        <Field label="Turi" value={d.kind} />
        <Field label="Telefon" value={d.phone} />
        <Field label="Davr boshiga" value={`${money(d.openDebt)} USD`} />
        <Field label="Savdo" value={`${money(d.savdo)} USD`} />
        <Field label="To'lov" value={`${money(d.tolov)} USD`} />
        <Field
          label="Qoldiq qarz"
          value={<span className={cn('text-[16px] font-bold', d.qoldiq < 0 ? 'text-[#047A47] dark:text-[#34D399]' : 'text-[#DC2626] dark:text-[#F87171]')}>{money(d.qoldiq)} USD</span>}
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-[#E5E5E5] bg-white dark:border-white/10 dark:bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F5F5F5] dark:bg-white/5">
              <tr className="h-11 border-b border-[#E5E5E5] dark:border-white/10">
                <th className={cn(TH, 'w-10 text-left')}>#</th>
                <th className={cn(TH, 'text-left')}>SANA</th>
                <th className={cn(TH, 'text-left')}>HUJJAT</th>
                <th className={cn(TH, 'text-left')}>AMAL</th>
                <th className={cn(TH, 'text-left')}>IZOH</th>
                <th className={cn(TH, 'text-right')}>DEBET, USD</th>
                <th className={cn(TH, 'text-right')}>KREDIT, USD</th>
                <th className={cn(TH, 'text-right')}>SALDO, USD</th>
              </tr>
            </thead>
            <tbody>
              {d.rows.map((r, i) => (
                <tr key={i} className="h-12 border-b border-[#E5E5E5] last:border-0 dark:border-white/5">
                  <td className="px-3 text-[13px] text-[#737373]">{i + 1}</td>
                  <td className="px-3 text-[13px] text-[#525252] dark:text-muted-foreground">{r.sana}</td>
                  <td className="px-3 text-[13px] font-medium text-[#0052D2] dark:text-[#60A5FA]">{r.hujjat}</td>
                  <td className="px-3 text-[13px] font-medium text-[#0A0A0A] dark:text-white">{r.amal}</td>
                  <td className="px-3 text-[13px] text-[#525252] dark:text-muted-foreground">{r.izoh || '—'}</td>
                  <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{money(r.debet)}</td>
                  <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{money(r.kredit)}</td>
                  <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{money(r.saldo)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-[#F5F5F5] dark:bg-white/5">
              <tr className="h-12">
                <td className="px-3" />
                <td className="px-3 text-[13px] font-semibold text-[#0A0A0A] dark:text-white" colSpan={4}>JAMI</td>
                <td className="px-3 text-right text-[13px] font-semibold text-[#0A0A0A] dark:text-white">{money(d.total.debet)}</td>
                <td className="px-3 text-right text-[13px] font-semibold text-[#0A0A0A] dark:text-white">{money(d.total.kredit)}</td>
                <td className="px-3 text-right text-[13px] font-semibold text-[#0A0A0A] dark:text-white">{money(d.total.saldo)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {d.footnote && <p className="text-[13px] text-[#737373] dark:text-muted-foreground">{d.footnote}</p>}
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-[12px] font-normal text-[#737373] dark:text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-[14px] text-[#0A0A0A] dark:text-white">{value}</p>
    </div>
  )
}
