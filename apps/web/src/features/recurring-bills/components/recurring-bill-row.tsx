import { IconBillDue, IconBillPaid } from '@/shared/components/icons'
import { formatRupiah } from '@/shared/lib/money'
import type { RecurringBill } from '../recurring-bill-calculation'

interface RecurringBillRowProps {
  bill: RecurringBill
  avatar: string | undefined
}

function getOrdinal(day: number): string {
  const remainder100 = day % 100
  const suffix =
    remainder100 >= 11 && remainder100 <= 13
      ? 'th'
      : day % 10 === 1
        ? 'st'
        : day % 10 === 2
          ? 'nd'
          : day % 10 === 3
            ? 'rd'
            : 'th'

  return `${day}${suffix}`
}

export function RecurringBillRow({ bill, avatar }: RecurringBillRowProps) {
  const day = Number(bill.dueDate.slice(-2))
  const isPaid = bill.status === 'paid'
  const isAttentionNeeded = bill.status === 'due-soon' || bill.status === 'overdue'
  const statusLabel =
    bill.status === 'paid'
      ? 'Paid in August'
      : bill.status === 'due-soon'
        ? 'Due soon'
        : bill.status === 'overdue'
          ? 'Overdue'
          : 'Upcoming'

  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-150 border-b border-grey-100 py-200 last:border-b-0 tablet:grid-cols-[minmax(0,1.5fr)_minmax(8rem,1fr)_auto] tablet:gap-200 tablet:py-250">
      <div className="flex min-w-0 items-center gap-150">
        {avatar ? (
          <img
            alt=""
            className="size-8 shrink-0 rounded-full object-cover tablet:size-10"
            height="40"
            src={avatar}
            width="40"
          />
        ) : (
          <span
            aria-hidden="true"
            className="grid size-8 shrink-0 place-items-center rounded-full bg-beige-100 text-preset-5-bold text-grey-500 tablet:size-10"
          >
            {bill.name.slice(0, 1).toUpperCase()}
          </span>
        )}
        <span className="min-w-0 truncate text-preset-4-bold">{bill.name}</span>
      </div>

      <div className="col-start-1 row-start-2 flex items-center gap-100 text-preset-5 tablet:col-start-2 tablet:row-start-1 tablet:text-preset-4">
        <span className={isPaid ? 'text-green' : 'text-grey-500'}>Monthly -{getOrdinal(day)}</span>
        {isPaid ? <IconBillPaid /> : isAttentionNeeded ? <IconBillDue /> : null}
      </div>

      <span
        className={`col-start-2 row-start-2 whitespace-nowrap text-right text-preset-4-bold tablet:col-start-3 tablet:row-start-1 ${isAttentionNeeded ? 'text-red' : 'text-grey-900'}`}
      >
        {formatRupiah(bill.amount)}
        <span className="sr-only"> per month; {statusLabel}</span>
      </span>
    </li>
  )
}
