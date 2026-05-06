import { describe, expect, it } from 'vitest'

import {
  buildCampaignTemplateParameters,
  matchesCampaignSegment,
  normalizeCampaignTemplate,
  renderCampaignTemplate,
  summarizeCampaignHistory,
} from '@/lib/whatsapp-campaigns'

describe('whatsapp campaign helpers', () => {
  it('normalizes legacy double-brace variables', () => {
    expect(normalizeCampaignTemplate('Hola {{ nombre }} desde {{club}}')).toBe(
      'Hola {nombre} desde {club}',
    )
  })

  it('renders a personalized preview with supported variables', () => {
    expect(
      renderCampaignTemplate('Hola {nombre}, reserva en {club}: {link_reserva}', {
        nombre: 'Juan',
        club: 'CourtOps Padel',
        link_reserva: 'https://courtops.app/p/club-demo',
      }),
    ).toBe('Hola Juan, reserva en CourtOps Padel: https://courtops.app/p/club-demo')
  })

  it('builds template parameters in a stable order', () => {
    expect(buildCampaignTemplateParameters(['nombre', 'club', 'link_reserva'], {
      nombre: 'Juan',
      club: 'CourtOps Padel',
      link_reserva: 'https://courtops.app/p/club-demo',
    })).toEqual([
      'Juan',
      'CourtOps Padel',
      'https://courtops.app/p/club-demo',
    ])
  })

  it('matches inactive clients after 30 days without bookings', () => {
    const now = new Date('2026-05-05T12:00:00.000Z')

    expect(
      matchesCampaignSegment(
        {
          createdAt: new Date('2026-01-10T12:00:00.000Z'),
          lastBookingAt: new Date('2026-03-01T12:00:00.000Z'),
          bookingsLast60: 0,
          debtCount: 0,
        },
        'INACTIVE_30D',
        now,
      ),
    ).toBe(true)
  })

  it('matches frequent, debt, expiring membership and new client segments', () => {
    const now = new Date('2026-05-05T12:00:00.000Z')

    expect(
      matchesCampaignSegment(
        {
          createdAt: new Date('2025-12-01T12:00:00.000Z'),
          lastBookingAt: new Date('2026-05-02T12:00:00.000Z'),
          bookingsLast60: 4,
          debtCount: 0,
        },
        'FREQUENT',
        now,
      ),
    ).toBe(true)

    expect(
      matchesCampaignSegment(
        {
          createdAt: new Date('2025-12-01T12:00:00.000Z'),
          lastBookingAt: new Date('2026-04-20T12:00:00.000Z'),
          bookingsLast60: 1,
          debtCount: 2,
        },
        'WITH_DEBT',
        now,
      ),
    ).toBe(true)

    expect(
      matchesCampaignSegment(
        {
          createdAt: new Date('2025-12-01T12:00:00.000Z'),
          lastBookingAt: new Date('2026-05-01T12:00:00.000Z'),
          bookingsLast60: 1,
          debtCount: 0,
          membershipStatus: 'ACTIVE',
          membershipExpiresAt: new Date('2026-05-10T12:00:00.000Z'),
        },
        'MEMBERSHIP_EXPIRING',
        now,
      ),
    ).toBe(true)

    expect(
      matchesCampaignSegment(
        {
          createdAt: new Date('2026-04-20T12:00:00.000Z'),
          lastBookingAt: null,
          bookingsLast60: 0,
          debtCount: 0,
        },
        'NEW_CLIENTS',
        now,
      ),
    ).toBe(true)
  })

  it('summarizes campaign performance history', () => {
    expect(summarizeCampaignHistory([
      { sentCount: 8, failedCount: 2, simulatedCount: 0, reachableCount: 10 },
      { sentCount: 5, failedCount: 1, simulatedCount: 2, reachableCount: 6 },
    ])).toEqual({
      campaigns: 2,
      sent: 13,
      failed: 3,
      simulated: 2,
      reachable: 16,
      deliveryRate: 81.3,
    })
  })
})
