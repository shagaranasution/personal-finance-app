import { useContext } from 'react'
import { PotsContext } from './pots-context'

/** Read the pots and balance preview shared by the Overview and Pots routes. */
export function usePots() {
  const context = useContext(PotsContext)
  if (!context) throw new Error('usePots must be used within the shared PotsProvider route')
  return context
}
