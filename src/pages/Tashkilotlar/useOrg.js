import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchOrganizationDetail } from '@/features/tashkilotlar/tashkilotlarSlice'

// Tashkilotni id bo'yicha APIdan oladi (keshlangan bo'lsa qayta so'ramaydi), topilmasa ro'yxatga qaytaradi.
// Tashkilot ichki sahifalari (filiallar/foydalanuvchilar/mijozlar/savdo) uchun — useBranch bilan bir xil.
export function useOrg() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const org = useSelector((s) => (s.tashkilotlar.current?.id === id ? s.tashkilotlar.current : null))
  const detailStatus = useSelector((s) => s.tashkilotlar.detailStatus)

  useEffect(() => {
    if (!org) dispatch(fetchOrganizationDetail(id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, dispatch])

  useEffect(() => {
    if (detailStatus === 'failed' && !org) navigate('/tashkilotlar', { replace: true })
  }, [detailStatus, org, navigate])

  return org
}
