import { useEffect, useState } from 'react'
import { fetchPots } from './pots-api'
import type { Pot } from './types'

type PotsState = { status: 'loading' } | { status: 'error' } | { status: 'success'; pots: Pot[] }

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

  return { state, retry }
}
