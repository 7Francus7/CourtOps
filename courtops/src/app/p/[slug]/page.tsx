export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { getPublicClubBySlug } from '@/actions/public-booking'
import PublicClubPage from '@/components/public/PublicClubPage'

type Props = {
       params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
       const { slug } = await params
       const club = await getPublicClubBySlug(slug)

       return {
              title: `Reservar en ${club?.name || 'CourtOps'}`,
              description: club?.description || `Sistema de reservas online de ${club?.name || 'tu club'}.`,
              alternates: {
                     canonical: `/p/${slug}`,
              },
              openGraph: {
                     title: `Reservar en ${club?.name || 'CourtOps'}`,
                     description: club?.description || `Sistema de reservas online de ${club?.name || 'tu club'}.`,
                     images: club?.coverUrl ? [{ url: club.coverUrl }] : undefined,
              },
       }
}

export default async function PublicSlugPage({ params }: Props) {
       const { slug } = await params
       return <PublicClubPage slug={slug} />
}
