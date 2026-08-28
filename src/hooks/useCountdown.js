import { useEffect, useState } from 'react'

// `targetTimestamp` (ms) ga qolgan vaqtni har soniyada yangilab turadi.
export function useCountdown(targetTimestamp) {
  const [remainingMs, setRemainingMs] = useState(() =>
    targetTimestamp ? Math.max(0, targetTimestamp - Date.now()) : 0
  )

  useEffect(() => {
    if (!targetTimestamp) {
      setRemainingMs(0)
      return
    }
    setRemainingMs(Math.max(0, targetTimestamp - Date.now()))
    const interval = setInterval(() => {
      setRemainingMs(Math.max(0, targetTimestamp - Date.now()))
    }, 1000)
    return () => clearInterval(interval)
  }, [targetTimestamp])

  return remainingMs
}
