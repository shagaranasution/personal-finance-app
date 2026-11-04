import type { CreatePotInput, Pot } from './types'

import { MAX_RUPIAH } from '../../shared/lib/money.ts'

function isPot(value: unknown): value is Pot {
  if (typeof value !== 'object' || value === null) return false
  const pot = value as Record<string, unknown>
  return (
    typeof pot.id === 'string' &&
    pot.id.length > 0 &&
    typeof pot.name === 'string' &&
    pot.name.trim() === pot.name &&
    [...pot.name].length >= 1 &&
    [...pot.name].length <= 30 &&
    typeof pot.theme === 'string' &&
    /^#[0-9a-f]{6}$/i.test(pot.theme) &&
    typeof pot.total === 'number' &&
    Number.isInteger(pot.total) &&
    pot.total >= 0 &&
    pot.total <= MAX_RUPIAH &&
    typeof pot.target === 'number' &&
    Number.isInteger(pot.target) &&
    pot.target > 0 &&
    pot.target <= MAX_RUPIAH
  )
}

export async function fetchPots(signal: AbortSignal): Promise<Pot[]> {
  const response = await fetch('/api/pots', { signal, cache: 'no-store' })
  if (!response.ok) throw new Error('Unable to load pots')
  const data: unknown = await response.json()
  if (
    !Array.isArray(data) ||
    !data.every(isPot) ||
    new Set(data.map((pot) => pot.id)).size !== data.length
  ) {
    throw new Error('Invalid pots response')
  }
  return data
}

export class PotCreationError extends Error {
  readonly status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'PotCreationError'
    this.status = status
  }
}

export async function createPot(input: CreatePotInput, signal: AbortSignal): Promise<Pot> {
  const response = await fetch('/api/pots', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    signal: AbortSignal.any([signal, AbortSignal.timeout(15_000)]),
    cache: 'no-store',
  })
  if (response.status === 409) {
    throw new PotCreationError(
      'This theme is already in use. Choose another, or close and refresh the list to check whether your pot was saved.',
      409,
    )
  }
  if (!response.ok) {
    throw new PotCreationError(
      response.status === 400
        ? 'Check the pot details and try again.'
        : 'We couldn’t confirm the save. Your entries are kept. Check your connection and refresh the list before retrying.',
      response.status,
    )
  }
  const pot: unknown = await response.json()
  if (!isPot(pot)) throw new Error('Unable to confirm the saved pot')
  return pot
}
