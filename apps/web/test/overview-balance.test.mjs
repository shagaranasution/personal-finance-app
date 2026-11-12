import assert from 'node:assert/strict'
import { test } from 'node:test'
import { MAX_RUPIAH } from '../src/shared/lib/money.ts'
import { getOverviewBalanceSummary } from '../src/features/overview/overview-balance.ts'

const pots = [
  { id: '1', name: 'Savings', theme: '#277C78', total: 159_000, target: 2_000_000 },
  { id: '2', name: 'Concert Ticket', theme: '#626070', total: 110_000, target: 150_000 },
  { id: '3', name: 'Gift', theme: '#82C9D7', total: 110_000, target: 150_000 },
  { id: '4', name: 'New Laptop', theme: '#F2CDAC', total: 10_000, target: 1_000_000 },
  { id: '5', name: 'Holiday', theme: '#826CB0', total: 531_000, target: 1_440_000 },
]

test('overview uses fixed independent balance snapshots and totals every pot', () => {
  assert.deepEqual(getOverviewBalanceSummary(pots), {
    currentBalance: 4_836_000,
    income: 3_814_250,
    expenses: 1_700_500,
    totalSaved: 920_000,
  })

  const afterPotTransfer = getOverviewBalanceSummary(
    pots.map((pot) => (pot.id === '1' ? { ...pot, total: 559_000 } : pot)),
    4_436_000,
  )
  assert.deepEqual(afterPotTransfer, {
    currentBalance: 4_436_000,
    income: 3_814_250,
    expenses: 1_700_500,
    totalSaved: 1_320_000,
  })
})

test('overview rejects an out-of-range savings aggregate', () => {
  assert.throws(
    () =>
      getOverviewBalanceSummary([
        { ...pots[0], total: MAX_RUPIAH },
        { ...pots[1], total: 1 },
      ]),
    /supported rupiah limit/,
  )
})
