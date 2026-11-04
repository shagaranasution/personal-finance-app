import { Card } from '@/shared/ui/card'
import { formatRupiah } from '@/shared/lib/money'
import { getBudgetChartBackground, getBudgetTotals } from '../budget-summary'
import type { BudgetSummary } from '../types'

export function BudgetSummaryCard({ budgets }: { budgets: BudgetSummary[] }) {
  const totals = getBudgetTotals(budgets)

  return (
    <Card padding="compact" className="flex flex-col gap-300">
      <div className="flex flex-col items-center gap-300 tablet:flex-row tablet:justify-center desktop:flex-col">
        <div
          aria-hidden="true"
          className="relative grid size-[220px] shrink-0 place-items-center rounded-full p-[14px]"
          style={{ background: getBudgetChartBackground(budgets, totals.spent) }}
        >
          <div className="grid size-full place-items-center rounded-full border-[10px] border-white bg-white">
            <div className="flex flex-col items-center">
              <span className="text-preset-2">{formatRupiah(totals.spent)}</span>
              <span className="text-preset-5 text-grey-500">
                of {formatRupiah(totals.maximum)} limit
              </span>
            </div>
          </div>
        </div>

        <div className="w-full min-w-0">
          <h2 className="mb-200 text-center text-preset-3 tablet:text-left desktop:text-center">
            Spending Summary
          </h2>
          <ul aria-label="Budget spending summary" className="list-none p-0">
            {budgets.map((budget) => (
              <li
                className="flex items-center gap-150 border-b border-grey-100 py-150 last:border-b-0"
                key={budget.id}
              >
                <span
                  aria-hidden="true"
                  className="h-4 w-1 shrink-0"
                  style={{ backgroundColor: budget.theme }}
                />
                <span className="min-w-0 flex-1 truncate text-preset-5 text-grey-500">
                  {budget.category}
                </span>
                <span className="shrink-0 text-preset-5-bold">{formatRupiah(budget.spent)}</span>
                <span className="shrink-0 text-preset-5 text-grey-500">
                  of {formatRupiah(budget.maximum)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p
        className="sr-only"
        role="img"
        aria-label={`Total budget spending ${formatRupiah(totals.spent)} of ${formatRupiah(totals.maximum)} across ${budgets.length} categories.`}
      />
    </Card>
  )
}
