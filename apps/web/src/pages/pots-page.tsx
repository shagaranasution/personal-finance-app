import { useRef, useState } from 'react'
import { PotFormDialog } from '@/features/pots/components/pot-form-dialog'
import { DeletePotDialog } from '@/features/pots/components/delete-pot-dialog'
import { PotMovementDialog } from '@/features/pots/components/pot-movement-dialog'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { PotCard } from '@/features/pots/components/pot-card'
import { usePots } from '@/features/pots/use-pots'
import {
  FIXTURE_CURRENT_BALANCE,
  type PotMovementDirection,
} from '@/features/pots/pot-fixture-adapter'
import type { Pot } from '@/features/pots/types'
import { formatRupiah } from '@/shared/lib/money'

export function PotsPage() {
  const { state, retry, addPot, editPot, deletePot, movePotMoney } = usePots()
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<Pot | null>(null)
  const [deleting, setDeleting] = useState<Pot | null>(null)
  const [movement, setMovement] = useState<{
    pot: Pot
    direction: PotMovementDirection
  } | null>(null)
  const [deleteError, setDeleteError] = useState('')
  const createButton = useRef<HTMLButtonElement>(null)
  const actionButton = useRef<HTMLButtonElement>(null)
  const potsHeading = useRef<HTMLHeadingElement>(null)
  const deleteReturnFocus = useRef<HTMLElement>(null)
  const movementButton = useRef<HTMLButtonElement>(null)

  return (
    <section aria-labelledby="pots-title" className="flex flex-col gap-400">
      <header className="flex h-14 items-center justify-between gap-200 py-100">
        <h1 ref={potsHeading} className="text-preset-1" id="pots-title">
          Pots
        </h1>
        <Button
          ref={createButton}
          disabled={state.status !== 'success' || Boolean(state.fixture)}
          onClick={() => setCreating(true)}
          className="shrink-0"
          title={
            state.status !== 'success'
              ? 'Load your pots before adding a new one'
              : state.status === 'success' && state.fixture
                ? 'Reload saved pots to leave the local preview before adding a pot'
                : undefined
          }
        >
          + Add New Pot
        </Button>
      </header>

      <p className="sr-only" role="status">
        {state.status === 'loading'
          ? 'Loading your pots.'
          : state.status === 'success'
            ? state.pots.length > 0
              ? `${state.pots.length} savings pots loaded.`
              : 'No pots yet.'
            : ''}
      </p>

      {state.status === 'success' && state.fixture && (
        <div
          aria-live="polite"
          className="flex flex-wrap items-center justify-between gap-200 rounded-100 bg-beige-100 p-200 text-preset-5 text-grey-500"
        >
          <p role="status">
            Local UI preview: pots were loaded from the API, but edits, deletions, deposits, and
            withdrawals are not saved. Seeded preview balance:{' '}
            <strong className="text-grey-900">{formatRupiah(state.fixture.currentBalance)}</strong>.
          </p>
          <button
            type="button"
            onClick={retry}
            className="cursor-pointer font-bold text-grey-900 underline underline-offset-2 focus-visible:rounded-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grey-900"
          >
            Reload saved pots
          </button>
        </div>
      )}

      {creating && state.status === 'success' && !state.fixture && (
        <PotFormDialog
          usedThemes={state.pots.map((pot) => pot.theme)}
          returnFocusRef={createButton}
          onClose={() => setCreating(false)}
          onSaved={(pot) => {
            addPot(pot)
            setCreating(false)
          }}
        />
      )}

      {editing && state.status === 'success' && (
        <PotFormDialog
          pot={editing}
          usedThemes={state.pots.filter((pot) => pot.id !== editing.id).map((pot) => pot.theme)}
          returnFocusRef={actionButton}
          onClose={() => setEditing(null)}
          onSaved={(pot) => {
            editPot(pot)
            setEditing(null)
          }}
        />
      )}

      {deleting && (
        <DeletePotDialog
          pot={deleting}
          returnFocusRef={deleteReturnFocus}
          error={deleteError}
          onClose={() => {
            setDeleting(null)
            setDeleteError('')
          }}
          onConfirm={() => {
            const result = deletePot(deleting.id)
            if (!result.deleted) {
              setDeleteError(
                result.error ??
                  'This pot is no longer available. Reload the saved pots and try again.',
              )
              return
            }
            deleteReturnFocus.current = potsHeading.current
            setDeleting(null)
            setDeleteError('')
          }}
        />
      )}

      {movement && state.status === 'success' && (
        <PotMovementDialog
          pot={movement.pot}
          currentBalance={state.fixture?.currentBalance ?? FIXTURE_CURRENT_BALANCE}
          direction={movement.direction}
          returnFocusRef={movementButton}
          onClose={() => setMovement(null)}
          onConfirm={(amount) => {
            const result = movePotMoney(movement.pot.id, amount, movement.direction)
            if (result.changed) setMovement(null)
            return result
          }}
        />
      )}

      <div aria-busy={state.status === 'loading'}>
        {state.status === 'loading' && (
          <Card padding="compact" className="flex min-h-[317px] flex-col justify-center gap-200">
            <h2 className="text-preset-2">Loading your pots…</h2>
            <p className="text-preset-4 text-grey-500">
              Your savings progress will appear here shortly.
            </p>
          </Card>
        )}
        {state.status === 'error' && (
          <Card
            padding="compact"
            className="flex min-h-[317px] flex-col items-start justify-center gap-200"
          >
            <div role="alert" className="flex flex-col gap-100">
              <h2 className="text-preset-2">We couldn’t load your pots</h2>
              <p className="text-preset-4 text-grey-500">
                Please try again to see your savings progress.
              </p>
            </div>
            <Button onClick={retry}>Retry</Button>
          </Card>
        )}
        {state.status === 'success' && state.pots.length === 0 && (
          <Card padding="compact" className="flex min-h-[317px] flex-col justify-center gap-200">
            <h2 className="text-preset-2">No pots yet</h2>
            <p className="text-preset-4 text-grey-500">
              Your savings pots will appear here once added.
            </p>
          </Card>
        )}
        {state.status === 'success' && state.pots.length > 0 && (
          <ul
            aria-label="Savings pots"
            className="grid grid-cols-1 items-start gap-300 desktop:grid-cols-2"
          >
            {state.pots.map((pot) => (
              <li className="min-w-0" key={pot.id}>
                <PotCard
                  pot={pot}
                  onEdit={(selected, trigger) => {
                    actionButton.current = trigger
                    setEditing(selected)
                  }}
                  onDelete={(selected, trigger) => {
                    actionButton.current = trigger
                    deleteReturnFocus.current = trigger
                    setDeleteError('')
                    setDeleting(selected)
                  }}
                  onAddMoney={(selected, trigger) => {
                    movementButton.current = trigger
                    setMovement({ pot: selected, direction: 'add' })
                  }}
                  onWithdraw={(selected, trigger) => {
                    movementButton.current = trigger
                    setMovement({ pot: selected, direction: 'withdraw' })
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
