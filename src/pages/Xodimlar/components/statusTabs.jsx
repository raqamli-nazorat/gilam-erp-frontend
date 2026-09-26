import { useCallback, useEffect, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { getRecruitmentDismissalCounts } from '@/services/recruitmentService'
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

export function StatusTabs({ tab, onChange, counts = {} }) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-lg bg-[#F5F5F5] p-1 dark:bg-white/5">
      {STATUS_TABS.map(([key, label]) => {
        const active = tab === key
        const n = counts?.[key]
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

// /api/v1/hr/recruitment-dismissals/count/ javobidagi hisoblarni frontend tab kalitlariga moslashtirish:
// approved -> confirmed, all -> all, draft -> draft, cancelled -> cancelled
export function mapStatusCounts(raw) {
  if (!raw || typeof raw !== 'object') return {}
  return {
    all: raw.all ?? 0,
    confirmed: raw.approved ?? raw.confirmed ?? 0,
    draft: raw.draft ?? 0,
    cancelled: raw.cancelled ?? 0,
  }
}

// /api/v1/hr/recruitment-dismissals/count/ endpointidan recruitments yoki dismissals bo'yicha
// holatlar sonini oluvchi maxsus hook.
export function useRecruitmentDismissalCounts(type, reloadTrigger) {
  const [counts, setCounts] = useState({})

  const fetchCounts = useCallback(async () => {
    try {
      const res = await getRecruitmentDismissalCounts()
      const data = res?.data ?? res
      const groupKey =
        type === 'dismissal' || type === 'dismissals'
          ? 'dismissals'
          : 'recruitments'
      const group = data?.[groupKey]
      if (group) {
        setCounts(mapStatusCounts(group))
      }
    } catch (err) {
      console.error('Failed to load recruitment dismissal counts:', err)
    }
  }, [type])

  useEffect(() => {
    fetchCounts()
  }, [fetchCounts, reloadTrigger])

  return counts
}

// useStatusTabCounts backwards compatibility uchun
export function useStatusTabCounts(options = {}) {
  const type =
    typeof options === 'string'
      ? options
      : options.type || (options.fetchPage?.name?.toLowerCase().includes('dismissal') ? 'dismissals' : 'recruitments')
  return useRecruitmentDismissalCounts(type, options.reloadTrigger)
}

