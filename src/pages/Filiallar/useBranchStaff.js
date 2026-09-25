import { useCallback, useEffect, useMemo, useState } from 'react'
import { formatDate } from '@/lib/format'
import { useServerPagedList } from '@/hooks/useServerPagedList'
import { getEmployeesPage } from '@/services/employeeService'
import { getRecruitmentsPage } from '@/services/recruitmentService'
import { isEmployeeDismissed, mapEmployee } from '@/features/xodimlar/xodimlarSlice'

// Filial xodimlari — Filial tafsiloti va "Filial > Xodimlar" sahifalari uchun.
// Oldin bu jadvallar doim bo'sh `emptyDetail.xodimlar` ([]) ni o'qirdi — xodimlar umuman
// so'ralmas edi (yuqoridagi "5 ta" esa filial javobidagi employees_count'dan kelardi).
//
// - Xodimlar: hr/employees/?branch={id} — scroll pagination bilan (har sahifa uchun bitta so'rov).
// - Lavozim/ishga kirgan sana Employee'da yo'q — shu filialning "ishga olish" hujjatlaridan
//   (hr/recruitment-dismissals/?branch={id}&type=recruitment, 1-sahifa, BITTA so'rov) F.I.SH.
//   bo'yicha moslab olinadi (ro'yxat javobida xodim ID'si yo'q).
export function useBranchStaff(branchId) {
  const fetchStaffPage = useCallback(
    (params) =>
      getEmployeesPage(params).then((res) => ({
        ...res,
        results: res.results.map((raw) => {
          const e = mapEmployee(raw)
          return { ...e, holat: isEmployeeDismissed(e) ? 'Ishdan chiqarilgan' : 'Faol' }
        }),
      })),
    []
  )
  const list = useServerPagedList(fetchStaffPage, { branch: branchId })

  const [hires, setHires] = useState([])
  useEffect(() => {
    if (!branchId) return undefined
    let cancelled = false
    getRecruitmentsPage({ branch: branchId, page: 1 })
      .then((res) => {
        if (!cancelled) setHires(res.results)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [branchId])

  const rows = useMemo(() => {
    const byName = new Map()
    hires.forEach((h) => {
      const prev = byName.get(h.employee_name)
      if (!prev || (h.rec_dism_date ?? '') > (prev.rec_dism_date ?? '')) byName.set(h.employee_name, h)
    })
    return list.items.map((e) => {
      const h = byName.get(e.name)
      return { ...e, lavozim: h?.position_name ?? '', ishgaKirgan: h?.rec_dism_date ? formatDate(h.rec_dism_date) : '' }
    })
  }, [list.items, hires])

  return { ...list, rows }
}
