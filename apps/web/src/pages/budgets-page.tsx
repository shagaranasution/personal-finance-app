import { useRef, useState } from 'react'
import { BudgetCard } from '@/features/budgets/components/budget-card'
import { BudgetSummaryCard } from '@/features/budgets/components/budget-summary-card'
import { addBudget, removeBudget, updateBudget, useBudgets } from '@/features/budgets/budget-store'
import { BudgetFormDialog } from '@/features/budgets/components/budget-form-dialog'
import { DeleteBudgetDialog } from '@/features/budgets/components/delete-budget-dialog'
import { summarizeBudgets } from '@/features/budgets/budget-summary'
import type { Budget } from '@/features/budgets/types'
import { transactions } from '@/features/transactions/data/transactions'
import { Button } from '@/shared/ui/button'

export function BudgetsPage() {
  const currentBudgets = useBudgets()
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<Budget | null>(null)
  const [deleting, setDeleting] = useState<Budget | null>(null)
  const createButton = useRef<HTMLButtonElement>(null)
  const dialogReturnFocus = useRef<HTMLButtonElement>(null)
  const summaries = summarizeBudgets(currentBudgets, transactions)

  return (
    <section aria-labelledby="budgets-title" className="flex flex-col gap-400">
      <header className="flex min-h-14 items-center justify-between gap-200 py-100">
        <h1 className="text-preset-1" id="budgets-title">
          Budgets
        </h1>
        <Button ref={createButton} onClick={() => setCreating(true)}>
          + Add New Budget
        </Button>
      </header>

      {creating && (
        <BudgetFormDialog
          usedCategories={currentBudgets.map((budget) => budget.category)}
          usedThemes={currentBudgets.map((budget) => budget.theme)}
          returnFocusRef={createButton}
          onClose={() => setCreating(false)}
          onSaved={(budget) => {
            addBudget(budget)
            setCreating(false)
          }}
        />
      )}

      {editing && (
        <BudgetFormDialog
          budget={editing}
          usedCategories={currentBudgets
            .filter((budget) => budget.id !== editing.id)
            .map((budget) => budget.category)}
          usedThemes={currentBudgets
            .filter((budget) => budget.id !== editing.id)
            .map((budget) => budget.theme)}
          returnFocusRef={dialogReturnFocus}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            updateBudget(editing.id, updated)
            setEditing(null)
          }}
        />
      )}

      {deleting && (
        <DeleteBudgetDialog
          budget={deleting}
          returnFocusRef={dialogReturnFocus}
          onClose={() => setDeleting(null)}
          onConfirm={() => {
            dialogReturnFocus.current = createButton.current
            removeBudget(deleting.id)
            setDeleting(null)
          }}
        />
      )}

      <div className="grid grid-cols-1 items-start gap-300 desktop:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.6fr)]">
        <BudgetSummaryCard budgets={summaries} />
        {summaries.length > 0 ? (
          <ul aria-label="Budgets" className="flex list-none flex-col gap-300 p-0">
            {summaries.map((budget) => (
              <li className="min-w-0" key={budget.id}>
                <BudgetCard
                  budget={budget}
                  onEdit={(selected, trigger) => {
                    dialogReturnFocus.current = trigger
                    setEditing(selected)
                  }}
                  onDelete={(selected, trigger) => {
                    dialogReturnFocus.current = trigger
                    setDeleting(selected)
                  }}
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-150 bg-white p-400">
            <h2 className="text-preset-2">No budgets yet</h2>
            <p className="mt-100 text-preset-4 text-grey-500">
              Your budget summary will appear here when a budget is available.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
