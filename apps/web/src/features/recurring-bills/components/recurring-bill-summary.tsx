import { IconRecurringBills } from '@/shared/components/icons'
import { Card } from '@/shared/ui/card'
import { formatRupiah } from '@/shared/lib/money'
import type { RecurringBillSummary as Summary } from '../recurring-bill-query'

export function RecurringBillTotalCard({ totalBills }: { totalBills: Summary['totalBills'] }) {
  return (
    <Card
      padding="compact"
      className="flex min-h-[118px] items-center gap-200 text-white tablet:min-h-[204px] tablet:flex-col tablet:items-start tablet:justify-center tablet:gap-300 desktop:min-h-[194px]"
      style={{ backgroundColor: 'var(--color-grey-900)' }}
    >
      <IconRecurringBills aria-hidden="true" className="shrink-0" />
      <div className="flex min-w-0 flex-col gap-100">
        <p className="text-preset-4">Total bills</p>
        <p className="text-preset-1">{formatRupiah(totalBills.amount)}</p>
      </div>
    </Card>
  )
}

export function RecurringBillSummaryCard({ summary }: { summary: Summary }) {
  const rows = [
    { label: 'Paid Bills', ...summary.paidBills, attention: false },
    { label: 'Total Upcoming', ...summary.upcomingBills, attention: false },
    { label: 'Due Soon', ...summary.dueSoonBills, attention: true },
  ]

  return (
    <Card padding="compact" className="flex flex-col">
      <h2 className="mb-150 text-preset-3">Summary</h2>
      <ul aria-label="Recurring bill summary" className="list-none p-0">
        {rows.map((row) => (
          <li
            className="flex items-center justify-between gap-150 border-b border-grey-100 py-150 last:border-b-0"
            key={row.label}
          >
            <span className={`text-preset-5 ${row.attention ? 'text-red' : 'text-grey-500'}`}>
              {row.label}
            </span>
            <span
              className={`shrink-0 text-right text-preset-5-bold ${row.attention ? 'text-red' : 'text-grey-900'}`}
            >
              {row.count} ({formatRupiah(row.amount)})
            </span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
