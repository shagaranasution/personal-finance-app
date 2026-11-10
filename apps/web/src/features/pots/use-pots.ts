import { useEffect, useState } from 'react'
import {
  deletePotFromFixture,
  editPotInFixture,
  movePotMoneyInFixture,
  startPotFixture,
  type PotDeletionResult,
  type PotMovementDirection,
  type PotMovementResult,
} from './pot-fixture-adapter'
import { fetchPots } from './pots-api'
import type { Pot } from './types'

type PotsState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'success'; pots: Pot[]; fixture?: ReturnType<typeof startPotFixture> }

export function usePots() {
  const [state, setState] = useState<PotsState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    fetchPots(controller.signal).then(
      (pots) => {
        if (!controller.signal.aborted) setState({ status: 'success', pots })
      },
      () => {
        if (!controller.signal.aborted) setState({ status: 'error' })
      },
    )
    return () => controller.abort()
  }, [attempt])

  function retry() {
    setState({ status: 'loading' })
    setAttempt((previous) => previous + 1)
  }

  function addPot(pot: Pot) {
    setState((previous) =>
      previous.status === 'success' && !previous.fixture
        ? {
            status: 'success',
            pots: [...previous.pots.filter((existing) => existing.id !== pot.id), pot].sort(
              (a, b) => a.id.localeCompare(b.id),
            ),
          }
        : previous,
    )
  }

  function editPot(pot: Pot) {
    setState((previous) => {
      if (previous.status !== 'success') return previous
      const fixture = previous.fixture ?? startPotFixture(previous.pots)
      const updated = editPotInFixture(fixture, pot)
      return { ...previous, pots: updated.pots, fixture: updated }
    })
  }

  function deletePot(potId: string): PotDeletionResult {
    if (state.status !== 'success') {
      return {
        state: { pots: [], currentBalance: 0 },
        deleted: false,
        refunded: 0,
      }
    }
    const fixture = state.fixture ?? startPotFixture(state.pots)
    const result = deletePotFromFixture(fixture, potId)
    if (result.deleted) {
      setState({ ...state, pots: result.state.pots, fixture: result.state })
    }
    return result
  }

  function movePotMoney(
    potId: string,
    amount: number,
    direction: PotMovementDirection,
  ): PotMovementResult {
    if (state.status !== 'success') {
      return {
        state: { pots: [], currentBalance: 0 },
        changed: false,
        error: 'Your pots are not ready. Reload them and try again.',
      }
    }
    const fixture = state.fixture ?? startPotFixture(state.pots)
    const result = movePotMoneyInFixture(fixture, potId, amount, direction)
    if (result.changed) {
      setState({ ...state, pots: result.state.pots, fixture: result.state })
    }
    return result
  }

  return { state, retry, addPot, editPot, deletePot, movePotMoney }
}
