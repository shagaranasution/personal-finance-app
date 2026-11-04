import { BudgetCard } from '@/features/budgets/components/budget-card'
import { BudgetSummaryCard } from '@/features/budgets/components/budget-summary-card'
import { budgets } from '@/features/budgets/data/budgets'
import { summarizeBudgets } from '@/features/budgets/budget-summary'
import { transactions } from '@/features/transactions/data/transactions'
import { Button } from '@/shared/ui/button'

export function BudgetsPage() {
  const summaries = summarizeBudgets(budgets, transactions)

  return (
    <section aria-labelledby="budgets-title" className="flex flex-col gap-400">
      <header className="flex min-h-14 items-center justify-between gap-200 py-100">
        <h1 className="text-preset-1" id="budgets-title">
          Budgets
        </h1>
        <Button disabled title="Budget creation is coming in a later feature">
          + Add New Budget
        </Button>
      </header>

      <div className="grid grid-cols-1 items-start gap-300 desktop:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.6fr)]">
        <BudgetSummaryCard budgets={summaries} />
        {summaries.length > 0 ? (
          <ul aria-label="Budgets" className="flex list-none flex-col gap-300 p-0">
            {summaries.map((budget) => (
              <li className="min-w-0" key={budget.id}>
                <BudgetCard budget={budget} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-150 bg-white p-400">
            <h2 className="text-preset-2">No budgets yet</h2>
            <p className="mt-100 text-preset-4 text-grey-500">
              Your budget summary will appear here when a budget is available.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
