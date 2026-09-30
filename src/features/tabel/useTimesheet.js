import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchAllPages, fetchPage } from '@/services/apiHelpers'
import { getBranch } from '@/services/branchService'
import { getAllTimesheetItems, getTimesheet } from '@/services/timesheetService'
import { inferYear, normalizeTimesheet } from './tabelData'

// Ishdan chiqarilgan xodimlar (employment_status qiymatlari sxemada sanab ko'rsatilmagan)
const DISMISSED = /dismiss|fired|terminat|inactive|chiqarilgan|bo.?shagan/i

// Filialning hozir ishlayotgan xodimlari — qoralama tabelda qatori hali yo'q xodimlar ham ko'rinsin
async function loadBranchEmployees(branchId) {
  const list = await fetchAllPages('hr/employees/', { branch: branchId })
  return list
    .filter((e) => (e.branch_info?.id ?? e.branch ?? branchId) === branchId && !DISMISSED.test(e.employment_status ?? ''))
    .map((e) => ({ id: e.id, name: e.full_name ?? '', schedule: e.work_schedule_info?.name ?? '' }))
}

// Filialning amaldagi ish grafigi nomi — xodimning o'z grafigi (work_schedule_info) kelmasa zaxira sifatida
async function loadScheduleName(branchId) {
  const res = await fetchPage('hr/work-schedules/', { branch: branchId, is_active: true })
  return res.results[0]?.name ?? ''
}

// Bitta tabel: sarlavha ma'lumotlari, kunlik qatorlar, filial tashkiloti va ish grafigi.
// reload({ silent: true }) — jadvalni yuklovchi bilan almashtirmasdan qayta so'raydi.
export function useTimesheet(id) {
  const [state, setState] = useState({ data: null, loading: true, error: null })
  const reqId = useRef(0)
  const running = useRef(false)

  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (running.current) return          // oldingi so'rov tugamagan bo'lsa, qayta yo'q
      running.current = true
      const req = ++reqId.current
      if (!silent) setState((s) => ({ ...s, loading: true, error: null }))
      try {
        const tabel = normalizeTimesheet(await getTimesheet(id))
        const [items, branch, scheduleName, employees] = await Promise.all([
          getAllTimesheetItems(id),
          // Tashkilot javobda bo'lmasa — filial ma'lumotidan
          tabel.branchId && !tabel.orgId ? getBranch(tabel.branchId).catch(() => null) : null,
          tabel.branchId ? loadScheduleName(tabel.branchId).catch(() => '') : '',
          tabel.branchId && tabel.status === 'draft' ? loadBranchEmployees(tabel.branchId).catch(() => []) : [],
        ])
        if (req !== reqId.current) return
        setState({
          data: {
            tabel: {
              ...tabel,
              year: inferYear(tabel, items),
              orgId: tabel.orgId || branch?.organization_info?.id || '',
              orgName: tabel.orgName || branch?.organization_info?.name || '',
            },
            items,
            employees,
            scheduleName,
          },
          loading: false,
          error: null,
        })
      } catch (error) {
        if (req !== reqId.current) return
        setState((s) => ({ ...s, loading: false, error }))
      } finally {
        running.current = false
      }
    },
    [id]
  )

  useEffect(() => {
    load()
  }, [load])

  return { ...state, reload: load }
}
