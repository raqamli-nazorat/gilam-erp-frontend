import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeftRight,
  BarChart3,
  Car,
  CheckCircle2,
  Coins,
  HandCoins,
  RefreshCw,
  RotateCcw,
  Search,
  ShoppingCart,
  Tag,
  Truck,
  UserPlus,
  Wallet,
} from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { formatDate, formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import {
  docStatus,
  KASSAS,
  KASSA_ACTIONS,
  MANAGER_QUEUE,
  SALES_ACTIONS,
} from '@/features/kassa/kassaMockData'
import { cashOutMade, collected, converted, paymentAccepted } from '@/features/kassa/kassaSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Toast from '@/components/Toast'
import KassaStatusBadge from './components/KassaStatusBadge'
import AcceptPaymentModal from './components/AcceptPaymentModal'
import CashOutModal from './components/CashOutModal'
import ConvertModal from './components/ConvertModal'
import CollectionModal from './components/CollectionModal'

const ICONS = {
  savdo: ShoppingCart, bron: Tag, qaytarish: RotateCcw, nasiya: HandCoins, kunlik: Coins, inkassa: Truck,
  chiqim: Wallet, kontragent: ArrowLeftRight, kassaga: RefreshCw, konvert: RefreshCw, avans: UserPlus, transport: Car,
}
const TH = 'px-3 text-[13px] font-semibold uppercase leading-[18px] text-[#525252] dark:text-muted-foreground'

export default function KassaWorkspacePage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const rate = useSelector((s) => s.kassa.exchangeRate)
  const balance = useSelector((s) => s.kassa.balance)
  const operations = useSelector((s) => s.kassa.operations)
  const queueDocs = useSelector((s) => s.kassa.queueDocs)

  const [tab, setTab] = useState('ish')
  const [kassa, setKassa] = useState(KASSAS[0])
  const [toast, setToast] = useState('')

  const [cashoutOpen, setCashoutOpen] = useState(false)
  const [cashoutType, setCashoutType] = useState('Xarajat')
  const [convertOpen, setConvertOpen] = useState(false)
  const [collectionOpen, setCollectionOpen] = useState(false)

  usePageHeader('Kassa')

  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(''), 3500)
    return () => clearTimeout(t)
  }, [toast])

  const queueTotal = MANAGER_QUEUE.reduce((s, m) => s + m.unpaid, 0)

  function runAction(a) {
    if (a.to) return navigate(a.to)
    if (a.tab) return setTab(a.tab)
    if (a.modal === 'cashout') {
      setCashoutType(a.chiqimType || 'Xarajat')
      return setCashoutOpen(true)
    }
    if (a.modal === 'convert') return setConvertOpen(true)
    if (a.modal === 'collection') return setCollectionOpen(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E5E5] pb-2 dark:border-white/10">
        <div className="flex items-center gap-6">
          {[['ish', "Ish o'rni"], ['navbat', 'Navbat']].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                'relative flex items-center gap-1.5 pb-2.5 pt-1 text-sm transition-colors',
                tab === key ? 'font-medium text-[#0A0A0A] dark:text-white' : 'font-normal text-[#737373] hover:text-[#0A0A0A] dark:text-muted-foreground'
              )}
            >
              {label}
              {key === 'navbat' && (
                <span className={cn(
                  'inline-flex h-[18px] min-w-[24px] items-center justify-center rounded-full px-1.5 text-[12px] font-medium',
                  tab === key ? 'bg-[#EAF1FE] text-[#0052D2] dark:bg-[#0052D2]/20 dark:text-[#60A5FA]' : 'bg-[#F5F5F5] text-[#737373] dark:bg-white/10 dark:text-muted-foreground'
                )}>{queueTotal}</span>
              )}
              {tab === key && <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#0052D2]" />}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          {tab === 'navbat' && (
            <div className="relative w-[320px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
              <Input placeholder="Menejer yoki shartnoma bo'yicha qidi…" className="h-9 w-[320px] rounded-md border-[#E5E5E5] bg-white pl-9 pr-3 text-sm dark:border-white/10 dark:bg-card dark:text-white" />
            </div>
          )}
          <Select value={kassa} onValueChange={setKassa}>
            <SelectTrigger className="h-9 w-[200px] rounded-md border-[#E5E5E5] bg-white px-3 text-[14px] dark:border-white/10 dark:bg-card dark:text-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              {KASSAS.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
            </SelectContent>
          </Select>
          {tab === 'ish' && (
            <Button
              variant="outline"
              onClick={() => navigate('/kassa/kun-yakuni')}
              className="h-9 gap-2 border-[#E5E5E5] bg-white px-4 text-sm font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
            >
              <BarChart3 className="h-4 w-4" /> Kassa hisoboti
            </Button>
          )}
        </div>
      </div>

      {tab === 'ish' ? (
        <IshOrni balance={balance} rate={rate} operations={operations} onAction={runAction} />
      ) : (
        <Navbat queueDocs={queueDocs} onAccept={(payload) => {
          dispatch(paymentAccepted(payload))
          const doc = queueDocs.find((d) => d.id === payload.docId)
          setToast(`To'lov qabul qilindi · ${formatNumber(payload.usd)} USD · ${doc?.contract ?? ''}`)
        }} rate={rate} />
      )}

      <CashOutModal
        open={cashoutOpen}
        onOpenChange={setCashoutOpen}
        defaultType={cashoutType}
        balance={balance}
        exchangeRate={rate}
        onConfirm={(p) => {
          dispatch(cashOutMade(p))
          setToast(`Chiqim qilindi · ${formatNumber(p.usd)} USD`)
        }}
      />
      <ConvertModal
        open={convertOpen}
        onOpenChange={setConvertOpen}
        balance={balance}
        exchangeRate={rate}
        onConfirm={(p) => {
          dispatch(converted(p))
          setToast('Konvertatsiya bajarildi')
        }}
      />
      <CollectionModal
        open={collectionOpen}
        onOpenChange={setCollectionOpen}
        balance={balance}
        exchangeRate={rate}
        onConfirm={(p) => {
          dispatch(collected(p))
          setToast(`Inkassaga topshirildi · ${formatNumber(p.uzs, 0)} UZS`)
        }}
      />
      <Toast message={toast} />
    </div>
  )
}

function IshOrni({ balance, rate, operations, onAction }) {
  const recent = operations.slice(0, 5)
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="NAQD QOLDIQ · USD" value={<span className="text-[#0A0A0A] dark:text-white">{formatNumber(balance.usd)}</span>} sub={`${balance.kassa} · ${balance.asOf} holatiga`} />
        <StatCard title="NAQD QOLDIQ · UZS" value={<span className="text-[#0A0A0A] dark:text-white">{formatNumber(balance.uzs, 0)}</span>} sub={`Kurs 1 USD = ${formatNumber(rate)}`} />
        <StatCard title="BUGUNGI KIRIM" value={<span className="text-[#047A47] dark:text-[#34D399]">+{formatNumber(balance.todayIn)} USD</span>} sub={`${balance.todayOps} ta operatsiya · chiqim ${formatNumber(balance.todayOut)} USD`} />
      </div>

      <ActionGrid title="SAVDO AMALLARI" actions={SALES_ACTIONS} onAction={onAction} />
      <ActionGrid title="KASSA AMALLARI" actions={KASSA_ACTIONS} onAction={onAction} />

      <div>
        <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.4px] text-[#737373] dark:text-muted-foreground">Oxirgi operatsiyalar</p>
        <div className="overflow-hidden rounded-xl border border-[#E5E5E5] bg-white dark:border-white/10 dark:bg-card">
          <table className="w-full text-sm">
            <thead className="bg-[#F5F5F5] dark:bg-white/5">
              <tr className="h-10 border-b border-[#E5E5E5] dark:border-white/10">
                <th className={cn(TH, 'w-10 text-left')}>#</th>
                <th className={cn(TH, 'text-left')}>VAQT</th>
                <th className={cn(TH, 'text-left')}>AMAL</th>
                <th className={cn(TH, 'text-left')}>IZOH</th>
                <th className={cn(TH, 'text-right')}>KIRIM, USD</th>
                <th className={cn(TH, 'text-right')}>CHIQIM, USD</th>
                <th className={cn(TH, 'text-left')}>KASSIR</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((o, i) => (
                <tr key={o.id} className="h-12 border-b border-[#E5E5E5] last:border-0 dark:border-white/5">
                  <td className="px-3 text-[13px] text-[#737373]">{i + 1}</td>
                  <td className="px-3 text-[13px] text-[#525252] dark:text-muted-foreground">{o.time}</td>
                  <td className="px-3 text-[13px] font-medium text-[#0A0A0A] dark:text-white">{o.type}</td>
                  <td className="max-w-[280px] truncate px-3 text-[13px] text-[#525252] dark:text-muted-foreground">{o.note}</td>
                  <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{o.cashIn != null ? formatNumber(o.cashIn) : '—'}</td>
                  <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{o.cashOut != null ? formatNumber(o.cashOut) : '—'}</td>
                  <td className="px-3 text-[13px] text-[#525252] dark:text-muted-foreground">{o.cashier}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

function ActionGrid({ title, actions, onAction }) {
  return (
    <div>
      <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.4px] text-[#737373] dark:text-muted-foreground">{title}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {actions.map((a) => {
          const Icon = ICONS[a.key] ?? Wallet
          return (
            <button
              key={a.key}
              type="button"
              onClick={() => onAction(a)}
              className="flex flex-col items-start gap-6 rounded-xl border border-[#E5E5E5] bg-white p-4 text-left transition-colors hover:border-[#0052D2]/40 hover:bg-[#F9FAFB] dark:border-white/10 dark:bg-card dark:hover:bg-white/5"
            >
              <Icon className="h-6 w-6 text-[#0052D2] dark:text-[#60A5FA]" />
              <span className="text-[15px] font-medium text-[#0A0A0A] dark:text-white">{a.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Navbat({ queueDocs, onAccept, rate }) {
  const [managerId, setManagerId] = useState(MANAGER_QUEUE[0].id)
  const [sub, setSub] = useState('unpaid')
  const [payDoc, setPayDoc] = useState(null)

  const manager = MANAGER_QUEUE.find((m) => m.id === managerId)
  const docs = queueDocs.filter((d) => d.managerId === managerId)
  const unpaidDocs = docs.filter((d) => !d.paid && d.paidPct < 100)
  const paidCount = manager.paid + (docs.length - unpaidDocs.length)
  const shown = sub === 'unpaid' ? unpaidDocs : docs.filter((d) => d.paid || d.paidPct >= 100)
  const queueTotal = MANAGER_QUEUE.reduce((s, m) => s + m.unpaid, 0)

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <div className="w-full shrink-0 lg:w-[380px]">
        <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.4px] text-[#737373] dark:text-muted-foreground">
          Menejerlar navbati · {queueTotal} ta hujjat
        </p>
        <div className="flex flex-col gap-2">
          {MANAGER_QUEUE.map((m) => {
            const cnt = m.id === managerId ? unpaidDocs.length : m.unpaid
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => { setManagerId(m.id); setSub('unpaid') }}
                className={cn(
                  'flex items-center justify-between gap-3 rounded-xl border bg-white p-3.5 text-left transition-colors dark:bg-card',
                  m.id === managerId ? 'border-[#0052D2] ring-1 ring-[#0052D2]/30' : 'border-[#E5E5E5] hover:bg-[#F9FAFB] dark:border-white/10 dark:hover:bg-white/5'
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EAF1FE] text-[12px] font-semibold text-[#0052D2] dark:bg-[#0052D2]/20 dark:text-[#60A5FA]">{m.initials}</span>
                  <div>
                    <p className="text-[14px] font-medium text-[#0A0A0A] dark:text-white">{m.name}</p>
                    <p className="text-[12px] text-[#737373] dark:text-muted-foreground">{m.role}</p>
                  </div>
                </div>
                <span className={cn(
                  'flex h-6 min-w-[24px] items-center justify-center rounded-full px-1.5 text-[12px] font-semibold',
                  cnt > 0 ? 'bg-[#0052D2] text-white' : 'bg-[#F5F5F5] text-[#737373] dark:bg-white/10 dark:text-muted-foreground'
                )}>{cnt}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[12px] font-semibold uppercase tracking-[0.4px] text-[#737373] dark:text-muted-foreground">
            {manager.name} · saqlangan hujjatlar
          </p>
        </div>
        <div className="overflow-hidden rounded-xl border border-[#E5E5E5] bg-white dark:border-white/10 dark:bg-card">
          <div className="flex items-center justify-between border-b border-[#E5E5E5] px-4 pt-3 dark:border-white/10">
            <div className="flex items-center gap-6">
              {[['unpaid', "To'lanmagan", unpaidDocs.length], ['paid', "To'langan", paidCount]].map(([key, label, count]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSub(key)}
                  className={cn(
                    'relative flex items-center gap-1.5 pb-2.5 text-sm transition-colors',
                    sub === key ? 'font-medium text-[#0A0A0A] dark:text-white' : 'font-normal text-[#737373] hover:text-[#0A0A0A] dark:text-muted-foreground'
                  )}
                >
                  {label}
                  <span className={cn(
                    'inline-flex h-[18px] min-w-[22px] items-center justify-center rounded-full px-1.5 text-[12px] font-medium',
                    sub === key ? 'bg-[#EAF1FE] text-[#0052D2] dark:bg-[#0052D2]/20 dark:text-[#60A5FA]' : 'bg-[#F5F5F5] text-[#737373] dark:bg-white/10 dark:text-muted-foreground'
                  )}>{count}</span>
                  {sub === key && <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#0052D2]" />}
                </button>
              ))}
            </div>
            <Button
              disabled={sub !== 'unpaid' || shown.length === 0}
              onClick={() => setPayDoc(shown[0])}
              className="mb-2 h-9 gap-2 bg-[#0052D2] px-4 text-sm font-medium text-white hover:bg-[#0047B8] disabled:bg-[#E5E5E5] disabled:text-[#A3A3A3] disabled:opacity-100 dark:disabled:bg-white/10"
            >
              <CheckCircle2 className="h-4 w-4" /> To'lovni qabul qilish
            </Button>
          </div>

          <table className="w-full text-sm">
            <thead className="bg-[#F5F5F5] dark:bg-white/5">
              <tr className="h-10 border-b border-[#E5E5E5] dark:border-white/10">
                <th className={cn(TH, 'w-10 text-left')}>#</th>
                <th className={cn(TH, 'text-left')}>SANA</th>
                <th className={cn(TH, 'text-left')}>KONTRAGENT</th>
                <th className={cn(TH, 'text-left')}>SHARTNOMA</th>
                <th className={cn(TH, 'text-right')}>SUMMA, USD</th>
                <th className={cn(TH, 'text-right')}>TO'LANDI</th>
                <th className={cn(TH, 'text-left')}>HOLAT</th>
              </tr>
            </thead>
            <tbody>
              {shown.length === 0 ? (
                <tr><td colSpan={7} className="py-14 text-center text-sm text-[#737373]">Hujjat yo'q</td></tr>
              ) : shown.map((d, i) => (
                <tr key={d.id} className="h-12 border-b border-[#E5E5E5] last:border-0 dark:border-white/5">
                  <td className="px-3 text-[13px] text-[#737373]">{i + 1}</td>
                  <td className="px-3 text-[13px] text-[#525252] dark:text-muted-foreground">{formatDate(d.date)}</td>
                  <td className="px-3 text-[13px] font-medium text-[#0A0A0A] dark:text-white">{d.counterparty}</td>
                  <td className="px-3 text-[13px] font-medium text-[#0052D2] dark:text-[#60A5FA]">{d.contract}</td>
                  <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{formatNumber(d.amountUsd)}</td>
                  <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{formatNumber(d.paid ? 100 : d.paidPct, 1)} %</td>
                  <td className="px-3"><KassaStatusBadge status={docStatus(d)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AcceptPaymentModal
        open={!!payDoc}
        onOpenChange={(next) => !next && setPayDoc(null)}
        doc={payDoc}
        managerName={manager.name}
        exchangeRate={rate}
        onAccept={onAccept}
      />
    </div>
  )
}

function StatCard({ title, value, sub }) {
  return (
    <div className="rounded-xl border border-[#E5E5E5] bg-white p-4 dark:border-white/10 dark:bg-card">
      <p className="text-[12px] font-semibold uppercase tracking-[0.4px] text-[#737373] dark:text-muted-foreground">{title}</p>
      <p className="mt-1 text-[24px] font-bold leading-tight">{value}</p>
      <p className="mt-1 text-[12px] text-[#737373] dark:text-muted-foreground">{sub}</p>
    </div>
  )
}
