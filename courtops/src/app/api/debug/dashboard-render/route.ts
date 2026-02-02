import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
       const logs: string[] = []
       const errors: string[] = []

       try {
              logs.push('1. Getting session...')
              const session = await getServerSession(authOptions)

              if (!session || !session.user) {
                     return NextResponse.json({ error: 'No session', logs }, { status: 401 })
              }

              logs.push('2. Session OK: ' + session.user.email)

              const clubId = session.user.clubId
              if (!clubId) {
                     return NextResponse.json({ error: 'No clubId', logs }, { status: 400 })
              }

              logs.push('3. ClubId: ' + clubId)

              // Try to fetch club
              logs.push('4. Fetching club...')
              const club = await prisma.club.findUnique({
                     where: { id: clubId },
                     select: {
                            name: true,
                            logoUrl: true,
                            slug: true,
                            hasKiosco: true,
                            hasAdvancedReports: true,
                            themeColor: true,
                            _count: { select: { courts: true } }
                     }
              })
              logs.push('5. Club fetched: ' + (club?.name || 'null'))

              //Try to fetch notification
              logs.push('6. Fetching notification...')
              let notification = null
              try {
                     notification = await prisma.systemNotification.findFirst({
                            where: { isActive: true },
                            orderBy: { createdAt: 'desc' },
                            select: {
                                   id: true,
                                   title: true,
                                   message: true,
                                   type: true
                            }
                     })
                     logs.push('7. Notification: ' + (notification ? 'found' : 'none'))
              } catch (e: any) {
                     errors.push('Notification error: ' + e.message)
                     logs.push('7. Notification FAILED: ' + e.message)
              }

              // Try to serialize notification
              logs.push('8. Serializing notification...')
              let serializedNotification = null
              try {
                     if (notification) {
                            serializedNotification = JSON.parse(JSON.stringify(notification))
                            logs.push('9. Notification serialized OK')
                     } else {
                            logs.push('9. No notification to serialize')
                     }
              } catch (e: any) {
                     errors.push('Serialization error: ' + e.message)
                     logs.push('9. Serialization FAILED: ' + e.message)
              }

              // Prepare props
              logs.push('10. Preparing component props...')
              const props = {
                     user: session.user,
                     clubName: club?.name || 'Club',
                     logoUrl: club?.logoUrl,
                     slug: club?.slug,
                     features: {
                            hasKiosco: club?.hasKiosco ?? true,
                            hasAdvancedReports: club?.hasAdvancedReports ?? true
                     },
                     themeColor: club?.themeColor,
                     showOnboarding: (club?._count?.courts || 0) === 0,
                     activeNotification: serializedNotification
              }

              // Try to serialize props
              logs.push('11. Serializing all props...')
              try {
                     const serializedProps = JSON.parse(JSON.stringify(props))
                     logs.push('12. Props serialized OK')

                     return NextResponse.json({
                            success: true,
                            logs,
                            errors,
                            props: serializedProps
                     })
              } catch (e: any) {
                     errors.push('Props serialization failed: ' + e.message)
                     logs.push('12. Props serialization FAILED: ' + e.message)

                     return NextResponse.json({
                            success: false,
                            logs,
                            errors,
                            error: e.message,
                            stack: e.stack
                     }, { status: 500 })
              }

       } catch (error: any) {
              errors.push('TOP LEVEL ERROR: ' + error.message)
              logs.push('FATAL ERROR: ' + error.message)

              return NextResponse.json({
                     success: false,
                     logs,
                     errors,
                     error: error.message,
                     stack: error.stack
              }, { status: 500 })
       }
}
