
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
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-black tracking-tighter" >
            COURT<span className="text-emerald-500">OPS</span>
          </h1>

          <nav className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              Iniciar Sesión
            </Link>
            <Link href="/register" className="text-sm font-bold bg-foreground text-background px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
              Crear Cuenta
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>

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
