import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'

// Filial'ni id bo'yicha oladi, topilmasa ro'yxatga qaytaradi.
export function useBranch() {
  const { id } = useParams()
  const navigate = useNavigate()
  const branch = useSelector((s) => s.filiallar.list.find((b) => b.id === id))

  useEffect(() => {
    if (!branch) navigate('/filiallar', { replace: true })
  }, [branch, navigate])

  return branch
}
