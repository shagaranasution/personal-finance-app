import { Link } from 'react-router'
import type { Transaction } from '@/features/transactions/types'
import { IconCaretRight } from '@/shared/components/icons'
import { formatRupiah } from '@/shared/lib/money'
import { Card } from '@/shared/ui/card'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

function RecentTransactionRow({ transaction }: { transaction: Transaction }) {
  const isIncome = transaction.amount > 0

  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-150 border-b border-grey-100 py-200 last:border-b-0">
      <div className="flex min-w-0 items-center gap-150">
        <img
          alt=""
          className="size-8 shrink-0 rounded-full object-cover tablet:size-10"
          height="40"
          src={transaction.avatar}
          width="40"
        />
        <span className="truncate text-preset-4-bold">{transaction.name}</span>
      </div>
      <div className="flex min-w-[7rem] flex-col items-end gap-50">
        <span className={`text-preset-4-bold ${isIncome ? 'text-green' : 'text-grey-900'}`}>
          {formatRupiah(transaction.amount, true)}
        </span>
        <time className="whitespace-nowrap text-preset-5 text-grey-500" dateTime={transaction.date}>
          {dateFormatter.format(new Date(transaction.date))}
        </time>
      </div>
    </li>
  )
}

export function RecentTransactionsCard({ transactions }: { transactions: readonly Transaction[] }) {
  return (
    <Card padding="compact" className="flex flex-col gap-200 tablet:p-300">
      <header className="flex items-center justify-between gap-200">
        <h2 className="text-preset-3">Transactions</h2>
        <Link
          className="group inline-flex items-center gap-100 text-preset-5 text-grey-500 transition-colors hover:text-grey-900 focus-visible:rounded-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grey-900"
          to="/transactions"
        >
          View All
          <IconCaretRight className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </header>

      {transactions.length > 0 ? (
        <ul aria-label="Recent transactions" className="list-none p-0">
          {transactions.map((transaction) => (
            <RecentTransactionRow key={transaction.id} transaction={transaction} />
          ))}
        </ul>
      ) : (
        <div className="rounded-100 bg-beige-100 px-200 py-300">
          <p className="text-preset-4-bold">No recent activity</p>
          <p className="mt-50 text-preset-5 text-grey-500">
            Transactions will appear here when they are available.
          </p>
        </div>
      )}
    </Card>
  )
}
