'use client'
/* eslint-disable @next/next/no-img-element */

import { useMemo, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { QRCodeCanvas } from 'qrcode.react'
import { toast } from 'sonner'
import {
  AlertCircle,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  Download,
  Loader2,
  LogOut,
  QrCode,
  Shield,
  Trophy,
} from 'lucide-react'

import { cancelPlayerBooking, logoutPlayer, sendPlayerOTP, verifyPlayerOTP } from '@/actions/player-portal'
import { InstallPrompt } from '@/components/pwa/InstallPrompt'
import { PhoneInput } from '@/components/ui/PhoneInput'
import {
  buildPlayerBookingPath,
  buildRepeatReservationDate,
  getPlayerBookingStateMeta,
} from '@/lib/player-portal'

type BookingItem = {
  id: number
  startTime: string
  endTime: string
  price: number
  status: string
  paymentStatus: string
  canceledAt: string | null
  court: { name: string }
}

type ClubData = {
  id: string
  name: string
  themeColor: string | null
  logoUrl: string | null
  slug: string
  cancelHours: number
}

type DashboardData = {
  club: ClubData
  authenticated: true
  client: { id: number; name: string; membershipStatus: string; membershipExpiresAt: string | null } | null
  phone: string
  upcoming: BookingItem[]
  past: BookingItem[]
}

type UnauthData = {
  club: ClubData
  authenticated: false
}

type Props = {
  data: DashboardData | UnauthData
  clubSlug: string
}

function formatDateTime(iso: string) {
  const date = new Date(iso)
  return {
    day: date.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' }),
    fullDay: date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }),
    time: date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
  }
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount)
}

function buildPublicUrl(path: string) {
  if (typeof window === 'undefined') return path
  return new URL(path, window.location.origin).toString()
}

function OTPInput({ value, onChange }: { value: string; onChange: (_value: string) => void }) {
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  function handleKey(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  function handleChange(index: number, inputValue: string) {
    const digit = inputValue.replace(/\D/g, '').slice(-1)
    const nextValue = value.padEnd(6, ' ').split('')
    nextValue[index] = digit || ' '
    onChange(nextValue.join('').trimEnd())

    if (digit && index < 5) {
      inputs.current[index + 1]?.focus()
    }
  }

  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <input
          key={index}
          ref={(element) => {
            inputs.current[index] = element
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index]?.trim() || ''}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKey(index, event)}
          className="h-14 w-11 rounded-xl border-2 border-white/10 bg-white/5 text-center text-xl font-bold text-white transition-colors focus:border-[var(--club-color)] focus:outline-none"
        />
      ))}
    </div>
  )
}

function AuthFlow({ club, clubSlug }: { club: ClubData; clubSlug: string }) {
  const router = useRouter()
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [simulated, setSimulated] = useState(false)
  const [debugCode, setDebugCode] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const bookingHref = buildPlayerBookingPath(clubSlug)

  function submitPhone(event: React.FormEvent) {
    event.preventDefault()
    startTransition(async () => {
      const response = await sendPlayerOTP(phone, clubSlug)
      if ('error' in response) {
        toast.error(response.error)
        return
      }

      setSimulated(!!response.simulated)
      setDebugCode(response.debugCode || null)
      setStep('otp')
    })
  }

  function submitOTP(event: React.FormEvent) {
    event.preventDefault()
    startTransition(async () => {
      const response = await verifyPlayerOTP(phone, clubSlug, otp)
      if ('error' in response) {
        toast.error(response.error)
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="mb-8 text-center">
        {club.logoUrl ? (
          <img src={club.logoUrl} alt={club.name} className="mx-auto mb-4 h-16 w-auto rounded-xl" />
        ) : (
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold"
            style={{ backgroundColor: club.themeColor ?? '#00e676', color: '#000' }}
          >
            {club.name[0]}
          </div>
        )}
        <h1 className="text-xl font-bold text-white">{club.name}</h1>
        <p className="mt-1 text-sm text-white/50">Portal del jugador y reservas desde el celular</p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        {step === 'phone' ? (
          <form onSubmit={submitPhone} className="space-y-4 rounded-[1.75rem] border border-white/8 bg-white/5 p-5">
            <div>
              <label className="mb-2 block text-sm text-white/60">Tu numero de WhatsApp</label>
              <PhoneInput
                value={phone}
                onChange={setPhone}
                placeholder="351 123 4567"
                required
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 text-white transition-colors"
              />
              <p className="mt-2 text-xs text-white/40">
                Te enviamos un codigo de acceso para ver tus reservas y volver a reservar rapido.
              </p>
            </div>
            <button
              type="submit"
              disabled={pending || phone.length < 6}
              className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-semibold text-black transition-opacity disabled:opacity-40"
              style={{ backgroundColor: club.themeColor ?? '#00e676' }}
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Recibir codigo
            </button>
          </form>
        ) : (
          <form onSubmit={submitOTP} className="space-y-6 rounded-[1.75rem] border border-white/8 bg-white/5 p-5">
            <div className="text-center">
              <Shield className="mx-auto mb-3 h-10 w-10" style={{ color: club.themeColor ?? '#00e676' }} />
              <h2 className="text-lg font-semibold text-white">Ingresa el codigo</h2>
              {simulated ? (
                <p className="mt-1 flex items-center justify-center gap-1 text-xs text-amber-400">
                  <AlertCircle className="h-3 w-3" />
                  Modo simulacion{debugCode ? ` - codigo: ${debugCode}` : ''}
                </p>
              ) : (
                <p className="mt-1 text-sm text-white/50">
                  Enviamos 6 digitos a <span className="text-white">{phone}</span>
                </p>
              )}
            </div>
            <OTPInput value={otp} onChange={setOtp} />
            <button
              type="submit"
              disabled={pending || otp.trim().length < 6}
              className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-semibold text-black transition-opacity disabled:opacity-40"
              style={{ backgroundColor: club.themeColor ?? '#00e676' }}
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Verificar
            </button>
            <button
              type="button"
              onClick={() => {
                setStep('phone')
                setOtp('')
              }}
              className="w-full text-sm text-white/40 transition-colors hover:text-white/60"
            >
              Cambiar numero
            </button>
          </form>
        )}

        <a
          href={bookingHref}
          className="block rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-center text-sm font-semibold text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          Ver disponibilidad publica del club
        </a>
      </div>
    </div>
  )
}

function BookingCard({
  booking,
  cancelHours,
  clubSlug,
  onCanceled,
}: {
  booking: BookingItem
  cancelHours: number
  clubSlug: string
  onCanceled: (_id: number) => void
}) {
  const [confirming, setConfirming] = useState(false)
  const [pending, startTransition] = useTransition()
  const [renderedAt] = useState(() => Date.now())
  const { day, time } = formatDateTime(booking.startTime)
  const { time: endTime } = formatDateTime(booking.endTime)
  const stateMeta = getPlayerBookingStateMeta(booking.status, booking.paymentStatus)
  const isFuture = new Date(booking.startTime).getTime() > renderedAt
  const hoursUntil = (new Date(booking.startTime).getTime() - renderedAt) / 3_600_000
  const canCancel = isFuture && hoursUntil >= cancelHours
  const repeatHref = buildPlayerBookingPath(
    clubSlug,
    buildRepeatReservationDate(booking.startTime),
  )

  function handleCancel() {
    startTransition(async () => {
      const response = await cancelPlayerBooking(booking.id, clubSlug)
      if ('error' in response) {
        toast.error(response.error)
        setConfirming(false)
        return
      }
      toast.success('Reserva cancelada')
      onCanceled(booking.id)
    })
  }

  return (
    <div className="rounded-[1.5rem] border border-white/8 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate font-semibold text-white">{booking.court.name}</span>
            <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${stateMeta.reservationTone}`}>
              {stateMeta.reservationLabel}
            </span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-white/60">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {day}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {time}-{endTime}
            </span>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-bold text-white">{formatPrice(booking.price)}</p>
          <p className={`mt-0.5 text-xs ${stateMeta.paymentTone}`}>{stateMeta.paymentLabel}</p>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <a
          href={repeatHref}
          className="flex-1 rounded-xl bg-white/6 px-3 py-2 text-center text-xs font-semibold text-white/75 transition-colors hover:bg-white/10 hover:text-white"
        >
          Volver a reservar
        </a>
        {isFuture ? (
          confirming ? (
            <>
              <button
                onClick={() => setConfirming(false)}
                className="flex-1 rounded-xl bg-white/6 px-3 py-2 text-xs text-white/70 transition-colors hover:bg-white/10"
              >
                Volver
              </button>
              <button
                onClick={handleCancel}
                disabled={pending}
                className="flex-1 rounded-xl bg-rose-500/12 px-3 py-2 text-xs font-semibold text-rose-300 transition-colors hover:bg-rose-500/20 disabled:opacity-50"
              >
                {pending ? 'Cancelando...' : 'Confirmar cancelacion'}
              </button>
            </>
          ) : canCancel ? (
            <button
              onClick={() => setConfirming(true)}
              className="flex-1 rounded-xl bg-rose-500/12 px-3 py-2 text-xs font-semibold text-rose-300 transition-colors hover:bg-rose-500/20"
            >
              Cancelar reserva
            </button>
          ) : (
            <div className="flex-1 rounded-xl bg-white/4 px-3 py-2 text-center text-xs text-white/35">
              No se puede cancelar con menos de {cancelHours}h
            </div>
          )
        ) : null}
      </div>
    </div>
  )
}

function Dashboard({ data, clubSlug }: { data: DashboardData; clubSlug: string }) {
  const router = useRouter()
  const [showPast, setShowPast] = useState(false)
  const [upcomingList, setUpcomingList] = useState(data.upcoming)
  const [pending, startTransition] = useTransition()
  const nextBooking = upcomingList[0] || null
  const repeatSource = nextBooking || data.past.find((booking) => !['CANCELED', 'CANCELLED'].includes(booking.status)) || null
  const reservePath = buildPlayerBookingPath(clubSlug)
  const repeatPath = buildPlayerBookingPath(
    clubSlug,
    buildRepeatReservationDate(repeatSource?.startTime || null),
  )
  const publicUrl = useMemo(() => buildPublicUrl(reservePath), [reservePath])
  const displayName = data.client?.name || data.phone
  const nextBookingMeta = nextBooking ? getPlayerBookingStateMeta(nextBooking.status, nextBooking.paymentStatus) : null

  function handleCanceled(id: number) {
    setUpcomingList((current) => current.filter((booking) => booking.id !== id))
  }

  function handleLogout() {
    startTransition(async () => {
      await logoutPlayer(clubSlug)
      router.refresh()
    })
  }

  async function copyBookingLink() {
    try {
      await navigator.clipboard.writeText(publicUrl)
      toast.success('Link de reservas copiado')
    } catch {
      toast.error('No se pudo copiar el link')
    }
  }

  async function shareBookingLink() {
    const shareText = `Reserva tu proximo turno en ${data.club.name}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: data.club.name,
          text: shareText,
          url: publicUrl,
        })
        return
      } catch {
        return
      }
    }

    await copyBookingLink()
  }

  return (
    <div className="mx-auto max-w-md px-4 pb-28 pt-6">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {data.club.logoUrl ? (
              <img src={data.club.logoUrl} alt={data.club.name} className="h-10 w-auto rounded-lg" />
            ) : (
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-black"
                style={{ backgroundColor: data.club.themeColor ?? '#00e676' }}
              >
                {data.club.name[0]}
              </div>
            )}
            <div>
              <p className="text-xs text-white/40">{data.club.name}</p>
              <p className="max-w-[180px] truncate font-semibold text-white">{displayName}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={pending}
            className="rounded-xl p-2 text-white/40 transition-colors hover:bg-white/5 hover:text-white/70"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        <section className="rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-white/9 to-white/[0.03] p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/35">Proximo paso</p>
              {nextBooking ? (
                <>
                  <h2 className="mt-2 text-xl font-black text-white">{nextBooking.court.name}</h2>
                  <p className="mt-1 text-sm text-white/55">
                    {formatDateTime(nextBooking.startTime).fullDay} a las {formatDateTime(nextBooking.startTime).time}
                  </p>
                </>
              ) : (
                <>
                  <h2 className="mt-2 text-xl font-black text-white">Reserva tu proximo turno</h2>
                  <p className="mt-1 text-sm text-white/55">
                    Entra rapido, ve disponibilidad y vuelve a reservar sin depender de mensajes manuales.
                  </p>
                </>
              )}
            </div>
            {nextBookingMeta ? (
              <span className={`rounded-full border px-3 py-1 text-[11px] font-bold ${nextBookingMeta.reservationTone}`}>
                {nextBookingMeta.reservationLabel}
              </span>
            ) : null}
          </div>

          {data.client?.membershipStatus === 'ACTIVE' ? (
            <div
              className="mt-4 rounded-2xl border px-4 py-3"
              style={{
                backgroundColor: `${data.club.themeColor ?? '#00e676'}18`,
                borderColor: `${data.club.themeColor ?? '#00e676'}40`,
              }}
            >
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 shrink-0" style={{ color: data.club.themeColor ?? '#00e676' }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: data.club.themeColor ?? '#00e676' }}>
                    Membresia activa
                  </p>
                  {data.client.membershipExpiresAt ? (
                    <p className="text-xs text-white/50">
                      Vence el {new Date(data.client.membershipExpiresAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-4 grid grid-cols-3 gap-2">
            <a
              href={reservePath}
              className="rounded-2xl px-3 py-3 text-center text-xs font-bold text-black"
              style={{ backgroundColor: data.club.themeColor ?? '#00e676' }}
            >
              Reservar ahora
            </a>
            <a
              href={repeatPath}
              className="rounded-2xl border border-white/10 bg-white/6 px-3 py-3 text-center text-xs font-bold text-white/80 transition-colors hover:bg-white/10"
            >
              Volver a reservar
            </a>
            <button
              onClick={shareBookingLink}
              className="rounded-2xl border border-white/10 bg-white/6 px-3 py-3 text-center text-xs font-bold text-white/80 transition-colors hover:bg-white/10"
            >
              Compartir
            </button>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/35">Acceso rapido</p>
              <p className="mt-1 text-sm text-white/55">Escanea o copia el link del club para reservar desde cualquier celu.</p>
            </div>
            <QrCode className="h-5 w-5 text-white/30" />
          </div>

          <div className="flex items-center gap-4 rounded-[1.5rem] border border-white/8 bg-[#050505] p-4">
            <div className="rounded-2xl bg-white p-2">
              <QRCodeCanvas id="player-portal-booking-qr" value={publicUrl} size={92} level="M" includeMargin />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">Reservas online</p>
              <p className="mt-1 truncate text-xs text-white/40">{publicUrl}</p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={copyBookingLink}
                  className="inline-flex items-center gap-1 rounded-xl bg-white/6 px-3 py-2 text-xs font-semibold text-white/75 transition-colors hover:bg-white/10"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copiar
                </button>
                <a
                  href={publicUrl}
                  className="inline-flex items-center gap-1 rounded-xl bg-white/6 px-3 py-2 text-xs font-semibold text-white/75 transition-colors hover:bg-white/10"
                >
                  <Download className="h-3.5 w-3.5" />
                  Abrir
                </a>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/35">Proximas reservas</h2>
            <span className="text-xs text-white/35">{upcomingList.length}</span>
          </div>

          {upcomingList.length === 0 ? (
            <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] px-4 py-10 text-center">
              <Calendar className="mx-auto mb-3 h-8 w-8 text-white/20" />
              <p className="text-sm text-white/35">No tienes reservas proximas</p>
              <a
                href={reservePath}
                className="mt-4 inline-block rounded-2xl px-4 py-2.5 text-sm font-semibold text-black"
                style={{ backgroundColor: data.club.themeColor ?? '#00e676' }}
              >
                Ver disponibilidad
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingList.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  cancelHours={data.club.cancelHours}
                  clubSlug={clubSlug}
                  onCanceled={handleCanceled}
                />
              ))}
            </div>
          )}
        </section>

        {data.past.length > 0 ? (
          <section>
            <button
              onClick={() => setShowPast((current) => !current)}
              className="mb-3 flex w-full items-center justify-between text-sm font-semibold uppercase tracking-[0.18em] text-white/35"
            >
              Historial y canceladas ({data.past.length})
              {showPast ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {showPast ? (
              <div className="space-y-3">
                {data.past.map((booking) => {
                  const stateMeta = getPlayerBookingStateMeta(booking.status, booking.paymentStatus)
                  return (
                    <div key={booking.id} className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-white">{booking.court.name}</p>
                            <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${stateMeta.reservationTone}`}>
                              {stateMeta.reservationLabel}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-white/45">
                            {formatDateTime(booking.startTime).day} - {formatDateTime(booking.startTime).time}-{formatDateTime(booking.endTime).time}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-white/75">{formatPrice(booking.price)}</p>
                          <p className={`mt-0.5 text-xs ${stateMeta.paymentTone}`}>{stateMeta.paymentLabel}</p>
                        </div>
                      </div>
                      <a
                        href={buildPlayerBookingPath(clubSlug, buildRepeatReservationDate(booking.startTime))}
                        className="mt-3 inline-flex rounded-xl bg-white/6 px-3 py-2 text-xs font-semibold text-white/75 transition-colors hover:bg-white/10"
                      >
                        Repetir este horario
                      </a>
                    </div>
                  )
                })}
              </div>
            ) : null}
          </section>
        ) : null}
      </div>

      <InstallPrompt />
    </div>
  )
}

export default function PlayerPortalClient({ data, clubSlug }: Props) {
  if (!data.authenticated) {
    return (
      <>
        <AuthFlow club={data.club} clubSlug={clubSlug} />
        <InstallPrompt />
      </>
    )
  }

  return <Dashboard data={data} clubSlug={clubSlug} />
}
