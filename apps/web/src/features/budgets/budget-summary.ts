import type { Transaction } from '@/features/transactions/types'
import type { Budget, BudgetSummary } from './types'

const AUGUST_START = Date.parse('2024-08-01T00:00:00.000Z')
const SEPTEMBER_START = Date.parse('2024-09-01T00:00:00.000Z')

export function summarizeBudgets(budgets: Budget[], transactions: Transaction[]): BudgetSummary[] {
  return budgets.map((budget) => {
    const categoryTransactions = transactions
      .filter((transaction) => transaction.category === budget.category)
      .sort(
        (left, right) =>
          Date.parse(right.date) - Date.parse(left.date) || left.id.localeCompare(right.id),
      )

    const spent = categoryTransactions.reduce((total, transaction) => {
      const transactionTime = Date.parse(transaction.date)
      const isAugust = transactionTime >= AUGUST_START && transactionTime < SEPTEMBER_START
      return isAugust && transaction.amount < 0 ? total + Math.abs(transaction.amount) : total
    }, 0)

    if (!Number.isSafeInteger(spent) || !Number.isSafeInteger(budget.maximum)) {
      throw new Error(`Budget values for ${budget.category} must use safe whole rupiah amounts`)
    }

    return {
      ...budget,
      spent,
      remaining: Math.max(0, budget.maximum - spent),
      overspent: Math.max(0, spent - budget.maximum),
      progress: budget.maximum === 0 ? 0 : Math.min(100, (spent / budget.maximum) * 100),
      recentTransactions: categoryTransactions.slice(0, 3),
    }
  })
}

export function getBudgetTotals(summaries: BudgetSummary[]) {
  return summaries.reduce(
    (totals, budget) => ({
      spent: totals.spent + budget.spent,
      maximum: totals.maximum + budget.maximum,
    }),
    { spent: 0, maximum: 0 },
  )
}

export function getBudgetChartBackground(summaries: BudgetSummary[], totalSpent: number) {
  if (totalSpent === 0) return 'conic-gradient(var(--color-grey-100) 0deg 360deg)'

  let accumulatedPercentage = 0
  const stops = summaries
    .filter((budget) => budget.spent > 0)
    .map((budget) => {
      const start = accumulatedPercentage
      accumulatedPercentage += (budget.spent / totalSpent) * 100
      return `${budget.theme} ${start}% ${accumulatedPercentage}%`
    })

  return `conic-gradient(${stops.join(', ')})`
}
