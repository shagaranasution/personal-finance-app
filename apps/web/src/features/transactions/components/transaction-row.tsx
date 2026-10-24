import type { Transaction } from '../types'

interface TransactionRowProps {
  transaction: Transaction
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

const amountFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

function formatAmount(amount: number) {
  const signedAmount = amount > 0 ? `+${amountFormatter.format(amount)}` : amountFormatter.format(amount)
  return signedAmount.replace('-', '−')
}

export function TransactionRow({ transaction }: TransactionRowProps) {
  const isIncome = transaction.amount > 0

  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-200 gap-y-50 border-b border-grey-100 py-200 first:pt-0 last:border-b-0 last:pb-0 tablet:grid-cols-[minmax(0,1.7fr)_minmax(7rem,1fr)_minmax(8rem,1fr)_auto] tablet:gap-200 tablet:py-250">
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

      <span className="col-start-1 text-preset-5 text-grey-500 tablet:col-auto tablet:text-preset-4">
        {transaction.category}
      </span>

      <time
        className="col-start-1 text-preset-5 text-grey-500 tablet:col-auto tablet:text-preset-4"
        dateTime={transaction.date}
      >
        {dateFormatter.format(new Date(transaction.date))}
      </time>

      <span
        className={`row-span-3 row-start-1 text-right text-preset-4-bold tablet:row-span-1 ${isIncome ? 'text-green' : 'text-grey-900'}`}
      >
        {formatAmount(transaction.amount)}
      </span>
    </li>
  )
}
