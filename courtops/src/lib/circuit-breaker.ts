
import { getCache, setCache } from '@/lib/cache'

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN'

interface CircuitData {
  state: CircuitState
  failures: number
  lastFailureAt: number
}

const FAILURE_THRESHOLD = 5  // failures before opening
const COOLDOWN_MS = 30_000   // 30s cooldown before HALF_OPEN

export class CircuitBreakerError extends Error {
  constructor(public readonly service: string) {
    super(`Circuit breaker OPEN — service unavailable: ${service}`)
    this.name = 'CircuitBreakerError'
  }
}

async function getCircuit(name: string): Promise<CircuitData> {
  return (await getCache<CircuitData>(`cb:${name}`)) ?? {
    state: 'CLOSED',
    failures: 0,
    lastFailureAt: 0,
  }
}

async function saveCircuit(name: string, data: CircuitData) {
  await setCache(`cb:${name}`, data, 300)
}

/**
 * Wraps an async call with circuit breaker protection.
 * State is stored in Redis (via cache.ts), so it's shared across Vercel instances.
 *
 * States:
 *   CLOSED    — normal, all calls go through
 *   OPEN      — failing, calls are rejected immediately (fast-fail)
 *   HALF_OPEN — cooldown passed, one call allowed through to test recovery
 *
 * Usage:
 *   const data = await withCircuitBreaker('whatsapp', () =>
 *     fetch(url, { signal: AbortSignal.timeout(8000), ...opts })
 *   )
 */
export async function withCircuitBreaker<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const circuit = await getCircuit(name)
  const now = Date.now()

  if (circuit.state === 'OPEN') {
    if (now - circuit.lastFailureAt < COOLDOWN_MS) {
      throw new CircuitBreakerError(name)
    }
    // Cooldown passed — allow one request through (HALF_OPEN)
    circuit.state = 'HALF_OPEN'
    await saveCircuit(name, circuit)
  }

  try {
    const result = await fn()

    // Success: reset the circuit
    if (circuit.failures > 0 || circuit.state !== 'CLOSED') {
      await saveCircuit(name, { state: 'CLOSED', failures: 0, lastFailureAt: 0 })
    }

    return result
  } catch (err) {
    if (err instanceof CircuitBreakerError) throw err

    circuit.failures++
    circuit.lastFailureAt = now

    if (circuit.failures >= FAILURE_THRESHOLD || circuit.state === 'HALF_OPEN') {
      circuit.state = 'OPEN'
    }

    await saveCircuit(name, circuit)
    throw err
  }
}
