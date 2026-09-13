import { useState, useEffect, useRef, useCallback } from 'react'
import { Pipette, Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

// --- Color Helpers ---
function hexToRgb(hex) {
  if (!hex) return { r: 0, g: 0, b: 0, a: 1 }
  let clean = String(hex).replace('#', '').trim()
  if (clean.length === 3) {
    clean = clean
      .split('')
      .map((c) => c + c)
      .join('')
  } else if (clean.length === 4) {
    clean = clean
      .split('')
      .map((c) => c + c)
      .join('')
  }

  if (clean.length === 6) {
    const num = parseInt(clean, 16)
    if (isNaN(num)) return { r: 0, g: 0, b: 0, a: 1 }
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
      a: 1,
    }
  }

  if (clean.length === 8) {
    const num = parseInt(clean, 16)
    if (isNaN(num)) return { r: 0, g: 0, b: 0, a: 1 }
    return {
      r: (num >> 24) & 255,
      g: (num >> 16) & 255,
      b: (num >> 8) & 255,
      a: Math.round(((num & 255) / 255) * 100) / 100,
    }
  }

  return { r: 0, g: 0, b: 0, a: 1 }
}

function rgbToHsv(r, g, b) {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  let h = 0
  const s = max === 0 ? 0 : d / max
  const v = max

  if (max !== min) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  }
}

function hsvToRgb(h, s, v) {
  s = Math.max(0, Math.min(100, s)) / 100
  v = Math.max(0, Math.min(100, v)) / 100
  const i = Math.floor((h / 60) % 6)
  const f = h / 60 - i
  const p = v * (1 - s)
  const q = v * (1 - f * s)
  const t = v * (1 - (1 - f) * s)
  let r = 0,
    g = 0,
    b = 0
  switch (i) {
    case 0:
      r = v
      g = t
      b = p
      break
    case 1:
      r = q
      g = v
      b = p
      break
    case 2:
      r = p
      g = v
      b = t
      break
    case 3:
      r = p
      g = q
      b = v
      break
    case 4:
      r = t
      g = p
      b = v
      break
    case 5:
      r = v
      g = p
      b = q
      break
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  }
}

function rgbToHex(r, g, b, a = 1) {
  const toHex = (n) => {
    const clamped = Math.max(0, Math.min(255, Math.round(n)))
    return clamped.toString(16).padStart(2, '0').toUpperCase()
  }
  if (a < 1) {
    const alphaHex = toHex(Math.round(a * 255))
    return `#${toHex(r)}${toHex(g)}${toHex(b)}${alphaHex}`
  }
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

const PRESETS = [
  '#EF4444',
  '#F97316',
  '#F59E0B',
  '#10B981',
  '#06B6D4',
  '#3B82F6',
  '#6366F1',
  '#8B5CF6',
  '#EC4899',
  '#0A0A0A',
  '#737373',
  '#FFFFFF',
]

export default function ColorPicker({ value, onChange, className }) {
  const [initialColor] = useState(() => value || '#737373')
  const [hsv, setHsv] = useState(() => {
    const rgb = hexToRgb(value || '#737373')
    const hsvVal = rgbToHsv(rgb.r, rgb.g, rgb.b)
    return { ...hsvVal, a: rgb.a }
  })
  const [hexInput, setHexInput] = useState(() => value || '#737373')
  const [colorMode, setColorMode] = useState('hex') // 'hex' | 'rgb' | 'hsl'
  const [copied, setCopied] = useState(false)

  const spectrumRef = useRef(null)
  const hueRef = useRef(null)
  const alphaRef = useRef(null)

  // Sync when value prop changes externally
  useEffect(() => {
    if (!value) return
    const rgb = hexToRgb(value)
    const newHsv = rgbToHsv(rgb.r, rgb.g, rgb.b)
    setHsv((prev) => ({
      h: prev.h !== 0 && newHsv.s === 0 ? prev.h : newHsv.h,
      s: newHsv.s,
      v: newHsv.v,
      a: rgb.a,
    }))
    setHexInput(value)
  }, [value])

  const rgb = hsvToRgb(hsv.h, hsv.s, hsv.v)
  const currentHex = rgbToHex(rgb.r, rgb.g, rgb.b, hsv.a)
  const solidHex = rgbToHex(rgb.r, rgb.g, rgb.b, 1)

  const emitChange = useCallback(
    (newHsv) => {
      const cRgb = hsvToRgb(newHsv.h, newHsv.s, newHsv.v)
      const hex = rgbToHex(cRgb.r, cRgb.g, cRgb.b, newHsv.a)
      setHexInput(hex)
      onChange?.(hex)
    },
    [onChange]
  )

  // Spectrum 2D drag
  const handleSpectrumMove = useCallback(
    (e) => {
      if (!spectrumRef.current) return
      const rect = spectrumRef.current.getBoundingClientRect()
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
      const newS = Math.round(x * 100)
      const newV = Math.round((1 - y) * 100)
      setHsv((prev) => {
        const next = { ...prev, s: newS, v: newV }
        emitChange(next)
        return next
      })
    },
    [emitChange]
  )

  const handleSpectrumPointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    handleSpectrumMove(e)
  }

  const handleSpectrumPointerMove = (e) => {
    if (e.buttons !== 1) return
    handleSpectrumMove(e)
  }

  // Hue drag
  const handleHueMove = useCallback(
    (e) => {
      if (!hueRef.current) return
      const rect = hueRef.current.getBoundingClientRect()
      const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
      const newH = Math.round(y * 360) % 360
      setHsv((prev) => {
        const next = { ...prev, h: newH }
        emitChange(next)
        return next
      })
    },
    [emitChange]
  )

  const handleHuePointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    handleHueMove(e)
  }

  const handleHuePointerMove = (e) => {
    if (e.buttons !== 1) return
    handleHueMove(e)
  }

  // Alpha drag
  const handleAlphaMove = useCallback(
    (e) => {
      if (!alphaRef.current) return
      const rect = alphaRef.current.getBoundingClientRect()
      const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
      const newA = Math.round((1 - y) * 100) / 100
      setHsv((prev) => {
        const next = { ...prev, a: newA }
        emitChange(next)
        return next
      })
    },
    [emitChange]
  )

  const handleAlphaPointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    handleAlphaMove(e)
  }

  const handleAlphaPointerMove = (e) => {
    if (e.buttons !== 1) return
    handleAlphaMove(e)
  }

  // Manual hex typing
  const handleHexInputChange = (e) => {
    const val = e.target.value
    setHexInput(val)
    if (/^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(val.trim())) {
      const normalized = val.startsWith('#') ? val : `#${val}`
      const newRgb = hexToRgb(normalized)
      const newHsv = rgbToHsv(newRgb.r, newRgb.g, newRgb.b)
      setHsv({ ...newHsv, a: newRgb.a })
      onChange?.(normalized.toUpperCase())
    }
  }

  // Eyedropper API
  const handleEyeDropper = async () => {
    if (typeof window !== 'undefined' && 'EyeDropper' in window) {
      try {
        const eyeDropper = new window.EyeDropper()
        const result = await eyeDropper.open()
        if (result?.sRGBHex) {
          const hex = result.sRGBHex.toUpperCase()
          const newRgb = hexToRgb(hex)
          const newHsv = rgbToHsv(newRgb.r, newRgb.g, newRgb.b)
          setHsv({ ...newHsv, a: 1 })
          setHexInput(hex)
          onChange?.(hex)
        }
      } catch {
        // cancelled by user
      }
    }
  }

  const handleCopy = () => {
    navigator.clipboard?.writeText(currentHex)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const getDisplayText = () => {
    if (colorMode === 'rgb') {
      return hsv.a < 1
        ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${hsv.a})`
        : `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
    }
    if (colorMode === 'hsl') {
      return `hsl(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`
    }
    return currentHex
  }

  const cycleMode = () => {
    if (colorMode === 'hex') setColorMode('rgb')
    else if (colorMode === 'rgb') setColorMode('hsl')
    else setColorMode('hex')
  }

  return (
    <div
      className={cn(
        'w-[270px] select-none rounded-xl border border-[#E5E5E5] bg-white p-2.5 text-[#0A0A0A] shadow-[0_12px_32px_rgba(0,0,0,0.14)] dark:border-white/10 dark:bg-[#1e1e1e] dark:text-white',
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header Bar */}
      <div className="mb-2.5 flex h-7 items-center justify-between rounded-lg bg-[#F5F5F5] px-2 text-xs text-[#525252] dark:bg-white/5 dark:text-[#CCCCCC]">
        <div
          onClick={cycleMode}
          className="flex cursor-pointer items-center gap-2 font-mono transition-colors hover:text-[#0052D2] dark:hover:text-white"
          title="Formatni o'zgartirish uchun bosing"
        >
          {/* Split circle: left is initial color, right is current selected */}
          <div className="relative flex h-4 w-4 shrink-0 overflow-hidden rounded-full border border-black/15 shadow-xs dark:border-white/20">
            <div
              className="h-full w-1/2"
              style={{ backgroundColor: initialColor }}
              title="Dastlabki rang"
            />
            <div
              className="h-full w-1/2"
              style={{ backgroundColor: currentHex }}
              title="Tanlangan rang"
            />
          </div>
          <span className="font-semibold tracking-wide text-[#0A0A0A] dark:text-white">{getDisplayText()}</span>
        </div>

        <div className="flex items-center gap-0.5">
          {typeof window !== 'undefined' && 'EyeDropper' in window && (
            <button
              type="button"
              onClick={handleEyeDropper}
              className="rounded p-1 text-[#737373] transition-colors hover:bg-black/5 hover:text-[#0A0A0A] dark:text-[#A0A0A0] dark:hover:bg-white/10 dark:hover:text-white"
              title="Ekrandan rang olish"
            >
              <Pipette className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={handleCopy}
            className="rounded p-1 text-[#737373] transition-colors hover:bg-black/5 hover:text-[#0A0A0A] dark:text-[#A0A0A0] dark:hover:bg-white/10 dark:hover:text-white"
            title="Nusxalash"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Pickers Area: 2D Plane + 2 Sliders */}
      <div className="flex gap-2">
        {/* Saturation & Value Box */}
        <div
          ref={spectrumRef}
          onPointerDown={handleSpectrumPointerDown}
          onPointerMove={handleSpectrumPointerMove}
          className="relative h-[145px] flex-1 cursor-crosshair overflow-hidden rounded-md border border-black/10 shadow-inner dark:border-white/10"
          style={{
            backgroundColor: `hsl(${hsv.h}, 100%, 50%)`,
          }}
        >
          {/* Horizontal white gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent" />
          {/* Vertical black gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
          {/* Thumb handle */}
          <div
            className="pointer-events-none absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_3px_rgba(0,0,0,0.8)]"
            style={{
              left: `${hsv.s}%`,
              top: `${100 - hsv.v}%`,
            }}
          />
        </div>

        {/* Alpha / Opacity Slider */}
        <div
          ref={alphaRef}
          onPointerDown={handleAlphaPointerDown}
          onPointerMove={handleAlphaPointerMove}
          className="relative h-[145px] w-4 cursor-pointer overflow-hidden rounded-md border border-black/10 dark:border-white/10"
          style={{
            backgroundImage: `linear-gradient(to bottom, ${solidHex} 0%, transparent 100%), repeating-conic-gradient(#cbd5e1 0% 25%, #ffffff 0% 50%) 50% / 6px 6px`,
          }}
          title="Shaffoflik (Alpha)"
        >
          <div
            className="pointer-events-none absolute left-0 right-0 h-2 -translate-y-1/2 rounded-[1px] border border-white/95 shadow-[0_0_2px_rgba(0,0,0,0.8)]"
            style={{
              top: `${(1 - hsv.a) * 100}%`,
            }}
          />
        </div>

        {/* Rainbow Hue Slider */}
        <div
          ref={hueRef}
          onPointerDown={handleHuePointerDown}
          onPointerMove={handleHuePointerMove}
          className="relative h-[145px] w-4 cursor-pointer overflow-hidden rounded-md border border-black/10 dark:border-white/10"
          style={{
            background:
              'linear-gradient(to bottom, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
          }}
          title="Rang tusi (Hue)"
        >
          <div
            className="pointer-events-none absolute left-0 right-0 h-2 -translate-y-1/2 rounded-[1px] border border-white/95 shadow-[0_0_2px_rgba(0,0,0,0.8)]"
            style={{
              top: `${(hsv.h / 360) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Direct Hex Input & Alpha Percent */}
      <div className="mt-2.5 flex items-center gap-1.5">
        <div className="relative flex-1">
          <input
            type="text"
            value={hexInput}
            onChange={handleHexInputChange}
            placeholder="#000000"
            className="h-7 w-full rounded-md border border-[#E5E5E5] bg-[#FAFAFA] px-2 font-mono text-xs text-[#0A0A0A] uppercase placeholder:text-[#737373] focus:border-[#0052D2] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0052D2] dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-[#60A5FA] dark:focus:ring-[#60A5FA]"
          />
        </div>
        <div className="flex h-7 w-12 items-center justify-center rounded-md border border-[#E5E5E5] bg-[#F5F5F5] font-mono text-xs font-medium text-[#525252] dark:border-white/10 dark:bg-white/5 dark:text-neutral-300">
          {Math.round(hsv.a * 100)}%
        </div>
      </div>

      {/* Preset Swatches Palette */}
      <div className="mt-2 grid grid-cols-6 gap-1.5 pt-0.5">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => {
              const newRgb = hexToRgb(p)
              const newHsv = rgbToHsv(newRgb.r, newRgb.g, newRgb.b)
              setHsv({ ...newHsv, a: 1 })
              setHexInput(p)
              onChange?.(p)
            }}
            className={cn(
              'h-5 w-full rounded-[4px] border border-black/10 shadow-2xs transition-transform hover:scale-110 active:scale-95 dark:border-white/15',
              currentHex.toUpperCase() === p.toUpperCase() &&
                'ring-2 ring-[#0052D2] ring-offset-1 ring-offset-white dark:ring-[#60A5FA] dark:ring-offset-[#1e1e1e]'
            )}
            style={{ backgroundColor: p }}
            title={p}
          />
        ))}
      </div>
    </div>
  )
}
