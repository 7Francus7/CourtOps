'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { sendPlayerOTP, verifyPlayerOTP, cancelPlayerBooking, logoutPlayer } from '@/actions/player-portal'
import { toast } from 'sonner'
import {
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  LogOut,
  Phone,
  Shield,
  X,
  CheckCircle,
  Loader2,
  Trophy,
  AlertCircle,
} from 'lucide-react'

type BookingItem = {
  id: number
  startTime: string
  endTime: string
  price: number
  status: string
  paymentStatus: string
  court: { name: string }
}

type DashboardData = {
  club: { id: string; name: string; themeColor: string | null; logoUrl: string | null; slug: string; cancelHours: number }
  authenticated: true
  client: { id: number; name: string; membershipStatus: string; membershipExpiresAt: string | null } | null
  phone: string
  upcoming: BookingItem[]
  past: BookingItem[]
}

type UnauthData = {
  club: { id: string; name: string; themeColor: string | null; logoUrl: string | null; slug: string; cancelHours: number }
  authenticated: false
}

type Props = {
  data: DashboardData | UnauthData
  clubSlug: string
}

function formatDateTime(iso: string) {
  const d = new Date(iso)
  const day = d.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })
  const time = d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  return { day, time }
}

function formatPrice(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}

// ─── OTP Input ────────────────────────────────────────────────────────────────
function OTPInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  function handleKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !value[i] && i > 0) inputs.current[i - 1]?.focus()
  }

  function handleChange(i: number, val: string) {
    const digit = val.replace(/\D/g, '').slice(-1)
    const arr = value.padEnd(6, ' ').split('')
    arr[i] = digit || ' '
    const next = arr.join('').trimEnd()
    onChange(next)
    if (digit && i < 5) inputs.current[i + 1]?.focus()
  }

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputs.current[i] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i]?.trim() || ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          className="w-11 h-14 text-center text-xl font-bold rounded-xl border-2 border-white/10 bg-white/5 focus:border-[var(--club-color)] focus:outline-none transition-colors"
        />
      ))}
    </div>
  )
}

// ─── Auth Flow ─────────────────────────────────────────────────────────────────
function AuthFlow({ club, clubSlug }: { club: UnauthData['club']; clubSlug: string }) {
  const router = useRouter()
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [simulated, setSimulated] = useState(false)
  const [pending, startTransition] = useTransition()

  function submitPhone(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const res = await sendPlayerOTP(phone, clubSlug)
      if ('error' in res) { toast.error(res.error); return }
      setSimulated(!!res.simulated)
      setStep('otp')
    })
  }

  function submitOTP(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const res = await verifyPlayerOTP(phone, clubSlug, otp)
      if ('error' in res) { toast.error(res.error); return }
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
      {/* Logo */}
      <div className="mb-8 text-center">
        {club.logoUrl ? (
          <img src={club.logoUrl} alt={club.name} className="h-16 w-auto mx-auto mb-4 rounded-xl" />
        ) : (
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-2xl font-bold"
            style={{ backgroundColor: club.themeColor ?? '#00e676', color: '#000' }}
          >
            {club.name[0]}
          </div>
        )}
        <h1 className="text-xl font-bold text-white">{club.name}</h1>
        <p className="text-sm text-white/50 mt-1">Portal del jugador</p>
      </div>

      <div className="w-full max-w-sm">
        {step === 'phone' ? (
          <form onSubmit={submitPhone} className="space-y-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">Tu número de WhatsApp</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ej: 351 1234567"
                  required
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[var(--club-color)] transition-colors"
                />
              </div>
              <p className="text-xs text-white/40 mt-2">
                Te enviamos un código por WhatsApp para verificar tu identidad.
              </p>
            </div>
            <button
              type="submit"
              disabled={pending || phone.length < 6}
              className="w-full py-3.5 rounded-2xl font-semibold text-black transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
              style={{ backgroundColor: club.themeColor ?? '#00e676' }}
            >
              {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Recibir código
            </button>
          </form>
        ) : (
          <form onSubmit={submitOTP} className="space-y-6">
            <div className="text-center">
              <Shield className="w-10 h-10 mx-auto mb-3" style={{ color: club.themeColor ?? '#00e676' }} />
              <h2 className="font-semibold text-white text-lg">Ingresá el código</h2>
              {simulated ? (
                <p className="text-xs text-amber-400 mt-1 flex items-center justify-center gap-1">
                  <AlertCircle className="w-3 h-3" /> WhatsApp no configurado — código de prueba: {otp || '??????'}
                </p>
              ) : (
                <p className="text-sm text-white/50 mt-1">
                  Enviamos 6 dígitos a <span className="text-white">{phone}</span>
                </p>
              )}
            </div>
            <OTPInput value={otp} onChange={setOtp} />
            <button
              type="submit"
              disabled={pending || otp.trim().length < 6}
              className="w-full py-3.5 rounded-2xl font-semibold text-black transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
              style={{ backgroundColor: club.themeColor ?? '#00e676' }}
            >
              {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Verificar
            </button>
            <button
              type="button"
              onClick={() => { setStep('phone'); setOtp('') }}
              className="w-full text-sm text-white/40 hover:text-white/60 transition-colors"
            >
              Cambiar número
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

// ─── Booking Card ──────────────────────────────────────────────────────────────
function BookingCard({
  booking,
  cancelHours,
  clubSlug,
  onCanceled,
}: {
  booking: BookingItem
  cancelHours: number
  clubSlug: string
  onCanceled: (id: number) => void
}) {
  const [confirming, setConfirming] = useState(false)
  const [pending, startTransition] = useTransition()
  const { day, time } = formatDateTime(booking.startTime)
  const { time: endTime } = formatDateTime(booking.endTime)

  const isFuture = new Date(booking.startTime) > new Date()
  const hoursUntil = (new Date(booking.startTime).getTime() - Date.now()) / 3_600_000
  const canCancel = isFuture && hoursUntil >= cancelHours

  function handleCancel() {
    startTransition(async () => {
      const res = await cancelPlayerBooking(booking.id, clubSlug)
      if ('error' in res) { toast.error(res.error); setConfirming(false); return }
      toast.success('Reserva cancelada')
      onCanceled(booking.id)
    })
  }

  const statusBadge: Record<string, string> = {
    CONFIRMED: 'text-emerald-400',
    PENDING: 'text-amber-400',
    CANCELED: 'text-red-400',
  }

  return (
    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-white truncate">{booking.court.name}</span>
            <span className={`text-xs font-medium ${statusBadge[booking.status] ?? 'text-white/50'}`}>
              {booking.status === 'CONFIRMED' ? 'Confirmada' : booking.status === 'PENDING' ? 'Pendiente' : 'Cancelada'}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-sm text-white/60">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {day}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {time}–{endTime}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="font-bold text-white">{formatPrice(booking.price)}</span>
          <p className={`text-xs mt-0.5 ${booking.paymentStatus === 'PAID' ? 'text-emerald-400' : 'text-white/40'}`}>
            {booking.paymentStatus === 'PAID' ? 'Pagada' : 'Pendiente de pago'}
          </p>
        </div>
      </div>

      {isFuture && (
        <div className="mt-3 pt-3 border-t border-white/5">
          {confirming ? (
            <div className="flex gap-2">
              <button
                onClick={() => setConfirming(false)}
                className="flex-1 py-2 rounded-xl text-sm text-white/60 bg-white/5 hover:bg-white/10 transition-colors"
              >
                No, volver
              </button>
              <button
                onClick={handleCancel}
                disabled={pending}
                className="flex-1 py-2 rounded-xl text-sm font-medium text-red-400 bg-red-400/10 hover:bg-red-400/20 transition-colors flex items-center justify-center gap-1.5"
              >
                {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                Confirmar
              </button>
            </div>
          ) : canCancel ? (
            <button
              onClick={() => setConfirming(true)}
              className="w-full py-2 rounded-xl text-sm text-red-400/80 hover:text-red-400 hover:bg-red-400/10 transition-colors"
            >
              Cancelar reserva
            </button>
          ) : (
            <p className="text-xs text-white/30 text-center">
              No se puede cancelar (menos de {cancelHours}h)
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({ data, clubSlug }: { data: DashboardData; clubSlug: string }) {
  const router = useRouter()
  const [showPast, setShowPast] = useState(false)
  const [upcomingList, setUpcomingList] = useState(data.upcoming)
  const [pending, startTransition] = useTransition()

  function handleCanceled(id: number) {
    setUpcomingList((prev) => prev.filter((b) => b.id !== id))
  }

  function handleLogout() {
    startTransition(async () => {
      await logoutPlayer(clubSlug)
      router.refresh()
    })
  }

  const displayName = data.client?.name || data.phone

  return (
    <div className="max-w-md mx-auto px-4 pb-24 pt-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {data.club.logoUrl ? (
            <img src={data.club.logoUrl} alt={data.club.name} className="h-9 w-auto rounded-lg" />
          ) : (
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-black"
              style={{ backgroundColor: data.club.themeColor ?? '#00e676' }}
            >
              {data.club.name[0]}
            </div>
          )}
          <div>
            <p className="text-xs text-white/40">{data.club.name}</p>
            <p className="font-semibold text-white leading-tight truncate max-w-[160px]">{displayName}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={pending}
          className="p-2 rounded-xl text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Membership Badge */}
      {data.client?.membershipStatus === 'ACTIVE' && (
        <div
          className="flex items-center gap-3 p-4 rounded-2xl"
          style={{ backgroundColor: `${data.club.themeColor ?? '#00e676'}18`, border: `1px solid ${data.club.themeColor ?? '#00e676'}40` }}
        >
          <Trophy className="w-5 h-5 shrink-0" style={{ color: data.club.themeColor ?? '#00e676' }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: data.club.themeColor ?? '#00e676' }}>
              Membresía activa
            </p>
            {data.client.membershipExpiresAt && (
              <p className="text-xs text-white/50">
                Vence el{' '}
                {new Date(data.client.membershipExpiresAt).toLocaleDateString('es-AR', {
                  day: 'numeric',
                  month: 'long',
                })}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Upcoming Bookings */}
      <section>
        <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-3">
          Próximas reservas
        </h2>
        {upcomingList.length === 0 ? (
          <div className="text-center py-10 rounded-2xl bg-white/3 border border-white/5">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-white/20" />
            <p className="text-sm text-white/30">Sin reservas próximas</p>
            <a
              href={`/p/${data.club.slug}`}
              className="inline-block mt-3 text-sm font-medium px-4 py-2 rounded-xl"
              style={{ backgroundColor: data.club.themeColor ?? '#00e676', color: '#000' }}
            >
              Reservar cancha
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingList.map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                cancelHours={data.club.cancelHours}
                clubSlug={clubSlug}
                onCanceled={handleCanceled}
              />
            ))}
          </div>
        )}
      </section>

      {/* Reserve CTA */}
      {upcomingList.length > 0 && (
        <a
          href={`/p/${data.club.slug}`}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-semibold text-sm text-black"
          style={{ backgroundColor: data.club.themeColor ?? '#00e676' }}
        >
          <CheckCircle className="w-4 h-4" />
          Reservar otra cancha
        </a>
      )}

      {/* Past Bookings */}
      {data.past.length > 0 && (
        <section>
          <button
            onClick={() => setShowPast((s) => !s)}
            className="w-full flex items-center justify-between text-sm font-semibold text-white/40 uppercase tracking-wider mb-3"
          >
            Historial ({data.past.length})
            {showPast ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showPast && (
            <div className="space-y-3">
              {data.past.map((b) => (
                <div key={b.id} className="bg-white/3 rounded-2xl p-4 border border-white/5 opacity-60">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">{b.court.name}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-white/50">
                        <span>{formatDateTime(b.startTime).day}</span>
                        <span>{formatDateTime(b.startTime).time}–{formatDateTime(b.endTime).time}</span>
                      </div>
                    </div>
                    <span className="font-semibold text-white/60 shrink-0">{formatPrice(b.price)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}

// ─── Root ──────────────────────────────────────────────────────────────────────
export default function PlayerPortalClient({ data, clubSlug }: Props) {
  if (!data.authenticated) {
    return <AuthFlow club={data.club} clubSlug={clubSlug} />
  }
  return <Dashboard data={data} clubSlug={clubSlug} />
}
