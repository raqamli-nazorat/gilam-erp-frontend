import { useEffect, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { useTabCounts } from '@/hooks/useTabCounts'
import { RECRUITMENT_STATUS_PARAM } from '@/features/xodimlar/xodimlarSlice'

// "Ishga qabul qilish" va "Ishdan chiqarish" ro'yxatlari uchun umumiy holat tab'lari/yorlig'i.
// Backend RecruitmentDismissal.status: draft | approved | cancelled (frontendda approved = confirmed).

export const STATUS_TABS = [
  ['all', 'Barchasi'],
  ['confirmed', 'Tasdiqlangan'],
  ['draft', 'Qoralama'],
  ['cancelled', 'Bekor qilingan'],
]
const STATUS_KEYS = ['confirmed', 'draft', 'cancelled']
export const STATUS_LABEL = { draft: 'Qoralama', confirmed: 'Tasdiqlangan', cancelled: 'Bekor qilingan' }
const STATUS_BADGE_CLS = {
  draft: 'bg-[#0A0A0A] text-white dark:bg-white/20',
  confirmed: 'bg-[#16A34A] text-white',
  cancelled: 'bg-[#DC2626] text-white',
}

// Ro'yxat so'roviga beriladigan `status` parametri (tab 'all' bo'lsa — yuborilmaydi).
export function statusParam(tab) {
  return tab === 'all' ? undefined : RECRUITMENT_STATUS_PARAM[tab]
}

export function StatusBadge({ status }) {
  if (!STATUS_LABEL[status]) return null
  return (
    <span
      className={cn(
        'inline-flex h-[22px] items-center whitespace-nowrap rounded-full px-2.5 text-[12px] font-medium',
        STATUS_BADGE_CLS[status]
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  )
}

export function StatusTabs({ tab, onChange, counts }) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-lg bg-[#F5F5F5] p-1 dark:bg-white/5">
      {STATUS_TABS.map(([key, label]) => {
        const active = tab === key
        const n = counts[key]
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={cn(
              'flex h-7 items-center gap-1.5 whitespace-nowrap rounded-[7px] px-2.5 text-[13px] font-medium transition-colors',
              active
                ? 'bg-white text-[#0A0A0A] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] dark:bg-card dark:text-white'
                : 'text-[#737373] hover:text-[#0A0A0A] dark:text-muted-foreground dark:hover:text-white'
            )}
          >
            {label}
            {n != null && (
              <span
                className={cn(
                  'inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1.5 text-[12px] font-medium',
                  active
                    ? 'bg-[#EAF1FE] text-[#0052D2] dark:bg-[#0052D2]/20 dark:text-[#60A5FA]'
                    : 'text-[#A3A3A3] dark:text-muted-foreground'
                )}
              >
                {n}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// Backend javobidagi `counts` — shakli hujjatlashtirilmagan, shuning uchun ikkala ko'rinish qabul
// qilinadi: { draft: 11, approved: 1, cancelled: 1, all?/total? } yoki [{ status, count }].
// Natija: { all, confirmed, draft, cancelled } (frontend kalitlari) yoki null.
function normalizeStatusCounts(raw) {
  if (!raw || typeof raw !== 'object') return null
  const byStatus = {}
  if (Array.isArray(raw)) {
    raw.forEach((it) => {
      const k = it?.status ?? it?.key ?? it?.value
      if (k != null) byStatus[k] = Number(it.count ?? it.total ?? 0)
    })
  } else {
    Object.entries(raw).forEach(([k, v]) => {
      byStatus[k] = Number(typeof v === 'object' && v !== null ? v.count ?? v.total ?? 0 : v)
    })
  }
  const out = {}
  Object.entries(RECRUITMENT_STATUS_PARAM).forEach(([front, back]) => {
    if (Number.isFinite(byStatus[back])) out[front] = byStatus[back]
  })
  if (!STATUS_KEYS.every((k) => Number.isFinite(out[k]))) return null
  const all = byStatus.all ?? byStatus.total ?? byStatus.barchasi
  out.all = Number.isFinite(all) ? all : out.confirmed + out.draft + out.cancelled
  return out
}

const STATUS_VARIANTS = Object.fromEntries(STATUS_KEYS.map((k) => [k, { status: RECRUITMENT_STATUS_PARAM[k] }]))
const NO_VARIANTS = {}

// Tab hisoblagichlari — sahifaga kirgan zahoti hammasi ko'rinadi:
// - backend ro'yxat javobida `counts` bo'lsa — shundan (qo'shimcha so'rovsiz);
// - bo'lmasa (birinchi yuklanishdan keyin bir marta aniqlanadi) — har bir holat uchun bittadan
//   1-sahifa so'rovi bilan (useTabCounts), "Barchasi" esa yig'indidan.
// `fetchPage` — { count } qaytaruvchi modul darajasidagi servis funksiyasi; `baseParams` — status'siz
// ro'yxat parametrlari (qidiruv/filtrlar).
export function useStatusTabCounts({ fetchPage, baseParams, statusCounts, tab, totalCount, isLoading, listError }) {
  const backendCounts = useMemo(() => normalizeStatusCounts(statusCounts), [statusCounts])
  const [mode, setMode] = useState(null) // null | 'backend' | 'fallback'
  useEffect(() => {
    if (mode === null && !isLoading && !listError) setMode(backendCounts ? 'backend' : 'fallback')
  }, [mode, isLoading, listError, backendCounts])

  const fallbackCounts = useTabCounts(
    fetchPage,
    baseParams,
    mode === 'fallback' ? STATUS_VARIANTS : NO_VARIANTS,
    tab,
    totalCount,
    isLoading
  )
  return backendCounts ?? (mode === 'fallback' ? fallbackCounts : {})
}
