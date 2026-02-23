import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getEffectivePrice } from '@/lib/tenant'
import prisma from '@/lib/db'

vi.mock('@/lib/db', () => ({
       default: {
              priceRule: {
                     findMany: vi.fn(),
              },
       },
}))

describe('getEffectivePrice', () => {
       const clubId = 'test-club-id'
       const date = new Date('2025-01-01T15:00:00Z') // A Wednesday

       beforeEach(() => {
              vi.clearAllMocks()
       })

       it('should return 0 if no rules match', async () => {
              ; (prisma.priceRule.findMany as any).mockResolvedValue([])
              const price = await getEffectivePrice(clubId, date)
              expect(price).toBe(0)
       })

       it('should return the correct price for a matching global rule', async () => {
              ; (prisma.priceRule.findMany as any).mockResolvedValue([
                     {
                            id: 1,
                            clubId,
                            courtId: null,
                            startTime: '00:00',
                            endTime: '23:59',
                            price: 1500,
                            priority: 1,
                            daysOfWeek: '0,1,2,3,4,5,6',
                     },
              ])

              const price = await getEffectivePrice(clubId, date)
              expect(price).toBe(1500)
       })

       it('should prioritize court-specific rules over global rules', async () => {
              ; (prisma.priceRule.findMany as any).mockResolvedValue([
                     {
                            id: 1,
                            clubId,
                            courtId: null,
                            startTime: '00:00',
                            endTime: '23:59',
                            price: 1000,
                            priority: 1,
                            daysOfWeek: '0,1,2,3,4,5,6',
                     },
                     {
                            id: 2,
                            clubId,
                            courtId: 55,
                            startTime: '00:00',
                            endTime: '23:59',
                            price: 2000,
                            priority: 1,
                            daysOfWeek: '0,1,2,3,4,5,6',
                     },
              ])

              const price = await getEffectivePrice(clubId, date, 90, false, 0, 55)
              expect(price).toBe(2000)
       })

       it('should apply member discount correctly', async () => {
              ; (prisma.priceRule.findMany as any).mockResolvedValue([
                     {
                            id: 1,
                            clubId,
                            courtId: null,
                            startTime: '00:00',
                            endTime: '23:59',
                            price: 1000,
                            priority: 1,
                            daysOfWeek: '0,1,2,3,4,5,6',
                     },
              ])

              const price = await getEffectivePrice(clubId, date, 90, true, 20)
              expect(price).toBe(800)
       })
})
