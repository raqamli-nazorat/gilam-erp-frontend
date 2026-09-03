import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { AlertCircle, AlertTriangle, Loader2 } from 'lucide-react'
import { login, unblock } from '@/features/auth/authSlice'
import { useCountdown } from '@/hooks/useCountdown'
import { formatCountdown } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import LoginLeftPanel from './LoginLeftPanel'

const ALERT_STYLES = {
  error: {
    icon: AlertCircle,
    dot: 'bg-red-500',
    box: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400',
  },
  warning: {
    icon: AlertTriangle,
    dot: 'bg-amber-500',
    box: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-400',
  },
  blocked: {
    icon: AlertCircle,
    dot: 'bg-red-500',
    box: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400',
  },
}

export default function LoginPage() {
  const dispatch = useDispatch()
  const location = useLocation()
  const auth = useSelector((state) => state.auth)
  const [form, setForm] = useState({ login: '', password: '' })

  const remainingMs = useCountdown(auth.status === 'blocked' ? auth.blockedUntil : null)

  useEffect(() => {
    if (auth.status === 'blocked' && auth.blockedUntil && remainingMs <= 0) {
      dispatch(unblock())
    }
  }, [remainingMs, auth.status, auth.blockedUntil, dispatch])

  if (auth.token) {
    const from = location.state?.from?.pathname || '/tovarlar-kirimi'
    return <Navigate to={from} replace />
  }

  const isBlocked = auth.status === 'blocked'
  const isLoading = auth.status === 'loading'
  const hasFieldError = auth.status === 'error' || auth.status === 'warning' || isBlocked

  function handleSubmit(e) {
    e.preventDefault()
    if (isBlocked || isLoading) return
    dispatch(login({ login: form.login, password: form.password }))
  }

  const alertConfig = ALERT_STYLES[auth.status]

  return (
    <div
      className="relative flex min-h-screen items-center justify-center bg-white px-6 py-12 dark:bg-black"
      style={{ fontFamily: "'Onest Variable', sans-serif" }}
    >
      <div className="flex items-center gap-16">
        <LoginLeftPanel />

        <div className="w-[380px] shrink-0">
          <h2
            className="text-center text-foreground dark:text-[#FFFFFFF5]"
            style={{ fontSize: 30, fontWeight: 700, lineHeight: '38px', letterSpacing: '-0.8px' }}
          >
            Tizimga kirish
          </h2>
          <p
            className="mt-1.5 text-center text-muted-foreground dark:text-[#FFFFFF7A]"
            style={{ fontSize: 14, fontWeight: 400, lineHeight: '20px' }}
          >
            Login va parolingizni kiriting
          </p>

          {alertConfig && (
            <div className={cn('mt-6 rounded-xl border px-4 py-3', alertConfig.box)}>
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', alertConfig.dot)} />
                {auth.status === 'error' && "Login yoki parol noto'g'ri"}
                {auth.status === 'warning' && 'Oxirgi urinish qoldi'}
                {isBlocked && 'Hisob vaqtincha bloklandi'}
              </div>
              <p className="mt-0.5 pl-3.5 text-[13px] opacity-80">
                {auth.status === 'error' && `Qolgan urinishlar: ${auth.attemptsLeft} ta`}
                {auth.status === 'warning' &&
                  'Yana bir marta xato — hisob 5 daqiqaga bloklanadi'}
                {isBlocked &&
                  `Ko'p marta xato kiritildi. Qayta urinish ${formatCountdown(remainingMs)} dan keyin`}
              </p>
            </div>
          )}

          <form className="mt-6 flex flex-col gap-3" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="login" className="sr-only">
                Login
              </Label>
              <Input
                id="login"
                placeholder="Login"
                autoComplete="username"
                disabled={isBlocked || isLoading}
                value={form.login}
                onChange={(e) => setForm((f) => ({ ...f, login: e.target.value }))}
                className={cn(
                  'h-11 rounded-[10px] bg-muted/40 px-3.5 py-1.5 dark:border-[#404040] dark:bg-[#171717]',
                  hasFieldError && 'border-red-400 focus-visible:ring-red-400/40 dark:border-red-800'
                )}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password" className="sr-only">
                Parol
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Parol"
                autoComplete="current-password"
                disabled={isBlocked || isLoading}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className={cn(
                  'h-11 rounded-[10px] bg-muted/40 px-3.5 py-1.5 dark:border-[#404040] dark:bg-[#171717]',
                  hasFieldError && 'border-red-400 focus-visible:ring-red-400/40 dark:border-red-800'
                )}
              />
            </div>

            <button
              type="submit"
              disabled={isBlocked || isLoading}
              className={cn(
                'mt-1.5 flex h-11 items-center justify-center gap-2 rounded-[10px] text-[15px] font-semibold transition-colors',
                'bg-[#0066FF] text-white hover:bg-[#2563EB]',
                'dark:border dark:border-[#FFFFFF1F] dark:bg-[#FFFFFF2E] dark:text-white dark:hover:bg-white/[0.25]',
                (isBlocked || isLoading) &&
                  'cursor-not-allowed bg-muted text-muted-foreground hover:bg-muted dark:border-white/10 dark:bg-white/[0.08] dark:text-white/40 dark:hover:bg-white/[0.08]'
              )}
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isBlocked
                ? `${formatCountdown(remainingMs)} dan keyin`
                : isLoading
                  ? 'Tekshirilmoqda...'
                  : 'Kirish'}
            </button>
          </form>

          <p
            className="mt-4 text-center text-muted-foreground"
            style={{ fontSize: 12, fontWeight: 400, lineHeight: '18px' }}
          >
            {isBlocked ? (
              <>
                Blok muddati tugagach qayta urinib ko‘ring. Muammo saqlansa —{' '}
                <a href="#" className="text-[#0066FF] underline underline-offset-2 dark:text-blue-400">
                  administratorga
                </a>{' '}
                murojaat qiling.
              </>
            ) : (
              'Hisob administrator tomonidan beriladi.'
            )}
          </p>
        </div>
      </div>

      <p
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-muted-foreground/70"
        style={{ fontSize: 12, fontWeight: 400, lineHeight: '16px' }}
      >
        SAG Gilamlari · Andijon · +998 91 601 43 33
      </p>
    </div>
  )
}
