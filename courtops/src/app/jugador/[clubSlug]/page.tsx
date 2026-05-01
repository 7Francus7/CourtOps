export const dynamic = 'force-dynamic'

import { getPlayerDashboard } from '@/actions/player-portal'
import PlayerPortalClient from '@/components/player/PlayerPortalClient'
import { notFound } from 'next/navigation'

type Props = { params: Promise<{ clubSlug: string }> }

export async function generateMetadata({ params }: Props) {
  const { clubSlug } = await params
  return {
    title: 'Mi cuenta',
    description: 'Portal del jugador',
    themeColor: '#111111',
    robots: 'noindex',
  }
}

export default async function PlayerPortalPage({ params }: Props) {
  const { clubSlug } = await params
  const data = await getPlayerDashboard(clubSlug)
  if (!data) notFound()

  return (
    <main
      className="min-h-screen bg-[#0d0d0d] text-white"
      style={{ '--club-color': data.club.themeColor ?? '#00e676' } as React.CSSProperties}
    >
      <PlayerPortalClient data={data} clubSlug={clubSlug} />
    </main>
  )
}
