import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { Building2, MoreHorizontal, Plus, Printer, Scissors, ShoppingCart, Tag, X } from 'lucide-react'
import { usePageHeader } from '@/hooks/usePageHeader'
import { cn } from '@/lib/utils'
import { formatNumber } from '@/lib/format'
import {
  makeRoll,
  roomArea,
  rollBookedM2,
  rollSum,
} from '@/features/bookings/bookingsMockData'
import {
  bookingCancelled,
  bookingDraftCreated,
  bookingHeaderUpdated,
  bookingSaved,
  bookingSold,
  roomAdded,
  rollCut,
  rollRemoved,
  rollsAdded,
  rollToggled,
} from '@/features/bookings/bookingsSlice'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import BookingHeaderForm from './components/BookingHeaderForm'
import RoomModal from './components/RoomModal'
import AddRollModal from './components/AddRollModal'
import CutRollModal from './components/CutRollModal'
import BookingSaleModal from './components/BookingSaleModal'
import BookingReceiptModal from './components/BookingReceiptModal'
import CancelBookingModal from './components/CancelBookingModal'
import Toast from '@/components/Toast'

export default function BookingDetailPage({ isNew }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const created = useRef(false)

  useEffect(() => {
    if (isNew && !created.current) {
      created.current = true
      const action = dispatch(bookingDraftCreated())
      navigate(`/bron-tovarlar/${action.payload.id}`, { replace: true })
    }
  }, [isNew, dispatch, navigate])

  if (isNew) return null
  return <BookingWorkspace />
}

function BookingWorkspace() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const exchangeRate = useSelector((s) => s.bookings.exchangeRate)
  const booking = useSelector((s) => s.bookings.list.find((b) => b.id === id))

  const [roomOpen, setRoomOpen] = useState(false)
  const [rollOpen, setRollOpen] = useState(false)
  const [cutRoll, setCutRoll] = useState(null)
  const [saleOpen, setSaleOpen] = useState(false)
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [toast, setToast] = useState('')

  const isDraft = booking?.status === 'draft'
  const isClosed = booking?.status === 'closed'

  usePageHeader(
    'Bron tovarlar',
    booking ? (isDraft ? { label: 'Yangi', variant: 'new' } : { label: booking.number, variant: 'new' }) : null
  )

  useEffect(() => {
    if (!booking) navigate('/bron-tovarlar', { replace: true })
  }, [booking, navigate])

  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(''), 3500)
    return () => clearTimeout(t)
  }, [toast])

  if (!booking) return null

  const neededM2 = booking.rooms.reduce((s, r) => s + roomArea(r), 0)
  const bronTotal = booking.rolls.reduce((s, r) => s + rollBookedM2(r), 0)
  const totalUsd = booking.rolls.reduce((s, r) => s + rollSum(r), 0)
  const totalUzs = Math.round(totalUsd * exchangeRate)
  const canSave = booking.rooms.length > 0 && booking.rolls.length > 0
  const covered = booking.rolls.length > 0 && bronTotal >= neededM2 && neededM2 > 0

  return (
    <>
      <div className="flex flex-col gap-4">
        <BookingHeaderForm
          booking={booking}
          exchangeRate={exchangeRate}
          onChange={(patch) => dispatch(bookingHeaderUpdated({ id: booking.id, patch }))}
        />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[500px_1fr]">
          {/* Xona o'lchovi */}
          <div className="flex flex-col overflow-hidden rounded-xl border border-[#E5E5E5] bg-white dark:border-white/10 dark:bg-card">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] p-4 dark:border-white/10">
              <h2 className="text-[15px] font-semibold text-[#0A0A0A] dark:text-white">Xona o‘lchovi</h2>
              <button
                type="button"
                onClick={() => setRoomOpen(true)}
                className="flex items-center gap-1 text-[13px] font-medium text-[#0052D2] transition-colors hover:underline dark:text-[#60A5FA]"
              >
                <Plus className="h-4 w-4" /> Xona
              </button>
            </div>

            {booking.rooms.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F5F5] dark:bg-white/5">
                  <Building2 className="h-6 w-6 text-[#737373]" />
                </div>
                <p className="text-[14px] font-medium text-[#0A0A0A] dark:text-white">Xona qo‘shilmagan</p>
                <p className="text-[12px] text-[#737373] dark:text-muted-foreground">Mijoz xonalarini o‘lchab kiriting</p>
              </div>
            ) : (
              <table className="w-full flex-1 text-sm">
                <thead className="bg-[#F5F5F5] dark:bg-white/5">
                  <tr className="h-10 border-b border-[#E5E5E5] text-[11px] font-semibold uppercase text-[#737373] dark:border-white/10">
                    <th className="w-10 px-3 text-left">#</th>
                    <th className="px-3 text-left">XONA</th>
                    <th className="px-3 text-right">ENI</th>
                    <th className="px-3 text-right">BO‘YI</th>
                    <th className="px-3 text-right">M²</th>
                  </tr>
                </thead>
                <tbody>
                  {booking.rooms.map((r, i) => (
                    <tr key={r.id} className="h-11 border-b border-[#E5E5E5] last:border-0 dark:border-white/5">
                      <td className="px-3 text-[13px] text-[#737373]">{i + 1}</td>
                      <td className="px-3 text-[13px] font-medium text-[#0A0A0A] dark:text-white">{r.name}</td>
                      <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{formatNumber(r.widthM)}</td>
                      <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{formatNumber(r.lengthM)}</td>
                      <td className="px-3 text-right text-[13px] font-medium text-[#0A0A0A] dark:text-white">{formatNumber(roomArea(r))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="bg-[#EAF1FE] px-4 py-3 dark:bg-[#0052D2]/15">
              <p className="text-[12px] font-normal text-[#737373] dark:text-muted-foreground">Kerakli maydon</p>
              <p className="mt-0.5">
                <span className="text-[16px] font-bold text-[#0052D2] dark:text-[#60A5FA]">{formatNumber(neededM2)}</span>
                <span className="ml-1.5 text-[12px] text-[#737373] dark:text-muted-foreground">
                  {booking.rooms.length > 0 && 'm² · '}{booking.rooms.length} ta xona
                </span>
              </p>
            </div>
          </div>

          {/* Bron qilingan rulonlar */}
          <div className="flex flex-col overflow-hidden rounded-xl border border-[#E5E5E5] bg-white dark:border-white/10 dark:bg-card">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E5E5] p-4 dark:border-white/10">
              <h2 className="text-[15px] font-semibold text-[#0A0A0A] dark:text-white">Bron qilingan rulonlar</h2>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={() => setRollOpen(true)}
                  className="h-9 gap-1.5 rounded-md border border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:bg-[#F5F5F5] dark:border-white/10 dark:bg-card dark:text-white"
                >
                  <Plus className="h-4 w-4" /> Rulon qo‘shish
                </Button>
                {!isDraft && booking.rolls.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-9 w-9 p-0 text-[#737373] hover:bg-[#F5F5F5] hover:text-[#0A0A0A] dark:hover:bg-white/5 dark:hover:text-white"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end" className="w-[200px] rounded-[12px] border border-[#E5E5E5] bg-white p-1.5 shadow-[0px_8px_24px_0px_#01091C1F] dark:border-white/10 dark:bg-card">
                      <DropdownMenuItem
                        disabled={isClosed}
                        onClick={() => setSaleOpen(true)}
                        className="h-9 cursor-pointer gap-2.5 rounded-lg px-3 text-[14px] text-[#0A0A0A] hover:bg-[#F5F5F5] focus:bg-[#F5F5F5] dark:text-white dark:hover:bg-white/5"
                      >
                        <ShoppingCart className="h-4 w-4" /> Sotuv yaratish
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={isClosed}
                        onClick={() => setCancelOpen(true)}
                        className="h-9 cursor-pointer gap-2.5 rounded-lg px-3 text-[14px] text-[#DC2626] hover:bg-[#FEF2F2] focus:bg-[#FEF2F2] dark:hover:bg-red-950/40"
                      >
                        <X className="h-4 w-4" /> Bronni bekor qilish
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>

            {booking.rolls.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F5F5] dark:bg-white/5">
                  <Tag className="h-6 w-6 text-[#A3A3A3]" />
                </div>
                <p className="text-[14px] font-medium text-[#0A0A0A] dark:text-white">Rulon tanlanmagan</p>
                <p className="text-[12px] text-[#737373] dark:text-muted-foreground">
                  Kerakli maydon hisoblangach mos rulonlarni tanlang
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#F5F5F5] dark:bg-white/5">
                    <tr className="h-10 border-b border-[#E5E5E5] text-[11px] font-semibold uppercase text-[#737373] dark:border-white/10">
                      <th className="w-8 px-3 text-left">#</th>
                      <th className="w-8 px-3" />
                      <th className="px-3 text-left">TOVAR</th>
                      <th className="px-3 text-left">PARTIYA</th>
                      <th className="px-3 text-right">QOLDIQ, M²</th>
                      <th className="px-3 text-right">ENI</th>
                      <th className="px-3 text-right">BO‘YI</th>
                      <th className="px-3 text-right">BRON, M²</th>
                      <th className="px-3 text-right">NARX, USD</th>
                      <th className="px-3 text-right">SUMMA, USD</th>
                      <th className="w-10 px-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {booking.rolls.map((r, i) => (
                      <tr
                        key={r.id}
                        className={cn(
                          'group h-11 border-b border-[#E5E5E5] last:border-0 dark:border-white/5',
                          r.selected && 'bg-[#EFF5FF] dark:bg-[#0052D2]/10'
                        )}
                      >
                        <td className="px-3 text-[13px] text-[#737373]">{i + 1}</td>
                        <td className="px-3">
                          <Checkbox
                            checked={!!r.selected}
                            onCheckedChange={() => dispatch(rollToggled({ id: booking.id, rollId: r.id }))}
                            disabled={isClosed}
                          />
                        </td>
                        <td className="max-w-[190px] truncate px-3 text-[13px] font-medium text-[#0A0A0A] dark:text-white">
                          {r.quality} {r.design}
                          {r.cut && <span className="ml-1.5 text-[11px] font-normal text-[#B45309]">· kesildi</span>}
                        </td>
                        <td className="px-3 text-[13px] font-medium text-[#0052D2] dark:text-[#60A5FA]">{r.partiya}</td>
                        <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{formatNumber(r.stockM2)}</td>
                        <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{formatNumber(r.widthM)}</td>
                        <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{formatNumber(r.lengthM)}</td>
                        <td className="px-3 text-right text-[13px] font-medium text-[#0A0A0A] dark:text-white">{formatNumber(rollBookedM2(r))}</td>
                        <td className="px-3 text-right text-[13px] text-[#0A0A0A] dark:text-white">{formatNumber(r.priceUsd)}</td>
                        <td className="px-3 text-right text-[13px] font-medium text-[#0A0A0A] dark:text-white">{formatNumber(rollSum(r))}</td>
                        <td className="px-3 text-right">
                          {!isClosed && (
                            <button
                              type="button"
                              onClick={() => (r.cut ? dispatch(rollRemoved({ id: booking.id, rollId: r.id })) : setCutRoll(r))}
                              className="text-[#737373] opacity-0 transition-opacity hover:text-[#DC2626] group-hover:opacity-100"
                              aria-label={r.cut ? 'Rulonni olib tashlash' : 'Rulonni kesish'}
                            >
                              {r.cut ? <X className="h-4 w-4" /> : <Scissors className="h-4 w-4" />}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-[13px] font-medium',
                covered
                  ? 'bg-[#E6FAF1] text-[#047A47] dark:bg-[#047A47]/15 dark:text-[#34D399]'
                  : 'bg-[#F5F5F5] text-[#525252] dark:bg-white/5 dark:text-muted-foreground'
              )}
            >
              {covered ? (
                <>✓ Bron {formatNumber(bronTotal)} m² · kerak {formatNumber(neededM2)} m² · qoldiq {formatNumber(Math.max(0, bronTotal - neededM2))} m² rulonlarda qoladi</>
              ) : (
                <>✓ Xonalarni kiriting — tizim mos rulonlarni taklif qiladi</>
              )}
            </div>
          </div>
        </div>

        {/* Pastki panel */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E5E5E5] bg-white px-5 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.06)] dark:border-white/10 dark:bg-card">
          <div>
            <p className="text-[12px] font-normal text-[#737373] dark:text-muted-foreground">Jami summa</p>
            <p className="mt-0.5 text-[16px] font-bold text-[#0A0A0A] dark:text-white">
              {formatNumber(totalUzs)} <span className="text-[12px] font-normal text-[#737373]">UZS</span>
              <span className="mx-1.5 text-[#D4D4D4]">·</span>
              {formatNumber(totalUsd)} <span className="text-[12px] font-normal text-[#737373]">USD</span>
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={booking.rolls.length === 0}
              className="h-9 gap-1.5 border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] disabled:opacity-50 dark:border-white/10 dark:bg-card dark:text-white"
            >
              <Printer className="h-4 w-4" /> Shtrix chop etish
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={booking.rolls.length === 0}
              onClick={() => setReceiptOpen(true)}
              className="h-9 gap-1.5 border-[#E5E5E5] bg-white px-4 text-[14px] font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] disabled:opacity-50 dark:border-white/10 dark:bg-card dark:text-white"
            >
              <Printer className="h-4 w-4" /> Chek chop etish
            </Button>
            <Button
              type="button"
              disabled={!canSave}
              onClick={() => {
                dispatch(bookingSaved(booking.id))
                setToast(`Bron saqlandi · ${booking.number}`)
              }}
              className="h-9 gap-1.5 bg-[#0052D2] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-[#0047B8] disabled:bg-[#E5E5E5] disabled:text-[#A3A3A3] disabled:opacity-100 dark:disabled:bg-white/10"
            >
              ✓ Saqlash
            </Button>
          </div>
        </div>
      </div>

      <RoomModal
        open={roomOpen}
        onOpenChange={setRoomOpen}
        neededM2={neededM2}
        onAdd={(room) => dispatch(roomAdded({ id: booking.id, room }))}
      />

      <AddRollModal
        open={rollOpen}
        onOpenChange={setRollOpen}
        roomCount={booking.rooms.length}
        neededM2={neededM2}
        onAdd={(srcRolls) =>
          dispatch(
            rollsAdded({
              id: booking.id,
              rolls: srcRolls.map((s) => makeRoll(s, Number((s.stockM2 / s.widthM).toFixed(2)), { selected: true })),
            })
          )
        }
      />

      <CutRollModal
        open={!!cutRoll}
        onOpenChange={(open) => !open && setCutRoll(null)}
        roll={cutRoll}
        onConfirm={() => cutRoll && dispatch(rollCut({ id: booking.id, rollId: cutRoll.id }))}
      />

      <BookingSaleModal
        open={saleOpen}
        onOpenChange={setSaleOpen}
        rolls={booking.rolls}
        exchangeRate={exchangeRate}
        onCreate={(rollIds) => {
          dispatch(bookingSold({ id: booking.id, rollIds }))
          setToast('Sotuv hujjati yaratildi')
        }}
      />

      <BookingReceiptModal open={receiptOpen} onOpenChange={setReceiptOpen} booking={booking} />

      <CancelBookingModal
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        booking={booking}
        onConfirm={() => {
          dispatch(bookingCancelled(booking.id))
          navigate('/bron-tovarlar')
        }}
      />

      <Toast message={toast} />
    </>
  )
}
