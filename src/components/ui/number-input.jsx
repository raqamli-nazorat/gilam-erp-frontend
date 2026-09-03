import { useLayoutEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { groupThousands } from "@/lib/format"

// Kiritilgan matndan faqat raqam (va ixtiyoriy bitta kasr ajratkich) qoldiradi.
// Boshidagi ortiqcha nollar olib tashlanadi. Ichki format — nuqtali ("1234.5").
export function sanitizeNumeric(raw, decimals = true) {
  let s = String(raw ?? "").replace(decimals ? /[^\d.,]/g : /\D/g, "")
  if (decimals) {
    s = s.replace(/,/g, ".")
    const dot = s.indexOf(".")
    if (dot !== -1) s = s.slice(0, dot + 1) + s.slice(dot + 1).replace(/\./g, "")
  }
  return s.replace(/^0+(?=\d)/, "")
}

// "1234567.5" -> "1 234 567,5" ; "" -> ""
export function groupNumeric(raw) {
  const s = String(raw ?? "")
  if (s === "") return ""
  const [int, frac] = s.split(".")
  const grouped = groupThousands(int || "")
  return frac !== undefined ? `${grouped},${frac}` : grouped
}

// type="text" input — faqat raqam yoziladi, XXX XXX XXX ko'rinishida formatlanadi.
// `pad` berilsa — fokusdan chiqqanda shuncha kasr xonagacha to'ldiriladi (masalan 4 -> "4,00").
// onChange chaqiruvchiga xom qiymatni ({ target: { value } }) qaytaradi.
export function NumberInput({ value, onChange, decimals = true, pad, onFocus, onBlur, ...props }) {
  const [focused, setFocused] = useState(false)
  const inputRef = useRef(null)
  const pendingCaret = useRef(null)

  const s = String(value ?? "")
  let display = groupNumeric(s)
  if (s !== "" && !focused && pad != null && Number.isFinite(Number(s))) {
    display = groupNumeric(Number(s).toFixed(pad))
  }

  // Qayta formatlashdan keyin kursorni foydalanuvchi to'xtagan joyga qaytaradi
  // (aks holda DOM value dasturiy ravishda yozilib, kursor har doim oxiriga sakraydi).
  useLayoutEffect(() => {
    if (pendingCaret.current == null) return
    inputRef.current?.setSelectionRange(pendingCaret.current, pendingCaret.current)
    pendingCaret.current = null
  }, [display])

  return (
    <Input
      ref={inputRef}
      type="text"
      inputMode={decimals ? "decimal" : "numeric"}
      value={display}
      onFocus={(e) => {
        setFocused(true)
        onFocus?.(e)
      }}
      onBlur={(e) => {
        setFocused(false)
        onBlur?.(e)
      }}
      onChange={(e) => {
        const raw = e.target.value
        const caret = e.target.selectionStart ?? raw.length
        const digitsBeforeCaret = (raw.slice(0, caret).match(/\d/g) || []).length
        const sanitized = sanitizeNumeric(raw, decimals)
        const grouped = groupNumeric(sanitized)

        let seen = 0
        let newCaret = grouped.length
        for (let i = 0; i < grouped.length; i++) {
          if (/\d/.test(grouped[i])) seen++
          if (seen === digitsBeforeCaret) {
            newCaret = i + 1
            break
          }
        }
        if (digitsBeforeCaret === 0) newCaret = 0
        pendingCaret.current = newCaret

        onChange?.({ target: { value: sanitized } })
      }}
      {...props}
    />
  )
}
