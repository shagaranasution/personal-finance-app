import { Route, Routes } from 'react-router'
import { NotFoundPage } from '@/pages/not-found-page'
import { PagePlaceholder } from '@/pages/page-placeholder'
import { AppShell } from '@/shared/layout/app-shell'
import { TransactionsPage } from '@/pages/transactions-page'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<PagePlaceholder title="Overview" />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="budgets" element={<PagePlaceholder title="Budgets" />} />
        <Route path="pots" element={<PagePlaceholder title="Pots" />} />
        <Route path="recurring-bills" element={<PagePlaceholder title="Recurring Bills" />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
