export interface Budget {
  id: string
  category: string
  maximum: number
  theme: string
}

export interface BudgetSummary extends Budget {
  spent: number
  remaining: number
  overspent: number
  progress: number
  recentTransactions: import('@/features/transactions/types').Transaction[]
}
