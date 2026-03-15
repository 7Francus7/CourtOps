'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { checkInByToken } from '@/actions/checkin'
import { CheckCircle2, Clock, MapPin, User, AlertCircle } from 'lucide-react'

export default function PublicCheckInPage() {
  const params = useParams()
  const token = params.token as string

  const [state, setState] = useState<'loading' | 'ready' | 'success' | 'already' | 'error'>('loading')
  const [booking, setBooking] = useState<{
    id: number
    courtName: string
    clientName: string
    clubName: string
    startTime: string
    endTime: string
  } | null>(null)
  const [checkedInAt, setCheckedInAt] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    // Load booking info without checking in
    checkInByToken(token).then((res) => {
      if (!res.success) {
        setState('error')
        setError(res.error || 'Error')
        return
      }
      if (res.alreadyCheckedIn) {
        setState('already')
        setBooking(res.booking as unknown as typeof booking)
        setCheckedInAt(res.checkedInAt ? new Date(res.checkedInAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : null)
      } else {
        // It already checked in via the load — show success
        setState('success')
        setBooking(res.booking as unknown as typeof booking)
        setCheckedInAt(res.checkedInAt ? new Date(res.checkedInAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : null)
      }
    })
  }, [token])

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
  }

  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <div className="max-w-sm w-full text-center space-y-4">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle size={40} className="text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-white">Check-in no disponible</h1>
          <p className="text-zinc-400 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="max-w-sm w-full space-y-6">
        {/* Club name */}
        <p className="text-center text-zinc-500 text-xs font-bold uppercase tracking-widest">
          {booking?.clubName}
        </p>

        {/* Status icon */}
        <div className="flex justify-center">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
            state === 'already' ? 'bg-emerald-500/10' : 'bg-emerald-500/10'
          }`}>
            <CheckCircle2 size={52} className="text-emerald-500" />
          </div>
        </div>

        {/* Status text */}
        <div className="text-center">
          <h1 className="text-2xl font-black text-white">
            {state === 'already' ? 'Ya registrado' : 'Check-in exitoso'}
          </h1>
          {checkedInAt && (
            <p className="text-emerald-400 font-semibold mt-1">
              Registrado a las {checkedInAt}
            </p>
          )}
        </div>

        {/* Booking details */}
        {booking && (
          <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-5 space-y-3">
            <div className="flex items-center gap-3">
              <User size={16} className="text-zinc-500" />
              <span className="text-white font-semibold">{booking.clientName}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin size={16} className="text-zinc-500" />
              <span className="text-zinc-300">{booking.courtName}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock size={16} className="text-zinc-500" />
              <div>
                <span className="text-zinc-300">
                  {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                </span>
                <p className="text-zinc-500 text-xs capitalize">{formatDate(booking.startTime)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
