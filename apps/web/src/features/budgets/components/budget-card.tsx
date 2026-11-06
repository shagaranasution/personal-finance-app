import { Link } from 'react-router'
import { Card } from '@/shared/ui/card'
import { formatRupiah } from '@/shared/lib/money'
import { BudgetActions } from './budget-actions'
import type { Budget, BudgetSummary } from '../types'

const transactionDate = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

interface BudgetCardProps {
  budget: BudgetSummary
  onEdit: (budget: Budget, trigger: HTMLButtonElement) => void
  onDelete: (budget: Budget, trigger: HTMLButtonElement) => void
}

export function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const headingId = `${budget.id}-heading`

  return (
    <Card padding="compact" className="flex flex-col gap-200">
      <div className="flex items-center justify-between gap-200">
        <div className="flex min-w-0 items-center gap-200">
          <span
            aria-hidden="true"
            className="size-2 shrink-0 rounded-full"
            style={{ backgroundColor: budget.theme }}
          />
          <h2 className="truncate text-preset-2" id={headingId}>
            {budget.category}
          </h2>
        </div>
        <BudgetActions budget={budget} onEdit={onEdit} onDelete={onDelete} />
      </div>

      <p className="text-preset-5 text-grey-500">Maximum of {formatRupiah(budget.maximum)}</p>

      <div
        aria-labelledby={headingId}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={budget.progress}
        aria-valuetext={`${formatRupiah(budget.spent)} spent of ${formatRupiah(budget.maximum)}`}
        className="h-3 overflow-hidden rounded-50 bg-beige-100 p-[2px]"
        role="progressbar"
      >
        <div
          className="h-full rounded-50 transition-[width]"
          style={{ backgroundColor: budget.theme, width: `${budget.progress}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-200">
        <div className="border-l-2 pl-150" style={{ borderColor: budget.theme }}>
          <p className="text-preset-5 text-grey-500">Spent</p>
          <p className="text-preset-5-bold">{formatRupiah(budget.spent)}</p>
        </div>
        <div className="border-l border-grey-100 pl-150">
          <p className="text-preset-5 text-grey-500">Remaining</p>
          <p className="text-preset-5-bold">{formatRupiah(budget.remaining)}</p>
        </div>
      </div>

      {budget.overspent > 0 && (
        <p className="text-preset-5-bold text-red-accessible" role="status">
          Overspent by {formatRupiah(budget.overspent)}
        </p>
      )}

      <section aria-labelledby={`${headingId}-activity`} className="rounded-100 bg-beige-100 p-200">
        <div className="mb-150 flex items-center justify-between gap-100">
          <h3 className="text-preset-4-bold" id={`${headingId}-activity`}>
            Latest Spending
          </h3>
          <Link
            className="flex shrink-0 items-center gap-100 text-preset-5 text-grey-500 hover:text-grey-900 focus-visible:rounded-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grey-900"
            to={`/transactions?category=${encodeURIComponent(budget.category)}`}
          >
            See All <span aria-hidden="true">›</span>
          </Link>
        </div>

        {budget.recentTransactions.length > 0 ? (
          <ul aria-label={`Latest ${budget.category} transactions`} className="list-none p-0">
            {budget.recentTransactions.map((transaction) => (
              <li
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-100 border-b border-grey-100 py-100 last:border-b-0 last:pb-0 first:pt-0"
                key={transaction.id}
              >
                <div className="flex min-w-0 items-center gap-100">
                  <img
                    alt=""
                    className="size-6 shrink-0 rounded-full object-cover"
                    height="24"
                    src={transaction.avatar}
                    width="24"
                  />
                  <span className="truncate text-preset-5-bold">{transaction.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-preset-5-bold">{formatRupiah(transaction.amount, true)}</p>
                  <time className="text-preset-5 text-grey-500" dateTime={transaction.date}>
                    {transactionDate.format(new Date(transaction.date))}
                  </time>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-preset-5 text-grey-500">No transactions in this category yet.</p>
        )}
      </section>
    </Card>
  )
}
