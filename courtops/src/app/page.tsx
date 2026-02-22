
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

const LandingUnifiedShowcase = nextDynamic(() => import("@/components/landing/LandingUnifiedShowcase"), {
  loading: () => (
    <div className="py-24 flex items-center justify-center">
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

  return (
    <div className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-white font-sans">

      {/* HEADER */}
      <LandingHeader />

      {/* MAIN CONTENT */}
      <main className="pt-0">
        <LandingHero />
        <LandingMockup />
        <LandingUnifiedShowcase />
        <LandingHowItWorks />
        <LandingFeatures />
        <LandingPricing />
        <LandingFAQ />
      </main>

      <LandingFooter />
    </div>
  )
}
