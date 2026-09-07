import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Copy } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { toggleTheme } from '@/features/ui/uiSlice'
import { passwordChanged } from '@/features/auth/authSlice'
import { formatDateTime } from '@/lib/format'
import { Switch } from '@/components/ui/switch'
import Toast from '@/components/Toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import PasswordModal from './components/PasswordModal'

const cardCls = 'rounded-xl border border-[#E5E5E5] bg-white p-6 dark:border-white/10 dark:bg-card'
const labelCls = 'mb-3 text-[12px] font-semibold uppercase tracking-[0.4px] text-[#737373] dark:text-muted-foreground'

function InfoRow({ label, value, onCopy }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 text-[14px]">
      <span className="text-[#737373] dark:text-muted-foreground">{label}</span>
      <span className="flex items-center gap-1.5 font-medium text-[#0A0A0A] dark:text-white">
        {value || '—'}
        {onCopy && value && (
          <button
            type="button"
            onClick={onCopy}
            className="text-[#737373] transition-colors hover:text-[#0052D2] dark:hover:text-[#60A5FA]"
            aria-label="Nusxa olish"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        )}
      </span>
    </div>
  )
}

export default function ProfilPage() {
  const dispatch = useDispatch()
  const user = useSelector((s) => s.auth.user)
  const theme = useSelector((s) => s.ui.theme)
  const [language, setLanguage] = useState('uz')
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [toast, setToast] = useState('')
  const fileRef = useRef(null)

  usePageHeader('Profil › Profil va sozlamalar')

  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(''), 3000)
    return () => clearTimeout(t)
  }, [toast])

  if (!user) return null

  function copy(text, label) {
    navigator.clipboard?.writeText(String(text))
    setToast(`${label} nusxalandi`)
  }

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <div className={cardCls}>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#0052D2]/10 text-[20px] font-semibold text-[#0052D2] dark:bg-[#0052D2]/20 dark:text-[#60A5FA]">
              {user.initials ?? '?'}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[18px] font-semibold text-[#0A0A0A] dark:text-white">{user.fullName}</p>
              <span className="mt-1 inline-flex h-[22px] items-center rounded-full bg-[#EAF1FE] px-2.5 text-[12px] font-medium text-[#0052D2] dark:bg-[#0052D2]/20 dark:text-[#60A5FA]">
                {user.role}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="mt-3 text-[13px] font-medium text-[#0052D2] transition-colors hover:underline dark:text-[#60A5FA]"
          >
            Rasmni o‘zgartirish
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={() => setToast('Backend hali ulanmagan — rasm saqlanmadi')}
          />

          <div className="mt-6 border-t border-[#E5E5E5] pt-4 dark:border-white/10">
            <p className={labelCls}>Ma’lumotlar</p>
            <InfoRow label="Telefon" value={user.phone} onCopy={() => copy(user.phone, 'Telefon')} />
            <InfoRow label="Tashkilot" value={user.tashkilot} />
            <InfoRow label="Filial" value={user.filial} />
            <InfoRow label="Roli" value={user.role} />
          </div>
        </div>

        <div className={cardCls}>
          <p className={labelCls}>Shaxsiy sozlamalar</p>
          <div className="flex flex-col divide-y divide-[#E5E5E5] dark:divide-white/10">
            <div className="flex items-center justify-between gap-4 py-4 first:pt-0">
              <div>
                <p className="text-[14px] font-medium text-[#0A0A0A] dark:text-white">Interfeys tili</p>
                <p className="text-[13px] text-[#737373] dark:text-muted-foreground">Faqat sizning hisobingiz uchun</p>
              </div>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="h-10 w-[220px] rounded-md border-[#E5E5E5] bg-white px-3 text-[14px] text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:border-white/10 dark:bg-card dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uz">O‘zbekcha (uz-Latn)</SelectItem>
                  <SelectItem value="ru">Русский (ru-RU)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between gap-4 py-4">
              <div>
                <p className="text-[14px] font-medium text-[#0A0A0A] dark:text-white">Qorong‘i mavzu</p>
                <p className="text-[13px] text-[#737373] dark:text-muted-foreground">Interfeys ranglari qorong‘i rejimga o‘tadi</p>
              </div>
              <Switch checked={theme === 'dark'} onCheckedChange={() => dispatch(toggleTheme())} />
            </div>

            <div className="flex items-center justify-between gap-4 py-4 last:pb-0">
              <div>
                <p className="text-[14px] font-medium text-[#0A0A0A] dark:text-white">Parol</p>
                <p className="text-[13px] text-[#737373] dark:text-muted-foreground">
                  Oxirgi o‘zgartirish, {user.passwordChangedAt ?? '—'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPasswordOpen(true)}
                className="flex h-9 items-center gap-1.5 rounded-md border border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.1)] transition-colors hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
              >
                Parolni o‘zgartirish
              </button>
            </div>
          </div>
        </div>
      </div>

      <PasswordModal
        open={passwordOpen}
        onOpenChange={setPasswordOpen}
        onSave={() => {
          dispatch(passwordChanged(formatDateTime().split(' ')[0]))
          setToast('Parol yangilandi')
        }}
      />
      <Toast message={toast} />
    </>
  )
}
