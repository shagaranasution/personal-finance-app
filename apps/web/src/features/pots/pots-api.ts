import type { Pot } from './types'

const MAX_RUPIAH = 2_147_483_647

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
