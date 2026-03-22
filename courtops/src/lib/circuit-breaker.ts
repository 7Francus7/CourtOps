
type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN'

interface CircuitData {
  state: CircuitState
  failures: number
  lastFailureAt: number
}

const FAILURE_THRESHOLD = 5  // failures before opening
const COOLDOWN_MS = 30_000   // 30s cooldown before HALF_OPEN

// In-memory per Vercel instance — no Redis dependency to avoid bundling issues
const circuits = new Map<string, CircuitData>()

function getCircuit(name: string): CircuitData {
  return circuits.get(name) ?? { state: 'CLOSED', failures: 0, lastFailureAt: 0 }
}

export class CircuitBreakerError extends Error {
  constructor(public readonly service: string) {
    super(`Circuit breaker OPEN — service unavailable: ${service}`)
    this.name = 'CircuitBreakerError'
  }
}

/**
 * Wraps an async call with circuit breaker protection.
 *
 * States:
 *   CLOSED    — normal, all calls go through
 *   OPEN      — failing, calls are rejected immediately (fast-fail)
 *   HALF_OPEN — cooldown passed, one call allowed through to test recovery
 *
 * Usage:
 *   const res = await withCircuitBreaker('whatsapp', () =>
 *     fetch(url, { signal: AbortSignal.timeout(8000), ...opts })
 *   )
 */
export async function withCircuitBreaker<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const circuit = getCircuit(name)
  const now = Date.now()

  if (circuit.state === 'OPEN') {
    if (now - circuit.lastFailureAt < COOLDOWN_MS) {
      throw new CircuitBreakerError(name)
    }
    circuit.state = 'HALF_OPEN'
    circuits.set(name, circuit)
  }

  try {
    const result = await fn()

    if (circuit.failures > 0 || circuit.state !== 'CLOSED') {
      circuits.set(name, { state: 'CLOSED', failures: 0, lastFailureAt: 0 })
    }

    return result
  } catch (err) {
    if (err instanceof CircuitBreakerError) throw err

    circuit.failures++
    circuit.lastFailureAt = now

    if (circuit.failures >= FAILURE_THRESHOLD || circuit.state === 'HALF_OPEN') {
      circuit.state = 'OPEN'
    }

    circuits.set(name, circuit)
    throw err
  }
}
