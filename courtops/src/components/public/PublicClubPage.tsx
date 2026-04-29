import { Suspense } from 'react'
import { format } from 'date-fns'
import { notFound } from 'next/navigation'
import { getPublicClubBySlug } from '@/actions/public-booking'
import { getOpenMatches } from '@/actions/open-matches'
import { nowInArg } from '@/lib/date-utils'
import CookieConsent from '@/components/CookieConsent'
import PublicBookingWizard from './PublicBookingWizard'

function hexToRgb(hex: string) {
       const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
       return result
              ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
              : null
}

function hexToHsl(hex: string) {
       const r = parseInt(hex.slice(1, 3), 16) / 255
       const g = parseInt(hex.slice(3, 5), 16) / 255
       const b = parseInt(hex.slice(5, 7), 16) / 255

       const max = Math.max(r, g, b)
       const min = Math.min(r, g, b)
       const l = (max + min) / 2
       let h = 0
       let s = 0

       if (max !== min) {
              const d = max - min
              s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
              switch (max) {
                     case r:
                            h = (g - b) / d + (g < b ? 6 : 0)
                            break
                     case g:
                            h = (b - r) / d + 2
                            break
                     case b:
                            h = (r - g) / d + 4
                            break
              }
              h /= 6
       }

       return `${(h * 360).toFixed(1)} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}%`
}

function getContrastColorHsl(hex: string) {
       const r = parseInt(hex.slice(1, 3), 16)
       const g = parseInt(hex.slice(3, 5), 16)
       const b = parseInt(hex.slice(5, 7), 16)
       const yiq = (r * 299 + g * 587 + b * 114) / 1000
       return yiq >= 128 ? '222.2 84% 4.9%' : '210 40% 98%'
}

function getThemeStyle(themeColor?: string | null) {
       if (!themeColor) return ''

       const hsl = hexToHsl(themeColor)
       const rgb = hexToRgb(themeColor)
       const contrast = getContrastColorHsl(themeColor)

       return `
              :root {
                     --primary: ${hsl};
                     --primary-foreground: ${contrast};
                     ${rgb ? `--primary-rgb: ${rgb};` : ''}
              }
       `
}

function getPublicOrigin() {
       return process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://courtops.app'
}

function getClubJsonLd(club: Record<string, unknown>, slug: string) {
       const publicUrl = `${getPublicOrigin().replace(/\/$/, '')}/p/${slug}`
       const amenities = typeof club.amenities === 'string'
              ? club.amenities.split(',').map(item => item.trim()).filter(Boolean)
              : []
       const sameAs = [
              club.socialInstagram,
              club.socialFacebook,
              club.socialTwitter,
              club.socialTiktok
       ].filter(Boolean)

       return {
              '@context': 'https://schema.org',
              '@type': ['SportsActivityLocation', 'LocalBusiness'],
              name: club.name,
              url: publicUrl,
              image: club.coverUrl || club.logoUrl || undefined,
              logo: club.logoUrl || undefined,
              telephone: club.phone || undefined,
              address: club.address || undefined,
              sameAs,
              amenityFeature: amenities.map(name => ({
                     '@type': 'LocationFeatureSpecification',
                     name,
                     value: true
              })),
              potentialAction: {
                     '@type': 'ReserveAction',
                     target: {
                            '@type': 'EntryPoint',
                            urlTemplate: publicUrl,
                            actionPlatform: [
                                   'https://schema.org/DesktopWebPlatform',
                                   'https://schema.org/MobileWebPlatform'
                            ]
                     },
                     result: {
                            '@type': 'Reservation',
                            name: `Reserva en ${club.name}`
                     }
              }
       }
}

export default async function PublicClubPage({ slug }: { slug: string }) {
       const club = await getPublicClubBySlug(slug)

       if (!club) {
              notFound()
       }

       const openMatches = await getOpenMatches(slug)
       const themeStyle = getThemeStyle(club.themeColor)
       const today = format(nowInArg(), 'yyyy-MM-dd')
       const clubJsonLd = getClubJsonLd(club, slug)

       return (
              <>
                     {themeStyle && <style dangerouslySetInnerHTML={{ __html: themeStyle }} />}
                     <script
                            type="application/ld+json"
                            dangerouslySetInnerHTML={{ __html: JSON.stringify(clubJsonLd) }}
                     />
                     <Suspense
                            fallback={
                                   <div className="min-h-screen bg-background flex items-center justify-center text-foreground font-bold">
                                          Cargando...
                                   </div>
                            }
                     >
                            <PublicBookingWizard club={club} initialDateStr={today} openMatches={openMatches} />
                     </Suspense>
                     <CookieConsent />
              </>
       )
}
