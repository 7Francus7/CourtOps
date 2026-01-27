import { getPublicClubBySlug } from '@/actions/public-booking'
import { getOpenMatches } from '@/actions/open-matches'
import PublicBookingWizard from '@/components/public/PublicBookingWizard'
import { notFound } from 'next/navigation'

import { Suspense } from 'react'

// Helper to get consistent theme colors
function hexToRgb(hex: string) {
       const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
       return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
}

export default async function PublicSlugPage({ params }: { params: Promise<{ slug: string }> }) {
       const resolvedParams = await params
       const club = await getPublicClubBySlug(resolvedParams.slug)
       const openMatches = await getOpenMatches(resolvedParams.slug)

       if (!club) {
              notFound()
       }

       const now = new Date().toISOString()

       // Dynamic Theme Injection for Public Pages
       let themeStyle = ''
       if (club.themeColor) {
              const color = club.themeColor
              const rgb = hexToRgb(color)
              themeStyle = `
                     :root {
                            --primary: ${color};
                            --brand-blue: ${color};
                            --brand-green: ${color};
                            ${rgb ? `--primary-rgb: ${rgb};` : ''}
                     }
                     .btn-primary, .bg-primary, .text-primary {
                            /* Ensure these utility classes pick up the variable change or force override if needed (Tailwind v3 var usage handles it usually) */
                     }
              `
       }

       return (
              <>
                     {themeStyle && <style dangerouslySetInnerHTML={{ __html: themeStyle }} />}
                     <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Cargando...</div>}>
                            <PublicBookingWizard club={club} initialDateStr={now} openMatches={openMatches} />
                     </Suspense>
              </>
       )
}
