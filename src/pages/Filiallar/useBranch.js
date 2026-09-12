import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchBranchDetail } from '@/features/filiallar/filiallarSlice'

// Filial'ni id bo'yicha APIdan oladi (keshlangan bo'lsa qayta so'ramaydi), topilmasa ro'yxatga qaytaradi.
export function useBranch() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const branch = useSelector((s) => (s.filiallar.current?.id === id ? s.filiallar.current : null))
  const detailStatus = useSelector((s) => s.filiallar.detailStatus)

  useEffect(() => {
    dispatch(fetchBranchDetail(id))
  }, [id, dispatch])

  useEffect(() => {
    if (detailStatus === 'failed' && !branch) navigate('/filiallar', { replace: true })
  }, [detailStatus, branch, navigate])

  return branch
}
