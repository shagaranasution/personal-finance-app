import { usePots } from '@/features/pots/use-pots'
import { PotSummaryCard } from '@/features/overview/components/pot-summary-card'
import { BalanceCard } from '@/features/overview/components/balance-card'
import { getOverviewBalanceSummary } from '@/features/overview/overview-balance'
import { FIXTURE_CURRENT_BALANCE } from '@/features/pots/pot-fixture-adapter'
import { transactions } from '@/features/transactions/data/transactions'
import { getVisibleTransactions } from '@/features/transactions/transaction-query'
import { useBudgets } from '@/features/budgets/budget-store'
import { summarizeBudgets } from '@/features/budgets/budget-summary'
import {
  calculateRecurringBills,
  DEMO_RECURRING_BILL_CONTEXT,
} from '@/features/recurring-bills/recurring-bill-calculation'
import { getRecurringBillSummary } from '@/features/recurring-bills/recurring-bill-query'
import { RecurringBillSummaryCard } from '@/features/recurring-bills/components/recurring-bill-summary'
import { BudgetOverviewCard } from '@/features/overview/components/budget-overview-card'
import { RecentTransactionsCard } from '@/features/overview/components/recent-transactions-card'
import { IconCaretRight } from '@/shared/components/icons'
import { Link } from 'react-router'
import { Card } from '@/shared/ui/card'

const recentTransactions = getVisibleTransactions(transactions, '', null, 'latest').slice(0, 5)
const recurringBills = calculateRecurringBills(transactions, DEMO_RECURRING_BILL_CONTEXT)
const recurringBillSummary = getRecurringBillSummary(recurringBills)

export function OverviewPage() {
  const { state } = usePots()
  const currentBudgets = useBudgets()
  const budgetSummaries = summarizeBudgets(currentBudgets, transactions)
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

      <div className="mt-300 grid grid-cols-1 items-start gap-300 desktop:mt-300 desktop:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-300">
          <PotSummaryCard
            pots={pots}
            totalSaved={state.status === 'success' ? summary.totalSaved : null}
            status={state.status}
          />
          <RecentTransactionsCard transactions={recentTransactions} />
        </div>

        <div className="flex min-w-0 flex-col gap-300">
          <BudgetOverviewCard budgets={budgetSummaries} />
          {recurringBills.length > 0 ? (
            <RecurringBillSummaryCard
              summary={recurringBillSummary}
              title="Recurring Bills"
              headerAction={
                <Link
                  className="group inline-flex items-center gap-100 text-preset-5 text-grey-500 transition-colors hover:text-grey-900 focus-visible:rounded-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grey-900"
                  to="/recurring-bills"
                >
                  See Details
                  <IconCaretRight className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              }
            />
          ) : (
            <Card padding="compact" className="flex flex-col gap-200 tablet:p-300">
              <header className="flex items-center justify-between gap-200">
                <h2 className="text-preset-3">Recurring Bills</h2>
                <Link
                  className="group inline-flex items-center gap-100 text-preset-5 text-grey-500 transition-colors hover:text-grey-900 focus-visible:rounded-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grey-900"
                  to="/recurring-bills"
                >
                  See Details
                  <IconCaretRight className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              </header>
              <p className="rounded-100 bg-beige-100 px-200 py-300 text-preset-5 text-grey-500">
                No recurring bills yet. Your bill summary will appear here when bills are available.
              </p>
            </Card>
          )}
        </div>
      </div>
    </section>
  )
}
