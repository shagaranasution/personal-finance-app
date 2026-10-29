import { assertRupiah } from '../money.js'

// Already adapted to IDR using original fixture amounts × 1,000. Do not scale again.
export const demoBalance = {
  id: '00000000-0000-4000-8000-000000000002',
  current: 4_836_000,
  income: 3_814_250,
  expenses: 1_700_500,
}

export const demoPots = [
  {
    id: '00000000-0000-4000-8000-000000000101',
    name: 'Savings',
    target: 2_000_000,
    total: 159_000,
    theme: '#277C78',
  },
  {
    id: '00000000-0000-4000-8000-000000000102',
    name: 'Concert Ticket',
    target: 150_000,
    total: 110_000,
    theme: '#626070',
  },
  {
    id: '00000000-0000-4000-8000-000000000103',
    name: 'Gift',
    target: 150_000,
    total: 110_000,
    theme: '#82C9D7',
  },
  {
    id: '00000000-0000-4000-8000-000000000104',
    name: 'New Laptop',
    target: 1_000_000,
    total: 10_000,
    theme: '#F2CDAC',
  },
  {
    id: '00000000-0000-4000-8000-000000000105',
    name: 'Holiday',
    target: 1_440_000,
    total: 531_000,
    theme: '#826CB0',
  },
]

export function validateDemoAmounts(): void {
  for (const amount of [demoBalance.current, demoBalance.income, demoBalance.expenses]) {
    assertRupiah(amount)
  }
  for (const pot of demoPots) {
    assertRupiah(pot.target, 1)
    assertRupiah(pot.total)
  }
}
