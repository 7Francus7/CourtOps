
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
    const out = safe ? `${icons[level]} ${msg} ${JSON.stringify(safe)}` : `${icons[level]} ${msg}`
    level === 'error' ? console.error(out) : level === 'warn' ? console.warn(out) : console.log(out)
    return
  }

  // Production: JSON lines for Vercel log drains
  const entry = { time: new Date().toISOString(), level, msg, ...safe }
  level === 'error' ? console.error(JSON.stringify(entry)) : level === 'warn' ? console.warn(JSON.stringify(entry)) : console.log(JSON.stringify(entry))
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
