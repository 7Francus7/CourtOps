import fs from 'fs'
import path from 'path'

export function logError(context: string, error: unknown) {
       const logFile = path.join(process.cwd(), 'server_debug.log')
       const timestamp = new Date().toISOString()
       const errObj = error instanceof Error ? error : { message: String(error), stack: '' }
       const message = `[${timestamp}] [${context}] ${errObj.message}\n${errObj.stack || ''}\n\n`

       try {
              fs.appendFileSync(logFile, message)
       } catch (e) {
              console.error('Failed to write to debug log:', e)
       }
}
