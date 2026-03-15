'use client'

import { useState, useEffect, useCallback } from 'react'
import { getTodayBookingsForCheckin, checkInByBookingId } from '@/actions/checkin'
import { CheckCircle2, Clock, Search, QrCode, UserCheck, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import BookingQRCode from '@/components/BookingQRCode'

type BookingCheckin = {
  id: number
  courtName: string
  clientName: string
  clientPhone: string
  startTime: Date
  endTime: Date
  checkedInAt: Date | null
  checkinToken: string | null
  status: string
}

export default function CheckInPage() {
  const [bookings, setBookings] = useState<BookingCheckin[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedQR, setSelectedQR] = useState<string | null>(null)

  const loadBookings = useCallback(async () => {
    setLoading(true)
    const data = await getTodayBookingsForCheckin()
    setBookings(data as BookingCheckin[])
    setLoading(false)
  }, [])

  useEffect(() => { loadBookings() }, [loadBookings])

  const handleCheckIn = async (bookingId: number) => {
    const res = await checkInByBookingId(bookingId)
    if (res.success) {
      toast.success('Check-in registrado')
      loadBookings()
    } else {
      toast.error(res.error)
    }
  }

  const formatTime = (date: Date) =>
    new Date(date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })

  const filtered = bookings.filter(
    (b) =>
      b.clientName.toLowerCase().includes(search.toLowerCase()) ||
      b.courtName.toLowerCase().includes(search.toLowerCase()) ||
      b.clientPhone.includes(search)
  )

  const checkedIn = filtered.filter((b) => b.checkedInAt)
  const pending = filtered.filter((b) => !b.checkedInAt)

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Check-in</h1>
          <p className="text-sm text-muted-foreground">Registrar asistencia de hoy</p>
        </div>
        <button
          onClick={loadBookings}
          className="p-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
        >
          <RefreshCw size={18} className="text-muted-foreground" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card/60 border border-border rounded-2xl p-4">
          <p className="text-xs text-muted-foreground font-bold uppercase">Pendientes</p>
          <p className="text-2xl font-black text-foreground">{pending.length}</p>
        </div>
        <div className="bg-card/60 border border-border rounded-2xl p-4">
          <p className="text-xs text-muted-foreground font-bold uppercase">Check-in</p>
          <p className="text-2xl font-black text-emerald-500">{checkedIn.length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por nombre, cancha o teléfono..."
          className="input-theme w-full pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Clock size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold">No hay reservas para hoy</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Pending first */}
          {pending.map((b) => (
            <div
              key={b.id}
              className="flex items-center justify-between p-4 bg-card/40 border border-border/50 rounded-2xl hover:border-border transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center shrink-0">
                  <Clock size={18} className="text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-foreground text-sm truncate">{b.clientName}</p>
                  <p className="text-xs text-muted-foreground">
                    {b.courtName} &middot; {formatTime(b.startTime)} - {formatTime(b.endTime)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {b.checkinToken && (
                  <button
                    onClick={() => setSelectedQR(selectedQR === b.checkinToken ? null : b.checkinToken)}
                    className="p-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                    title="Ver QR"
                  >
                    <QrCode size={16} className="text-muted-foreground" />
                  </button>
                )}
                <button
                  onClick={() => handleCheckIn(b.id)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 text-xs font-bold transition-colors"
                >
                  <UserCheck size={14} />
                  Check-in
                </button>
              </div>
            </div>
          ))}

          {/* Checked in */}
          {checkedIn.map((b) => (
            <div
              key={b.id}
              className="flex items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center shrink-0">
                  <CheckCircle2 size={18} className="text-emerald-500" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-foreground text-sm truncate">{b.clientName}</p>
                  <p className="text-xs text-muted-foreground">
                    {b.courtName} &middot; {formatTime(b.startTime)} - {formatTime(b.endTime)}
                  </p>
                </div>
              </div>
              <p className="text-xs text-emerald-500 font-semibold shrink-0">
                {formatTime(b.checkedInAt!)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* QR Modal */}
      {selectedQR && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setSelectedQR(null)}>
          <div className="bg-card border border-border rounded-3xl p-8" onClick={(e) => e.stopPropagation()}>
            <BookingQRCode checkinToken={selectedQR} size={220} />
          </div>
        </div>
      )}
    </div>
  )
}
