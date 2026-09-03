import { CheckCircle2 } from 'lucide-react'

export default function Toast({ message }) {
  if (!message) return null
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-lg animate-in dark:border-emerald-900/50 dark:bg-emerald-950/80 dark:text-emerald-400">
      <CheckCircle2 className="h-4 w-4" />
      {message}
    </div>
  )
}
