import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BarChart3, ChevronLeft, Filter as FilterIcon } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import {
  ACCOUNT_KINDS,
  GENERIC_CONFIG,
  REPORT_CONFIGS,
  REPORT_COUNTERPARTIES,
  REPORT_INDEX,
  REPORT_QUALITIES,
  REPORT_STAKEHOLDERS,
  REPORT_WAREHOUSES,
} from '@/features/hisobotlar/hisobotlarData'
import { PLATFORM_REPORT_SLUGS } from '@/features/hisobotlar/platformReportsData'
import PlatformReportPage from './PlatformReportPage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Download01Icon } from '@/components/ui/icons'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import ReportPrintModal from './components/ReportPrintModal'

const fieldCls =
  'h-10 w-full rounded-md border-[#E5E5E5] bg-white px-3 text-[14px] font-normal text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:border-white/10 dark:bg-card dark:text-white'
const labelCls = 'mb-1.5 block text-[13px] font-normal leading-[16px] text-[#525252] dark:text-muted-foreground'
const TH = 'px-3 text-[13px] font-semibold uppercase leading-[18px] text-[#525252] dark:text-muted-foreground'

function cellText(row, col) {
  const v = row[col.key]
  if (!col.num && col.num !== 0 && !col.perRowNum) return v ?? ''
  if (v == null) return '—'
  if (col.perRowNum) return formatNumber(v, row.valyuta === 'UZS' ? 0 : 2)
  return formatNumber(v, col.num)
}

export default function HisobotRunnerPage() {
  const { slug } = useParams()
  if (PLATFORM_REPORT_SLUGS.includes(slug)) return <PlatformReportPage slug={slug} />
  return <GenericReportRunner slug={slug} />
}

// Tenant ERP'ning umumiy (slug bo'yicha config'ga qarab ishlaydigan) hisobot generatori.
function GenericReportRunner({ slug }) {
  const navigate = useNavigate()

  const meta = REPORT_INDEX[slug]
  const config = REPORT_CONFIGS[slug] ?? GENERIC_CONFIG
  const isAkt = config.filterSet === 'aktsverka'

  usePageHeader(meta?.name ?? 'Hisobot')

  const [status, setStatus] = useState('idle') // idle | empty | ready
  const [printOpen, setPrintOpen] = useState(false)
  const [f, setF] = useState({
    period: isAkt ? '01.01.2026 — 13.08.2026' : '01.08.2026 — 13.08.2026',
    warehouse: 'MAGAZIN',
    quality: '',
    stakeholder: '',
    counterparty: REPORT_COUNTERPARTIES[0],
    currency: 'USD',
    accountKind: ACCOUNT_KINDS[0],
  })
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))

  const rows = useMemo(() => {
    if (!config.rows) return []
    if (!f.quality) return config.rows
    return config.rows.filter((r) => `${r.tovar ?? ''}${r.sifat ?? ''}`.toLowerCase().includes(f.quality.toLowerCase()))
  }, [config, f.quality])

  function generate() {
    setStatus(rows.length === 0 ? 'empty' : 'ready')
  }

  if (!meta) {
    return (
      <div className="flex flex-col gap-4">
        <BackLink onClick={() => navigate('/hisobotlar')} />
        <p className="py-16 text-center text-sm text-[#737373]">Hisobot topilmadi</p>
      </div>
    )
  }

  const showTotalRow = config.total && status === 'ready'

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <BackLink onClick={() => navigate('/hisobotlar')} />
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={() => setPrintOpen(true)}
            disabled={status !== 'ready'}
            className="h-9 gap-2 border-[#E5E5E5] bg-white px-4 text-sm font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] disabled:opacity-50 dark:border-white/10 dark:bg-card dark:text-white"
          >
            <Download01Icon className="h-4 w-4" /> Yuklash
          </Button>
          <Button
            onClick={generate}
            className="h-9 gap-2 rounded-md bg-[#0052D2] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
          >
            <BarChart3 className="h-4 w-4" /> Shakllantirish
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-[#E5E5E5] bg-white p-4 dark:border-white/10 dark:bg-card">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label className={labelCls}>Davr</Label>
            <Input value={f.period} onChange={(e) => set('period', e.target.value)} className={fieldCls} />
          </div>

          {isAkt ? (
            <>
              <SelectField label="Kontragent" value={f.counterparty} onChange={(v) => set('counterparty', v)} options={REPORT_COUNTERPARTIES} />
              <SelectField label="Valyuta" value={f.currency} onChange={(v) => set('currency', v)} options={['USD', 'UZS']} />
              <SelectField label="Hisob turi" value={f.accountKind} onChange={(v) => set('accountKind', v)} options={ACCOUNT_KINDS} />
            </>
          ) : (
            <>
              <SelectField label="Ombor" value={f.warehouse} onChange={(v) => set('warehouse', v)} options={REPORT_WAREHOUSES} />
              <SelectField label="Sifat" value={f.quality || '__all'} onChange={(v) => set('quality', v === '__all' ? '' : v)} options={REPORT_QUALITIES} allLabel="Barchasi" />
              <SelectField label="Hissador" value={f.stakeholder || '__all'} onChange={(v) => set('stakeholder', v === '__all' ? '' : v)} options={REPORT_STAKEHOLDERS} allLabel="Barchasi" />
            </>
          )}
        </div>
      </div>

      {status === 'idle' && (
        <EmptyBox
          icon={<BarChart3 className="h-7 w-7 text-[#737373]" />}
          title="Hisobot hali shakllantirilmagan"
          text="Davr, ombor va boshqa filtrlarni tanlab «Shakllantirish» tugmasini bosing"
        />
      )}

      {status === 'empty' && (
        <EmptyBox
          icon={<FilterIcon className="h-7 w-7 text-[#737373]" />}
          title="Tanlangan filtrlar bo'yicha ma'lumot topilmadi"
          text="Davrni kengaytiring yoki sifat va hissador filtrlarini bo'shating"
        />
      )}

      {status === 'ready' && (
        <>
          {config.warning && (
            <div className="flex items-start gap-2.5 rounded-lg bg-[#FEECEC] px-4 py-3 text-[13px] text-[#DC2626] dark:bg-[#DC2626]/15 dark:text-[#F87171]">
              <span className="mt-0.5 shrink-0">⚠</span>
              <p>{config.warning}</p>
            </div>
          )}

          <div className="overflow-hidden rounded-xl border border-[#E5E5E5] bg-white dark:border-white/10 dark:bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F5F5F5] dark:bg-white/5">
                  <tr className="h-11 border-b border-[#E5E5E5] dark:border-white/10">
                    <th className={cn(TH, 'w-10 text-left')}>#</th>
                    {config.columns.map((c) => (
                      <th key={c.key} className={cn(TH, c.align === 'right' ? 'text-right' : 'text-left')}>{c.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className="h-12 border-b border-[#E5E5E5] last:border-0 dark:border-white/5">
                      <td className="px-3 text-[13px] text-[#737373]">{r.marker ? '—' : i + 1}</td>
                      {config.columns.map((c, ci) => {
                        const v = r[c.key]
                        const neg = c.negRed && typeof v === 'number' && v < 0
                        return (
                          <td
                            key={c.key}
                            className={cn(
                              'px-3 text-[13px]',
                              c.align === 'right' ? 'text-right' : 'text-left',
                              ci === 0 ? 'font-medium text-[#0A0A0A] dark:text-white' : 'text-[#525252] dark:text-muted-foreground',
                              neg && 'font-medium text-[#DC2626] dark:text-[#F87171]'
                            )}
                          >
                            {cellText(r, c)}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
                {showTotalRow && (
                  <tfoot className="bg-[#F5F5F5] dark:bg-white/5">
                    <tr className="h-12">
                      <td className="px-3" />
                      {config.columns.map((c) => {
                        const v = config.total[c.key]
                        const neg = c.negRed && typeof v === 'number' && v < 0
                        return (
                          <td key={c.key} className={cn('px-3 text-[13px] font-semibold', c.align === 'right' ? 'text-right' : 'text-left', neg ? 'text-[#DC2626] dark:text-[#F87171]' : 'text-[#0A0A0A] dark:text-white')}>
                            {cellText(config.total, c)}
                          </td>
                        )
                      })}
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {config.footnote && (
            <p className={cn('text-[13px]', config.footnoteTone === 'red' ? 'text-[#DC2626] dark:text-[#F87171]' : 'text-[#737373] dark:text-muted-foreground')}>
              {config.footnote}
            </p>
          )}
        </>
      )}

      <ReportPrintModal
        open={printOpen}
        onOpenChange={setPrintOpen}
        title={meta.name}
        meta={
          isAkt
            ? [
                { label: 'DAVR', value: f.period },
                { label: 'KONTRAGENT', value: f.counterparty },
                { label: 'VALYUTA', value: f.currency },
                { label: 'HISOB TURI', value: f.accountKind },
              ]
            : [
                { label: 'DAVR', value: f.period },
                { label: 'OMBOR', value: f.warehouse },
                { label: 'SIFAT', value: f.quality || 'Barchasi' },
                { label: 'HISSADOR', value: f.stakeholder || 'Barchasi' },
              ]
        }
        columns={config.columns}
        rows={rows}
        total={config.total}
        fmt={cellText}
      />
    </div>
  )
}

function BackLink({ onClick }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-1.5 text-[15px] font-medium text-[#0A0A0A] transition-colors hover:text-[#0052D2] dark:text-white">
      <ChevronLeft className="h-4 w-4" /> Hisobotlar
    </button>
  )
}

function SelectField({ label, value, onChange, options, allLabel }) {
  return (
    <div>
      <Label className={labelCls}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={fieldCls}>
          <SelectValue>{(v) => (v === '__all' ? allLabel : v)}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {allLabel && <SelectItem value="__all">{allLabel}</SelectItem>}
          {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  )
}

function EmptyBox({ icon, title, text }) {
  return (
    <div className="rounded-xl border border-[#E5E5E5] bg-white dark:border-white/10 dark:bg-card">
      <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F5F5F5] dark:bg-white/5">{icon}</div>
        <p className="mt-1 font-medium text-[#0A0A0A] dark:text-white">{title}</p>
        <p className="max-w-md text-sm text-[#737373] dark:text-muted-foreground">{text}</p>
      </div>
    </div>
  )
}
