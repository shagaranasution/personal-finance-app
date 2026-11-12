import { usePots } from '@/features/pots/use-pots'
import { PotSummaryCard } from '@/features/overview/components/pot-summary-card'
import { BalanceCard } from '@/features/overview/components/balance-card'
import { getOverviewBalanceSummary } from '@/features/overview/overview-balance'
import { FIXTURE_CURRENT_BALANCE } from '@/features/pots/pot-fixture-adapter'

export function OverviewPage() {
  const { state } = usePots()
  const pots = state.status === 'success' ? state.pots : []
  const currentBalance =
    state.status === 'success'
      ? (state.fixture?.currentBalance ?? FIXTURE_CURRENT_BALANCE)
      : FIXTURE_CURRENT_BALANCE
  const summary = getOverviewBalanceSummary(pots, currentBalance)

  return (
    <section aria-labelledby="overview-title">
      <h1 className="text-preset-1" id="overview-title">
        Overview
      </h1>

      <div className="mt-300 grid grid-cols-1 gap-200 tablet:mt-400 tablet:grid-cols-3 tablet:gap-300">
        <BalanceCard emphasized label="Current Balance" amount={summary.currentBalance} />
        <BalanceCard label="Income" amount={summary.income} />
        <BalanceCard label="Expenses" amount={summary.expenses} />
      </div>

      <div className="mt-300 grid grid-cols-1 gap-300 desktop:mt-300 desktop:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <PotSummaryCard
          pots={pots}
          totalSaved={state.status === 'success' ? summary.totalSaved : null}
          status={state.status}
        />
      </div>
    </section>
  )
}
