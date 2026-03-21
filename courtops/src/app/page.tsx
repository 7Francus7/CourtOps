
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import nextDynamic from 'next/dynamic'

// Import Landing Components
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
import LandingPublicBooking from "@/components/landing/LandingPublicBooking"
import CookieConsent from "@/components/CookieConsent"

const LandingUnifiedShowcase = nextDynamic(() => import("@/components/landing/LandingUnifiedShowcase"), {
  loading: () => (
    <div className="py-24 flex items-center justify-center bg-white dark:bg-zinc-950">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
})

export const dynamic = 'force-dynamic'

export default async function Home() {
  const session = await getServerSession(authOptions)

  // If user is authenticated, send them to dashboard
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
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-slate-900 dark:text-white font-sans transition-colors duration-500">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Fixed ambient gradient background — dark mode only */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden hidden dark:block">
        <div className="absolute -top-[30%] -left-[15%] w-[900px] h-[900px] bg-emerald-500/10 blur-[200px] rounded-full" />
        <div className="absolute top-[35%] -right-[20%] w-[700px] h-[700px] bg-violet-500/[0.07] blur-[200px] rounded-full" />
        <div className="absolute -bottom-[15%] left-[25%] w-[600px] h-[600px] bg-teal-500/[0.07] blur-[180px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      {/* HEADER */}
      <LandingHeader />

      {/* MAIN CONTENT */}
      <main className="relative z-10 pt-0">
        <LandingHero />
        <SocialProof />
        <LandingMockup />
        <LandingUnifiedShowcase />
        <LandingHowItWorks />
        <LandingFeatures />
        <LandingPublicBooking />
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

// Trigger deploy
