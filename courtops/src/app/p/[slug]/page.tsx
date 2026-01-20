import { getPublicClubBySlug } from '@/actions/public-booking'
import PublicBookingWizard from '@/components/public/PublicBookingWizard'
import { notFound } from 'next/navigation'

import { Suspense } from 'react'

export default async function PublicSlugPage({ params }: { params: Promise<{ slug: string }> }) {
       const resolvedParams = await params
       const club = await getPublicClubBySlug(resolvedParams.slug)

       if (!club) {
              notFound()
       }

       const now = new Date().toISOString()

       return (
              <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Cargando...</div>}>
                     <PublicBookingWizard club={club} initialDateStr={now} />
              </Suspense>
       )
}
