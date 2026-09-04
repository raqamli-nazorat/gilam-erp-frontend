import { Input } from '@/components/ui/input'
import { formatUzPhone } from '@/lib/format'

// O'zbekiston telefon raqami uchun maydon: faqat raqam qabul qiladi va
// "+998 90 123-45-67" formatida ko'rsatadi. onChange formatlangan matnni qaytaradi.
export function PhoneInput({ value, onChange, placeholder, ...props }) {
  return (
    <Input
      {...props}
      type="tel"
      inputMode="numeric"
      autoComplete="tel"
      placeholder={placeholder ?? '+998 __ ___-__-__'}
      value={value ?? ''}
      onChange={(e) => onChange?.(formatUzPhone(e.target.value))}
      onKeyDown={(e) => {
        if (e.key.length === 1 && !/[\d\s+\-().]/.test(e.key) && !e.ctrlKey && !e.metaKey) {
          e.preventDefault()
        }
        props.onKeyDown?.(e)
      }}
    />
  )
}
