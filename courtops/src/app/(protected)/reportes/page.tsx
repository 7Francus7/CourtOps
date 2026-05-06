import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { ACTIONS, hasPermission, RESOURCES } from '@/lib/permissions'
import ReportsDashboard from '@/components/reports/ReportsDashboard'

export const dynamic = 'force-dynamic'

export default async function ReportesPage() {
  const session = await getServerSession(authOptions)
  const canViewReports = !!(
    session?.user?.clubId &&
    hasPermission(session.user.role || 'USER', RESOURCES.FINANCE, ACTIONS.READ)
  )

  return <ReportsDashboard canViewReports={canViewReports} />
}
