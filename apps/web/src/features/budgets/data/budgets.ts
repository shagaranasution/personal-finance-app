import type { Budget } from '../types'

/** Whole IDR values adapted once from the original challenge budgets × 1,000. */
export const budgets: Budget[] = [
  { id: 'budget-entertainment', category: 'Entertainment', maximum: 50_000, theme: '#277C78' },
  { id: 'budget-bills', category: 'Bills', maximum: 750_000, theme: '#82C9D7' },
  { id: 'budget-dining-out', category: 'Dining Out', maximum: 75_000, theme: '#F2CDAC' },
  { id: 'budget-personal-care', category: 'Personal Care', maximum: 100_000, theme: '#626070' },
]
