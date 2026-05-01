import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

/**
 * Webhook Retry Queue
 * 
 * Stores failed webhooks and provides retry mechanism.
 * Uses the database as a simple queue (no external dependencies).
 * 
 * Called by a cron job to retry failed webhooks.
 * POST /api/cron/webhook-retry
 */

const MAX_RETRIES = 5
const RETRY_INTERVALS_MS = [
       30_000,      // 30 seconds
       120_000,     // 2 minutes
       600_000,     // 10 minutes
       3_600_000,   // 1 hour
       86_400_000,  // 24 hours
]

async function runRetry() {

       try {
              // Get pending webhooks
              const pendingWebhooks = await prisma.webhookQueue.findMany({
                     where: {
                            status: 'PENDING',
                            nextRetryAt: { lte: new Date() },
                            retryCount: { lt: MAX_RETRIES }
                     },
                     orderBy: { createdAt: 'asc' },
                     take: 20 // Process in batches
              })

              if (pendingWebhooks.length === 0) {
                     return NextResponse.json({ status: 'ok', processed: 0 })
              }

              let processed = 0
              let succeeded = 0
              let failed = 0

              for (const webhook of pendingWebhooks) {
                     processed++

                     try {
                            // Re-call our own webhook endpoint
                            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
                            const webhookUrl = `${baseUrl}/api/webhooks/mercadopago${webhook.queryParams || ''}`

                            const response = await fetch(webhookUrl, {
                                   method: 'POST',
                                   headers: {
                                          'Content-Type': 'application/json',
                                          'x-webhook-retry': 'true', // Skip signature verification on retries
                                          'x-retry-count': String(webhook.retryCount + 1),
                                   },
                                   body: webhook.payload,
                            })

                            if (response.ok) {
                                   // Mark as completed
                                   await prisma.webhookQueue.update({
                                          where: { id: webhook.id },
                                          data: {
                                                 status: 'COMPLETED',
                                                 completedAt: new Date(),
                                                 retryCount: webhook.retryCount + 1
                                          }
                                   })
                                   succeeded++
                            } else {
                                   throw new Error(`Webhook returned ${response.status}`)
                            }
                     } catch (error) {
                            const newRetryCount = webhook.retryCount + 1
                            const nextInterval = RETRY_INTERVALS_MS[Math.min(newRetryCount, RETRY_INTERVALS_MS.length - 1)]

                            if (newRetryCount >= MAX_RETRIES) {
                                   // Mark as failed permanently
                                   await prisma.webhookQueue.update({
                                          where: { id: webhook.id },
                                          data: {
                                                 status: 'FAILED',
                                                 retryCount: newRetryCount,
                                                 lastError: error instanceof Error ? error.message : 'Unknown error'
                                          }
                                   })
                            } else {
                                   // Schedule next retry
                                   await prisma.webhookQueue.update({
                                          where: { id: webhook.id },
                                          data: {
                                                 retryCount: newRetryCount,
                                                 nextRetryAt: new Date(Date.now() + nextInterval),
                                                 lastError: error instanceof Error ? error.message : 'Unknown error'
                                          }
                                   })
                            }
                            failed++
                     }
              }

              return NextResponse.json({
                     status: 'ok',
                     processed,
                     succeeded,
                     failed,
                     remaining: await prisma.webhookQueue.count({
                            where: { status: 'PENDING', retryCount: { lt: MAX_RETRIES } }
                     })
              })
       } catch (error) {
              console.error('Webhook Retry Cron Error:', error)
              return NextResponse.json({ error: 'Internal error' }, { status: 500 })
       }
}

function verifyCronSecret(request: Request) {
       const auth = request.headers.get('authorization')
       const secret = auth?.replace('Bearer ', '') ?? request.headers.get('x-cron-secret')
       return secret === process.env.CRON_SECRET || process.env.NODE_ENV !== 'production'
}

export async function GET(request: Request) {
       if (!verifyCronSecret(request)) {
              return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
       }
       return runRetry()
}

export async function POST(request: Request) {
       if (!verifyCronSecret(request)) {
              return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
       }
       return runRetry()
}
