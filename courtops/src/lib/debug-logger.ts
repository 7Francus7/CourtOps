import fs from 'fs'
import path from 'path'

export function logError(context: string, error: any) {
       const logFile = path.join(process.cwd(), 'server_debug.log')
       const timestamp = new Date().toISOString()
       const message = `[${timestamp}] [${context}] ${error.message || error}\n${error.stack || ''}\n\n`

       try {
              fs.appendFileSync(logFile, message)
       } catch (e) {
              console.error('Failed to write to debug log:', e)
       }
}
