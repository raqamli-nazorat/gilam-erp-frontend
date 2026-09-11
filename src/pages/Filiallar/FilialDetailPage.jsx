import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { HugeiconsIcon } from '@hugeicons/react'
import { Copy01Icon } from '@hugeicons/core-free-icons/index'
import { usePageHeader } from '@/hooks/usePageHeader'
import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import { holatLabel } from '@/features/filiallar/filiallarData'
import Toast from '@/components/Toast'
import StatCards from './components/StatCards'
import FilialFooter from './components/FilialFooter'
import { Panel, InfoRow, headBg, surface } from './components/InfoPanel'

const THb =
  'sticky top-0 z-10 h-11 bg-[#9AC2FF] px-3 text-[12px] font-semibold uppercase leading-[18px] text-[#0A0A0A] dark:bg-[#0052D2]/40 dark:text-white'

export default function FilialDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const branch = useSelector((s) => s.filiallar.list.find((b) => b.id === id))
  const [toast, setToast] = useState('')

  usePageHeader(branch ? [{ label: 'Filiallar', to: '/filiallar' }, { label: branch.name }] : 'Filiallar')

  useEffect(() => {
    if (!branch) navigate('/filiallar', { replace: true })
  }, [branch, navigate])
  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(''), 3000)
    return () => clearTimeout(t)
  }, [toast])

  if (!branch) return null

  const closed = branch.status === 'closed'
  const d = branch.detail
  const salesTotal = d.lastSales.reduce((s, r) => s + r.amount, 0)

  function copy(text, label) {
    navigator.clipboard?.writeText(String(text))
    setToast(`${label} nusxalandi`)
  }

  return (
    <>
      <div className="flex h-full flex-col gap-3">
        <StatCards
          items={[
            { title: 'XODIMLAR', value: `${formatNumber(branch.stats.xodimlar, 0)} ta`, to: `/filiallar/${id}/xodimlar` },
            { title: 'OMBORLAR', value: `${formatNumber(branch.stats.omborlar, 0)} ta`, to: `/filiallar/${id}/omborlar` },
            { title: 'MIJOZLAR', value: `${formatNumber(branch.stats.mijozlar, 0)} ta`, to: `/filiallar/${id}/mijozlar` },
            { title: 'SAVDO', value: `${formatNumber(branch.stats.savdo, 2)} UZS`, to: `/filiallar/${id}/savdo` },
          ]}
        />

        {closed && branch.close && (
          <div className="rounded-[8px] bg-[#FEECEC] px-3.5 py-3 text-[13px] font-medium leading-5 text-[#B42318] dark:bg-[#DC2626]/15 dark:text-[#F87171]">
            Filial yopilgan, {branch.close.at}. Sabab: {branch.close.reason}. Yopdi: {branch.close.by}.
          </div>
        )}

        <div className="flex min-h-0 flex-1 flex-col gap-2 lg:flex-row">
          {/* Xodimlar jadvali */}
          <div className={cn('flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden', surface)}>
            <div className="min-h-0 flex-1 overflow-auto">
              <table className="w-full border-separate border-spacing-0 text-sm">
                <thead>
                  <tr>
                    <th className={cn(THb, 'w-10 text-left')}>#</th>
                    <th className={cn(THb, 'text-left')}>F.I.SH.</th>
                    <th className={cn(THb, 'text-left')}>LAVOZIM</th>
                    <th className={cn(THb, 'text-left')}>TELEFON</th>
                    <th className={cn(THb, 'pr-4 text-left')}>HOLAT</th>
                  </tr>
                </thead>
                <tbody>
                  {d.xodimlar.length === 0 ? (
                    <tr><td colSpan={5} className="py-14 text-center text-sm text-[#737373]">Xodim yo‘q</td></tr>
                  ) : (
                    d.xodimlar.map((x, i) => (
                      <tr key={x.id} className="h-[60px] hover:bg-[#E3E9F6] dark:hover:bg-white/5">
                        <td className="px-3 text-[13px] text-[#737373]">{i + 1}</td>
                        <td className="px-3 text-[13px] font-medium text-[#0052D2] dark:text-[#60A5FA]">{x.name}</td>
                        <td className="px-3 text-[13px] text-[#0a0a0a] dark:text-muted-foreground">{x.lavozim}</td>
                        <td className="px-3 text-[13px] text-[#0a0a0a] dark:text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5">
                            {x.phone}
                            <button
                              type="button"
                              onClick={() => copy(x.phone, 'Telefon')}
                              className="text-[#737373] transition-colors hover:text-[#0052D2] dark:hover:text-[#60A5FA]"
                              aria-label="Nusxa olish"
                            >
                              <HugeiconsIcon icon={Copy01Icon} size={16} strokeWidth={2} />
                            </button>
                          </span>
                        </td>
                        <td className="px-3 pr-4 text-[13px] text-[#525252] dark:text-muted-foreground">{x.holat}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* O'ng panel */}
          <div className="w-full shrink-0 space-y-4 overflow-auto lg:w-[400px]">
            <Panel title="Filial ma’lumotlari:">
              <InfoRow label="Tashkilot" value={branch.tashkilot} />
              <InfoRow label="Filial turi" value={branch.turi} />
              <InfoRow label="Direktor" value={branch.director} />
              <InfoRow label="Telefon" value={branch.phone} onCopy={() => copy(branch.phone, 'Telefon')} />
              <InfoRow label="Viloyat" value={branch.viloyat} />
              <InfoRow label="Tuman" value={branch.tuman} />
              <InfoRow label="Manzil" value={branch.manzil} />
              <InfoRow label="Ochilgan sana" value={branch.openedAt} />
              <InfoRow
                label="Holat"
                value={
                  <span
                    className={cn(
                      'inline-flex h-[22px] items-center rounded-full px-2.5 text-[11px] font-medium tracking-[0.3px]',
                      closed
                        ? 'bg-[#F5F5F5] text-[#737373] dark:bg-white/10 dark:text-muted-foreground'
                        : 'bg-[#E6FAF1] text-[#047A47] dark:bg-[#047A47]/20 dark:text-[#34D399]'
                    )}
                  >
                    {holatLabel(branch.status)}
                  </span>
                }
              />
            </Panel>

            <Panel title="Oxirgi savdolar:">
              {d.lastSales.map((r, i) => (
                <div key={r.date} className="flex items-center justify-between px-4 py-2.5 text-[13px]">
                  <span className="text-[#525252] dark:text-muted-foreground">{r.date}</span>
                  <span className="font-medium text-[#0A0A0A] dark:text-white">
                    {formatNumber(r.amount, 2)}{i === 0 ? ' UZS' : ''}
                  </span>
                </div>
              ))}
              <div className={cn('flex items-center justify-between px-4 py-2.5 text-[13px] font-semibold text-[#0A0A0A] dark:text-white', headBg)}>
                <span>JAMI, 7 kun</span>
                <span>{formatNumber(salesTotal, 2)}</span>
              </div>
            </Panel>
          </div>
        </div>

        <FilialFooter branch={branch} />
      </div>
      <Toast message={toast} />
    </>
  )
}
