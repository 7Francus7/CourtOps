import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BookingService } from '@/services/booking.service'
import prisma from '@/lib/db'

vi.mock('@/lib/db', () => ({
       default: {
              booking: {
                     findFirst: vi.fn(),
                     update: vi.fn(),
              },
              transaction: {
                     create: vi.fn(),
              },
              product: {
                     update: vi.fn(),
              },
              cashRegister: {
                     findFirst: vi.fn(),
                     create: vi.fn(),
              }
       },
}))

vi.mock('@/lib/tenant', () => ({
       getOrCreateTodayCashRegister: vi.fn().mockResolvedValue({ id: 1 })
}))

describe('BookingService.cancel', () => {
       const clubId = 'club-1'
       const bookingId = 123
       const userStaff = { id: 'user-1', role: 'STAFF' }
       const userAdmin = { id: 'admin-1', role: 'ADMIN' }

       beforeEach(() => {
              vi.clearAllMocks()
       })

       it('should block cancellation if less than 6h remain and user is STAFF', async () => {
              const startTime = new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours from now
                     ; (prisma.booking.findFirst as any).mockResolvedValue({
                            id: bookingId,
                            clubId,
                            startTime,
                            status: 'CONFIRMED',
                            club: { cancelHours: 6 },
                            transactions: [],
                            items: []
                     })

              await expect(BookingService.cancel(bookingId, clubId, userStaff))
                     .rejects.toThrow(/No se puede cancelar con menos de 6h/)
       })

       it('should allow cancellation if less than 6h remain and user is ADMIN', async () => {
              const startTime = new Date(Date.now() + 2 * 60 * 60 * 1000)
                     ; (prisma.booking.findFirst as any).mockResolvedValue({
                            id: bookingId,
                            clubId,
                            startTime,
                            status: 'CONFIRMED',
                            club: { cancelHours: 6 },
                            transactions: [],
                            items: []
                     })
                     ; (prisma.booking.update as any).mockResolvedValue({ success: true })

              const result = await BookingService.cancel(bookingId, clubId, userAdmin)
              expect(result.success).toBe(true)
       })

       it('should allow cancellation if more than 6h remain for anyone', async () => {
              const startTime = new Date(Date.now() + 10 * 60 * 60 * 1000) // 10h
                     ; (prisma.booking.findFirst as any).mockResolvedValue({
                            id: bookingId,
                            clubId,
                            startTime,
                            status: 'CONFIRMED',
                            club: { cancelHours: 6 },
                            transactions: [],
                            items: []
                     })

              const result = await BookingService.cancel(bookingId, clubId, userStaff)
              expect(result.success).toBe(true)
       })
})
