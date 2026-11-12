import { PotsPage } from '@/pages/pots-page'
import { Outlet, Route, Routes } from 'react-router'
import { NotFoundPage } from '@/pages/not-found-page'
import { AppShell } from '@/shared/layout/app-shell'
import { TransactionsPage } from '@/pages/transactions-page'
import { BudgetsPage } from '@/pages/budgets-page'
import { RecurringBillsPage } from '@/pages/recurring-bills-page'
import { OverviewPage } from '@/pages/overview-page'
import { PotsProvider } from '@/features/pots/pots-provider'

function OverviewAndPotsState() {
  return (
    <PotsProvider>
      <Outlet />
    </PotsProvider>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route element={<OverviewAndPotsState />}>
          <Route index element={<OverviewPage />} />
          <Route path="pots" element={<PotsPage />} />
        </Route>
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="budgets" element={<BudgetsPage />} />
        <Route path="recurring-bills" element={<RecurringBillsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
