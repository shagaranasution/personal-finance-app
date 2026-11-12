import { createContext } from 'react'
import type { Pot } from './types'
import type {
  PotDeletionResult,
  PotMovementDirection,
  PotMovementResult,
  startPotFixture,
} from './pot-fixture-adapter'

export type PotsState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'success'; pots: Pot[]; fixture?: ReturnType<typeof startPotFixture> }

export interface PotsContextValue {
  state: PotsState
  retry: () => void
  addPot: (pot: Pot) => void
  editPot: (pot: Pot) => void
  deletePot: (potId: string) => PotDeletionResult
  movePotMoney: (
    potId: string,
    amount: number,
    direction: PotMovementDirection,
  ) => PotMovementResult
}

export const PotsContext = createContext<PotsContextValue | null>(null)
