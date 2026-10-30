import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { PotCard } from '@/features/pots/components/pot-card'
import { usePots } from '@/features/pots/use-pots'

export function PotsPage() {
  const { state, retry } = usePots()

  return (
    <section aria-labelledby="pots-title" className="flex flex-col gap-400">
      <header className="flex h-14 items-center justify-between gap-200 py-100">
        <h1 className="text-preset-1" id="pots-title">
          Pots
        </h1>
        <Button
          disabled
          className="shrink-0 disabled:opacity-100"
          title="Creating pots is not available yet"
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
                <PotCard pot={pot} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
