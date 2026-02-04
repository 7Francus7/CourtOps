import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect('/login')
  }

  // Redirect to the main dashboard
  // Super admins can still access /god-mode manually, but the primary entry is the dashboard.
  redirect('/dashboard')
}
