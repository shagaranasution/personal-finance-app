import { FIXTURE_CURRENT_BALANCE } from '../pots/pot-fixture-adapter.ts'
import type { Pot } from '../pots/types.ts'
import { MAX_RUPIAH } from '../../shared/lib/money.ts'

export const INITIAL_INCOME_SNAPSHOT = 3_814_250
export const INITIAL_EXPENSES_SNAPSHOT = 1_700_500

export interface OverviewBalanceSummary {
  currentBalance: number
  income: number
  expenses: number
  totalSaved: number
}

function assertBoundedRupiah(amount: number): void {
  if (!Number.isSafeInteger(amount) || amount < 0 || amount > MAX_RUPIAH) {
    throw new RangeError('Expected a non-negative whole-rupiah amount within the supported limit')
  }
}

/** Uses fixed fixture snapshots for income/expenses and current pot state for savings. */
export function getOverviewBalanceSummary(
  pots: readonly Pot[],
  currentBalance = FIXTURE_CURRENT_BALANCE,
): OverviewBalanceSummary {
  assertBoundedRupiah(currentBalance)
  assertBoundedRupiah(INITIAL_INCOME_SNAPSHOT)
  assertBoundedRupiah(INITIAL_EXPENSES_SNAPSHOT)

  const totalSaved = pots.reduce((sum, pot) => sum + pot.total, 0)
  if (!Number.isSafeInteger(totalSaved) || totalSaved > MAX_RUPIAH) {
    throw new RangeError('Savings total exceeds the supported rupiah limit')
  }

  return {
    currentBalance,
    income: INITIAL_INCOME_SNAPSHOT,
    expenses: INITIAL_EXPENSES_SNAPSHOT,
    totalSaved,
  }
}
