
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'

// Import Landing Components
import LandingHero from "@/components/landing/LandingHero"
import LandingFeatures from "@/components/landing/LandingFeatures"
import LandingShowcase from "@/components/landing/LandingShowcase"
import LandingPricing from "@/components/landing/LandingPricing"
import LandingFooter from "@/components/landing/LandingFooter"
import SocialProof from '@/components/landing/SocialProof'
import LandingHeader from "@/components/landing/LandingHeader"

export const dynamic = 'force-dynamic'

export default async function Home() {
  const session = await getServerSession(authOptions)

  // If user is authenticated, send them to dashboard
  if (session?.user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">

      {/* HEADER */}
      <LandingHeader />

      {/* MAIN CONTENT */}
      <main className="pt-24">

        <LandingHero />
        <SocialProof />
        <LandingShowcase />
        <LandingFeatures />
        <LandingPricing />
      </main>

      <LandingFooter />
    </div>
  )
}
