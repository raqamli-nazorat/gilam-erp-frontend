import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { login, unblock } from '@/features/auth/authSlice'
import { useCountdown } from '@/hooks/useCountdown'
import { formatCountdown } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import LoginLeftPanel from './LoginLeftPanel'

const ERROR_ALERT = {
  dot: 'bg-[#EF4444]',
  box: 'border-[#F1C6C6] bg-[#FDECEC] dark:border-[#7F1D1D]/70 dark:bg-[#2A1416]',
  title: 'text-[#DC2626] dark:text-[#F87171]',
}

const ALERT_STYLES = {
  error: ERROR_ALERT,
  blocked: ERROR_ALERT,
  warning: {
    dot: 'bg-[#F59E0B]',
    box: 'border-[#E7CE8C] bg-[#FBF3DD] dark:border-[#78350F]/70 dark:bg-[#241C0A]',
    title: 'text-[#B45309] dark:text-[#FBBF24]',
  },
}

const FIELD_CLASS =
  'h-11 rounded-[10px] border-[#E4E4E7] bg-white px-3.5 py-1.5 text-[15px] md:text-[15px] dark:border-[#2E2E2E] dark:bg-[#1A1A1A]'

const FIELD_ERROR_CLASS =
  'border-[#EF4444] focus-visible:border-[#EF4444] focus-visible:ring-[#EF4444]/25 dark:border-[#EF4444] dark:focus-visible:border-[#EF4444]'

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
  const isEmpty = form.login.trim().length === 0 || form.password.length === 0
  const isDisabled = isBlocked || isLoading || isEmpty

  function handleSubmit(e) {
    e.preventDefault()
    if (isDisabled) return
    dispatch(login({ phone_number: form.login, login: form.login, password: form.password }))
  }

  const alertConfig = ALERT_STYLES[auth.status]

  return (
    <div
      className="relative flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#FBFCFE_0%,#A4E3FF_81.09%,#45BAF9_100%)] px-6 py-12 dark:bg-[#080808] dark:bg-none"
      style={{ fontFamily: "'Onest Variable', sans-serif" }}
    >
      <div className="flex items-center gap-16">
        <LoginLeftPanel />

        <div className="w-[380px] shrink-0">
          <h2
            className="text-center text-[#0A0A0A] dark:text-[#FFFFFFF5]"
            style={{ fontSize: 30, fontWeight: 700, lineHeight: '38px', letterSpacing: '-0.8px' }}
          >
            Tizimga kirish
          </h2>
          <p
            className="mt-1.5 text-center text-[#5B5B5B] dark:text-[#FFFFFF7A]"
            style={{ fontSize: 14, fontWeight: 400, lineHeight: '20px' }}
          >
            Telefon raqami va parolingizni kiriting
          </p>

          {alertConfig && (
            <div className={cn('mt-6 rounded-xl border px-4 py-3', alertConfig.box)}>
              <div
                className={cn(
                  'flex items-center gap-2 text-sm font-semibold',
                  alertConfig.title
                )}
              >
                <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', alertConfig.dot)} />
                {auth.status === 'error' && (auth.errorMessage || "Login yoki parol noto'g'ri")}
                {auth.status === 'warning' && 'Oxirgi urinish qoldi'}
                {isBlocked && 'Hisob vaqtincha bloklandi'}
              </div>
              <p className="mt-0.5 pl-3.5 text-[13px] text-[#6B7280] dark:text-white/50">
                {auth.status === 'error' && `Qolgan urinishlar: ${auth.attemptsLeft} ta`}
                {auth.status === 'warning' &&
                  'Yana bir marta xato — hisob 5 daqiqaga bloklanadi'}
                {isBlocked &&
                  `Ko'p marta xato kiritildi. Qayta urinish ${formatCountdown(remainingMs)} dan keyin`}
              </p>
            </div>
          )}

          <form
            className={cn('flex flex-col gap-3', alertConfig ? 'mt-4' : 'mt-6')}
            onSubmit={handleSubmit}
          >
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
                className={cn(FIELD_CLASS, hasFieldError && FIELD_ERROR_CLASS)}
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
                className={cn(FIELD_CLASS, hasFieldError && FIELD_ERROR_CLASS)}
              />
            </div>

            <button
              type="submit"
              disabled={isDisabled}
              className={cn(
                'mt-1.5 flex h-11 items-center justify-center gap-2 rounded-[10px] text-[15px] font-semibold transition-colors',
                isDisabled
                  ? 'cursor-not-allowed bg-[#E9E9EA] text-[#9A9AA0] dark:bg-[#262626] dark:text-[#7A7A7A]'
                  : 'bg-[#0B5FD4] text-white hover:bg-[#0A55BF] dark:bg-white dark:text-[#0A0A0A] dark:hover:bg-white/90'
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
        </div>
      </div>
    </div>
  )
}
