import { useEffect, useState } from 'react'
import { getUsersByOrganization } from '@/services/userService'
import { mapUser } from '@/features/foydalanuvchilar/foydalanuvchilarSlice'

// Organization serializeri foydalanuvchilar sonini/rollar taqsimotini qaytarmaydi — ular
// accounts/users/?organization={id} orqali alohida olinadi. Bir sahifada bir nechta komponent
// (kartalar + jadval) bir vaqtda so'rasa, bitta so'rov ulashiladi.
const inflight = new Map()

function loadOrgUsers(orgId) {
  if (!inflight.has(orgId)) {
    const p = getUsersByOrganization(orgId)
      .then((raw) => raw.map(mapUser))
      .finally(() => inflight.delete(orgId))
    inflight.set(orgId, p)
  }
  return inflight.get(orgId)
}

// Natija: { users, loaded, failed } — `users` faqat shu tashkilotniki bo'lsa to'ldiriladi.
export function useOrgUsers(orgId) {
  const [result, setResult] = useState({ orgId: null, users: [], failed: false })

  useEffect(() => {
    if (!orgId) return undefined
    let cancelled = false
    loadOrgUsers(orgId)
      .then((users) => {
        if (!cancelled) setResult({ orgId, users, failed: false })
      })
      .catch(() => {
        if (!cancelled) setResult({ orgId, users: [], failed: true })
      })
    return () => {
      cancelled = true
    }
  }, [orgId])

  const loaded = !!orgId && result.orgId === orgId
  return { users: loaded ? result.users : [], loaded, failed: loaded && result.failed }
}

// Rollar bo'yicha taqsimot: [{ role, count }] — ko'pidan kamiga.
export function groupByRole(users) {
  const map = new Map()
  users.forEach((u) => {
    const role = u.rol || 'Rolsiz'
    map.set(role, (map.get(role) ?? 0) + 1)
  })
  return [...map.entries()].map(([role, count]) => ({ role, count })).sort((a, b) => b.count - a.count)
}
