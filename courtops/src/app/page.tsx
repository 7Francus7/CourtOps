
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

import LandingHero from "@/components/landing/LandingHero"
import LandingFeatures from "@/components/landing/LandingFeatures"
import LandingPricing from "@/components/landing/LandingPricing"
import LandingFooter from "@/components/landing/LandingFooter"
import SocialProof from '@/components/landing/SocialProof'
import LandingHeader from "@/components/landing/LandingHeader"
import LandingFAQ from "@/components/landing/LandingFAQ"
import LandingHowItWorks from "@/components/landing/LandingHowItWorks"
import LandingMockup from "@/components/landing/LandingMockup"
import LandingCTA from "@/components/landing/LandingCTA"
import LandingTestimonials from "@/components/landing/LandingTestimonials"
import CookieConsent from "@/components/CookieConsent"

export const dynamic = 'force-dynamic'

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session?.user) {
    redirect('/dashboard')
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'CourtOps',
        description: 'Sistema de gestion integral para clubes de padel y deportes. Reservas online, cobros, torneos, clientes y mas.',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        url: 'https://courtops.net',
        offers: {
          '@type': 'AggregateOffer',
          priceCurrency: 'ARS',
          lowPrice: '45000',
          highPrice: '150000',
          offerCount: '3'
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          ratingCount: '150'
        }
      },
      {
        '@type': 'Organization',
        name: 'CourtOps',
        url: 'https://courtops.net',
        logo: 'https://courtops.net/icon.png',
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+54-9-3524-42-1497',
          contactType: 'customer service',
          availableLanguage: 'Spanish'
        }
      },
      {
        '@type': 'WebSite',
        name: 'CourtOps',
        url: 'https://courtops.net',
        description: 'Plataforma SaaS para la gestion profesional de clubes de padel y deportes.',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://courtops.net/p/{search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      }
    ]
  }

  return (
    <div className="min-h-screen antialiased" style={{ background: 'var(--co-bg)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <LandingHeader />

      <main>
        <LandingHero />
        <SocialProof />
        <LandingFeatures />
        <LandingMockup />
        <LandingHowItWorks />
        <LandingTestimonials />
        <LandingPricing />
        <LandingFAQ />
        <LandingCTA />
      </main>

      <LandingFooter />
      <CookieConsent />
    </div>
  )
}
