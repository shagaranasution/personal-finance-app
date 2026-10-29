import type { Transaction } from '../types'
import { formatRupiah } from '../../../shared/lib/money'

interface TransactionRowProps {
  transaction: Transaction
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

export function TransactionRow({ transaction }: TransactionRowProps) {
  const isIncome = transaction.amount > 0

  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-150 border-b border-grey-100 py-200 last:border-b-0 tablet:grid-cols-[minmax(0,1.7fr)_minmax(7rem,1fr)_minmax(8rem,1fr)_auto] tablet:gap-200 tablet:py-250">
      <div className="flex min-w-0 items-center gap-150 tablet:col-start-1">
        <img
          alt=""
          className="size-8 shrink-0 rounded-full object-cover tablet:size-10"
          height="40"
          src={transaction.avatar}
          width="40"
        />
        <div className="flex min-w-0 flex-col gap-50">
          <span className="truncate text-preset-4-bold">{transaction.name}</span>
          <span className="truncate text-preset-5 text-grey-500 tablet:hidden">
            {transaction.category}
          </span>
        </div>
      </div>

      <span className="hidden text-preset-4 text-grey-500 tablet:block tablet:col-start-2">
        {transaction.category}
      </span>

      <time
        className="hidden text-preset-4 text-grey-500 tablet:block tablet:col-start-3"
        dateTime={transaction.date}
      >
        {dateFormatter.format(new Date(transaction.date))}
      </time>

      <div className="flex min-w-[7rem] flex-col items-end gap-50 tablet:col-start-4">
        <span className={`text-preset-4-bold ${isIncome ? 'text-green' : 'text-grey-900'}`}>
          {formatRupiah(transaction.amount, true)}
        </span>
        <time
          className="whitespace-nowrap text-preset-5 text-grey-500 tablet:hidden"
          dateTime={transaction.date}
        >
          {dateFormatter.format(new Date(transaction.date))}
        </time>
      </div>
    </li>
  )
}
