import { useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'

// Sahifa AppLayout'dagi Header'ga sarlavha va (ixtiyoriy) badge yuboradi.
// `title` — matn ("Bo'lim") yoki breadcrumb massivi: ["A", { label: 'B', to: '/b' }, "C"].
// `to` berilgan bo'laklar bosilganda o'sha bo'limga o'tadi (oxirgi bo'lak hech qachon link emas).
export function usePageHeader(title, badge = null) {
  const { setHeader } = useOutletContext()

  const key = Array.isArray(title)
    ? title.map((c) => (typeof c === 'string' ? c : `${c.label}|${c.to ?? ''}`)).join('›')
    : title

  useEffect(() => {
    setHeader({ title, badge })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, badge?.label, badge?.variant, setHeader])
}
