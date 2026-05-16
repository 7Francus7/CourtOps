import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface CronResult {
  success: boolean
  jobName: string
  duration: number
  details?: Record<string, unknown>
  error?: string
}

export async function runCronWithMonitoring<T>(
  jobName: string,
  fn: () => Promise<T>,
): Promise<{ result: T | null; meta: CronResult }> {
  const start = Date.now()

  try {
    const result = await fn()
    const duration = Date.now() - start

    const meta: CronResult = { success: true, jobName, duration, details: result as Record<string, unknown> }
    console.log(`[cron:${jobName}] OK — ${duration}ms`, meta.details)
    return { result, meta }
  } catch (error) {
    const duration = Date.now() - start
    const errMsg = error instanceof Error ? error.message : String(error)

    const meta: CronResult = { success: false, jobName, duration, error: errMsg }
    console.error(`[cron:${jobName}] FAILED — ${duration}ms`, errMsg)

    await alertCronFailure(jobName, errMsg, duration).catch(() => {})
    return { result: null, meta }
  }
}

async function alertCronFailure(jobName: string, error: string, duration: number) {
  const alertEmail = process.env.MASTER_ADMIN_EMAIL
  if (!alertEmail || !process.env.RESEND_API_KEY) return

  await resend.emails.send({
    from: process.env.EMAIL_FROM || 'CourtOps <onboarding@resend.dev>',
    to: [alertEmail],
    subject: `[CourtOps] Cron FALLIDO: ${jobName}`,
    html: `
      <div style="font-family: monospace; background: #0f172a; color: #f1f5f9; padding: 24px; border-radius: 8px;">
        <h2 style="color: #ef4444; margin-top: 0;">⚠️ Cron job fallido</h2>
        <p><strong>Job:</strong> ${jobName}</p>
        <p><strong>Error:</strong> ${error}</p>
        <p><strong>Duración:</strong> ${duration}ms</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <hr style="border-color: #334155;" />
        <p style="color: #94a3b8; font-size: 12px;">Este mensaje se envió automáticamente desde CourtOps.</p>
      </div>
    `,
  })
}
