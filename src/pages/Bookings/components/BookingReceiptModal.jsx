import { Printer, X } from 'lucide-react'
import { BOOKING_STORE, rollBookedM2, rollSum } from '@/features/bookings/bookingsMockData'
import { formatDate, formatNumber } from '@/lib/format'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

function QrMock({ seed = 'BR' }) {
  const n = 21
  const s = String(seed)
  const finder = (r, c) => {
    const ring = (br, bc) => {
      if (!(r >= br && r < br + 7 && c >= bc && c < bc + 7)) return false
      return r === br || r === br + 6 || c === bc || c === bc + 6 || (r >= br + 2 && r <= br + 4 && c >= bc + 2 && c <= bc + 4)
    }
    return ring(0, 0) || ring(0, n - 7) || ring(n - 7, 0)
  }
  const inFinder = (r, c) => (r < 8 && c < 8) || (r < 8 && c >= n - 8) || (r >= n - 8 && c < 8)
  const cells = []
  for (let r = 0; r < n; r += 1) {
    for (let c = 0; c < n; c += 1) {
      if (finder(r, c)) cells.push(<rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="currentColor" />)
      else if (!inFinder(r, c) && (s.charCodeAt((r * n + c) % s.length) + r * 7 + c * 13) % 2 === 0)
        cells.push(<rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="currentColor" />)
    }
  }
  return <svg viewBox={`0 0 ${n} ${n}`} className="h-24 w-24 text-[#0A0A0A]">{cells}</svg>
}

export default function BookingReceiptModal({ open, onOpenChange, booking }) {
  if (!booking) return null
  const rolls = booking.rolls
  const totalM2 = rolls.reduce((s, r) => s + rollBookedM2(r), 0)
  const totalUsd = rolls.reduce((s, r) => s + rollSum(r), 0)
  const totalUzs = Math.round(totalUsd * 11400)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="p-5 sm:max-w-[460px]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-[17px] font-semibold leading-[24px] tracking-[-0.2px] text-[#0A0A0A] dark:text-white">
            Bron cheki
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-9 gap-1.5 border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
            >
              <X className="h-4 w-4" /> Yopish
            </Button>
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              className="h-9 gap-1.5 bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8]"
            >
              <Printer className="h-4 w-4" /> Chop etish
            </Button>
          </div>
        </DialogHeader>

        <div className="rounded-xl border border-[#E5E5E5] bg-white p-6 text-[13px] text-[#0A0A0A] dark:border-white/10 dark:bg-card dark:text-white">
          <p className="text-center text-[15px] font-bold">{BOOKING_STORE.name}</p>
          <p className="text-center text-[12px] text-[#737373]">{BOOKING_STORE.address}</p>

          <div className="my-3 border-t border-dashed border-[#D4D4D4]" />

          <p className="text-center font-semibold">BRON CHEKI № {booking.number}</p>
          <div className="mt-2 space-y-1 text-[12px]">
            <Line l="Sana" r={`${formatDate(booking.date)} ${booking.time}`} />
            <Line l="Mijoz" r={booking.customer || '—'} />
            <Line l="Agent" r={booking.agent} />
          </div>

          <div className="my-3 border-t border-dashed border-[#D4D4D4]" />

          <div className="space-y-2">
            {rolls.map((r) => (
              <div key={r.id}>
                <p className="font-medium">{r.quality} {r.design}</p>
                <div className="flex items-center justify-between text-[12px] text-[#525252] dark:text-muted-foreground">
                  <span>{r.partiya}</span>
                  <span>
                    {formatNumber(rollBookedM2(r))} m² <span className="ml-2 font-semibold text-[#0A0A0A] dark:text-white">{formatNumber(rollSum(r))} USD</span>
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="my-3 border-t border-dashed border-[#D4D4D4]" />

          <div className="space-y-1 text-[12px]">
            <Line l="Jami maydon" r={`${formatNumber(totalM2)} m²`} />
            <Line l="Jami summa" r={`${formatNumber(totalUsd)} USD`} />
            <Line l="UZS" r={formatNumber(totalUzs, 0)} />
          </div>

          <div className="my-3 border-t border-dashed border-[#D4D4D4]" />

          <p className="text-center text-[12px] text-[#737373]">Bron 7 kun saqlanadi</p>
          <div className="mt-3 flex justify-center">
            <QrMock seed={booking.number} />
          </div>
          <p className="mt-2 text-center font-semibold">Rahmat!</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Line({ l, r }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[#737373]">{l}</span>
      <span className="font-medium">{r}</span>
    </div>
  )
}
