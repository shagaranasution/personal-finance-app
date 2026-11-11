import { PotsPage } from '@/pages/pots-page'
import { Route, Routes } from 'react-router'
import { NotFoundPage } from '@/pages/not-found-page'
import { PagePlaceholder } from '@/pages/page-placeholder'
import { AppShell } from '@/shared/layout/app-shell'
import { TransactionsPage } from '@/pages/transactions-page'
import { BudgetsPage } from '@/pages/budgets-page'
import { RecurringBillsPage } from '@/pages/recurring-bills-page'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<PagePlaceholder title="Overview" />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="budgets" element={<BudgetsPage />} />
        <Route path="pots" element={<PotsPage />} />
        <Route path="recurring-bills" element={<RecurringBillsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
