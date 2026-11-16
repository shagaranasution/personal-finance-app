import { Link } from 'react-router'
import { getBudgetChartBackground, getBudgetTotals } from '@/features/budgets/budget-summary'
import type { BudgetSummary } from '@/features/budgets/types'
import { IconCaretRight } from '@/shared/components/icons'
import { formatRupiah } from '@/shared/lib/money'
import { Card } from '@/shared/ui/card'

export function BudgetOverviewCard({ budgets }: { budgets: readonly BudgetSummary[] }) {
  const totals = getBudgetTotals(budgets)

  return (
    <Card padding="compact" className="flex flex-col gap-200 tablet:p-300">
      <header className="flex items-center justify-between gap-200">
        <h2 className="text-preset-3">Budgets</h2>
        <Link
          className="group inline-flex items-center gap-100 text-preset-5 text-grey-500 transition-colors hover:text-grey-900 focus-visible:rounded-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grey-900"
          to="/budgets"
        >
          See Details
          <IconCaretRight className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </header>

      {budgets.length > 0 ? (
        <div className="flex min-w-0 flex-col items-center gap-200 tablet:flex-row tablet:justify-center">
          <div
            aria-hidden="true"
            className="relative grid size-[168px] shrink-0 place-items-center rounded-full p-[12px]"
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

          <ul aria-label="Budget categories and limits" className="min-w-0 flex-1 list-none p-0">
            {budgets.map((budget) => (
              <li className="flex min-w-0 items-center gap-100 py-100" key={budget.id}>
                <span
                  aria-hidden="true"
                  className="h-6 w-1 shrink-0 rounded-50"
                  style={{ backgroundColor: budget.theme }}
                />
                <span className="min-w-0 flex-1 truncate text-preset-5 text-grey-500">
                  {budget.category}
                </span>
                <span className="shrink-0 text-preset-5-bold">{formatRupiah(budget.maximum)}</span>
              </li>
            ))}
          </ul>
          <p
            className="sr-only"
            role="img"
            aria-label={`Total budget spending ${formatRupiah(totals.spent)} of ${formatRupiah(totals.maximum)} across ${budgets.length} categories.`}
          />
        </div>
      ) : (
        <div className="rounded-100 bg-beige-100 px-200 py-300">
          <p className="text-preset-4-bold">No budgets yet</p>
          <p className="mt-50 text-preset-5 text-grey-500">
            Your budget chart will appear here when a budget is available.
          </p>
        </div>
      )}
    </Card>
  )
}
