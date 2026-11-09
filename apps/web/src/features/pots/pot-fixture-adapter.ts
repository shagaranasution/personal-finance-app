import { MAX_RUPIAH } from '@/shared/lib/money'
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
