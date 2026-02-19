
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
import LandingStats from "@/components/landing/LandingStats"

// Lazy load heavy components (they import TurneroGrid, RevenueHeatmap, etc.)
const LandingShowcase = nextDynamic(() => import("@/components/landing/LandingShowcase"), {
  loading: () => (
    <div className="py-24 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
})

const LandingAppShowcase = nextDynamic(() => import("@/components/landing/LandingAppShowcase"), {
  loading: () => null
})

export const dynamic = 'force-dynamic'

export default async function Home() {
  const session = await getServerSession(authOptions)

  // If user is authenticated, send them to dashboard
  if (session?.user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-white font-sans">

      {/* HEADER */}
      <LandingHeader />

      {/* MAIN CONTENT */}
      <main className="pt-0">
        <LandingHero />
        <SocialProof />
        <LandingStats />
        <LandingHowItWorks />
        <LandingShowcase />
        <LandingAppShowcase />
        <LandingFeatures />
        <LandingPricing />
        <LandingFAQ />
      </main>

      <LandingFooter />
    </div>
  )
}
