import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { Trash2, X } from 'lucide-react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Edit02Icon } from '@hugeicons/core-free-icons/index'
import { cn } from '@/lib/utils'
import { usePageHeader } from '@/hooks/usePageHeader'
import { formatDate } from '@/lib/format'
import * as recruitmentService from '@/services/recruitmentService'
import { deleteKadr, mapRecruitment, updateKadr } from '@/features/xodimlar/xodimlarSlice'
import { fetchBranches } from '@/features/filiallar/filiallarSlice'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import Toast from '@/components/Toast'
import { Panel, InfoRow, surface } from './components/InfoPanel'
import XodimModal from './components/XodimModal'

const THb =
  'sticky top-0 z-10 h-10 bg-[#9AC2FF] px-3 text-[12px] font-semibold uppercase leading-[18px] text-[#0A0A0A] dark:bg-[#0052D2]/40 dark:text-white'

// Xodim (Employee) shaxsiy profili — to'g'ridan-to'g'ri ko'rish/tahrirlash/o'chirish, Figma
// bo'yicha ("boshqa bo'limlarga tegma, manashu bo'lim o'zi alohida bo'ladi" — Ishga qabul
// qilish/Foydalanuvchilar'dagi ishga olish/ishdan chiqarish oqimi bilan bog'lanmaydi, bu
// sahifa mustaqil). "Faol/Nofaol" Employee'ning o'z maydoni emas (Swagger tasdiqlagan —
// bunday maydon yo'q) — shu bo'lim doirasida eng oxirgi RecruitmentDismissal yozuvidan kelib
// chiqib (`holat`) hisoblanadi: 'boshagan' bo'lmasa — Faol.
export default function XodimlarDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const xodim = useSelector((s) => s.xodimlar.list.find((x) => x.id === id))
  const branches = useSelector((s) => s.filiallar.list)
  const branchesStatus = useSelector((s) => s.filiallar.listStatus)

  const [history, setHistory] = useState([])
  const [historyStatus, setHistoryStatus] = useState('idle')
  const [editOpen, setEditOpen] = useState(false)
  const [delOpen, setDelOpen] = useState(false)
  const [toast, setToast] = useState('')

  usePageHeader(xodim ? [{ label: 'Xodimlar', to: '/malumotnomalar/xodimlar' }, { label: xodim.name }] : 'Xodimlar')

  useEffect(() => {
    if (!xodim) navigate('/malumotnomalar/xodimlar', { replace: true })
  }, [xodim, navigate])

  useEffect(() => {
    if (branchesStatus === 'idle') dispatch(fetchBranches())
  }, [branchesStatus, dispatch])

  // Ish tarixi — bu xodimga tegishli barcha "Ishga olish" hujjatlari ("Ishga qabul qilish"
  // bo'limidan, agar bo'lsa). `type` maydoni ro'yxat javobida umuman yo'q (real OpenAPI
  // sxemasi bilan tasdiqlangan — LIST va RETRIEVE ikki xil serializer ishlatadi), shuning
  // uchun oddiy ro'yxat so'rovi bilan `.type === 'recruitment'` filtri doim yolg'on chiqib,
  // jadval doim bo'sh ko'rinardi — endi `type` bo'yicha filtrlangan (natijasi BIZ tomondan
  // belgilangan) so'rov ishlatiladi. Tashkilot nomi ham endi to'g'ridan-to'g'ri (r.tashkilot,
  // organization_name'dan) keladi — branchId ro'yxat javobida yo'q, filiallar bo'yicha qidirish
  // ishlamas edi.
  useEffect(() => {
    if (!id) return
    let cancelled = false
    setHistoryStatus('loading')
    recruitmentService
      .getAllRecruitmentDismissalsTagged({ employee: id })
      .then((rows) => {
        if (cancelled) return
        const records = rows.map(mapRecruitment).filter((r) => r.type === 'recruitment')
        const sorted = [...records].sort((a, b) => (a.sana < b.sana ? 1 : a.sana > b.sana ? -1 : 0))
        setHistory(
          sorted.map((r, i) => ({
            ...r,
            tashkilot: r.tashkilot || branches.find((b) => b.id === r.branchId)?.tashkilot || '—',
            holat: i === 0 ? 'Faol' : 'Tugatilgan',
          }))
        )
        setHistoryStatus('succeeded')
      })
      .catch(() => {
        if (!cancelled) setHistoryStatus('failed')
      })
    return () => {
      cancelled = true
    }
  }, [id, branches])

  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(''), 3000)
    return () => clearTimeout(t)
  }, [toast])

  if (!xodim) return null

  function copy(text, label) {
    navigator.clipboard?.writeText(String(text))
    setToast(`${label} nusxalandi`)
  }

  const isActive = xodim.holat !== 'boshagan'

  return (
    <>
      <div className="flex h-full flex-col gap-3">
        {/* Bu sahifaning o'z rang sxemasi — umumiy StatCards komponenti (Filiallar/
            Foydalanuvchilar bilan bo'lishiladi) o'rniga to'g'ridan-to'g'ri chizilgan, shu
            bilan bu yerdagi ranglarni o'zgartirish boshqa sahifalarga ta'sir qilmaydi. */}
        <div className="grid shrink-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-[#9E9DAE] p-5 text-left text-[#0A0A0A]">
            <div className="text-[12px] font-semibold uppercase tracking-[0.4px]">HOLATI</div>
            <p className="mt-3 text-[22px] font-bold leading-tight">{isActive ? 'Faol' : 'Nofaol'}</p>
          </div>
          <div className="rounded-xl bg-[#CDE7FE] p-5 text-left text-[#0A0A0A]">
            <div className="text-[12px] font-semibold uppercase tracking-[0.4px]">VILOYATI</div>
            <p className="mt-3 text-[22px] font-bold leading-tight">{xodim.viloyat || '—'}</p>
          </div>
          <div className="rounded-xl bg-[#F8C3B3] p-5 text-left text-[#0A0A0A]">
            <div className="text-[12px] font-semibold uppercase tracking-[0.4px]">TUMANI</div>
            <p className="mt-3 text-[22px] font-bold leading-tight">{xodim.tuman || '—'}</p>
          </div>
          <div className="rounded-xl bg-[#B3F8C5] p-5 text-left text-[#0A0A0A]">
            <div className="text-[12px] font-semibold uppercase tracking-[0.4px]">FILIALI</div>
            <p className="mt-3 text-[22px] font-bold leading-tight">{xodim.filial || '—'}</p>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-2 lg:flex-row">
          {/* Ish tarixi jadvali */}
          <div className={cn('flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl', surface)}>
            <div className="min-h-0 flex-1 overflow-auto">
              <table className="w-full border-separate border-spacing-0 text-sm">
                <thead>
                  <tr>
                    <th className={cn(THb, 'w-10 text-left')}>#</th>
                    <th className={cn(THb, 'text-left')}>TASHKILOT</th>
                    <th className={cn(THb, 'text-left')}>FILIAL</th>
                    <th className={cn(THb, 'text-left')}>LAVOZIM</th>
                    <th className={cn(THb, 'text-left')}>ISHGA OLINGAN</th>
                    <th className={cn(THb, 'pr-4 text-left')}>HOLAT</th>
                  </tr>
                </thead>
                <tbody>
                  {historyStatus === 'loading' ? (
                    <tr>
                      <td colSpan={6} className="py-14 text-center text-sm text-[#737373]">Yuklanmoqda…</td>
                    </tr>
                  ) : history.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-14 text-center text-sm text-[#737373]">Bu ma’lumot hali mavjud emas</td>
                    </tr>
                  ) : (
                    history.map((r, i) => (
                      <tr key={r.id} className="h-11 hover:bg-[#E3E9F6] dark:hover:bg-white/5">
                        <td className="px-3 text-[13px] text-[#737373]">{i + 1}</td>
                        <td className="px-3 text-[13px] text-[#0A0A0A] dark:text-white">{r.tashkilot}</td>
                        <td className="px-3 text-[13px] text-[#525252] dark:text-muted-foreground">{r.branch || '—'}</td>
                        <td className="px-3 text-[13px] text-[#525252] dark:text-muted-foreground">{r.lavozim || '—'}</td>
                        <td className="px-3 text-[13px] text-[#525252] dark:text-muted-foreground">{formatDate(r.sana)}</td>
                        <td className="px-3 pr-4">
                          <span
                            className={cn(
                              'inline-flex h-[22px] items-center rounded-full px-2 text-[11px] font-medium tracking-[0.3px]',
                              r.holat === 'Faol'
                                ? 'bg-[#E6FAF1] text-[#047A47] dark:bg-[#047A47]/20 dark:text-[#34D399]'
                                : 'bg-[#F5F5F5] text-[#737373] dark:bg-white/10 dark:text-muted-foreground'
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

          {/* O'ng panel */}
          <div className="flex w-full min-h-0 shrink-0 flex-col gap-4 lg:w-[400px]">
            <Panel title="SHAXSIY MA’LUMOTLAR" className="min-h-0 flex-1">
              <InfoRow label="Telefoni" value={xodim.phone} onCopy={() => copy(xodim.phone, 'Telefon')} />
              <InfoRow
                label="Passport seriyasi va raqami"
                value={[xodim.passportSeria, xodim.passportNumber].filter(Boolean).join(' ')}
                onCopy={() => copy([xodim.passportSeria, xodim.passportNumber].filter(Boolean).join(' '), 'Passport')}
              />
              <InfoRow label="JSHSHIR" value={xodim.jshshir} onCopy={() => copy(xodim.jshshir, 'JSHSHIR')} />
              <InfoRow label="STIR" value={xodim.stir} onCopy={() => copy(xodim.stir, 'STIR')} />
              <InfoRow label="Viloyati" value={xodim.viloyat} />
              <InfoRow label="Tumani" value={xodim.tuman} />
              <InfoRow label="Manzili" value={xodim.manzil} />
              <InfoRow label="Filiali" value={xodim.filial} />
              <InfoRow label="Izoh" value={xodim.tavsif} />
              <InfoRow label="Yaratilgan" value={xodim.yaratilgan} />
              <InfoRow label="Yangilangan" value={xodim.ozgartirilgan} />
              <InfoRow
                label="Holati"
                value={
                  <span
                    className={cn(
                      'inline-flex h-[22px] items-center rounded-full px-2.5 text-[11px] font-medium tracking-[0.3px]',
                      isActive
                        ? 'bg-[#E6FAF1] text-[#047A47] dark:bg-[#047A47]/20 dark:text-[#34D399]'
                        : 'bg-[#F5F5F5] text-[#737373] dark:bg-white/10 dark:text-muted-foreground'
                    )}
                  >
                    {isActive ? 'Faol' : 'Nofaol'}
                  </span>
                }
              />
            </Panel>
          </div>
        </div>

        {/* Pastki panel */}
        <div className="flex shrink-0 items-center justify-end gap-2.5 border-t border-[#E5E5E5] bg-[#F5F5F5] px-6 py-3 dark:border-white/10 dark:bg-white/5">
          <Button
            variant="outline"
            onClick={() => setEditOpen(true)}
            className="h-9 gap-2 rounded-lg border border-[#E5E5E5] bg-[#EFF1F7] px-4 text-sm font-medium text-[#0A0A0A] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] hover:bg-[#E3E7F0] dark:border-white/10 dark:bg-card dark:text-white dark:hover:bg-white/10"
          >
            <HugeiconsIcon icon={Edit02Icon} size={16} strokeWidth={2} /> Tahrirlash
          </Button>
          <Button
            onClick={() => setDelOpen(true)}
            className="h-9 gap-2 bg-[#DC2626] px-4 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#B91C1C]"
          >
            <Trash2 className="h-4 w-4" /> O‘chirish
          </Button>
        </div>
      </div>

      <XodimModal
        open={editOpen}
        onOpenChange={setEditOpen}
        xodim={xodim}
        onSave={(values) => {
          dispatch(updateKadr({ id: xodim.id, draft: values }))
            .unwrap()
            .then(() => setToast('O‘zgarishlar saqlandi'))
            .catch((err) => setToast(err || 'Saqlashda xatolik yuz berdi'))
        }}
      />

      <Dialog open={delOpen} onOpenChange={setDelOpen}>
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-[480px]">
          <DialogHeader className="flex flex-row items-center justify-between px-5 pt-5">
            <DialogTitle className="text-[17px] font-semibold leading-[24px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
              Xodim o‘chirish?
            </DialogTitle>
          </DialogHeader>
          <div className="rounded-lg bg-[#F5F5F5] px-4 py-3 text-[13px] dark:bg-white/5 mx-5 my-4">
            {[
              ['F.I.SH.', xodim.name],
              ['Telefoni', xodim.phone || '—'],
              ['Holati', isActive ? 'Faol' : 'Nofaol'],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between py-1">
                <span className="text-[#737373] dark:text-muted-foreground">{k}</span>
                <span className="font-medium text-[#0A0A0A] dark:text-white">{v}</span>
              </div>
            ))}
          </div>
          <DialogFooter className="mx-0 mb-0 mt-0 flex gap-2 border-0 bg-[#F5F5F5] px-5 py-4 dark:bg-white/5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDelOpen(false)}
              className="h-9 gap-1.5 border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
            >
              <X className="h-4 w-4" /> Bekor qilish
            </Button>
            <Button
              type="button"
              onClick={() => {
                dispatch(deleteKadr(xodim.id))
                  .unwrap()
                  .then(() => navigate('/malumotnomalar/xodimlar', { replace: true }))
                  .catch((err) => setToast(err || 'O‘chirishda xatolik yuz berdi'))
                setDelOpen(false)
              }}
              className="h-9 gap-1.5 bg-[#DC2626] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#B91C1C]"
            >
              <Trash2 className="h-4 w-4" /> O‘chirish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toast message={toast} />
    </>
  )
}
