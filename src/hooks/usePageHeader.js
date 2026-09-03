import { useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'

// Sahifa AppLayout'dagi Header'ga sarlavha va (ixtiyoriy) badge yuboradi.
export function usePageHeader(title, badge = null) {
  const { setHeader } = useOutletContext()

  useEffect(() => {
    setHeader({ title, badge })
  }, [title, badge?.label, badge?.variant, setHeader])
}
