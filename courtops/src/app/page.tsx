import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect('/login')
  }

  // SUPER ADMIN REDIRECT
  if (session.user.email === 'dellorsif@gmail.com' || session.user.email === 'admin@courtops.com') {
    redirect('/god-mode')
  }

  // Redirect to the main dashboard
  redirect('/dashboard')
}
