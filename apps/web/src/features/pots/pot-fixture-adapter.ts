import { MAX_RUPIAH } from '../../shared/lib/money.ts'
import type { Pot } from './types'

export interface PotFixtureState {
  pots: Pot[]
  currentBalance: number
}

export interface PotDeletionResult {
  state: PotFixtureState
  deleted: boolean
  refunded: number
  error?: string
}

export type PotMovementDirection = 'add' | 'withdraw'

export interface PotMovementResult {
  state: PotFixtureState
  changed: boolean
  error?: string
}

// Mirrors the approved seeded balance snapshot; it is used only for local UI previews.
export const FIXTURE_CURRENT_BALANCE = 4_836_000

export function startPotFixture(persistedPots: readonly Pot[]): PotFixtureState {
  return {
    pots: persistedPots.map((pot) => ({ ...pot })),
    currentBalance: FIXTURE_CURRENT_BALANCE,
  }
}

export function editPotInFixture(state: PotFixtureState, updatedPot: Pot): PotFixtureState {
  if (!state.pots.some((pot) => pot.id === updatedPot.id)) return state
  return {
    ...state,
    pots: state.pots.map((pot) => (pot.id === updatedPot.id ? updatedPot : pot)),
  }
}

export function deletePotFromFixture(state: PotFixtureState, potId: string): PotDeletionResult {
  const pot = state.pots.find((entry) => entry.id === potId)
  if (!pot) return { state, deleted: false, refunded: 0 }

  const currentBalance = state.currentBalance + pot.total
  if (!Number.isSafeInteger(currentBalance) || currentBalance > MAX_RUPIAH) {
    return {
      state,
      deleted: false,
      refunded: 0,
      error:
        'This pot cannot be removed in the local preview because the resulting balance exceeds the supported limit.',
    }
  }

  return {
    state: {
      pots: state.pots.filter((entry) => entry.id !== potId),
      currentBalance,
    },
    deleted: true,
    refunded: pot.total,
  }
}

export function movePotMoneyInFixture(
  state: PotFixtureState,
  potId: string,
  amount: number,
  direction: PotMovementDirection,
): PotMovementResult {
  const pot = state.pots.find((entry) => entry.id === potId)
  if (!pot) {
    return {
      state,
      changed: false,
      error: 'This pot is no longer available. Reload saved pots and try again.',
    }
  }
  if (!Number.isSafeInteger(amount) || amount < 1 || amount > MAX_RUPIAH) {
    return {
      state,
      changed: false,
      error: 'Enter a positive whole-rupiah amount within the supported limit.',
    }
  }

  const nextBalance =
    direction === 'add' ? state.currentBalance - amount : state.currentBalance + amount
  const nextTotal = direction === 'add' ? pot.total + amount : pot.total - amount

  if (direction === 'add' && amount > state.currentBalance) {
    return { state, changed: false, error: 'The amount cannot exceed the current balance.' }
  }
  if (direction === 'withdraw' && amount > pot.total) {
    return {
      state,
      changed: false,
      error: 'The amount cannot exceed the amount saved in this pot.',
    }
  }
  if (
    nextBalance < 0 ||
    nextBalance > MAX_RUPIAH ||
    nextTotal < 0 ||
    nextTotal > MAX_RUPIAH ||
    !Number.isSafeInteger(nextBalance) ||
    !Number.isSafeInteger(nextTotal)
  ) {
    return {
      state,
      changed: false,
      error: 'This movement would exceed the supported whole-rupiah limit.',
    }
  }

  return {
    changed: true,
    state: {
      currentBalance: nextBalance,
      pots: state.pots.map((entry) =>
        entry.id === potId ? { ...entry, total: nextTotal } : entry,
      ),
    },
  }
}
