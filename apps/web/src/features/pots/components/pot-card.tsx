import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { formatRupiah } from '@/shared/lib/money'
import { getPotProgress } from '../pot-progress'
import type { Pot } from '../types'
import { IconEllipsis } from '@/shared/components/icons'

export function PotCard({ pot }: { pot: Pot }) {
  const progress = getPotProgress(pot.total, pot.target)
  const headingId = `pot-${pot.id}`

  return (
    <Card padding="compact" className="flex min-h-[317px] flex-col gap-400 desktop:min-h-[303px]">
      <div className="flex items-center justify-between gap-200">
        <div className="flex min-w-0 items-center gap-200">
          <span
            aria-hidden="true"
            className="size-4 shrink-0 rounded-full"
            style={{ backgroundColor: pot.theme }}
          />
          <h2 className="min-w-0 wrap-break-word text-preset-2" id={headingId}>
            {pot.name}
          </h2>
        </div>
        <button
          aria-label={`Options for ${pot.name} (not available yet)`}
          disabled
          title="Pot options are not available yet"
          className="flex size-4 shrink-0 cursor-not-allowed items-center justify-center"
        >
          <IconEllipsis width={14} height={4} />
        </button>
      </div>

      <div className="flex min-h-[114px] flex-col justify-center gap-200">
        <div className="flex flex-wrap items-center justify-between gap-100">
          <span className="text-preset-4 text-grey-500">Total Saved</span>
          <span className="max-w-full wrap-break-word text-preset-1">
            {formatRupiah(pot.total)}
          </span>
        </div>
        <div className="flex flex-col gap-[13px]">
          <div
            role="progressbar"
            aria-labelledby={headingId}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress.fill}
            aria-valuetext={`${progress.label} of target; ${formatRupiah(pot.total)} saved of ${formatRupiah(pot.target)}`}
            className="h-2 overflow-hidden rounded-50 bg-beige-100"
          >
            <div
              className="h-full rounded-50"
              style={{ width: `${progress.fill}%`, backgroundColor: pot.theme }}
            />
          </div>
          <div className="flex items-start justify-between gap-100 text-preset-5 text-grey-500">
            <span className="text-preset-5-bold">{progress.label}</span>
            <span className="text-right">Target of {formatRupiah(pot.target)}</span>
          </div>
        </div>
        {progress.goalReached && (
          <p className="text-preset-5-bold text-green">
            {progress.overTarget ? 'Above target' : 'Target reached'}
          </p>
        )}
      </div>

      <div className="flex gap-200">
        <Button
          disabled
          variant="secondary"
          className="min-w-0 flex-1 disabled:opacity-100"
          title="Adding money is not available yet"
          aria-label={`Add money to ${pot.name} (not available yet)`}
        >
          + Add Money
        </Button>
        <Button
          disabled
          variant="secondary"
          className="min-w-0 flex-1 disabled:opacity-100"
          title="Withdrawals are not available yet"
          aria-label={`Withdraw from ${pot.name} (not available yet)`}
        >
          Withdraw
        </Button>
      </div>
    </Card>
  )
}
