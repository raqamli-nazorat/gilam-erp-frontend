import { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Check, ShieldCheck, Upload, X } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { cn } from '@/lib/utils'
import { formatJshshir, formatNumber, formatStir, formatUzPassport, splitUzPassport } from '@/lib/format'
import { setTheme } from '@/features/ui/uiSlice'
import { changePassword, updateOwnProfile } from '@/features/auth/authSlice'
import { fetchXodimDetail, updateKadr } from '@/features/xodimlar/xodimlarSlice'
import { fetchRegions, fetchDistricts } from '@/features/geo/geoSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PhoneInput } from '@/components/ui/phone-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Toast from '@/components/Toast'
import PasswordModal from './components/PasswordModal'

const fieldCls =
  'h-9 w-full appearance-none rounded-[8px] border border-[#E5E5E5] bg-white px-3 py-1 text-[14px] font-normal text-[#0A0A0A] shadow-[0px_1px_2px_0px_#0000001A] placeholder:text-[#737373] disabled:cursor-not-allowed disabled:bg-[#F5F5F5] disabled:opacity-100 dark:border-white/10 dark:bg-card dark:text-white dark:disabled:bg-white/5'
const labelCls = 'mb-1.5 block text-[13px] font-normal leading-[16px] text-[#525252] dark:text-muted-foreground'

// Figma dev-mode SVG'lar — "Rasmni o'zgartirish" tugmasi va tanlangan passport fayli ikonkasi.
function ChangePhotoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <g clipPath="url(#profil-change-photo-clip)">
        <path
          d="M2 10.6673L4.97978 7.68754C5.20616 7.46116 5.51319 7.33398 5.83333 7.33398C6.15348 7.33398 6.46051 7.46116 6.68689 7.68754L9.33333 10.334M10.3333 11.334L9.33333 10.334M14 10.6673L12.3536 9.02087C12.1272 8.79449 11.8201 8.66732 11.5 8.66732C11.1799 8.66732 10.8728 8.79449 10.6464 9.02087L9.33333 10.334"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.00002 1.66602C5.1802 1.66602 3.77029 1.66602 2.83519 2.46466C2.70241 2.57807 2.57874 2.70174 2.46533 2.83452C1.66669 3.76962 1.66669 5.17953 1.66669 7.99935C1.66669 10.8192 1.66669 12.2291 2.46533 13.1642C2.57874 13.297 2.70241 13.4206 2.83519 13.534C3.77029 14.3327 5.1802 14.3327 8.00002 14.3327C10.8198 14.3327 12.2298 14.3327 13.1648 13.534C13.2976 13.4206 13.4213 13.297 13.5347 13.1642C14.3334 12.2291 14.3334 10.8192 14.3334 7.99935"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10.3333 3.66602C10.7265 3.26146 11.7731 1.66602 12.3333 1.66602C12.8935 1.66602 13.9401 3.26146 14.3333 3.66602M12.3333 1.99935V6.33268"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="profil-change-photo-clip">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

function PassportFileIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 text-[#DC2626]">
      <path
        d="M12.6667 7.33398C12.6667 6.78898 12.6667 6.28772 12.5652 6.04269C12.4637 5.79766 12.271 5.60498 11.8856 5.2196L8.72792 2.06191C8.39533 1.72932 8.22904 1.56302 8.02301 1.46448C7.98016 1.44399 7.93625 1.4258 7.89146 1.40999C7.67609 1.33398 7.44092 1.33398 6.97056 1.33398C4.80721 1.33398 3.72554 1.33398 2.99289 1.9247C2.84488 2.04404 2.71005 2.17886 2.59072 2.32687C2 3.05952 2 4.1412 2 6.30455V9.33398C2 11.8481 2 13.1052 2.78105 13.8863C3.5621 14.6673 4.81918 14.6673 7.33333 14.6673H12.6667M8 1.66732V2.00065C8 3.88627 8 4.82908 8.58579 5.41486C9.17157 6.00065 10.1144 6.00065 12 6.00065H12.3333"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 9.33398H12.6666C12.2984 9.33398 12 9.63246 12 10.0007V11.0007M12 11.0007V12.6673M12 11.0007H13.6666M4.66663 12.6673V11.334M4.66663 11.334V9.33398H5.66663C6.21891 9.33398 6.66663 9.7817 6.66663 10.334C6.66663 10.8863 6.21891 11.334 5.66663 11.334H4.66663ZM8.33329 9.33398H9.19044C9.82162 9.33398 10.3333 9.83145 10.3333 10.4451V11.5562C10.3333 12.1699 9.82162 12.6673 9.19044 12.6673H8.33329V9.33398Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function joinPassport(seria, number) {
  return formatUzPassport(`${seria ?? ''}${number ?? ''}`)
}

function Picker({ value, onChange, placeholder, options, disabled }) {
  return (
    <Select value={value || '__none'} onValueChange={(v) => onChange(v === '__none' ? '' : v)} disabled={disabled}>
      <SelectTrigger className={cn(fieldCls, disabled && 'opacity-60')}>
        <SelectValue>
          {(v) => (v === '__none' ? <span className="text-[#737373]">{placeholder}</span> : options.find((o) => o.id === v)?.name ?? '')}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.id} value={o.id}>
            {o.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function Field({ label, children, full }) {
  return (
    <div className={cn(full && 'col-span-2')}>
      <Label className={labelCls}>{label}</Label>
      {children}
    </div>
  )
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

// Backendda hech qanday faylga bog'lanadigan maydon yo'q — shuning uchun tanlangan fayl
// faqat UI'da ko'rinadi, Saqlashda yuborilmaydi (Asos hujjat naqshiga o'xshash).
function PassportFileField({ file, onChange }) {
  const inputRef = useRef(null)
  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onChange(f)
          e.target.value = ''
        }}
      />
      {file ? (
        <div className="flex h-9 items-center gap-2.5 rounded-[8px] border border-[#E5E5E5] bg-white px-3 shadow-[0px_1px_2px_0px_#0000001A] dark:border-white/10 dark:bg-card">
          <PassportFileIcon />
          <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[#0A0A0A] dark:text-white">{file.name}</span>
          <span className="shrink-0 text-[12px] text-[#737373] dark:text-muted-foreground">{formatFileSize(file.size)}</span>
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Faylni olib tashlash"
            className="shrink-0 text-[#737373] transition-colors hover:text-[#DC2626]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-9 w-full items-center gap-2 rounded-[8px] border border-dashed border-[#D4D4D4] bg-[#FAFAFA] px-3 text-left transition-colors hover:border-[#0052D2] dark:border-white/20 dark:bg-card"
        >
          <Upload className="h-4 w-4 shrink-0 text-[#737373]" />
          <span className="truncate text-[13px] text-[#737373] dark:text-muted-foreground">Faylni tanlang</span>
        </button>
      )}
    </div>
  )
}

function draftFromSources(user, xodim) {
  return {
    fullName: user?.fullName ?? '',
    phone: user?.phone && user.phone !== '' ? user.phone : '',
    email: '',
    telegram: '',
    balansi: '',
    bankKarta: '',
    passportFile: null,
    viloyat: xodim?.viloyatId ?? '',
    tuman: xodim?.tumanId ?? '',
    manzil: xodim?.manzil ?? '',
    passport: xodim ? joinPassport(xodim.passportSeria, xodim.passportNumber) : '',
    jshshir: xodim?.jshshir ?? '',
    stir: xodim?.stir ?? '',
  }
}

// Bittasi haqiqiy maydonlarga (User.full_name/phone_number, bog'langan Employee'ning
// viloyat/tuman/manzil/passport/JSHSHIR/STIR) yozadi, ikkinchisi (Elektron pochta/Telegram/
// Balansi/Bank karta raqami/Passport nusxasi) — backendda hech qanday moslashuvchi maydon
// yo'qligi tasdiqlangan (Swagger), shuning uchun ko'rinadi-lekin-saqlanmaydi.
export default function ProfilPage() {
  const dispatch = useDispatch()
  const user = useSelector((s) => s.auth.user)
  const theme = useSelector((s) => s.ui.theme)
  const xodim = useSelector((s) => (s.xodimlar.current?.id === user?.employeeId ? s.xodimlar.current : null))
  const regions = useSelector((s) => s.geo.regions)
  const districtsByRegion = useSelector((s) => s.geo.districtsByRegion)
  const districtsStatus = useSelector((s) => s.geo.districtsStatus)

  const [language, setLanguage] = useState('uz')
  const [draft, setDraft] = useState(() => draftFromSources(user, null))
  const [initial, setInitial] = useState(() => draftFromSources(user, null))
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const fileRef = useRef(null)

  usePageHeader([{ label: 'Profil' }, { label: 'Shaxsiy kabinet' }])

  useEffect(() => {
    if (user?.employeeId) dispatch(fetchXodimDetail(user.employeeId))
    dispatch(fetchRegions())
  }, [user?.employeeId, dispatch])

  useEffect(() => {
    const next = draftFromSources(user, xodim)
    setDraft(next)
    setInitial(next)
    if (xodim?.viloyatId) dispatch(fetchDistricts(xodim.viloyatId))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, xodim?.id, xodim?.viloyatId, xodim?.tumanId, xodim?.manzil, xodim?.passportSeria, xodim?.jshshir])

  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(''), 3000)
    return () => clearTimeout(t)
  }, [toast])

  const dirty = useMemo(() => Object.keys(initial).some((k) => draft[k] !== initial[k]), [draft, initial])

  if (!user) return null

  const set = (k, v) =>
    setDraft((d) => {
      const next = { ...d, [k]: v }
      if (k === 'viloyat' && v !== d.viloyat) next.tuman = ''
      return next
    })

  function setViloyat(regionId) {
    set('viloyat', regionId)
    if (regionId) dispatch(fetchDistricts(regionId))
  }

  const tumanOptions = districtsByRegion[draft.viloyat] ?? []
  const userDirty = draft.fullName !== initial.fullName || draft.phone !== initial.phone
  const employeeDirty =
    !!xodim &&
    (draft.viloyat !== initial.viloyat ||
      draft.tuman !== initial.tuman ||
      draft.manzil !== initial.manzil ||
      draft.passport !== initial.passport ||
      draft.jshshir !== initial.jshshir ||
      draft.stir !== initial.stir)
  const canSave = dirty && draft.fullName.trim().length > 1 && !saving

  function handleSave() {
    setSaving(true)
    const tasks = []
    if (userDirty) {
      tasks.push(dispatch(updateOwnProfile({ id: user.id, fullName: draft.fullName, phone: draft.phone })).unwrap())
    }
    if (employeeDirty) {
      const { seria, number } = splitUzPassport(draft.passport)
      tasks.push(
        dispatch(
          updateKadr({
            id: xodim.id,
            draft: {
              name: xodim.name,
              phone: xodim.phone,
              tashkilot: xodim.tashkilotId,
              filial: xodim.filialId,
              viloyat: draft.viloyat,
              tuman: draft.tuman,
              manzil: draft.manzil,
              passportSeria: seria,
              passportNumber: number,
              jshshir: draft.jshshir,
              stir: draft.stir,
              tavsif: xodim.tavsif,
            },
          })
        ).unwrap()
      )
    }
    Promise.all(tasks)
      .then(() => {
        setToast('Saqlandi')
        setInitial(draft)
      })
      .catch((err) => setToast({ variant: 'error', message: err || 'Saqlashda xatolik yuz berdi' }))
      .finally(() => setSaving(false))
  }

  const oylikMaosh = xodim?.ishHaqiTuri ? formatNumber(xodim.ishHaqiSummasi, 2) : ''

  return (
    <>
      <div className="rounded-xl border border-[#E5E5E5] bg-white p-6 dark:border-white/10 dark:bg-card">
        <h1 className="mb-6 text-[24px] font-bold text-[#0A0A0A] dark:text-white">Shaxsiy kabinet</h1>

        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-[88px] w-[88px] shrink-0 items-center justify-center overflow-hidden rounded-[12px] bg-[#EAF1FE] text-[24px] font-semibold text-[#0052D2] dark:bg-[#0052D2]/20 dark:text-[#60A5FA]">
            {user.avatar ? (
              <img src={user.avatar} alt={user.fullName} className="h-full w-full object-cover" />
            ) : (
              (user.initials ?? '?')
            )}
          </div>
          <div className="flex min-w-0 flex-col gap-3 pt-1">
            <div className="flex min-w-0 items-center gap-2.5">
              <p className="truncate text-[20px] font-semibold leading-[28px] text-[#0A0A0A] dark:text-white">{user.fullName}</p>
              <span className="inline-flex h-5 shrink-0 items-center rounded-full bg-[#E6EEFB] px-2 py-0.5 text-[12px] font-medium text-[#0052D2] dark:bg-[#0052D2]/20 dark:text-[#60A5FA]">
                {user.role}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPasswordOpen(true)}
                className="h-9 gap-2 rounded-[8px] border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#0A0A0A] shadow-[0px_1px_2px_0px_#0000001A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
              >
                <ShieldCheck className="h-4 w-4" /> Parolni o‘zgartirish
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileRef.current?.click()}
                className="h-9 gap-2 rounded-[8px] border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#0A0A0A] shadow-[0px_1px_2px_0px_#0000001A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
              >
                <ChangePhotoIcon /> Rasmni o‘zgartirish
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={() => setToast({ variant: 'warning', message: 'Backend hali ulanmagan — rasm saqlanmadi' })}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <Field label="F.I.SH.">
            <Input value={draft.fullName} onChange={(e) => set('fullName', e.target.value)} className={fieldCls} />
          </Field>
          <Field label="Telefon raqami">
            <PhoneInput value={draft.phone} onChange={(v) => set('phone', v)} className={fieldCls} />
          </Field>

          <Field label="Elektron pochta">
            <Input
              type="email"
              value={draft.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="email@misol.uz"
              className={fieldCls}
            />
          </Field>
          <Field label="Telegram">
            <Input value={draft.telegram} onChange={(e) => set('telegram', e.target.value)} placeholder="@foydalanuvchi" className={fieldCls} />
          </Field>

          <Field label="Tashkilot">
            <Input value={user.tashkilot} disabled className={fieldCls} />
          </Field>
          <Field label="Filial">
            <Input value={user.filial} disabled className={fieldCls} />
          </Field>

          <Field label="Lavozimi">
            <Input value={xodim?.lavozim || ''} disabled className={fieldCls} />
          </Field>
          <Field label="Roli">
            <Input value={user.role} disabled className={fieldCls} />
          </Field>

          <Field label="Viloyat">
            <Picker value={draft.viloyat} onChange={setViloyat} placeholder="Viloyatni tanlang" options={regions} disabled={!xodim} />
          </Field>
          <Field label="Tuman">
            <Picker
              value={draft.tuman}
              onChange={(v) => set('tuman', v)}
              placeholder={draft.viloyat ? 'Tumanni tanlang' : 'Avval viloyatni tanlang'}
              options={tumanOptions}
              disabled={!xodim || !draft.viloyat || districtsStatus[draft.viloyat] === 'loading'}
            />
          </Field>

          <Field label="Manzil">
            <Input value={draft.manzil} onChange={(e) => set('manzil', e.target.value)} disabled={!xodim} className={fieldCls} />
          </Field>
          <Field label="Tabel raqami">
            <Input value={xodim?.kartaRaqami || ''} disabled className={fieldCls} />
          </Field>

          <Field label="Passport ma’lumotlari">
            <Input
              value={draft.passport}
              onChange={(e) => set('passport', formatUzPassport(e.target.value))}
              placeholder="AA 123 45 67"
              maxLength={12}
              disabled={!xodim}
              className={fieldCls}
            />
          </Field>
          <Field label="Passport nusxasi">
            <PassportFileField file={draft.passportFile} onChange={(f) => set('passportFile', f)} />
          </Field>

          <Field label="JSHSHIR">
            <Input
              value={draft.jshshir}
              onChange={(e) => set('jshshir', formatJshshir(e.target.value))}
              maxLength={14}
              disabled={!xodim}
              className={fieldCls}
            />
          </Field>
          <Field label="STIR">
            <Input
              value={draft.stir}
              onChange={(e) => set('stir', formatStir(e.target.value))}
              maxLength={11}
              disabled={!xodim}
              className={fieldCls}
            />
          </Field>

          <Field label="Oylik maosh (UZS)">
            <Input value={oylikMaosh || ''} disabled className={fieldCls} />
          </Field>
          <Field label="Balansi (UZS)">
            <Input value={draft.balansi} onChange={(e) => set('balansi', e.target.value)} placeholder="0" className={fieldCls} />
          </Field>

          <Field label="Bank karta raqami">
            <Input
              value={draft.bankKarta}
              onChange={(e) => set('bankKarta', e.target.value)}
              placeholder="0000 0000 0000 0000"
              className={fieldCls}
            />
          </Field>
          <Field label="Ishga kirgan sana">
            <Input value={xodim?.ishgaOlinganSana || ''} disabled className={fieldCls} />
          </Field>

          <Field label="Interfeys tili">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className={fieldCls}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="uz">O‘zbekcha (uz-Latn)</SelectItem>
                <SelectItem value="ru">Русский (ru-RU)</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Mavzu">
            <Select value={theme} onValueChange={(v) => dispatch(setTheme(v))}>
              <SelectTrigger className={fieldCls}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Yorug‘</SelectItem>
                <SelectItem value="dark">Qorong‘i</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            type="button"
            disabled={!canSave}
            onClick={handleSave}
            className="h-9 gap-1.5 bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8] disabled:bg-[#E5E5E5] disabled:text-[#A3A3A3] disabled:opacity-100 dark:disabled:bg-white/10"
          >
            <Check className="h-4 w-4" /> Saqlash
          </Button>
        </div>
      </div>

      <PasswordModal
        open={passwordOpen}
        onOpenChange={setPasswordOpen}
        onSave={(newPassword) => {
          dispatch(changePassword({ id: user.id, password: newPassword }))
            .unwrap()
            .then(() => setToast('Parol yangilandi'))
            .catch((err) => setToast({ variant: 'error', message: err || 'Parolni almashtirishda xatolik yuz berdi' }))
        }}
      />
      <Toast message={toast} />
    </>
  )
}
