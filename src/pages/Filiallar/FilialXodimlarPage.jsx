import { useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatNumber } from '@/lib/format'
import { useBranch } from './useBranch'
import { useBranchStaff } from './useBranchStaff'
import FilialSubShell, { CopyBtn, TD, TD_IDX, TD_LINK } from './components/FilialSubShell'

const COLS = 6

// Filial > Xodimlar — xodimlar hr/employees/?branch={id} orqali scroll pagination bilan
// (useBranchStaff). Oldin doim bo'sh `branch.detail.xodimlar` o'qilardi. Sotuvchi/kassir soni
// va ish haqi fondi uchun backendda filial bo'yicha statistika endpointi yo'q — ular hozircha 0.
export default function FilialXodimlarPage() {
  const { id } = useParams()
  const branch = useBranch()
  const {
    rows: staffRows,
    isLoading: staffLoading,
    isLoadingMore: staffLoadingMore,
    hasMore: staffHasMore,
    containerRef: staffScrollRef,
    sentinelRef: staffSentinelRef,
    handleScroll: handleStaffScroll,
    totalCount: staffTotal,
  } = useBranchStaff(id)

  if (!branch) return null

  const s = branch.detail.xodimlarStats

  return (
    <FilialSubShell
      branch={branch}
      crumbTail="Xodimlar"
      scrollRef={staffScrollRef}
      onScroll={handleStaffScroll}
      statItems={[
        { title: 'XODIMLAR', value: `${formatNumber(branch.stats.xodimlar ?? staffTotal, 0)} ta` },
        { title: 'SOTUVCHI', value: `${formatNumber(s.sotuvchi, 0)} ta` },
        { title: 'KASSIR', value: `${formatNumber(s.kassir, 0)} ta` },
        { title: 'ISH HAQI FONDI', value: `${formatNumber(s.ishHaqiFondi, 2)} UZS` },
      ]}
      head={[
        { label: '#' },
        { label: 'F.I.SH.' },
        { label: 'LAVOZIM' },
        { label: 'TELEFON' },
        { label: 'ISHGA KIRGAN' },
        { label: 'HOLAT' },
      ]}
    >
      {staffLoading && staffRows.length === 0 ? (
        <tr>
          <td colSpan={COLS} className="py-14 text-center">
            <Loader2 className="mx-auto h-5 w-5 animate-spin text-[#0052D2]" />
          </td>
        </tr>
      ) : staffRows.length === 0 ? (
        <tr>
          <td colSpan={COLS} className="py-14 text-center text-sm text-[#737373]">
            Bu ma’lumot hali mavjud emas
          </td>
        </tr>
      ) : (
        staffRows.map((x, i) => {
          const working = x.holat === 'Faol'
          return (
            <tr key={x.id || i} className="h-11 hover:bg-[#F9FAFB] dark:hover:bg-white/5">
              <td className={TD_IDX}>{i + 1}</td>
              <td className={TD_LINK}>{x.name}</td>
              <td className={TD}>{x.lavozim || '—'}</td>
              <td className={cn(TD, 'text-[#737373]')}>
                {x.phone || '—'}
                {x.phone && <CopyBtn value={x.phone} />}
              </td>
              <td className={cn(TD, 'text-[#737373]')}>{x.ishgaKirgan || '—'}</td>
              <td className="px-4">
                <span
                  className={cn(
                    'inline-flex h-[22px] items-center rounded-full px-2.5 text-[11px] font-medium tracking-[0.3px]',
                    working
                      ? 'bg-[#E6FAF1] text-[#047A47] dark:bg-[#047A47]/20 dark:text-[#34D399]'
                      : 'bg-[#FFF8E6] text-[#B45309] dark:bg-[#B45309]/20 dark:text-[#FBBF24]'
                  )}
                >
                  {working ? 'Ishlayapti' : x.holat}
                </span>
              </td>
            </tr>
          )
        })
      )}
      {staffRows.length > 0 && staffHasMore && !staffLoading && (
        <tr ref={staffSentinelRef} className="h-1">
          <td colSpan={COLS} className="h-1 p-0" />
        </tr>
      )}
      {staffLoadingMore && (
        <tr>
          <td colSpan={COLS} className="py-3 text-center">
            <Loader2 className="mx-auto h-4 w-4 animate-spin text-[#0052D2]" />
          </td>
        </tr>
      )}
    </FilialSubShell>
  )
}