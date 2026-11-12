import { Link } from 'react-router'
import type { Pot } from '@/features/pots/types'
import { IconCaretRight, IconPot } from '@/shared/components/icons'
import { Card } from '@/shared/ui/card'
import { formatRupiah } from '@/shared/lib/money'

const VISIBLE_POT_SUMMARIES = 4

interface PotSummaryCardProps {
  pots: readonly Pot[]
  totalSaved: number | null
  status: 'loading' | 'error' | 'success'
}

export function PotSummaryCard({ pots, totalSaved, status }: PotSummaryCardProps) {
  const visiblePots = pots.slice(0, VISIBLE_POT_SUMMARIES)

  return (
    <Card padding="compact" className="flex flex-col gap-200 tablet:p-300">
      <header className="flex items-center justify-between gap-200">
        <h2 className="text-preset-3">Pots</h2>
        <Link
          className="group inline-flex items-center gap-100 text-preset-5 text-grey-500 transition-colors hover:text-grey-900 focus-visible:rounded-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grey-900"
          to="/pots"
        >
          See Details
          <IconCaretRight className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </header>

      <div className="grid grid-cols-1 items-stretch gap-200 tablet:grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)] tablet:items-center">
        <div className="flex min-h-[80px] items-center gap-200 rounded-100 bg-beige-100 px-200 py-150">
          <IconPot aria-hidden="true" className="shrink-0" />
          <div className="flex min-w-0 flex-col gap-50">
            <span className="text-preset-5 text-grey-500">Total Saved</span>
            <span className="text-preset-2">
              {totalSaved === null ? '—' : formatRupiah(totalSaved)}
            </span>
          </div>
        </div>

        {status === 'loading' ? (
          <p aria-live="polite" className="text-preset-5 text-grey-500">
            Loading your pots…
          </p>
        ) : status === 'error' ? (
          <p role="status" className="text-preset-5 text-grey-500">
            Your pots are unavailable. Visit Pots to retry loading them.
          </p>
        ) : visiblePots.length > 0 ? (
          <ul
            aria-label="Pot summaries"
            className="grid list-none grid-cols-2 gap-x-200 gap-y-150 p-0"
          >
            {visiblePots.map((pot) => (
              <li className="flex min-w-0 items-center gap-100" key={pot.id}>
                <span
                  aria-hidden="true"
                  className="h-8 w-[3px] shrink-0 rounded-50"
                  style={{ backgroundColor: pot.theme }}
                />
                <span className="flex min-w-0 flex-col gap-50">
                  <span className="truncate text-preset-5 text-grey-500">{pot.name}</span>
                  <span className="text-preset-5-bold text-grey-900">
                    {formatRupiah(pot.total)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-preset-5 text-grey-500">
            Your savings pots will appear here once you create one.
          </p>
        )}
      </div>
    </Card>
  )
}
