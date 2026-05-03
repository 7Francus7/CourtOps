
type Level = 'debug' | 'info' | 'warn' | 'error'
type Context = Record<string, unknown>

const SENSITIVE = new Set([
  'password', 'token', 'secret', 'authorization',
  'mpAccessToken', 'accessToken', 'refreshToken',
  'apiKey', 'api_key', 'cvv', 'cardNumber',
])

function redact(obj: Context): Context {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [
      k,
      SENSITIVE.has(k.toLowerCase()) ? '[REDACTED]' : v,
    ])
  )
}

const isDev = process.env.NODE_ENV !== 'production'
const LEVELS: Record<Level, number> = { debug: 0, info: 1, warn: 2, error: 3 }
const minLevel = LEVELS[(process.env.LOG_LEVEL as Level) ?? 'info']

function emit(level: Level, msg: string, ctx?: Context) {
  if (LEVELS[level] < minLevel) return

  const safe = ctx ? redact(ctx) : undefined

  if (isDev) {
    const icons: Record<Level, string> = { debug: '[DBG]', info: '[INF]', warn: '[WRN]', error: '[ERR]' }
    let out = `${icons[level]} ${msg}`
    if (safe) {
      try {
        out += ` ${JSON.stringify(safe, null, 2)}`
      } catch {
        out += ` [Unserializable Context]`
      }
    }
    level === 'error' ? console.error(out) : level === 'warn' ? console.warn(out) : console.log(out)
    return
  }

  // Production: JSON lines for Vercel log drains
  try {
    const entry = { time: new Date().toISOString(), level, msg, ...safe }
    const out = JSON.stringify(entry)
    level === 'error' ? console.error(out) : level === 'warn' ? console.warn(out) : console.log(out)
  } catch (err) {
    // Fallback if serialization fails
    const fallback = JSON.stringify({ 
      time: new Date().toISOString(), 
      level: 'error', 
      msg: `Log serialization failed: ${msg}`,
      originalLevel: level 
    })
    console.error(fallback)
  }
}

export const logger = {
  debug: (msg: string, ctx?: Context) => emit('debug', msg, ctx),
  info:  (msg: string, ctx?: Context) => emit('info',  msg, ctx),
  warn:  (msg: string, ctx?: Context) => emit('warn',  msg, ctx),
  error: (msg: string, ctx?: Context) => emit('error', msg, ctx),

  /** Child logger with pre-bound context fields (e.g. { clubId, userId }) */
  child: (base: Context) => ({
    debug: (msg: string, ctx?: Context) => emit('debug', msg, { ...base, ...ctx }),
    info:  (msg: string, ctx?: Context) => emit('info',  msg, { ...base, ...ctx }),
    warn:  (msg: string, ctx?: Context) => emit('warn',  msg, { ...base, ...ctx }),
    error: (msg: string, ctx?: Context) => emit('error', msg, { ...base, ...ctx }),
  }),
}
